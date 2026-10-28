import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Inline, Stack, Text, tokens } from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { FOUNDATION_SECTIONS } from "./foundations/sections";
import { COMPONENTS, PRIMITIVE_GROUPS, type CompSpec } from "./registry";

const linkStyle = (active: boolean) => ({
  display: "block",
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  color: active ? tokens.color.ink.primary : tokens.color.ink.secondary,
  background: active ? tokens.color.interaction.selected : "transparent",
  textDecoration: "none",
  fontSize: tokens.text.style.body.size,
});

const NavGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap="xs">
    <Text variant="label" ink="soft">{label}</Text>
    <Stack gap="sm">{children}</Stack>
  </Stack>
);

const ComponentLinks = ({ group, value }: { group: CompSpec["group"]; value: string }) => (
  <Stack gap="xs">
    {COMPONENTS.filter((component) => component.group === group).map((component) => (
      <Link key={component.slug} to={`/playground/${component.slug}`} aria-current={value === component.slug ? "page" : undefined} style={linkStyle(value === component.slug)}>{component.name}</Link>
    ))}
  </Stack>
);

export const PlaygroundLayout = ({ value, children }: { value: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box style={{ display: "grid", gridTemplateColumns: `${tokens.shape.dimension.width.lg} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
      <Box as="nav" aria-label="플레이그라운드" style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, maxHeight: `calc(100dvh - ${NAV_HEIGHT})`, overflowY: "auto", top: NAV_HEIGHT, position: "sticky", alignSelf: "start", padding: tokens.shape.inset.lg, borderRight: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
        {/* Foundations → Primitives → Atoms: the order the system is built in. */}
        <Stack gap="lg">
          <Link to="/playground" style={linkStyle(value === "all")}>Overview</Link>
          <NavGroup label="Foundations">
            {FOUNDATION_SECTIONS.map(([slug, label]) => (
              <Link key={slug} to={`/playground/foundations/${slug}`} aria-current={value === `foundation-${slug}` ? "page" : undefined} style={linkStyle(value === `foundation-${slug}`)}>{label}</Link>
            ))}
          </NavGroup>
          <NavGroup label="Primitives">
            {PRIMITIVE_GROUPS.map((group) => (
              <Stack key={group} gap="xs">
                <Text variant="caption" ink="faint" style={{ paddingInline: tokens.shape.inset.md }}>{group}</Text>
                <ComponentLinks group={group} value={value} />
              </Stack>
            ))}
          </NavGroup>
          <NavGroup label="Atoms">
            <ComponentLinks group="Atoms" value={value} />
          </NavGroup>
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
