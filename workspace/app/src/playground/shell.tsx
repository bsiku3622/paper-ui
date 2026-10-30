import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Inline, Stack, Text } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { PLAYGROUND_NAV, PRIMITIVE_ORDER_LABELS, type PlaygroundGroup, type PlaygroundItem, type PlaygroundSection } from "../site/site-map";

const linkStyle = (active: boolean) => ({
  display: "block",
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  color: active ? tokens.color.ink.primary : tokens.color.ink.secondary,
  background: active ? tokens.color.interaction.selected : "transparent",
  textDecoration: "none",
  fontSize: tokens.typography.role.body.size,
});

const NavGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap="xs">
    <Text variant="label" ink="secondary">{label}</Text>
    <Stack gap="sm">{children}</Stack>
  </Stack>
);

const NavLinks = ({ items, value }: { items: PlaygroundItem[]; value: string }) =>
  items.map(({ name, slug }) => (
    <Link key={slug} to={`/playground/${slug}`} aria-current={value === slug ? "page" : undefined} style={linkStyle(value === slug)}>{name}</Link>
  ));

const SectionLinks = ({ section, value }: { section: PlaygroundSection; value: string }) => (
  <Stack gap="xs">
    {section.label ? <Text variant="caption" ink="tertiary" style={{ paddingInline: tokens.shape.inset.md }}>{section.label}</Text> : null}
    <Stack gap="xs"><NavLinks items={section.items} value={value} /></Stack>
  </Stack>
);

// The sections of a group. The sections of one order stand together under that order's heading.
const GroupSections = ({ group, value }: { group: PlaygroundGroup; value: string }) => {
  const blocks = group.sections.reduce<PlaygroundSection[][]>((out, section) => {
    const last = out.at(-1);
    if (last && section.order !== undefined && last[0]!.order === section.order) last.push(section);
    else out.push([section]);
    return out;
  }, []);
  return (
    <Stack gap="md">
      {blocks.map(([head, ...rest]) => (
        <Stack key={head!.label} gap="sm">
          {head!.order ? <Text variant="label" ink="tertiary" style={{ paddingInline: tokens.shape.inset.md }}>{PRIMITIVE_ORDER_LABELS[head!.order]}</Text> : null}
          {[head!, ...rest].map((section) => <SectionLinks key={section.label} section={section} value={value} />)}
        </Stack>
      ))}
    </Stack>
  );
};

// `value` is the slug of the page being shown ("overview" for the index).
export const PlaygroundLayout = ({ value, children }: { value: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box maxWidth="container.content" width="full" style={{ display: "grid", gridTemplateColumns: `${tokens.shape.dimension.width.lg} 1fr`, marginInline: "auto" }}>
      <Box as="nav" aria-label="플레이그라운드" style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, maxHeight: `calc(100dvh - ${NAV_HEIGHT})`, overflowY: "auto", top: NAV_HEIGHT, position: "sticky", alignSelf: "start", padding: tokens.shape.inset.lg, borderRight: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
        {/* Foundations → Primitives → Atoms: the order the system is built in, as the site map lists it. */}
        <Stack gap="lg">
          <Link to="/playground" style={linkStyle(value === "overview")}>Overview</Link>
          {PLAYGROUND_NAV.map((group) => (
            <NavGroup key={group.id} label={group.label}>
              {group.id === "foundations"
                ? <NavLinks items={group.sections.flatMap((section) => section.items)} value={value} />
                : <GroupSections group={group} value={value} />}
            </NavGroup>
          ))}
        </Stack>
      </Box>
      <Box paddingX="xl" paddingY="xl" style={{ minWidth: 0 }}>{children}</Box>
    </Box>
  </Stack>
);

export const Crumb = ({ group, name }: { group: string; name: string }) => (
  <Inline gap="xs" align="center">
    <Text variant="caption" ink="tertiary">{group}</Text>
    <Text variant="caption" ink="tertiary">/</Text>
    <Text variant="caption" ink="secondary">{name}</Text>
  </Inline>
);

export const ReferenceHeading = ({ group, name, description }: { group: string; name: string; description: string }) => (
  <Stack gap="xs">
    <Crumb group={group} name={name} />
    <Text as="h1" variant="title">{name}</Text>
    <Text variant="body" ink="secondary">{description}</Text>
  </Stack>
);
