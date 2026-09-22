// PlaygroundLayout — 시스템 Sidebar로 세우는 공용 reference shell.

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Breadcrumb, Sidebar, Stack, tokens } from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { COMPONENTS, GROUPS } from "./registry";

const CHANGE_BADGE = {
  new: { label: "NEW", color: "info" },
  mod: { label: "MOD", color: "warning" },
} as const;

export const PlaygroundLayout = ({ value, children }: { value: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box style={{ display: "grid", gridTemplateColumns: `${tokens.shape.width.lg.layout} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
      <Sidebar
        value={value}
        aria-label="컴포넌트 레퍼런스"
        style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, top: NAV_HEIGHT, position: "sticky" }}
      >
        <Sidebar.Group label="레퍼런스">
          <Sidebar.Item value="palette" as={Link} to="/playground/palette">팔레트 · Foundations</Sidebar.Item>
          <Sidebar.Item value="tokens" as={Link} to="/playground/tokens">토큰 · Foundations</Sidebar.Item>
          <Sidebar.Item value="all" as={Link} to="/playground">전수 · 한 화면</Sidebar.Item>
        </Sidebar.Group>
        {GROUPS.map((group) => (
          <Sidebar.Group key={group} label={group}>
            {COMPONENTS.filter((component) => component.group === group).map((component) => {
              const badge = component.change ? CHANGE_BADGE[component.change] : undefined;
              return (
                <Sidebar.Item key={component.slug} value={component.slug} as={Link} to={`/playground/${component.slug}`}>
                  {component.name}
                  {badge ? <Sidebar.Badge accent={badge.color}>{badge.label}</Sidebar.Badge> : null}
                </Sidebar.Item>
              );
            })}
          </Sidebar.Group>
        ))}
      </Sidebar>
      <Box paddingX="xl" paddingY="xl" style={{ minWidth: 0 }}>{children}</Box>
    </Box>
  </Stack>
);

export const Crumb = ({ group, name }: { group: string; name: string }) => (
  <Breadcrumb><Breadcrumb.Item>{group}</Breadcrumb.Item><Breadcrumb.Item current>{name}</Breadcrumb.Item></Breadcrumb>
);
