// Sidebar — an app's navigation: the first face of the window, a raised card, the page you are on in solid ink.
// The app says only what is in it.
//
// An item with `to` is a route and is current when the location matches it (`end` for an exact match); an item with
// `onSelect` is a button. `current` overrides both, for an app that keeps its own place.

import type { ReactNode } from "react";
import { Link as RouterLink, matchPath, useLocation } from "react-router-dom";

import { Badge, Button, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { useFace, useShell } from "./AppShell";
import { Glyph, type GlyphName } from "./Glyph";

export type NavItem = {
  id: string;
  label: string;
  glyph?: GlyphName;
  // Drawn in place of the glyph: a cover, an avatar, a colour dot.
  art?: ReactNode;
  to?: string;
  end?: boolean;
  onSelect?: () => void;
  count?: number | string;
  // Anything else at the end of the row (a status dot, a Badge, a shortcut).
  badge?: ReactNode;
};

export type NavSection = { label?: string; action?: ReactNode; items: readonly NavItem[] };

export type SidebarProps = {
  // What the navigation is called, for assistive technology ("관리 메뉴").
  label: string;
  brand?: ReactNode;
  // Under the brand: a workspace switcher, a search.
  top?: ReactNode;
  sections: readonly NavSection[];
  current?: string;
  // At the bottom: items (설정, 도움말) and anything else (an account card, a storage meter).
  footerItems?: readonly NavItem[];
  footer?: ReactNode;
};

const useHere = (item: NavItem, current: string | undefined) => {
  const { pathname } = useLocation();
  if (current !== undefined) return current === item.id;
  if (!item.to) return false;
  return matchPath({ path: item.to, end: item.end ?? false }, pathname) !== null;
};

const Item = ({ item, current }: { item: NavItem; current: string | undefined }) => {
  const here = useHere(item, current);
  const lead = item.art ?? (item.glyph ? <Glyph name={item.glyph} /> : null);
  const end = item.badge ?? (item.count !== undefined && item.count !== 0 ? <Badge accent="info" variant="solid" size="sm">{item.count}</Badge> : null);
  const body = (
    <>
      <Inline as="span" gap="sm" align="center" minWidth={0}>{lead}<Text as="span" ink="inherit" strong={here} truncate>{item.label}</Text></Inline>
      {end}
    </>
  );
  const shared = {
    variant: here ? ("solid" as const) : ("muted" as const),
    fullWidth: true,
    justify: end ? ("between" as const) : ("start" as const),
    "aria-current": here ? ("page" as const) : undefined,
    onClick: item.onSelect,
  };
  return item.to
    ? <Button as={RouterLink} to={item.to} {...shared}>{body}</Button>
    : <Button {...shared}>{body}</Button>;
};

const Sections = ({ sections, current }: { sections: readonly NavSection[]; current: string | undefined }) => (
  <>
    {sections.map((section, index) => (
      <Stack key={section.label ?? index} gap="xs">
        {section.label ? (
          <Inline justify="between" align="center" paddingX="lg">
            <Text as="span" variant="label" ink="tertiary">{section.label}</Text>
            {section.action}
          </Inline>
        ) : null}
        {section.items.map((item) => <Item key={item.id} item={item} current={current} />)}
      </Stack>
    ))}
  </>
);

export const Sidebar = ({ label, brand, top, sections, current, footerItems, footer }: SidebarProps) => {
  const { folded } = useShell();
  const face = useFace();
  const content = (
    <Stack justify="between" gap="lg" height={folded ? undefined : "full"}>
      <Stack gap="lg">
        {brand}
        {top}
        <Stack as="nav" aria-label={label} gap="md">
          <Sections sections={sections} current={current} />
        </Stack>
      </Stack>
      {footerItems || footer ? (
        <Stack gap="md">
          {footerItems ? <Stack as="nav" aria-label={`${label} · 아래`} gap="xs"><Sections sections={[{ items: footerItems }]} current={current} /></Stack> : null}
          {footer}
        </Stack>
      ) : null}
    </Stack>
  );
  if (folded) return content;
  return <Surface as="aside" elevation="sticky" height="viewport" overflowY="auto" hideBelow="md" top="lg" {...face} radius="lg" padding="md">{content}</Surface>;
};

// The app's name at the top of the sidebar, with a mark that leads home.
export const SidebarBrand = ({ name, glyph = "sparkles", to, sub }: { name: string; glyph?: GlyphName; to: string; sub?: string }) => (
  <Inline gap="sm" align="center" paddingX="md" paddingY="xs">
    <IconButton as={RouterLink} to={to} size="xs" aria-label={`${name} 첫 화면`}><Glyph name={glyph} /></IconButton>
    <Stack minWidth={0}>
      <Text as="span" variant="subheading" truncate>{name}</Text>
      {sub ? <Text as="span" variant="caption" ink="tertiary" truncate>{sub}</Text> : null}
    </Stack>
  </Inline>
);

// A block at the foot of the sidebar: an account, a quota, what is playing. Inside the card it is a well.
export const SidebarCard = ({ children }: { children: ReactNode }) => <Surface fill="sunken" radius="md" padding="md">{children}</Surface>;
