// PlaygroundLayout — 플레이그라운드 공용 껍데기.
//
// SiteNav + 컴포넌트 사이드바 + 본문. 전수 레퍼런스(/playground)와 컴포넌트별
// 상세(/playground/:slug)가 같은 사이드바를 공유해 어디에 있든 길을 잃지 않는다.

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Inline, Stack, Text, tokens } from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { COMPONENTS, GROUPS } from "./registry";

const SideLink = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
  <Link to={to} style={{ textDecoration: "none" }}>
    <Text
      variant="body"
      as="span"
      style={{
        fontSize: "0.875rem",
        color: active ? tokens.color.accent.blue.ink : tokens.color.ink.soft,
        fontWeight: active ? 550 : 450,
      }}
    >
      {label}
    </Text>
  </Link>
);

export const PlaygroundLayout = ({ active, children }: { active: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box style={{ display: "grid", gridTemplateColumns: "13rem 1fr", maxWidth: "72rem", marginInline: "auto", width: "100%" }}>
      <Box
        as="nav"
        paddingX="lg"
        paddingY="xl"
        style={{
          borderRight: `1px solid ${tokens.color.border.base}`,
          minHeight: `calc(100vh - ${NAV_HEIGHT})`,
          position: "sticky",
          top: NAV_HEIGHT,
          alignSelf: "start",
        }}
      >
        <Stack gap="lg">
          <Stack gap="xs">
            <Text variant="label">레퍼런스</Text>
            <SideLink to="/playground" label="전수 · 한 화면" active={active === "all"} />
          </Stack>
          {GROUPS.map((g) => {
            const items = COMPONENTS.filter((c) => c.group === g);
            if (items.length === 0) return null;
            return (
              <Stack key={g} gap="xs">
                <Text variant="label">{g}</Text>
                <Stack gap="xs">
                  {items.map((c) => (
                    <SideLink key={c.slug} to={`/playground/${c.slug}`} label={c.name} active={active === c.slug} />
                  ))}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      <Box paddingX="xl" paddingY="xl" style={{ minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  </Stack>
);

// 사이드바 헤더에서 재사용할 수 있는 브레드크럼 한 줄.
export const Crumb = ({ group, name }: { group: string; name: string }) => (
  <Inline gap="xs" align="center">
    <Text variant="caption" ink="faint" as="span">{group}</Text>
    <Text variant="caption" ink="faint" as="span">/</Text>
    <Text variant="caption" ink="soft" as="span">{name}</Text>
  </Inline>
);
