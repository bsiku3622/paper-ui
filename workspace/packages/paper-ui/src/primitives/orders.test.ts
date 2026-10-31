// The two orders of the Primitives are pinned by what the files import and what the stylesheets read.
// The first order is the ground and leans on no second-order folder; the second order is Box plus one
// capability, and its folders reach each other along the few edges below and no others.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { PRIMITIVE_ORDERS } from "../inventory";

const primitives = dirname(fileURLToPath(import.meta.url));
const src = dirname(primitives);

// The second-order folders, by the name of the group that holds them.
const SECOND = PRIMITIVE_ORDERS.second.map((group) => group.toLowerCase());

// select → focus: a group is one tab stop. float → paint: the scrim only. Nothing else reaches across, and
// nothing but Atoms and callers reaches press: a part is a native button and `<Pressable as={Part}>` gives it a press.
const EDGES: Record<string, readonly string[]> = {
  select: ["focus"],
  float: ["paint"],
};

// internal/ sits below the primitives, which makes it the way around the edges above. What second-order folders share
// through it is general tools, named here. A capability's own state is not one: a shared module holds no context.
const SHARED_INTERNAL = ["errors", "joinClass", "measure", "refs", "render-target", "useControllableState"];

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const isSource = (path: string) => /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path);
const sources = (dir: string) => walk(dir).filter(isSource);
const read = (path: string) => readFileSync(path, "utf8");

type Import = { from: string; names: string[] };
const STATEMENT = /^(?:import|export)\s+([^;'"]*?)\s*from\s*["']([^"']+)["']/gm;
const SIDE_EFFECT = /^import\s*["']([^"']+)["']/gm;
const importsOf = (path: string): Import[] => {
  const code = read(path);
  const named = [...code.matchAll(STATEMENT)].map(([, clause = "", from]) => ({
    from: from!,
    names: clause.replace(/\btype\b/g, " ").split(/[\s,{}*]+/).filter((name) => name && name !== "as"),
  }));
  const bare = [...code.matchAll(SIDE_EFFECT)].map(([, from]) => ({ from: from!, names: [] }));
  return [...named, ...bare].filter(({ from }) => from.startsWith("."));
};

// The primitives folder a relative import lands in: "" for a file directly under primitives, undefined outside.
const folderOf = (file: string, from: string): string | undefined => {
  const parts = relative(primitives, resolve(dirname(file), from)).split(sep);
  return parts[0] === ".." ? undefined : parts.length > 1 ? parts[0] : "";
};

const ownFolder = (file: string) => {
  const parts = relative(primitives, file).split(sep);
  return parts.length > 1 ? parts[0]! : "";
};

// The one barrel imports every folder by design, so it belongs to neither order.
const secondOrderFiles = SECOND.flatMap((folder) => sources(join(primitives, folder)));
const firstOrderFiles = sources(primitives).filter((file) => !SECOND.includes(ownFolder(file)) && relative(primitives, file) !== "index.ts");

describe("the first order", () => {
  it("[primitives.orders.first] imports no second-order folder", () => {
    expect(firstOrderFiles.length).toBeGreaterThan(0);
    const violations = firstOrderFiles.flatMap((file) =>
      importsOf(file)
        .map(({ from }) => ({ file: relative(primitives, file), from, folder: folderOf(file, from) }))
        .filter(({ folder }) => folder !== undefined && SECOND.includes(folder)),
    );
    expect(violations).toEqual([]);
  });

  it("[primitives.orders.first] keeps Box, Stack, Inline and Grid free of the theme scope", () => {
    for (const file of ["Box.tsx", "layout/Stack.tsx", "layout/Inline.tsx", "layout/Grid.tsx"]) expect(read(join(primitives, file)), file).not.toMatch(/useThemeScope/);
  });
});

describe("the second order", () => {
  it("[primitives.orders.second] imports only the allowed edges, and each import of another folder is one of them", () => {
    expect(secondOrderFiles.length).toBeGreaterThan(0);
    const violations = secondOrderFiles.flatMap((file) => {
      const own = ownFolder(file);
      return importsOf(file)
        .map(({ from }) => ({ file: relative(primitives, file), from, folder: folderOf(file, from) }))
        .filter(({ folder }) => folder !== undefined && SECOND.includes(folder) && folder !== own && !(EDGES[own] ?? []).includes(folder));
    });
    expect(violations).toEqual([]);
  });

  it("[primitives.orders.second] shares only general tools through internal/, so a capability's state cannot slip around the edges", () => {
    const users = new Map<string, Set<string>>();
    for (const file of secondOrderFiles) {
      for (const { from } of importsOf(file)) {
        const module = relative(join(src, "internal"), resolve(dirname(file), from));
        if (!module.startsWith("..")) users.set(module, (users.get(module) ?? new Set()).add(ownFolder(file)));
      }
    }
    const shared = [...users].filter(([, folders]) => folders.size > 1).map(([module]) => module).sort();
    expect(shared).toEqual([...SHARED_INTERNAL].sort());
    for (const module of shared) expect(read(join(src, "internal", `${module}.ts`)), module).not.toMatch(/createContext/);
  });

  it("[primitives.orders.second] lets float reach paint for the scrim and nothing else", () => {
    const names = sources(join(primitives, "float")).flatMap((file) =>
      importsOf(file).filter(({ from }) => folderOf(file, from) === "paint").flatMap(({ from, names }) => names.map((name) => `${from}#${name}`)),
    );
    expect(names).toEqual(["../paint/recipes.css#scrimPaint"]);
  });

  it("[primitives.orders.second] keeps the hook useSelectable free of press", () => {
    const hook = join(primitives, "select/useSelectable.ts");
    expect(importsOf(hook).filter(({ from }) => folderOf(hook, from) === "press")).toEqual([]);
  });

  it("[primitives.orders.second] keeps the hover gate inside the paint tier", () => {
    const users = sources(src).filter((file) => /\bhoverGate\b/.test(read(file)) && relative(src, file) !== join("styles", "color.css.ts"));
    expect(users.map((file) => relative(src, file))).toEqual([join("primitives", "paint", "Paint.tsx")]);
  });
});

describe("colour ownership", () => {
  const stylesheets = walk(primitives).filter((file) => file.endsWith(".css.ts"));

  it("[primitives.orders.colour] reads tokens.color in the paint tier and in Icon's ink, and nowhere else under primitives", () => {
    expect(stylesheets.length).toBeGreaterThan(0);
    const readers = stylesheets.filter((file) => /tokens\.color\b/.test(read(file))).map((file) => relative(primitives, file));
    for (const reader of readers) expect(reader.startsWith(`paint${sep}`) || reader === "Icon.css.ts", reader).toBe(true);
  });

  it("[primitives.orders.colour] keeps Box's stylesheet free of colour", () => {
    expect(read(join(primitives, "Box.css.ts"))).not.toMatch(/tokens\.color\b/);
  });
});
