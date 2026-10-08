import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Inline, Stack, Text, tokens } from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { FOUNDATION_SECTIONS } from "./foundation-sections";

const linkStyle = (active: boolean) => ({
  display: "block",
  padding: `${tokens.shape.padding.xs.layout} ${tokens.shape.padding.sm.layout}`,
  color: active ? tokens.color.ink.primary : tokens.color.ink.secondary,
  background: active ? tokens.color.interaction.selected : "transparent",
  textDecoration: "none",
  fontSize: tokens.text.style.body.size,
});

export const PlaygroundLayout = ({ value, children }: { value: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box style={{ display: "grid", gridTemplateColumns: `${tokens.shape.width.lg.layout} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
      <Box as="nav" aria-label="Foundations" style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, top: NAV_HEIGHT, position: "sticky", alignSelf: "start", padding: tokens.shape.padding.md.layout, borderRight: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}` }}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Text variant="label" ink="faint">REFERENCE</Text>
            <Link to="/playground/palette" style={linkStyle(value === "palette")}>Palette</Link>
          </Stack>
          <Stack gap="xs">
            <Text variant="label" ink="faint">FOUNDATIONS</Text>
            {FOUNDATION_SECTIONS.map(([slug, label]) => (
              <Link key={slug} to={`/playground/foundations/${slug}`} style={linkStyle(value === `foundation-${slug}`)}>{label}</Link>
            ))}
          </Stack>
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
