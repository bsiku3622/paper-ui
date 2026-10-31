// SidebarNav — the one sidebar of the Docs and the Playground. It is sticky with its own scroll, marks the page
// you are on, and answers the pointer. Below md it is a closed disclosure above the content.
//
// A list is groups → blocks → sections → links, and the gaps are the structure: a group's label sits xs above
// its blocks, blocks are md apart, the sections of a block sm apart, and a section's caption and links xs apart.
// A list of links that wants sm between them (the Foundations) makes each link a section of its own.

import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { ChevronRightIcon } from "../compositions/icons";
import * as s from "./shell.css";
import { useMediaQuery } from "./useMediaQuery";

export type SidebarLink = { label: string; to: string };
export type SidebarSection = { caption?: string; links: SidebarLink[] };
export type SidebarBlock = { heading?: string; sections: SidebarSection[] };
export type SidebarGroup = { label?: string; blocks: SidebarBlock[] };

// The route a link points at, without a closing slash, so "/docs/" and "/docs" are one page.
const here = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname);

const Section = ({ section, current }: { section: SidebarSection; current: string }) => (
  <Stack gap="xs">
    {section.caption ? <Text variant="caption" ink="tertiary" className={s.navHeading}>{section.caption}</Text> : null}
    {section.links.map(({ label, to }) => (
      <Surface key={to} as={RouterLink} to={to} hoverable className={s.navItem} aria-current={to === current ? "page" : undefined}>
        {label}
      </Surface>
    ))}
  </Stack>
);

const Group = ({ group, current }: { group: SidebarGroup; current: string }) => (
  <Stack gap="xs">
    {group.label ? <Text variant="label" ink="secondary">{group.label}</Text> : null}
    <Stack gap="md">
      {group.blocks.map((block, index) => (
        <Stack key={block.heading ?? index} gap="sm">
          {block.heading ? <Text variant="label" ink="tertiary" className={s.navHeading}>{block.heading}</Text> : null}
          {block.sections.map((section, at) => <Section key={section.caption ?? at} section={section} current={current} />)}
        </Stack>
      ))}
    </Stack>
  </Stack>
);

// `label` names the list for assistive technology and, under md, the summary of the disclosure.
export const SidebarNav = ({ label, groups }: { label: string; groups: SidebarGroup[] }) => {
  const current = here(useLocation().pathname);
  const wide = !useMediaQuery(s.narrow);
  // The disclosure opens for one page: following a link closes it.
  const [openAt, setOpenAt] = useState<string>();
  const open = wide || openAt === current;
  const page = groups.flatMap((group) => group.blocks.flatMap((block) => block.sections.flatMap((section) => section.links))).find((link) => link.to === current);

  return (
    <Surface as="nav" elevation="sticky" aria-label={label} className={s.sidebar}>
      <details open={open} onToggle={(event) => { if (!wide) setOpenAt(event.currentTarget.open ? current : undefined); }}>
        <Surface as="summary" border radius="sm" hoverable className={s.summary}>
          <Text variant="label" as="span">{label}</Text>
          {page ? <Text variant="caption" as="span" ink="secondary" className={s.summaryCurrent}>{page.label}</Text> : null}
          <ChevronRightIcon className={s.chevron} />
        </Surface>
        <Stack gap="lg" className={s.disclosureBody}>
          {groups.map((group, index) => <Group key={group.label ?? index} group={group} current={current} />)}
        </Stack>
      </details>
    </Surface>
  );
};
