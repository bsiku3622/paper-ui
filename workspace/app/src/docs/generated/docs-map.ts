// The map in docs/README.md: each group under its DOC_GROUPS heading, every doc under its title, and the
// first Playground item of each part of the site.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDoc } from "../parse";
import { DOC_GROUPS, docFile } from "../../site/site-core";
import { PLAYGROUND_NAV } from "../../site/site-map";
import { PRIMITIVE_ORDERS } from "@studio-baeks/paper-ui";

import type { GeneratedBlock } from "./markers";
import { DOCS_DIR } from "./paths";

// The map's own labels for the two docs whose titles are longer than the map wants (today's map text).
const MAP_LABEL: Record<string, string> = { "get-started/philosophy": "원칙", "get-started/install": "설치" };

// A label for a doc that left DOC_GROUPS would be ignored in silence, so it stops the build instead.
const DOC_PATHS = new Set(DOC_GROUPS.flatMap((group) => group.docs.map((doc) => docFile(group.id, doc).replace(/\.md$/, ""))));
for (const path of Object.keys(MAP_LABEL)) {
  if (!DOC_PATHS.has(path)) throw new Error(`MAP_LABEL names ${path}, which is not a doc in DOC_GROUPS`);
}

const titleOf = (group: string, doc: string): string => {
  const label = MAP_LABEL[docFile(group, doc).replace(/\.md$/, "")];
  return label ?? parseDoc(readFileSync(join(DOCS_DIR, docFile(group, doc)), "utf-8")).title;
};

const link = (group: string, doc: string) => `[${titleOf(group, doc)}](${docFile(group, doc)})`;

const primitiveDocs = (): string => {
  const group = DOC_GROUPS.find((entry) => entry.id === "primitives")!;
  const docs = group.docs.filter((doc) => doc !== "README");
  const first = new Set(PRIMITIVE_ORDERS.first.map((name) => name.toLowerCase()));
  const parts = docs.map((doc, index) => {
    const prefix = index === 0 ? "1차 " : docs[index - 1] && first.has(docs[index - 1]!) && !first.has(doc) ? "2차 " : "";
    return `${prefix}${link(group.id, doc)}`;
  });
  return [link("primitives", "README"), ...parts].join(" · ");
};

const playground = () => {
  const [foundations, primitives, atoms] = PLAYGROUND_NAV;
  const href = (slug: string | undefined) => `/playground/${slug}`;
  return `[Overview](/playground) · [Foundations](${href(foundations!.sections[0]!.items[0]!.slug)}) · [Primitives](${href(primitives!.sections[0]!.items[0]!.slug)}) · [Atoms](${href(atoms!.sections[0]!.items[0]!.slug)})`;
};

export const DOCS_MAP_BLOCK: GeneratedBlock = {
  id: "docs-map",
  files: ["docs/README.md"],
  render: () => {
    const lines = DOC_GROUPS.filter((group) => group.id !== "").map((group) => {
      if (group.id === "primitives") return `- **${group.ko}** — ${primitiveDocs()}`;
      return `- **${group.ko}** — ${group.docs.map((doc) => link(group.id, doc)).join(" · ")}`;
    });
    return [...lines, `- **Playground** — ${playground()}`].join("\n");
  },
};
