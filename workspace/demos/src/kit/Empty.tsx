import type { ReactNode } from "react";

import { Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, type GlyphName } from "./Glyph";

export const Empty = ({ glyph = "inbox", title, description, action }: { glyph?: GlyphName; title: ReactNode; description?: ReactNode; action?: ReactNode }) => (
  <Stack align="center" gap="sm" padding="2xl">
    <Glyph name={glyph} size="subheading" ink="tertiary" />
    <Text as="p" variant="subheading">{title}</Text>
    {description ? <Text as="p" ink="tertiary">{description}</Text> : null}
    {action}
  </Stack>
);
