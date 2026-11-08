// SidebarNav — the one sidebar of the Docs and the Playground: a list on the canvas that stays under the header with its own
// scroll and a row for each page. The page you are on takes the quiet selected face: where you are is not what the screen is
// about, so it does not call for the eye. Below md the list is a closed disclosure above the content.
//
// A list is groups → blocks → links, two levels of heading at most. A row is a small Button at the body's size, and the gaps
// are the structure: groups xl apart, blocks md, rows xs. There are no icons: forty glyphs would be noise.
//
// A group folds under its heading. What is folded is remembered in this browser, per list; the group that holds the page you
// open unfolds, so the row you are on is never hidden.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Button, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { ChevronDownIcon, ChevronRightIcon } from "../compositions/icons";
import * as s from "./shell.css";
import { useMediaQuery } from "./useMediaQuery";

export type SidebarLink = { label: string; to: string };
export type SidebarBlock = { heading?: string; links: SidebarLink[] };
export type SidebarGroup = { label?: string; blocks: SidebarBlock[] };

// The route a link points at, without a closing slash, so "/docs/" and "/docs" are one page.
const here = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname);

const Block = ({ block, current }: { block: SidebarBlock; current: string }) => (
  <Stack gap="xs">
    {block.heading ? <Text as="span" variant="caption" ink="tertiary" className={s.navHeading}>{block.heading}</Text> : null}
    {block.links.map(({ label, to }) => (
      <Button key={to} as={RouterLink} to={to} size="sm" fontSize="body" fullWidth justify="start" strong={to === current} variant="ghost" aria-current={to === current ? "page" : undefined}>
        {label}
      </Button>
    ))}
  </Stack>
);

const holds = (group: SidebarGroup, current: string) => group.blocks.some((block) => block.links.some((link) => link.to === current));

const Group = ({ group, current, folded, onFold }: { group: SidebarGroup; current: string; folded: boolean; onFold: () => void }) => {
  const body = useId();
  return (
    <Stack gap="sm">
      {group.label ? (
        <Button size="sm" variant="ghost" fullWidth justify="between" aria-expanded={!folded} aria-controls={body} onClick={onFold}>
          <Text as="span" variant="subheading" ink="inherit">{group.label}</Text>
          <ChevronDownIcon className={s.groupChevron} />
        </Button>
      ) : null}
      {/* The fold is on a plain element: a Stack's display would win over the hidden attribute. */}
      <div id={body} hidden={folded}>
        <Stack gap="md">
          {group.blocks.map((block, index) => <Block key={block.heading ?? index} block={block} current={current} />)}
        </Stack>
      </div>
    </Stack>
  );
};

// What is folded, kept in this browser under the list's name. Storage can be missing or refuse, and then nothing is remembered.
const FOLDED_KEY = "paper-site:sidebar-folded";
const readFolded = (list: string): string[] => {
  try {
    const all = JSON.parse(window.localStorage.getItem(FOLDED_KEY) ?? "{}") as Record<string, unknown>;
    return Array.isArray(all[list]) ? (all[list] as unknown[]).filter((name): name is string => typeof name === "string") : [];
  } catch {
    return [];
  }
};
const writeFolded = (list: string, folded: string[]) => {
  try {
    const all = JSON.parse(window.localStorage.getItem(FOLDED_KEY) ?? "{}") as Record<string, unknown>;
    window.localStorage.setItem(FOLDED_KEY, JSON.stringify({ ...all, [list]: folded }));
  } catch { /* Folding still works for this visit when storage is unavailable. */ }
};

const useFolded = (list: string, groups: SidebarGroup[], current: string) => {
  const [folded, setFolded] = useState<string[]>(() => readFolded(list));
  // The group that holds the page you open unfolds.
  const opening = groups.find((group) => group.label && folded.includes(group.label) && holds(group, current))?.label;
  useEffect(() => {
    if (!opening) return;
    setFolded((names) => {
      const next = names.filter((name) => name !== opening);
      writeFolded(list, next);
      return next;
    });
  }, [list, opening]);
  const toggle = useCallback((name: string) => setFolded((names) => {
    const next = names.includes(name) ? names.filter((item) => item !== name) : [...names, name];
    writeFolded(list, next);
    return next;
  }), [list]);
  return [folded, toggle] as const;
};

// `label` names the list for assistive technology and, under md, the summary of the disclosure.
export const SidebarNav = ({ label, groups }: { label: string; groups: SidebarGroup[] }) => {
  const current = here(useLocation().pathname);
  const wide = !useMediaQuery(s.narrow);
  const [folded, toggle] = useFolded(label, groups, current);
  // The disclosure opens for one page: following a link closes it.
  const [openAt, setOpenAt] = useState<string>();
  const open = wide || openAt === current;
  const page = groups.flatMap((group) => group.blocks.flatMap((block) => block.links)).find((link) => link.to === current);
  // A long list scrolls on its own, so the page you are on is brought into view when it has fallen outside.
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const list = nav.current;
    const item = list?.querySelector('[aria-current="page"]');
    if (!wide || !list || !item) return;
    const frame = list.getBoundingClientRect();
    const { top, bottom } = item.getBoundingClientRect();
    if (top < frame.top || bottom > frame.bottom) list.scrollTop += top - frame.top - frame.height / 2;
  }, [current, wide]);

  return (
    <Surface as="nav" ref={nav} elevation="sticky" aria-label={label} className={s.sidebar}>
      <details open={open} onToggle={(event) => { if (!wide) setOpenAt(event.currentTarget.open ? current : undefined); }}>
        <Surface as="summary" border radius="sm" hoverable className={s.summary}>
          <Text variant="label" as="span">{label}</Text>
          {page ? <Text variant="caption" as="span" ink="secondary" className={s.summaryCurrent}>{page.label}</Text> : null}
          <ChevronRightIcon className={s.chevron} />
        </Surface>
        <Stack gap="xl" className={s.disclosureBody}>
          {groups.map((group, index) => (
            <Group key={group.label ?? index} group={group} current={current} folded={Boolean(group.label && folded.includes(group.label))} onFold={() => { if (group.label) toggle(group.label); }} />
          ))}
        </Stack>
      </details>
    </Surface>
  );
};
