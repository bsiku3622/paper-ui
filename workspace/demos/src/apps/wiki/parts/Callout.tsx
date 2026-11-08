import type { ReactNode } from "react";

import { Inline, Stack, Surface } from "@studio-baeks/paper-ui";

import { Glyph, type GlyphName } from "../../../kit";

export const Callout = ({ glyph = "info", tone = "secondary", children }: { glyph?: GlyphName; tone?: "secondary" | "info" | "warning" | "error"; children: ReactNode }) => (
  <Surface fill="sunken" radius="md" padding="md" role="note">
    <Inline gap="sm" align="start">
      <Glyph name={glyph} size="subheading" ink={tone} />
      <Stack gap="sm" minWidth={0}>
        {children}
      </Stack>
    </Inline>
  </Surface>
);
