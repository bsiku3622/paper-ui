// The API surface of the package, recorded in api/surface.json. The test computes the surface from the source (the
// TypeScript checker for the names each entry exports, the runtime for the values, the token tree, the emitted
// variables and the layer module) and compares it with the record, so a name that appears, goes or changes
// side shows up in review as a diff of that file.
//
// pnpm api:update           rewrites api/surface.json. If the version has been released (api/released/<version>.json),
//                           the surface of a release never changes, and a new version needs the bump its changes
//                           call for and a `## <version>` heading in CHANGELOG.md.
// PAPER_API_RECORD=1        writes api/released/<version>.json, which prepublishOnly does at publish time.

import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterAll, describe, expect, it } from "vitest";

import pkg from "../package.json" with { type: "json" };
import * as root from "./index";
import * as themeBoot from "./theme/boot";
import { tokens } from "./tokens";
import * as tokensEntry from "./tokens/public";
import { themeVariables } from "./tokens/variables";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(here);
const API_DIR = join(packageDir, "api");
const SURFACE = join(API_DIR, "surface.json");
const RELEASED = join(API_DIR, "released");
const CHANGELOG = join(packageDir, "CHANGELOG.md");

type Entry = { values: string[]; types: string[] };
type Surface = {
  version: string;
  entries: {
    ".": Entry;
    "./tokens": Entry & { tokens: string[] };
    "./theme-boot": Entry;
    "./styles.css": { layers: string[]; cssVariables: Record<string, string[]> };
  };
};

const sorted = (names: Iterable<string>) => [...new Set(names)].sort();

// The names an entry file exports, by the kind the checker resolves each one to: an interface or a type alias is a
// type, a const, function or class a value, and a name that is both (a class, or a const beside a type of the
// same name) is listed in both.
const exportsOf = (entries: Record<string, string>) => {
  const config = ts.parseJsonConfigFileContent(ts.readConfigFile(join(packageDir, "tsconfig.json"), ts.sys.readFile).config, ts.sys, packageDir);
  const program = ts.createProgram(Object.values(entries), { ...config.options, noEmit: true });
  const checker = program.getTypeChecker();
  return Object.fromEntries(
    Object.entries(entries).map(([entry, file]) => {
      const source = program.getSourceFile(file);
      const symbol = source && checker.getSymbolAtLocation(source);
      if (!symbol) throw new Error(`${file} exports nothing`);
      const members = checker.getExportsOfModule(symbol).map((member) => {
        const target = member.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(member) : member;
        return { name: member.name, value: (target.flags & ts.SymbolFlags.Value) !== 0, type: (target.flags & ts.SymbolFlags.Type) !== 0 };
      });
      return [entry, { values: sorted(members.filter((member) => member.value).map((member) => member.name)), types: sorted(members.filter((member) => member.type).map((member) => member.name)) }];
    }),
  ) as Record<string, Entry>;
};

// Every leaf of a tree, as the dotted path to it.
const leafPaths = (value: unknown, path: string[] = []): string[] =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? Object.entries(value).flatMap(([key, child]) => leafPaths(child, [...path, key]))
    : [path.join(".")];

// The layer module is a .css.ts that cannot be imported outside the build, so its names are read from its text, in
// declaration order: the order is the cascade.
const layerNames = (): string[] => {
  const code = readFileSync(join(here, "tokens/layers.css.ts"), "utf8");
  const parent = /globalLayer\("([^"]+)"\)/.exec(code)?.[1];
  const children = [...code.matchAll(/globalLayer\(\{ parent: \w+ \}, "([^"]+)"\)/g)].map((match) => `${parent}.${match[1]}`);
  if (!parent || children.length === 0) throw new Error("tokens/layers.css.ts declares no layers the record can read");
  return [parent, ...children];
};

const cssVariables = () => {
  const { source, invariant, modes, contrastMore } = themeVariables();
  return {
    source: sorted(Object.keys(source)),
    invariant: sorted(Object.keys(invariant)),
    light: sorted([...Object.keys(modes.light.own), ...Object.keys(modes.light.ground)]),
    dark: sorted([...Object.keys(modes.dark.own), ...Object.keys(modes.dark.ground)]),
    contrastMore: sorted([...Object.keys(contrastMore.light), ...Object.keys(contrastMore.dark)]),
  };
};

const computeSurface = (): Surface => {
  const sources = Object.fromEntries(
    Object.entries(pkg.exports)
      .filter(([entry]) => entry !== "./styles.css")
      .map(([entry, condition]) => [entry, join(packageDir, condition["paper-ui-source"])]),
  );
  const names = exportsOf(sources);
  return {
    version: pkg.version,
    entries: {
      ".": names["."]!,
      "./tokens": { ...names["./tokens"]!, tokens: sorted(leafPaths(tokens)) },
      "./theme-boot": names["./theme-boot"]!,
      "./styles.css": { layers: layerNames(), cssVariables: cssVariables() },
    },
  };
};

const serialize = (surface: Surface) => `${JSON.stringify(surface, null, 2)}\n`;
const readSurface = (path: string): Surface => JSON.parse(readFileSync(path, "utf8"));

// ───── The gate ─────────────────────────────────────────────────────────────────────────────────────────────

// x.y.z, then the rank of its label and the rc's number: alpha < beta < rc.n < the release itself.
type Version = [number, number, number, number, number];
const LABELS = ["alpha", "beta", "rc"];
const RELEASE_RANK = LABELS.length;
const parse = (version: string): Version => {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(?:(alpha|beta)|rc\.(\d+)))?$/.exec(version);
  if (!match) throw new Error(`"${version}" is not a x.y.z, x.y.z-alpha, x.y.z-beta or x.y.z-rc.n version`);
  const label = match[4] ?? (match[5] === undefined ? null : "rc");
  return [Number(match[1]), Number(match[2]), Number(match[3]), label === null ? RELEASE_RANK : LABELS.indexOf(label), Number(match[5] ?? 0)];
};
const compare = (a: Version, b: Version) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4];
const isPrerelease = (version: Version) => version[3] < RELEASE_RANK;

const LEVELS = ["patch", "minor", "major"] as const;
type Level = (typeof LEVELS)[number];

// The highest part that grew from one version to a later one.
const bumpOf = (from: Version, to: Version): Level | null =>
  to[0] > from[0] ? "major" : to[1] > from[1] ? "minor" : to[2] > from[2] ? "patch" : null;

// Every name of a surface as one flat key, so a diff is a set difference.
const keysOf = (surface: Surface): Set<string> => {
  const keys = new Set<string>();
  for (const [entry, record] of Object.entries(surface.entries)) {
    const body = record as Partial<Entry> & { tokens?: string[]; layers?: string[]; cssVariables?: Record<string, string[]> };
    for (const kind of ["values", "types", "tokens", "layers"] as const) for (const name of body[kind] ?? []) keys.add(`${entry} ${kind} ${name}`);
    for (const [scope, names] of Object.entries(body.cssVariables ?? {})) for (const name of names) keys.add(`${entry} cssVariables.${scope} ${name}`);
  }
  return keys;
};

const difference = (a: Set<string>, b: Set<string>) => [...a].filter((key) => !b.has(key)).sort();

// What changing a release's surface to another costs: a removed or renamed name needs a minor bump while 0.x and a
// major at 1.0 and later, an added name alone a patch bump while 0.x and a minor later, and nothing else a bump.
const requiredBump = (released: Version, removed: number, added: number): Level | null =>
  removed > 0 ? (released[0] === 0 ? "minor" : "major") : added > 0 ? (released[0] === 0 ? "patch" : "minor") : null;

const releasedVersions = (dir: string): string[] =>
  (() => {
    try {
      return readdirSync(dir);
    } catch {
      return [];
    }
  })()
    .filter((file) => file.endsWith(".json"))
    .map((file) => basename(file, ".json"))
    .sort((a, b) => compare(parse(a), parse(b)));

// The reasons api:update refuses to rewrite the record of `version`, or [] when it may. `released` holds the
// surfaces published so far, one api/released/<version>.json each.
const refusals = ({ released, changelog, surface }: { released: string; changelog: string; surface: Surface }): string[] => {
  const versions = releasedVersions(released);
  if (versions.length === 0) return [];
  const version = parse(surface.version);
  const same = versions.find((candidate) => compare(parse(candidate), version) === 0);
  if (same) {
    const record = readSurface(join(released, `${same}.json`));
    if (serialize(record) === serialize(surface)) return [];
    const removed = difference(keysOf(record), keysOf(surface));
    const added = difference(keysOf(surface), keysOf(record));
    return [`${same} is released and its surface differs (${removed.length} removed, ${added.length} added): bump the version in package.json`];
  }
  const below = versions.filter((candidate) => compare(parse(candidate), version) < 0);
  if (below.length === 0) return [`${surface.version} is below every released version (${versions.join(", ")})`];
  const reasons: string[] = [];
  // A pre-release promises no names to the next version, so the bump is measured from the last full release.
  const latest = below.filter((candidate) => !isPrerelease(parse(candidate))).at(-1);
  if (latest) {
    const record = readSurface(join(released, `${latest}.json`));
    const removed = difference(keysOf(record), keysOf(surface));
    const added = difference(keysOf(surface), keysOf(record));
    const required = requiredBump(parse(latest), removed.length, added.length);
    const bump = bumpOf(parse(latest), version);
    if (required && (!bump || LEVELS.indexOf(bump) < LEVELS.indexOf(required))) {
      reasons.push(`${removed.length} removed and ${added.length} added names since ${latest} need a ${required} bump or more, and ${surface.version} ${bump ? `is a ${bump} bump` : "is not a bump"}`);
    }
  }
  if (!new RegExp(`^## ${surface.version.replaceAll(".", "\\.")}(?![\\w.-])`, "m").test(changelog)) reasons.push(`CHANGELOG.md has no "## ${surface.version}" heading`);
  return reasons;
};

// ───── The record ───────────────────────────────────────────────────────────────────────────────────────────

const surface = computeSurface();

describe("the API surface", () => {
  it("[install.api.surface-recorded] matches api/surface.json, which also records the version", () => {
    const changelog = readFileSync(CHANGELOG, "utf8");
    if (process.env.PAPER_API_UPDATE) {
      const reasons = refusals({ released: RELEASED, changelog, surface });
      if (reasons.length > 0) throw new Error(`api:update refuses: ${reasons.join("; ")}`);
      mkdirSync(API_DIR, { recursive: true });
      writeFileSync(SURFACE, serialize(surface));
    }
    const recorded = readSurface(SURFACE);
    expect(recorded.version).toBe(pkg.version);
    // A readable diff first: the names that came or went, then the whole record.
    expect({ removed: difference(keysOf(recorded), keysOf(surface)), added: difference(keysOf(surface), keysOf(recorded)) }, "run `pnpm api:update` after an intended API change").toEqual({ removed: [], added: [] });
    expect(surface, "run `pnpm api:update` after an intended API change").toEqual(recorded);
  });

  it("[install.api.surface-recorded] agrees with the runtime: the value names are the module's own keys", () => {
    expect(surface.entries["."].values).toEqual(Object.keys(root).sort());
    expect(surface.entries["./tokens"].values).toEqual(Object.keys(tokensEntry).sort());
    expect(surface.entries["./theme-boot"].values).toEqual(Object.keys(themeBoot).sort());
  });

  it("[install.api.surface-recorded] [install.entry.one-home] [install.entry.table] puts each name in one entry only", () => {
    const names = [".", "./tokens", "./theme-boot"].flatMap((entry) => {
      const record = surface.entries[entry as "." | "./tokens" | "./theme-boot"];
      return [...record.values, ...record.types].filter((name, index, all) => all.indexOf(name) === index);
    });
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  it("[install.runtime.environments] [install.entry.table] keeps the class maps and class functions in the client entry, and out of /tokens", () => {
    const classes = ["elevation", "presence", "loop", "surfaceClass", "paintClass"];
    expect(surface.entries["."].values).toEqual(expect.arrayContaining(classes));
    expect(surface.entries["./tokens"].values.filter((name) => classes.includes(name))).toEqual([]);
  });

  it("[install.api.surface-recorded] records the cascade layers in declaration order and the variables of each scope", () => {
    expect(surface.entries["./styles.css"].layers).toEqual(["pui", "pui.reset", "pui.theme", "pui.base", "pui.utilities", "pui.components"]);
    const { source, invariant, light, dark } = surface.entries["./styles.css"].cssVariables;
    for (const names of [source, invariant, light, dark]) expect(names!.length).toBeGreaterThan(0);
    expect(light).toEqual(dark);
  });

  it("records the release of every published version once, under the version it names", () => {
    for (const version of releasedVersions(RELEASED)) expect(readSurface(join(RELEASED, `${version}.json`)).version).toBe(version);
  });

  if (process.env.PAPER_API_RECORD) {
    it("[install.api.surface-recorded] writes api/released/<version>.json at publish time", () => {
      expect(serialize(readSurface(SURFACE))).toBe(serialize(surface));
      const reasons = refusals({ released: RELEASED, changelog: readFileSync(CHANGELOG, "utf8"), surface });
      if (reasons.length > 0) throw new Error(`the release record refuses: ${reasons.join("; ")}`);
      mkdirSync(RELEASED, { recursive: true });
      writeFileSync(join(RELEASED, `${surface.version}.json`), serialize(surface));
    });
  }
});

// The gate runs against a temporary directory of released surfaces, so the real record is never touched.
describe("the version gate", () => {
  const scratch = mkdtempSync(join(tmpdir(), "paper-api-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  // A surface with the given value names in '.', released as `version`.
  const surfaceWith = (version: string, values: string[]): Surface => ({
    version,
    entries: { ...surface.entries, ".": { values, types: [] } },
  });
  const releasedAt = (name: string, ...surfaces: Surface[]) => {
    const dir = join(scratch, name);
    mkdirSync(dir, { recursive: true });
    for (const record of surfaces) writeFileSync(join(dir, `${record.version}.json`), serialize(record));
    return dir;
  };
  const notes = (...versions: string[]) => versions.map((version) => `## ${version}\n\n- notes\n`).join("\n");

  it("[install.api.bump-required] lets the first release be recorded with nothing before it", () => {
    expect(refusals({ released: releasedAt("none"), changelog: notes("0.1.0"), surface: surfaceWith("0.1.0", ["A"]) })).toEqual([]);
  });

  it("[install.api.bump-required] refuses to change the surface of a released version, even with a changelog entry", () => {
    const released = releasedAt("same", surfaceWith("0.1.0", ["A", "B"]));
    expect(refusals({ released, changelog: notes("0.1.0"), surface: surfaceWith("0.1.0", ["A", "B"]) })).toEqual([]);
    expect(refusals({ released, changelog: notes("0.1.0"), surface: surfaceWith("0.1.0", ["A", "B", "C"]) })).toEqual([
      "0.1.0 is released and its surface differs (0 removed, 1 added): bump the version in package.json",
    ]);
  });

  it("[install.api.bump-required] asks 0.x for a patch bump when names are added and a minor bump when one is removed or renamed", () => {
    const released = releasedAt("zero", surfaceWith("0.1.0", ["A", "B"]));
    const added = surfaceWith("0.1.1", ["A", "B", "C"]);
    expect(refusals({ released, changelog: notes("0.1.1"), surface: added })).toEqual([]);
    expect(refusals({ released, changelog: notes("0.1.1"), surface: surfaceWith("0.1.0", ["A", "B", "C"]) })).toHaveLength(1);
    const removed = surfaceWith("0.1.1", ["A"]);
    expect(refusals({ released, changelog: notes("0.1.1"), surface: removed })).toEqual(["1 removed and 0 added names since 0.1.0 need a minor bump or more, and 0.1.1 is a patch bump"]);
    expect(refusals({ released, changelog: notes("0.2.0"), surface: surfaceWith("0.2.0", ["A"]) })).toEqual([]);
    expect(refusals({ released, changelog: notes("0.2.0"), surface: surfaceWith("0.2.0", ["A", "C"]) })).toEqual([]);
    expect(refusals({ released, changelog: notes("1.0.0"), surface: surfaceWith("1.0.0", ["A"]) })).toEqual([]);
  });

  it("[install.api.bump-required] asks 1.x for a minor bump when names are added and a major bump when one is removed", () => {
    const released = releasedAt("one", surfaceWith("1.2.0", ["A", "B"]));
    expect(refusals({ released, changelog: notes("1.2.1"), surface: surfaceWith("1.2.1", ["A", "B", "C"]) })).toHaveLength(1);
    expect(refusals({ released, changelog: notes("1.3.0"), surface: surfaceWith("1.3.0", ["A", "B", "C"]) })).toEqual([]);
    expect(refusals({ released, changelog: notes("1.3.0"), surface: surfaceWith("1.3.0", ["A"]) })).toHaveLength(1);
    expect(refusals({ released, changelog: notes("2.0.0"), surface: surfaceWith("2.0.0", ["A"]) })).toEqual([]);
  });

  it("[install.api.bump-required] reads alpha, beta and rc.n under their release, and refuses any other label", () => {
    const released = releasedAt("labels", surfaceWith("0.2.0", ["A"]), surfaceWith("0.2.0-rc.10", ["A"]), surfaceWith("0.2.0-rc.2", ["A"]), surfaceWith("0.2.0-beta", ["A"]), surfaceWith("0.2.0-alpha", ["A"]));
    expect(releasedVersions(released)).toEqual(["0.2.0-alpha", "0.2.0-beta", "0.2.0-rc.2", "0.2.0-rc.10", "0.2.0"]);
    expect(() => refusals({ released, changelog: "", surface: surfaceWith("0.2.0-nightly", ["A"]) })).toThrow('"0.2.0-nightly" is not a');
  });

  it("[install.api.bump-required] measures a pre-release's bump from the last full release, and holds a released pre-release to its record", () => {
    const released = releasedAt("prerelease", surfaceWith("0.1.0", ["A", "B"]), surfaceWith("0.2.0-alpha", ["A"]));
    // The record of a pre-release is as fixed as a release's.
    expect(refusals({ released, changelog: notes("0.2.0-alpha"), surface: surfaceWith("0.2.0-alpha", ["C"]) })).toEqual([
      "0.2.0-alpha is released and its surface differs (1 removed, 1 added): bump the version in package.json",
    ]);
    // Between pre-releases of one version names may move; each stands against 0.1.0, which a minor bump covers.
    expect(refusals({ released, changelog: notes("0.2.0-beta"), surface: surfaceWith("0.2.0-beta", ["C"]) })).toEqual([]);
    expect(refusals({ released, changelog: notes("0.2.0"), surface: surfaceWith("0.2.0", ["C"]) })).toEqual([]);
    // A pre-release that removes a name still needs the bump its removal calls for.
    expect(refusals({ released, changelog: notes("0.1.1-rc.1"), surface: surfaceWith("0.1.1-rc.1", ["A"]) })).toEqual(["1 removed and 0 added names since 0.1.0 need a minor bump or more, and 0.1.1-rc.1 is a patch bump"]);
  });

  it("[install.api.bump-required] lets a pre-release stand with no full release before it, with a heading of its own", () => {
    const released = releasedAt("only-prerelease", surfaceWith("0.1.0-alpha", ["A", "B"]));
    expect(refusals({ released, changelog: notes("0.1.0-beta"), surface: surfaceWith("0.1.0-beta", ["A"]) })).toEqual([]);
    expect(refusals({ released, changelog: notes("0.1.0-beta"), surface: surfaceWith("0.1.0", ["A"]) })).toEqual(['CHANGELOG.md has no "## 0.1.0" heading']);
  });

  it("[install.api.bump-required] wants a changelog heading for the new version, and a version above the last release", () => {
    const released = releasedAt("changelog", surfaceWith("0.1.0", ["A"]));
    expect(refusals({ released, changelog: notes("0.1.0"), surface: surfaceWith("0.1.1", ["A", "B"]) })).toEqual(['CHANGELOG.md has no "## 0.1.1" heading']);
    expect(refusals({ released, changelog: notes("0.1.10"), surface: surfaceWith("0.1.1", ["A", "B"]) })).toEqual(['CHANGELOG.md has no "## 0.1.1" heading']);
    const later = releasedAt("below", surfaceWith("0.3.0", ["A"]));
    expect(refusals({ released: later, changelog: notes("0.2.0"), surface: surfaceWith("0.2.0", ["A"]) })).toEqual(["0.2.0 is below every released version (0.3.0)"]);
  });
});
