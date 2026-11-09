import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Sidebar } from "@studio-baeks/paper-ui";

import * as s from "./shell.css";

export const SIDEBAR_ID = "site-sidebar";
export type SidebarState = { open: boolean; onOpenChange: (open: boolean) => void };

export type SidebarLink = { label: string; to: string };
export type SidebarBlock = { heading?: string; links: SidebarLink[] };
export type SidebarGroup = { label?: string; blocks: SidebarBlock[] };

const here = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname);

const Block = ({ block, current }: { block: SidebarBlock; current: string }) => (
  <Sidebar.Group title={block.heading}>
    {block.links.map(({ label, to }) => (
      <Sidebar.Item key={to} as={RouterLink} to={to} current={to === current}>{label}</Sidebar.Item>
    ))}
  </Sidebar.Group>
);

const holds = (group: SidebarGroup, current: string) => group.blocks.some((block) => block.links.some((link) => link.to === current));

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
  } catch { /* Storage can be unavailable; folding still works for this visit. */ }
};

const useFolded = (list: string, groups: SidebarGroup[], current: string) => {
  const [folded, setFolded] = useState<string[]>(() => readFolded(list));
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

export const SidebarNav = ({ label, groups, open, onOpenChange }: { label: string; groups: SidebarGroup[]; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const current = here(useLocation().pathname);
  const [folded, toggle] = useFolded(label, groups, current);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const list = nav.current;
    const item = list?.querySelector('[aria-current="page"]');
    if (!list || !item) return;
    const frame = list.getBoundingClientRect();
    const { top, bottom } = item.getBoundingClientRect();
    if (top < frame.top || bottom > frame.bottom) list.scrollTop += top - frame.top - frame.height / 2;
  }, [current, open]);

  return (
    <Sidebar ref={nav} id={SIDEBAR_ID} label={label} offset={s.navHeight} collapseBelow="md" open={open} onOpenChange={onOpenChange}>
      {groups.map((group, index) => {
        const blocks = group.blocks.map((block, at) => <Block key={block.heading ?? at} block={block} current={current} />);
        const name = group.label;
        return name ? (
          <Sidebar.Group key={name} collapsible title={name} open={!folded.includes(name)} onOpenChange={() => toggle(name)}>{blocks}</Sidebar.Group>
        ) : (
          <Sidebar.Group key={index}>{blocks}</Sidebar.Group>
        );
      })}
    </Sidebar>
  );
};
