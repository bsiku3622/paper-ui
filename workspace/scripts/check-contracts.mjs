// check-contracts.mjs — every contract the docs state has a test, and every test that claims a contract
// points at one the docs state.
//
// A contract sentence, paragraph or table in docs/**/*.md is preceded by a CommonMark link reference
// definition on its own line, which renders as nothing:
//
//   [contract:<area>.<subject>.<slug>]: #
//
// Several markers may stand together in front of one block. The test that asserts a contract starts its
// title with `[<id>]`; a test that asserts several lists their ids one after another (`[a] [b] title`).
// This covers vitest describe/it/test, Playwright test and node:test. A skipped, todo, fixme or failing title
// still has to name a defined contract, but it asserts nothing, so it does not cover one.
//
// `node scripts/check-contracts.mjs` reads the repository and fails on a duplicate marker, a marker without a
// test, a test id without a marker, a malformed marker, or a marker that does not open its own block before
// a content block (one that continues a paragraph, list item or table, or sits right above a table, renders
// as text). It runs inside `pnpm test`.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const AREAS = ["foundations", "primitives", "atoms", "install", "guardrails", "app"];

const ID = new RegExp(`^(?:${AREAS.join("|")})\\.[a-z0-9]+(?:-[a-z0-9]+)*\\.[a-z0-9]+(?:-[a-z0-9]+)*$`);
const MARKER = /^\[contract:([^\]]*)\]: #$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const HEADING = /^ {0,3}#{1,6}(?:\s|$)/;
const BREAK = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const TABLE_ROW = /^ {0,3}\|/;
// A call whose first argument is a string that opens with one or more bracketed tokens. Group 1 is the
// modifier chain after the call name (`.skip`, `.describe.serial` …), group 2 the bracketed tokens.
const TITLE = /\b(?:describe|it|test)((?:\.(?:only|skip|todo|fixme|fails?|concurrent|sequential|serial|parallel|describe))*)\s*\(\s*["'`]((?:\[[^\]\n]*\]\s*)+)/g;
// Modifiers of a test that is not run, or that is run expecting it to fail.
const NOT_ASSERTED = /\.(?:skip|todo|fixme|fails?)\b/;

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

// The markers of one Markdown file, with the placement errors that would make one render or float free.
export const parseMarkers = (path, text) => {
  const lines = text.split("\n");
  const markers = [];
  const errors = [];
  let fence = null;
  let previous = "";
  lines.forEach((line, index) => {
    const at = `${path}:${index + 1}`;
    const opening = FENCE.exec(line);
    if (fence) {
      if (opening && opening[1][0] === fence[0] && opening[1].length >= fence.length && line.trim() === opening[1]) fence = null;
      previous = fence ? previous : "```";
      return;
    }
    if (opening) {
      fence = opening[1];
      return;
    }
    if (/^\s*\[contract:/.test(line)) {
      const id = MARKER.exec(line)?.[1];
      if (id === undefined || !ID.test(id)) errors.push(`${at} malformed contract marker "${line.trim()}" — write [contract:<area>.<subject>.<slug>]: # with area ${AREAS.join(" · ")}`);
      else markers.push({ id, path, line: index + 1 });
      const opensBlock = previous === "" || previous === "```" || MARKER.test(previous) || HEADING.test(previous) || BREAK.test(previous);
      if (!opensBlock) errors.push(`${at} contract marker continues the block above it and renders as text — leave a blank line before it`);
      if (id !== undefined && !MARKER.test(lines[index + 1] ?? "")) {
        const next = lines.slice(index + 1).find((candidate) => candidate.trim() !== "" && !MARKER.test(candidate));
        if (next === undefined || HEADING.test(next) || BREAK.test(next)) errors.push(`${at} contract marker is not followed by a content block`);
        else if (TABLE_ROW.test(lines[index + 1] ?? "")) errors.push(`${at} contract marker sits right above a table and renders as text on GitHub — leave a blank line between them`);
      }
    }
    previous = line.trim() === "" ? "" : line;
  });
  return { markers, errors };
};

// The contract ids that test titles in one file claim, each with whether its test asserts the contract (a
// skipped, todo, fixme or failing one does not). Bracketed words that are not contract ids — say a title
// that opens with "[data-pui-theme]" — are not claims.
export const parseTestIds = (path, text) => {
  const ids = [];
  const errors = [];
  for (const match of text.matchAll(TITLE)) {
    const line = lineOf(text, match.index);
    const asserts = !NOT_ASSERTED.test(match[1]);
    for (const [, token] of match[2].matchAll(/\[([^\]\n]*)\]/g)) {
      if (!AREAS.some((area) => token.startsWith(`${area}.`))) continue;
      if (ID.test(token)) ids.push({ id: token, path, line, asserts });
      else errors.push(`${path}:${line} malformed contract id "[${token}]" in a test title`);
    }
  }
  return { ids, errors };
};

// docs and tests are { path, text } lists. Returns every violation; an empty list means the two map one to one.
export const checkContracts = ({ docs, tests }) => {
  const errors = [];
  const markers = new Map();
  for (const { path, text } of docs) {
    const parsed = parseMarkers(path, text);
    errors.push(...parsed.errors);
    for (const marker of parsed.markers) {
      const first = markers.get(marker.id);
      if (first) errors.push(`${marker.path}:${marker.line} duplicate contract ${marker.id} (first at ${first.path}:${first.line})`);
      else markers.set(marker.id, marker);
    }
  }
  const tested = new Set();
  const skipped = new Set();
  for (const { path, text } of tests) {
    const parsed = parseTestIds(path, text);
    errors.push(...parsed.errors);
    for (const { id, line, asserts } of parsed.ids) {
      (asserts ? tested : skipped).add(id);
      if (!markers.has(id)) errors.push(`${path}:${line} test claims contract ${id}, which no docs marker defines`);
    }
  }
  for (const [id, marker] of markers) {
    if (!tested.has(id)) errors.push(`${marker.path}:${marker.line} contract ${id} has no test whose title starts with [${id}]${skipped.has(id) ? " and asserts it (skip, todo, fixme and fail do not)" : ""}`);
  }
  return errors;
};

const SKIP = new Set(["node_modules", ".types", "test-results", "playwright-report"]);
// A directory named dist is build output, except tests/dist: the specs that run against the build are sources.
const SPECS_DIST = join("tests", "dist");
const walk = (dir, base = dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  if (SKIP.has(entry.name) || (entry.name === "dist" && relative(base, path) !== SPECS_DIST)) return [];
  return entry.isDirectory() ? walk(path, base) : [path];
});

// Test files by place: package and app unit tests, Playwright specs, eslint rule tests and script tests.
const TEST_FILES = [
  /^packages\/[^/]+\/src\/.+\.test\.tsx?$/,
  /^app\/src\/.+\.test\.tsx?$/,
  /^tests\/.+\.spec\.ts$/,
  /^eslint-rules\/[^/]+\.test\.js$/,
  /^scripts\/[^/]+\.test\.mjs$/,
];

// The repository's docs and test files, with paths relative to the repository root.
export const readRepository = (workspace = fileURLToPath(new URL("..", import.meta.url))) => {
  const root = join(workspace, "..");
  const read = (path) => ({ path: relative(root, path).split(sep).join("/"), text: readFileSync(path, "utf8") });
  const docs = walk(join(root, "docs")).filter((path) => path.endsWith(".md")).map(read);
  const tests = walk(workspace)
    .filter((path) => TEST_FILES.some((pattern) => pattern.test(relative(workspace, path).split(sep).join("/"))))
    .map(read);
  return { docs, tests };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repository = readRepository();
  const errors = checkContracts(repository);
  for (const error of errors) console.error(error);
  if (errors.length === 0) {
    const contracts = repository.docs.reduce((count, { path, text }) => count + parseMarkers(path, text).markers.length, 0);
    console.log(`check-contracts: ${contracts} contracts in docs, each with a test`);
  }
  process.exitCode = errors.length > 0 ? 1 : 0;
}
