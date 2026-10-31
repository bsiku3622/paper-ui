// The Playground sidebar: Overview, then Foundations → Primitives → Atoms as the site map lists them. The sections
// of one order of the Primitives stand together under that order's heading; the Foundations pages are sections of
// one link each, which keeps them one step further apart than the components.

import { PLAYGROUND_NAV, PRIMITIVE_ORDER_LABELS, type PlaygroundGroup, type PlaygroundSection } from "../site/site-map";
import { SidebarNav, type SidebarBlock, type SidebarGroup } from "../site/SidebarNav";

const linksOf = (section: PlaygroundSection) => section.items.map(({ name, slug }) => ({ label: name, to: `/playground/${slug}` }));

const blocksOf = (group: PlaygroundGroup): SidebarBlock[] => {
  if (group.id === "foundations") return [{ sections: group.sections.flatMap(linksOf).map((link) => ({ links: [link] })) }];
  const blocks: { order?: PlaygroundSection["order"]; sections: PlaygroundSection[] }[] = [];
  for (const section of group.sections) {
    const last = blocks.at(-1);
    if (last && section.order !== undefined && last.order === section.order) last.sections.push(section);
    else blocks.push({ order: section.order, sections: [section] });
  }
  return blocks.map(({ order, sections }) => ({
    heading: order ? PRIMITIVE_ORDER_LABELS[order] : undefined,
    sections: sections.map((section) => ({ caption: section.label || undefined, links: linksOf(section) })),
  }));
};

const GROUPS: SidebarGroup[] = [
  { blocks: [{ sections: [{ links: [{ label: "Overview", to: "/playground" }] }] }] },
  ...PLAYGROUND_NAV.map((group) => ({ label: group.label, blocks: blocksOf(group) })),
];

export const PlaygroundNav = () => <SidebarNav label="플레이그라운드 목차" groups={GROUPS} />;
