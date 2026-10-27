import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Inline, Stack, Text, tokens } from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { FOUNDATION_SECTIONS } from "./foundation-sections";
import { COMPONENTS, GROUPS } from "./registry";

const linkStyle = (active: boolean) => ({
  display: "block",
  padding: `${tokens.layout.padding.xs} ${tokens.layout.padding.sm}`,
  color: active ? tokens.color.ink.primary : tokens.color.ink.secondary,
  background: active ? tokens.color.interaction.selected : "transparent",
  textDecoration: "none",
  fontSize: tokens.text.style.body.size,
});

export const PlaygroundLayout = ({ value, children }: { value: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box style={{ display: "grid", gridTemplateColumns: `${tokens.layout.width.lg} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
      <Box as="nav" aria-label="플레이그라운드" style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, maxHeight: `calc(100dvh - ${NAV_HEIGHT})`, overflowY: "auto", top: NAV_HEIGHT, position: "sticky", alignSelf: "start", padding: tokens.layout.padding.md, borderRight: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Text variant="label" ink="faint">PLAYGROUND</Text>
            <Link to="/playground" style={linkStyle(value === "all")}>Overview</Link>
            <Link to="/playground/palette" style={linkStyle(value === "palette")}>Palette</Link>
          </Stack>
          <Stack gap="xs">
            <Text variant="label" ink="faint">FOUNDATIONS</Text>
            {FOUNDATION_SECTIONS.map(([slug, label]) => (
              <Link key={slug} to={`/playground/foundations/${slug}`} style={linkStyle(value === `foundation-${slug}`)}>{label}</Link>
            ))}
          </Stack>
          {GROUPS.map((group) => (
            <Stack key={group} gap="xs">
              <Text variant="label" ink="faint">{group}</Text>
              {COMPONENTS.filter((component) => component.group === group).map((component) => (
                <Link key={component.slug} to={`/playground/${component.slug}`} aria-current={value === component.slug ? "page" : undefined} style={linkStyle(value === component.slug)}>{component.name}</Link>
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>
      <Box paddingX="xl" paddingY="xl" style={{ minWidth: 0 }}>{children}</Box>
    </Box>
  </Stack>
);

export const Crumb = ({ group, name }: { group: string; name: string }) => (
  <Inline gap="xs" align="center">
    <Text variant="caption" ink="faint">{group}</Text>
    <Text variant="caption" ink="faint">/</Text>
    <Text variant="caption" ink="soft">{name}</Text>
  </Inline>
);

export const ReferenceHeading = ({ group, name, description }: { group: string; name: string; description: string }) => (
  <Stack gap="xs">
    <Crumb group={group} name={name} />
    <Text as="h1" variant="title">{name}</Text>
    <Text variant="body" ink="soft">{description}</Text>
  </Stack>
);
