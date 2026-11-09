import { PLAYGROUND_NAV } from "../../site/site-map";
import type { Spec } from "./schema";

const FILES = import.meta.glob<{ default: Spec }>("./entries/*.tsx", { eager: true });

export type Entry = Spec & {
  slug: string;
  group: string;
  part: "primitives" | "atoms" | "components";
};

const fileOf = (slug: string): Spec | undefined => FILES[`./entries/${slug}.tsx`]?.default;

export const REGISTRY: readonly Entry[] = PLAYGROUND_NAV.filter((group) => group.id !== "foundations").flatMap((group) =>
  group.sections.flatMap((section) =>
    section.items.map((item): Entry => {
      const spec = fileOf(item.slug);
      if (!spec) throw new Error(`The registry has no entry for ${item.name}; add playground/registry/entries/${item.slug}.tsx.`);
      return { ...spec, slug: item.slug, group: section.label || group.label, part: group.id as Entry["part"] };
    }),
  ),
);

export const entryBySlug = (slug: string): Entry | undefined => REGISTRY.find((entry) => entry.slug === slug);

export { codeOf, stateFromCode } from "./code";
export { named, printJsx } from "./jsx";
export { initialState, normalized, type Control, type SheetAxis, type Spec, type State } from "./schema";
