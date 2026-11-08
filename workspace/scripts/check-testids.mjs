import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SKIP = new Set(["node_modules", "dist", "test-results", "playwright-report", ".doc-snippets"]);
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  if (SKIP.has(entry.name)) return [];
  return entry.isDirectory() ? walk(path) : [path];
});

const SOURCE = /\.(?:tsx?|jsx?)$/;
const isTest = (path) => /\.(?:test|spec)\.(?:tsx?|mjs|js)$/.test(path);

const VALUE = String.raw`(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*\`([^\`]*)\`\s*\})`;
const literal = (...groups) => {
  const text = groups.find((group) => group !== undefined);
  if (text === undefined) return undefined;
  const at = text.indexOf("${");
  return at < 0 ? { text, template: false } : { text: text.slice(0, at), template: true };
};

const DEFINITION = new RegExp(String.raw`\b(?:data-testid|testid)=${VALUE}|"data-testid":\s*(?:"([^"]*)"|\`([^\`]*)\`)`, "g");
const CALL = new RegExp(String.raw`\b(?:get|query|find)(?:All)?ByTestId\(\s*(?:"([^"]*)"|'([^']*)'|\`([^\`]*)\`)`, "g");
const SELECTOR = /\[data-testid(\^?)=\s*(?:"([^"]*)"|'([^']*)'|([^\]"'\s]+))\s*\]/g;

const STRING = /"([^"\n]*)"|'([^'\n]*)'|`([^`\n]*)`/g;

const NAMED_LOOKUP = /\b(?:get|query|find)(?:All)?By(?:Role|LabelText|Label|Text)\(\s*(?:"[^"\n]*"|'[^'\n]*'|`[^`\n]*`)(?:\s*,\s*\{[^{}]*\})?/g;

const clip = (text) => {
  const at = text.indexOf("${");
  return at < 0 ? { text, template: false } : { text: text.slice(0, at), template: true };
};

export const definitionsIn = (file, code) => {
  const found = [];
  for (const match of code.matchAll(DEFINITION)) {
    const value = literal(...match.slice(1, 6)) ?? literal(...match.slice(6, 8));
    if (value && value.text !== "") found.push({ id: value.text, template: value.template, file });
  }
  return found;
};

export const referencesIn = (code) => {
  const found = [];
  for (const match of code.matchAll(CALL)) {
    const { text, template } = clip(match[1] ?? match[2] ?? match[3]);
    if (text !== "") found.push({ id: text, template });
  }
  for (const match of code.matchAll(SELECTOR)) {
    const { text, template } = clip(match[2] ?? match[3] ?? match[4]);
    if (text !== "") found.push({ id: text, template: template || match[1] === "^" });
  }
  if (/ByTestId\(|data-testid/.test(code)) {
    for (const match of code.replace(NAMED_LOOKUP, "").matchAll(STRING)) {
      const { text, template } = clip(match[1] ?? match[2] ?? match[3]);
      if (text !== "") found.push({ id: text, template });
    }
  }
  return found;
};

const meets = (definition, reference) => {
  if (!definition.template && !reference.template) return definition.id === reference.id;
  if (!definition.template) return definition.id.startsWith(reference.id);
  if (!reference.template) return reference.id.startsWith(definition.id);
  return definition.id.startsWith(reference.id) || reference.id.startsWith(definition.id);
};

export const orphans = ({ definitions, references }) => definitions.filter((definition) => !references.some((reference) => meets(definition, reference)));

export const readRepository = (workspace = fileURLToPath(new URL("..", import.meta.url))) => {
  const read = (path) => ({ path: relative(workspace, path).split(sep).join("/"), code: readFileSync(path, "utf8") });
  const definitionFiles = [...walk(join(workspace, "app/src")), ...walk(join(workspace, "fixtures/harness/src"))].filter((path) => SOURCE.test(path) && !isTest(path));
  const testFiles = [
    ...walk(join(workspace, "tests")),
    ...walk(join(workspace, "app/src")),
    ...walk(join(workspace, "packages/paper-ui/src")),
  ].filter((path) => SOURCE.test(path) && isTest(path));
  const definitions = definitionFiles.map(read).flatMap(({ path, code }) => definitionsIn(path, code));
  const references = testFiles.map(read).flatMap(({ code }) => referencesIn(code));
  return { definitions, references };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { definitions, references } = readRepository();
  const unread = orphans({ definitions, references });
  for (const { id, template, file } of unread) console.error(`${file}: data-testid ${template ? `"${id}…"` : `"${id}"`} is read by no test — delete it or bind it to a spec`);
  if (unread.length === 0) console.log(`check-testids: ${definitions.length} data-testid values, each read by a test`);
  process.exitCode = unread.length > 0 ? 1 : 0;
}
