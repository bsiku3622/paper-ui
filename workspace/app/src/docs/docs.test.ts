// @vitest-environment node
//
// The repo's docs/ held to the docs runtime: every doc parses, DOC_GROUPS and the files agree one to
// one, and every link between docs reaches an existing doc and heading. Whether an app link
// (/playground/…) reaches a route is checked against the route table, which the shell owns.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";

import { collectDocs } from "../../vite/paper-docs";
import { DOC_GROUPS } from "../site/site-core";
import { resolveDocHref } from "./links";
import { parseDoc } from "./parse";

const DOCS_DIR = fileURLToPath(new URL("../../../../docs", import.meta.url));
const FILES = readdirSync(DOCS_DIR, { recursive: true, encoding: "utf-8" }).filter((path) => path.endsWith(".md")).map((path) => path.split("\\").join("/")).sort();
const read = (file: string) => readFileSync(join(DOCS_DIR, file), "utf-8");

type Node = { type: string; url?: string; value?: string; children?: Node[] };
const walk = (node: Node, visit: (node: Node) => void) => {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
};
const textOf = (node: Node): string => node.value ?? node.children?.map(textOf).join("") ?? "";
const tree = (markdown: string) => unified().use(remarkParse).use(remarkGfm).parse(markdown) as unknown as Node;

// The destinations of the links, as the page renders them: a `[contract:…]: #` definition is a marker, not a link.
const linksOf = (markdown: string): string[] => {
  const urls: string[] = [];
  walk(tree(markdown), (node) => {
    if (node.type === "link" && node.url !== undefined) urls.push(node.url);
  });
  return urls;
};

// The heading ids rehype-slug gives the rendered body: github-slugger over each heading's text, in order.
const headingIdsOf = (markdown: string): Set<string> => {
  const slugger = new GithubSlugger();
  const ids = new Set<string>();
  walk(tree(markdown), (node) => {
    if (node.type === "heading") ids.add(slugger.slug(textOf(node)));
  });
  return ids;
};

describe("linksOf", () => {
  it("reads contract definitions as markers, not links", () => {
    expect(linksOf("[contract:app.docs.sample]: #\n\nSee [the page](other.md#part) and https://example.com.\n")).toEqual(["other.md#part", "https://example.com"]);
  });

  it("ignores a link in a code span or block", () => {
    expect(linksOf("`[a](b.md)`\n\n```md\n[c](d.md)\n```\n")).toEqual([]);
  });
});

describe("docs/", () => {
  it("has files, and every one parses with a title", () => {
    expect(FILES.length).toBeGreaterThan(0);
    for (const file of FILES) expect(parseDoc(read(file)).title, file).not.toBe("");
  });

  it("is listed in DOC_GROUPS one to one, in group order", async () => {
    const docs = await collectDocs({ dir: DOCS_DIR, groups: DOC_GROUPS });
    expect(docs.map((doc) => doc.file).sort()).toEqual(FILES);
    expect(docs.map((doc) => doc.group)).toEqual(DOC_GROUPS.flatMap((group) => group.docs.map(() => group.id)));
    expect(new Set(docs.map((doc) => doc.slug)).size).toBe(docs.length);
  });

  it("links to docs and headings that exist", async () => {
    const docs = await collectDocs({ dir: DOCS_DIR, groups: DOC_GROUPS });
    const headingIds = new Map(docs.map((doc) => [doc.slug, headingIdsOf(parseDoc(read(doc.file)).body)]));
    const broken: string[] = [];
    for (const doc of docs) {
      for (const url of linksOf(parseDoc(read(doc.file)).body)) {
        const target = resolveDocHref(doc.file, url);
        const [slug, hash] = target.kind === "anchor" ? [doc.slug, target.hash] : target.kind === "doc" ? [target.slug, target.hash] : [];
        if (slug === undefined) continue;
        const ids = headingIds.get(slug);
        if (!ids) broken.push(`${doc.file}: ${url} points at no doc`);
        else if (hash && !ids.has(decodeURIComponent(hash))) broken.push(`${doc.file}: ${url} points at no heading`);
      }
    }
    expect(broken).toEqual([]);
  });
});
