// Writes every ts and tsx code block of the docs and the two READMEs to .doc-snippets/, one file per block, so
// `tsc -p tsconfig.snippets.json` compiles them against the package source. A block with no import or export is
// a fragment: it is wrapped as a module that imports every public name of the package, so the names the text
// uses are the names the package exports. The output folder is generated and git-ignored.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const APP = fileURLToPath(new URL("../../", import.meta.url));
const WORKSPACE = fileURLToPath(new URL("../../../", import.meta.url));
const REPO = fileURLToPath(new URL("../../../../", import.meta.url));
const OUT = join(APP, ".doc-snippets");

// The public names, read from the inventory's own source: the module has no imports, so it can be loaded as is.
const inventorySource = readFileSync(join(WORKSPACE, "packages/paper-ui/src/inventory.ts"), "utf8");
const inventoryJs = ts.transpileModule(inventorySource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { INVENTORY } = await import(`data:text/javascript,${encodeURIComponent(inventoryJs)}`);

const rootNames = [
  ...Object.values(INVENTORY.primitives).flatMap((group) => [...group.components, ...group.hooks, ...(group.functions ?? [])]),
  ...INVENTORY.atoms,
  ...Object.values(INVENTORY.utilities).flat(),
  ...INVENTORY.classes,
  "INVENTORY",
  "PRIMITIVE_GROUPS",
  "PRIMITIVE_ORDERS",
].map((name) => name.split(".")[0]);
const tokenNames = [...INVENTORY.foundations];
const unique = (names) => [...new Set(names)].sort();

const markdownFiles = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(entry.parentPath, entry.name));

const files = [...markdownFiles(join(REPO, "docs")), join(REPO, "README.md"), join(REPO, "workspace/packages/paper-ui/README.md")];
const FENCE = /^```(tsx?)\n([\s\S]*?)^```/gm;
const MODULE = /^\s*(import|export)\b/m;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let count = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = relative(REPO, file);
  for (const match of text.matchAll(FENCE)) {
    const line = text.slice(0, match.index).split("\n").length;
    const body = match[2];
    const header = `// source: ${rel}:${line}\n`;
    // A fragment of JSX (several elements in a row) becomes one element; a fragment of hook code that ends in a
    // return becomes the body of a function; any other fragment of code stays code.
    const isModule = MODULE.test(body);
    const code = isModule ? body
      : match[1] === "tsx" && body.trimStart().startsWith("<") ? `export const Fragment = () => (\n<>\n${body}</>\n);\n`
      : /^return\b/m.test(body) ? `export function Snippet() {\n${body}}\n`
      : body;
    const source = isModule
      ? `${header}${code}`
      : `${header}import { ${unique(rootNames).join(", ")} } from "@studio-baeks/paper-ui";\nimport { ${unique(tokenNames).join(", ")} } from "@studio-baeks/paper-ui/tokens";\n${code}`;
    const name = `${rel.replace(/[\\/]/g, "__").replace(/\.md$/, "")}__L${line}.tsx`;
    writeFileSync(join(OUT, name), source);
    count += 1;
  }
}
console.log(`extracted ${count} snippets to .doc-snippets/`);
