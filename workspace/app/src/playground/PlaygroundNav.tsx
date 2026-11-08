import { PLAYGROUND_NAV, type PlaygroundGroup, type PlaygroundSection } from "../site/site-map";
import { useWords } from "../site/locale";
import { SidebarNav, type SidebarBlock, type SidebarGroup } from "../site/SidebarNav";

const linksOf = (section: PlaygroundSection) => section.items.map(({ name, slug }) => ({ label: name, to: `/playground/${slug}` }));

const blocksOf = (group: PlaygroundGroup): SidebarBlock[] => {
  const blocks: (SidebarBlock & { runs: string })[] = [];
  for (const section of group.sections) {
    const runs = section.order ?? section.label;
    const last = blocks.at(-1);
    if (last?.runs === runs) last.links.push(...linksOf(section));
    else blocks.push({ runs, heading: section.order ? undefined : section.label || undefined, links: linksOf(section) });
  }
  return blocks;
};

const GROUPS: SidebarGroup[] = [
  { blocks: [{ links: [{ label: "Overview", to: "/playground" }] }] },
  ...PLAYGROUND_NAV.map((group) => ({ label: group.label, blocks: blocksOf(group) })),
];

const NAV_LABEL = { ko: "플레이그라운드 목차", en: "Playground contents" };

export const PlaygroundNav = () => <SidebarNav label={useWords(NAV_LABEL)} groups={GROUPS} />;
