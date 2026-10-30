// The site map — the only list of how the site is laid out: the top navigation, the Playground sidebar
// and the docs. The Playground lists derive from the package's INVENTORY; the docs side lives in
// site-core.ts, which the Vite docs plugin reads in Node, and is re-exported here.

import { INVENTORY, PRIMITIVE_ORDERS, type PrimitiveOrder } from "@studio-baeks/paper-ui";

import { FOUNDATIONS } from "./site-core";

export * from "./site-core";

export const SITE_NAV = [
  { to: "/", label: "홈" },
  { to: "/demo", label: "데모" },
  { to: "/playground", label: "플레이그라운드" },
  { to: "/docs", label: "문서" },
] as const;

// PascalCase component name → URL slug.
export const slugOf = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// The Playground sidebar: Foundations → Primitives → Atoms. `slug` is the path after /playground/.
// A group without sub-headings has one section with an empty label. A primitive section carries the order
// it belongs to; the sidebar puts that order's heading above the first section of it.
export type PlaygroundItem = { name: string; slug: string };
export type PlaygroundSection = { label: string; items: PlaygroundItem[]; order?: PrimitiveOrder };
export type PlaygroundGroup = { id: "foundations" | "primitives" | "atoms"; label: string; sections: PlaygroundSection[] };

const items = (names: readonly string[]): PlaygroundItem[] => names.map((name) => ({ name, slug: slugOf(name) }));

export const PLAYGROUND_NAV: readonly PlaygroundGroup[] = [
  {
    id: "foundations",
    label: "Foundations",
    sections: [{ label: "", items: FOUNDATIONS.map(({ id, label }) => ({ name: label, slug: `foundations/${id}` })) }],
  },
  {
    id: "primitives",
    label: "Primitives",
    sections: [
      ...(Object.keys(PRIMITIVE_ORDERS) as PrimitiveOrder[]).flatMap((order) =>
        PRIMITIVE_ORDERS[order].map((group): PlaygroundSection => ({ label: group, order, items: items(INVENTORY.primitives[group].components) })),
      ),
      { label: "Utilities", items: items(["Composition", "Theme"]) },
    ],
  },
  { id: "atoms", label: "Atoms", sections: [{ label: "", items: items(INVENTORY.atoms) }] },
];
