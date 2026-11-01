// @vitest-environment node
//
// The repo's docs/ held to the docs runtime: every doc parses, DOC_GROUPS and the files agree one to
// one, and every link between docs reaches an existing doc and heading. An app link (/playground/…) has to
// match the route table, which the shell owns, and a route that takes a parameter has to know the value.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { matchRoutes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { INVENTORY } from "@studio-baeks/paper-ui";

import { DURATION, EASING, LOOP } from "@paper-ui/inspect/motion";
import { LAYOUT_SOURCE } from "@paper-ui/inspect/layout";
import { SHAPE_SOURCE } from "@paper-ui/inspect/shape";
import { TYPOGRAPHY_SOURCE } from "@paper-ui/inspect/typography";

import { collectDocs } from "../../vite/paper-docs";
import { routes } from "../routes";
import { resolveHandle } from "../site/handle";
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

  it("links to app routes that the route table has", async () => {
    const docs = await collectDocs({ dir: DOCS_DIR, groups: DOC_GROUPS });
    const broken: string[] = [];
    for (const doc of docs) {
      for (const url of linksOf(parseDoc(read(doc.file)).body)) {
        const target = resolveDocHref(doc.file, url);
        if (target.kind !== "app") continue;
        const matches = matchRoutes(routes, new URL(target.path, "http://paper.test").pathname);
        const leaf = matches?.at(-1);
        // The catch-all sends an unknown path home, so reaching it means no route has the path.
        if (!matches || !leaf || leaf.route.path === "*") broken.push(`${doc.file}: ${url} matches no route`);
        else if (Object.keys(leaf.params).length > 0 && !resolveHandle(matches.map((match) => ({ handle: match.route.handle, params: match.params }))).title) broken.push(`${doc.file}: ${url} names nothing the route knows`);
      }
    }
    expect(broken).toEqual([]);
  });
});

// The prose of the docs, with the generated blocks and the code fences left out: a generated table states its
// own values, and a fence is code, not prose.
const GENERATED = /<!-- generated:[\w.-]+ -->[\s\S]*?<!-- \/generated:[\w.-]+ -->/g;
const FENCE = /^```[\s\S]*?^```/gm;
const proseOf = (markdown: string) => parseDoc(markdown).body.replace(GENERATED, "").replace(FENCE, "");
const PROSE = FILES.map((file) => [file, proseOf(read(file))] as const);

const PACKAGE_DIR = fileURLToPath(new URL("../../../packages/paper-ui/", import.meta.url));

// Every number the sources state, in the units the docs write them: a length in dp or em, a duration in ms.
const sourceNumbers = (): number[] => {
  const numbers: number[] = [];
  const visit = (value: unknown): void => {
    if (typeof value === "number") numbers.push(Math.abs(value));
    else if (typeof value === "string") for (const [match] of value.matchAll(/-?\d*\.?\d+/g)) numbers.push(Number(match));
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  [SHAPE_SOURCE, LAYOUT_SOURCE, TYPOGRAPHY_SOURCE, DURATION, EASING, LOOP].forEach(visit);
  return numbers;
};

describe("docs metadata", () => {
  it("the package description is the first sentence of the package README", () => {
    const readme = readFileSync(join(PACKAGE_DIR, "README.md"), "utf-8");
    const lead = readme.split(/\r?\n\r?\n/)[1]!.replace(/\s+/g, " ").trim();
    const pkg = JSON.parse(readFileSync(join(PACKAGE_DIR, "package.json"), "utf-8")) as { description: string };
    expect(pkg.description).toBe(lead);
  });

  it("the prose states no hex colour", () => {
    const hits = PROSE.flatMap(([file, text]) => [...text.matchAll(/(?<![\w/&])#(?:[0-9a-fA-F]{3}){1,2}(?![\w-])/g)].map(([hex]) => `${file}: ${hex}`));
    expect(hits).toEqual([]);
  });

  it("every unit literal the prose states (px · rem · em · ms) exists among the source values", () => {
    const known = sourceNumbers();
    const has = (value: number) => known.some((n) => Math.abs(n - value) < 1e-9);
    const hits: string[] = [];
    for (const [file, text] of PROSE) {
      for (const [literal, number, unit] of text.matchAll(/(?<![\w.])(\d+(?:\.\d+)?)(px|rem|em|ms)\b/g)) {
        const value = Number(number);
        const ok = unit === "rem" ? has(value) || has(value * 16) : has(value);
        if (!ok) hits.push(`${file}: ${literal}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("the Atom table follows the inventory's order", () => {
    const text = readFileSync(join(DOCS_DIR, "atoms/README.md"), "utf-8");
    const table = text.slice(text.indexOf("[contract:atoms.contract.axes]: #"), text.indexOf("[contract:atoms.contract.stands-on]: #"));
    const rows = [...table.matchAll(/^\| (\w+) \|/gm)].map((match) => match[1]).slice(1);
    expect(rows).toEqual([...INVENTORY.atoms]);
  });

  it("the prose keeps none of the phrases the docs have already dropped", () => {
    const STALE = ["variant='quiet'", 'variant="quiet"', "raw HTML above", "Cascadia", "mono·uppercase", "10·13·17", "inputPaddingX", "#2563eb", "네 규칙", "type Tone =", "wash·soft는 각각"];
    const hits = PROSE.flatMap(([file, text]) => STALE.filter((phrase) => text.includes(phrase)).map((phrase) => `${file}: ${phrase}`));
    expect(hits).toEqual([]);
  });
});
