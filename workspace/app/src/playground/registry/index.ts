// The registry: one Spec per Playground entry, in the site map's order. The entries are the files
// of ./entries (one per PLAYGROUND_NAV item, named by its slug); the slug and the group come from the
// site map, so a name and a place are written once.

import { PLAYGROUND_NAV } from "../../site/site-map";
import type { Spec } from "./schema";

const FILES = import.meta.glob<{ default: Spec }>("./entries/*.tsx", { eager: true });

export type Entry = Spec & {
  slug: string;
  // The sidebar section the entry sits in (a primitive group, or Utilities), or Atoms.
  group: string;
  // Which part of the system it documents: the id of the site map group (Primitives or Atoms).
  part: "primitives" | "atoms";
};

const fileOf = (slug: string): Spec | undefined => FILES[`./entries/${slug}.tsx`]?.default;

export const REGISTRY: readonly Entry[] = PLAYGROUND_NAV.filter((group) => group.id !== "foundations").flatMap((group) =>
  group.sections.flatMap((section) =>
    section.items.map((item): Entry => {
      const spec = fileOf(item.slug);
      if (!spec) throw new Error(`The registry has no entry for ${item.name}; add playground/registry/entries/${item.slug}.tsx.`);
      return { ...spec, slug: item.slug, group: section.label || "Atoms", part: group.id as Entry["part"] };
    }),
  ),
);

export const entryBySlug = (slug: string): Entry | undefined => REGISTRY.find((entry) => entry.slug === slug);

export { codeOf, stateFromCode } from "./code";
export { named, printJsx } from "./jsx";
export { initialState, normalized, type Control, type Spec, type State } from "./schema";
