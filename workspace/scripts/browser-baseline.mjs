// browser-baseline.mjs — the declared browser floor and the CSS features the package stands on.
//
// packages/paper-ui/package.json "browserslist" is the floor. The package's Vite build.target and cssTarget
// derive from it (buildTargets), and every CSS feature the package uses has a row in FEATURES: a pattern
// that finds it in the built stylesheet, the first version of each engine that supports it, and its kind.
// A required feature must work at the floor. An enhancement may be missing there, and the floor then loses
// motion only. Adopting a CSS feature adds its row here.
//
// `node scripts/browser-baseline.mjs [stylesheet]` scans dist/paper-ui.css (or the given file) and fails
// when a required feature it uses is newer than the floor.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const ENGINES = ["chrome", "edge", "firefox", "safari", "ios_saf"];
const ESBUILD_ENGINE = { chrome: "chrome", edge: "edge", firefox: "firefox", safari: "safari", ios_saf: "ios" };

export const compareVersions = (a, b) => {
  const [x, y] = [a, b].map((version) => version.split(".").map(Number));
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const delta = (x[i] ?? 0) - (y[i] ?? 0);
    if (delta !== 0) return Math.sign(delta);
  }
  return 0;
};

// "chrome >= 125" → { chrome: "125" }. Every engine needs exactly one floor query.
export const parseFloor = (browserslist) => {
  const floor = {};
  for (const query of browserslist) {
    const match = /^(\w+) >= (\d+(?:\.\d+)?)$/.exec(query.trim());
    if (!match || !ENGINES.includes(match[1]) || match[1] in floor) throw new Error(`browserslist: unsupported query "${query}"`);
    floor[match[1]] = match[2];
  }
  const missing = ENGINES.filter((engine) => !(engine in floor));
  if (missing.length > 0) throw new Error(`browserslist: no floor for ${missing.join(", ")}`);
  return floor;
};

// esbuild target names for Vite's build.target and cssTarget, in browserslist order.
export const buildTargets = (browserslist) =>
  Object.entries(parseFloor(browserslist)).map(([engine, version]) => `${ESBUILD_ENGINE[engine]}${version}`);

const since = (chrome, edge, firefox, safari, ios_saf) => ({ chrome, edge, firefox, safari, ios_saf });

export const FEATURES = [
  { name: "@layer", pattern: /@layer\b/, kind: "required", since: since("99", "99", "97", "15.4", "15.4") },
  { name: ":where()", pattern: /:where\(/, kind: "required", since: since("88", "88", "78", "14", "14") },
  { name: ":has()", pattern: /:has\(/, kind: "required", since: since("105", "105", "121", "15.4", "15.4") },
  { name: ":dir()", pattern: /:dir\(/, kind: "required", since: since("120", "120", "49", "16.4", "16.4") },
  { name: "round()", pattern: /(?<![\w-])round\(/, kind: "required", since: since("125", "125", "118", "15.4", "15.4") },
  { name: ":focus-visible", pattern: /:focus-visible\b/, kind: "required", since: since("86", "86", "85", "15.4", "15.4") },
  { name: "translate", pattern: /(?<![\w-])translate\s*:/, kind: "required", since: since("104", "104", "72", "14.1", "14.5") },
  // The inset shorthand and its logical longhands (inset-inline-start · -end, inset-block-*).
  { name: "logical inset", pattern: /(?<![\w-])inset(?:-(?:inline|block)(?:-(?:start|end))?)?\s*:/, kind: "required", since: since("87", "87", "66", "14.1", "14.5") },
  { name: "color-scheme", pattern: /(?<![\w-])color-scheme\s*:/, kind: "required", since: since("81", "81", "96", "13", "13") },
  { name: "forced-colors", pattern: /\(\s*forced-colors\s*:/, kind: "required", since: since("89", "79", "89", "16", "16") },
  { name: "prefers-reduced-motion", pattern: /\(\s*prefers-reduced-motion\s*:/, kind: "required", since: since("74", "79", "63", "10.1", "10.3") },
];

// Every feature the stylesheet uses, and the engines at the floor that lack it.
export const checkStylesheet = (css, floor, features = FEATURES) => {
  const used = features
    .filter((feature) => feature.pattern.test(css))
    .map((feature) => ({ name: feature.name, kind: feature.kind, missing: ENGINES.filter((engine) => compareVersions(feature.since[engine], floor[engine]) > 0) }));
  return {
    used: used.map((feature) => feature.name),
    failures: used.filter((feature) => feature.kind === "required" && feature.missing.length > 0).map(({ name, missing }) => ({ name, missing })),
    degraded: used.filter((feature) => feature.kind === "enhancement" && feature.missing.length > 0).map(({ name, missing }) => ({ name, missing })),
  };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  const floor = parseFloor(JSON.parse(read("../packages/paper-ui/package.json")).browserslist);
  const file = process.argv[2] ?? fileURLToPath(new URL("../packages/paper-ui/dist/paper-ui.css", import.meta.url));
  const result = checkStylesheet(readFileSync(file, "utf8"), floor);
  console.log(`floor: ${ENGINES.map((engine) => `${engine} ${floor[engine]}`).join(" · ")}`);
  console.log(`used: ${result.used.join(" · ") || "none"}`);
  for (const { name, missing } of result.degraded) console.log(`enhancement ${name}: motion only below ${missing.join(", ")}`);
  for (const { name, missing } of result.failures) console.error(`required ${name} is newer than the floor of ${missing.join(", ")}`);
  process.exitCode = result.failures.length > 0 ? 1 : 0;
}
