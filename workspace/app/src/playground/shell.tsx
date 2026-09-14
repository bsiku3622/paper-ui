// PlaygroundLayout — 시스템 Sidebar로 세우는 공용 reference shell.

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Breadcrumb, Sidebar, Stack, tokens, type SidebarBadge, type SidebarGroup } from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { COMPONENTS, GROUPS } from "./registry";

const CHANGE_BADGE: Record<"new" | "mod", SidebarBadge> = {
  new: { label: "NEW", color: "info" },
  mod: { label: "MOD", color: "warning" },
};

const sidebarGroups = (): SidebarGroup[] => [
  {
    value: "reference",
    label: "레퍼런스",
    items: [
      { value: "tokens", label: "토큰 · Foundations", as: Link, to: "/playground/tokens" },
      { value: "all", label: "전수 · 한 화면", as: Link, to: "/playground" },
    ],
  },
  ...GROUPS.map((group) => ({
    value: group.toLowerCase(),
    label: group,
    items: COMPONENTS.filter((component) => component.group === group).map((component) => ({
      value: component.slug,
      label: component.name,
      as: Link,
      to: `/playground/${component.slug}`,
      badge: component.change ? CHANGE_BADGE[component.change] : undefined,
    })),
  })),
];

export const PlaygroundLayout = ({ active, children }: { active: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box style={{ display: "grid", gridTemplateColumns: `${tokens.shape.width.lg.layout} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
      <Sidebar
        groups={sidebarGroups()}
        active={active}
        aria-label="컴포넌트 레퍼런스"
        style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, top: NAV_HEIGHT, position: "sticky" }}
      />
      <Box paddingX="xl" paddingY="xl" style={{ minWidth: 0 }}>{children}</Box>
    </Box>
  </Stack>
);

export const Crumb = ({ group, name }: { group: string; name: string }) => (
  <Breadcrumb items={[{ value: "group", label: group }, { value: "name", label: name }]} />
);
