import { useId, type ReactNode } from "react";

import { Box, Divider, IconButton, Inline, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, useFace, type GlyphName } from "../../../kit";
import { useSettings } from "../settings";

export type PanelProps = {
  id: string;
  title: string;
  glyph?: GlyphName;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  collapsible?: boolean;
};

export const Panel = ({ id, title, glyph, actions, children, flush = false, collapsible = true }: PanelProps) => {
  const face = useFace();
  const heading = useId();
  const { settings, patch } = useSettings();
  const open = !(collapsible && settings.collapsed[id]);
  return (
    <Surface as="section" aria-labelledby={heading} {...face} radius="lg" overflow="hidden">
      <Inline justify="between" align="center" gap="sm" paddingX="lg" paddingY="sm">
        <Inline gap="sm" align="center" minWidth={0}>
          {glyph ? <Glyph name={glyph} ink="secondary" /> : null}
          <Text as="h2" id={heading} variant="subheading" truncate>{title}</Text>
        </Inline>
        <Inline gap="xs" align="center">
          {actions}
          {collapsible ? (
            <IconButton variant="ghost" size="sm" aria-label={`${title} ${open ? "접기" : "펼치기"}`} aria-expanded={open} onClick={() => patch("collapsed", { ...settings.collapsed, [id]: open })}>
              <Glyph name={open ? "chevron-up" : "chevron-down"} />
            </IconButton>
          ) : null}
        </Inline>
      </Inline>
      {open ? (
        <>
          <Divider />
          {flush ? children : <Box padding="lg">{children}</Box>}
        </>
      ) : null}
    </Surface>
  );
};
