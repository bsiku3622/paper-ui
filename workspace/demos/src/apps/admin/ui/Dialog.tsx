// Dialog — a modal in the original hub's frame: the head and the foot stand still and only the body scrolls. While the
// dialog is busy (saving, uploading) nothing can close it. Focus lands on the title unless a screen names a control: the
// first control is the close button, and a ring on it says nothing.

import { useId, useRef, type ReactNode, type RefObject } from "react";

import { Box, Floating, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { useAtLeast } from "../content/viewport";

// Floating's panel caps its own width at 100% of a grid cell that is as wide as the panel, so the cap never bites: a
// named width is wider than a phone. Below md the dialog takes the whole width the window leaves (width="full").
const WIDTH = { sm: "measure.xs", md: "measure.sm", lg: "measure.md" } as const;

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  size?: keyof typeof WIDTH;
  busy?: boolean;
  footer?: ReactNode;
  // Where focus lands when it opens; by default the title.
  focusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

export const Dialog = ({ open, onClose, title, description, size = "md", busy = false, footer, focusRef, children }: DialogProps) => {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const wide = useAtLeast("md");
  return (
    <Floating open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <Floating.Content
        as={Surface}
        presentation="modal"
        fill="raised"
        radius="lg"
        width={wide ? WIDTH[size] : "full"}
        overflow="hidden"
        aria-labelledby={titleId}
        dismissable={!busy}
        keyboardDismissDisabled={busy}
        initialFocusRef={focusRef ?? titleRef}
      >
        <Grid rows="auto minmax(0, 1fr) auto" maxHeight="viewport">
          <Inline justify="between" align="start" gap="md" padding="xl">
            <Stack gap="xs" minWidth={0}>
              <Text as="h2" variant="heading" id={titleId} ref={titleRef} tabIndex={-1}>{title}</Text>
              {description ? <Text ink="secondary">{description}</Text> : null}
            </Stack>
            <IconButton as={Floating.Close} size="sm" variant="ghost" aria-label="닫기" disabled={busy}><Glyph name="x" /></IconButton>
          </Inline>
          <Stack paddingX="xl" minHeight={0} overflowY="auto">{children}</Stack>
          {footer ? <Inline justify="end" gap="sm" wrap padding="xl">{footer}</Inline> : <Box paddingY="md" />}
        </Grid>
      </Floating.Content>
    </Floating>
  );
};
