// Small parts every service page draws the same way: a spinner, an error line, a note, a list of facts.

import type { ReactNode } from "react";

import { Grid, Inline, Spinner, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Ink } from "@studio-baeks/paper-ui/tokens";

import { Glyph, type GlyphName } from "../../../kit";

export const Loading = ({ label }: { label: string }) => (
  <Grid justifyItems="center" paddingY="3xl">
    <Spinner label={label} />
  </Grid>
);

// What went wrong and what to try, on a sunken well; `action` is the one button that tries again.
export const Alert = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <Surface fill="sunken" radius="md" padding="md">
    <Inline justify="between" align="center" gap="md" wrap>
      <Inline gap="sm" align="start" minWidth={0}>
        <Glyph name="triangle-alert" ink="error" />
        <Text role="alert" ink="error">{children}</Text>
      </Inline>
      {action}
    </Inline>
  </Surface>
);

// A line that says what just happened or what is going on.
export const Note = ({ children, glyph = "info", live = true }: { children: ReactNode; glyph?: GlyphName; live?: boolean }) => (
  <Inline gap="sm" align="start">
    <Glyph name={glyph} ink="secondary" />
    <Text role={live ? "status" : undefined} ink="secondary">{children}</Text>
  </Inline>
);

export const Hint = ({ children, ink = "tertiary" }: { children: ReactNode; ink?: Ink }) => (
  <Text as="p" variant="caption" ink={ink}>{children}</Text>
);

export const Mono = ({ children, ink, truncate }: { children: ReactNode; ink?: Ink; truncate?: boolean }) => (
  <Text as="span" variant="caption" family="mono" ink={ink} truncate={truncate}>{children}</Text>
);

// Label and value pairs, the label small and quiet on the left. A value may be text or any part.
export const Facts = ({ items }: { items: readonly { label: string; value: ReactNode }[] }) => (
  <Stack as="ul" gap="md">
    {items.map((item) => (
      <Grid key={item.label} as="li" columns={{ base: "minmax(0, 1fr)", sm: "minmax(6rem, 8.5rem) minmax(0, 1fr)" }} columnGap="lg" rowGap="xs" align="baseline">
        <Text as="span" variant="label" strong={false} ink="tertiary">{item.label}</Text>
        {typeof item.value === "string" || typeof item.value === "number" ? <Text as="span" truncate>{item.value}</Text> : <Inline minWidth={0}>{item.value}</Inline>}
      </Grid>
    ))}
  </Stack>
);
