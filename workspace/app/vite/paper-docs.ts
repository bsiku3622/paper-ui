// paperDocs — the repo's docs/**/*.md as the virtual module `virtual:paper-docs`, straight from the files:
//
//   import { DOCS } from "virtual:paper-docs";   // {slug, group, title, file}[] in DOC_GROUPS order
//
// DOC_GROUPS (src/site/site-core.ts) is the only list of which docs exist and in which order. A doc that
// is not listed, a listed doc without a file, a group without docs and a doc without a `# Title` first line
// all throw — as the dev overlay while serving and as a failed `vite build`. A change under docs/ reloads
// the page, so the sidebar and the text follow edits without a restart.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { normalizePath, type Plugin } from "vite";

import { parseDoc } from "../src/docs/parse";
import { docFile, docSlug, type DocEntry, type DocGroup } from "../src/site/site-core";

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
  const unlisted = new Set(await markdownFiles(dir));
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
        docs.push({ slug: docSlug(group.id, doc), group: group.id, title: parseDoc(await readFile(join(dir, file), "utf-8")).title, file });
      } catch (error) {
        problems.push(`docs/${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  for (const file of [...unlisted].sort()) problems.push(`docs/${file} is not listed in DOC_GROUPS`);
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
      for (const { file } of docs) this.addWatchFile(join(options.dir, file));
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
