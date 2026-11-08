import type { ReactNode } from "react";
import { Link as RouterLink, matchPath, useLocation } from "react-router-dom";

import { Badge, Button, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { useFace, useShell } from "./AppShell";
import { Glyph, type GlyphName } from "./Glyph";

export type NavItem = {
  id: string;
  label: string;
  glyph?: GlyphName;
  art?: ReactNode;
  to?: string;
  end?: boolean;
  onSelect?: () => void;
  count?: number | string;
  badge?: ReactNode;
};

export type NavSection = { label?: string; action?: ReactNode; items: readonly NavItem[] };

export type SidebarProps = {
  label: string;
  brand?: ReactNode;
  top?: ReactNode;
  sections: readonly NavSection[];
  current?: string;
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

export const SidebarBrand = ({ name, glyph = "sparkles", to, sub }: { name: string; glyph?: GlyphName; to: string; sub?: string }) => (
  <Inline gap="sm" align="center" paddingX="md" paddingY="xs">
    <IconButton as={RouterLink} to={to} size="xs" aria-label={`${name} 첫 화면`}><Glyph name={glyph} /></IconButton>
    <Stack minWidth={0}>
      <Text as="span" variant="subheading" truncate>{name}</Text>
      {sub ? <Text as="span" variant="caption" ink="tertiary" truncate>{sub}</Text> : null}
    </Stack>
  </Inline>
);

export const SidebarCard = ({ children }: { children: ReactNode }) => <Surface fill="sunken" radius="md" padding="md">{children}</Surface>;
