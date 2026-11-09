import { INVENTORY, PRIMITIVE_ORDERS, type PrimitiveOrder } from "@studio-baeks/paper-ui";

import { FOUNDATIONS } from "./site-core";

export * from "./site-core";

export const SITE_NAV = [
  { to: "/", label: { ko: "홈", en: "Home" } },
  { to: "/demo", label: { ko: "데모", en: "Demo" } },
  { to: "/playground", label: { ko: "플레이그라운드", en: "Playground" } },
  { to: "/docs", label: { ko: "문서", en: "Docs" } },
] as const;

export const slugOf = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

export type PlaygroundItem = { name: string; slug: string };
export type PlaygroundSection = { label: string; items: PlaygroundItem[]; order?: PrimitiveOrder };
export type PlaygroundGroup = { id: "foundations" | "primitives" | "atoms" | "components"; label: string; sections: PlaygroundSection[] };

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
  { id: "components", label: "Components", sections: [{ label: "", items: items(INVENTORY.components) }] },
];
