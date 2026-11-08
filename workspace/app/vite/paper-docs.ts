// paperDocs — the repo's docs/**/*.md as the virtual module `virtual:paper-docs`, straight from the files:
//
//   import { DOCS } from "virtual:paper-docs";   // {slug, group, title, file}[] in DOC_GROUPS order
//
// DOC_GROUPS (src/site/site-core.ts) is the only list of which docs exist and in which order. A doc that
// is not listed, a listed doc without a file, a group without docs and a doc without a `# Title` first line
// all throw — as the dev overlay while serving and as a failed `vite build`. A change under docs/ reloads
// the page, so the sidebar and the text follow edits without a restart.
//
// docs/en/ holds English translations at the same paths: a doc may have one, and a translation without its Korean original throws
// as an unlisted doc does.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { normalizePath, type Plugin } from "vite";

import { parseDoc } from "../src/docs/parse";
import { EN_DOCS_DIR, docFile, docSlug, type DocEntry, type DocGroup } from "../src/site/site-core";

export type PaperDocsOptions = { dir: string; groups: readonly DocGroup[] };

const VIRTUAL_ID = "virtual:paper-docs";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

const markdownFiles = async (dir: string, base = ""): Promise<string[]> => {
  const found: string[] = [];
  for (const entry of await readdir(join(dir, base), { withFileTypes: true })) {
    const path = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...(await markdownFiles(dir, path)));
    else if (entry.name.endsWith(".md")) found.push(path);
  }
  return found;
};

export const collectDocs = async ({ dir, groups }: PaperDocsOptions): Promise<DocEntry[]> => {
  const all = await markdownFiles(dir);
  const translations = new Set(all.filter((file) => file.startsWith(`${EN_DOCS_DIR}/`)).map((file) => file.slice(EN_DOCS_DIR.length + 1)));
  const unlisted = new Set(all.filter((file) => !file.startsWith(`${EN_DOCS_DIR}/`)));
  const docs: DocEntry[] = [];
  const problems: string[] = [];
  for (const group of groups) {
    if (group.docs.length === 0) problems.push(`group "${group.id}" lists no docs`);
    for (const doc of group.docs) {
      const file = docFile(group.id, doc);
      if (!unlisted.delete(file)) {
        problems.push(`docs/${file} is listed but has no file`);
        continue;
      }
      try {
        const entry: DocEntry = { slug: docSlug(group.id, doc), group: group.id, title: parseDoc(await readFile(join(dir, file), "utf-8")).title, file };
        if (translations.delete(file)) entry.titleEn = parseDoc(await readFile(join(dir, EN_DOCS_DIR, file), "utf-8")).title;
        docs.push(entry);
      } catch (error) {
        problems.push(`docs/${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  for (const file of [...unlisted].sort()) problems.push(`docs/${file} is not listed in DOC_GROUPS`);
  for (const file of [...translations].sort()) problems.push(`docs/${EN_DOCS_DIR}/${file} translates no listed doc`);
  if (problems.length > 0) throw new Error(`docs do not match DOC_GROUPS (app/src/site/site-core.ts):\n- ${problems.join("\n- ")}`);
  return docs;
};

export const paperDocs = (options: PaperDocsOptions): Plugin => {
  const root = `${normalizePath(options.dir)}/`;
  return {
    name: "paper-docs",
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : null),
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const docs = await collectDocs(options);
      for (const { file, titleEn } of docs) {
        this.addWatchFile(join(options.dir, file));
        if (titleEn !== undefined) this.addWatchFile(join(options.dir, EN_DOCS_DIR, file));
      }
      return `export const DOCS = ${JSON.stringify(docs)};`;
    },
    configureServer(server) {
      server.watcher.add(options.dir);
    },
    hotUpdate({ file }) {
      if (!file.endsWith(".md") || !normalizePath(file).startsWith(root)) return;
      const listing = this.environment.moduleGraph.getModuleById(RESOLVED_ID);
      if (listing) this.environment.moduleGraph.invalidateModule(listing);
      if (this.environment.name === "client") this.environment.hot.send({ type: "full-reload" });
      return [];
    },
  };
};
