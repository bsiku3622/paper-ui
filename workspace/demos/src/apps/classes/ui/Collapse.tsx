import type { ReactNode } from "react";

import { Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, type GlyphName } from "../../../kit";

export const Collapse = ({ title, glyph, open, onToggle, children }: { title: string; glyph?: GlyphName; open: boolean; onToggle: () => void; children: ReactNode }) => (
  <Stack gap="sm">
    <Button variant="ghost" size="lg" fontSize="body" strong={false} fullWidth justify="between" aria-expanded={open} onClick={onToggle}>
      <Inline as="span" gap="sm" align="center">
        {glyph ? <Glyph name={glyph} ink="tertiary" /> : null}
        <Text as="span" strong>{title}</Text>
      </Inline>
      <Glyph name={open ? "chevron-up" : "chevron-down"} ink="tertiary" />
    </Button>
    {open ? <Stack paddingX="md" paddingY="sm" gap="md">{children}</Stack> : null}
  </Stack>
);
