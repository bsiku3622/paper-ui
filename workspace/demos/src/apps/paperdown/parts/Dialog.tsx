// The window every dialog of the app is made of: Paper's Floating over a scrim, a title with its close button, the words, and the
// buttons at the end. The original's are `<dialog>` elements; this is their stand-in.

import type { ReactNode } from "react";

import { Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { useMedia } from "../lib/hooks";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  // The name of the close button.
  closeLabel?: string;
  // Whether the focus goes back to what had it when the dialog opened. The editor's dialogs say no: the editor puts the focus
  // back in the paper itself.
  restoreFocus?: boolean;
};

export const Dialog = ({ open, onOpenChange, title, children, actions, closeLabel = "대화상자 닫기", restoreFocus = true }: DialogProps) => {
  // The modal stands in a grid whose one track takes the width of what is put in it, so a width wider than a phone would spill
  // over its edge: on a phone the dialog takes the narrow one.
  const phone = useMedia("(max-width: 520px)");
  return (
    <Floating open={open} onOpenChange={onOpenChange}>
      <Floating.Content as={Surface} fill="raised" radius="md" padding="xl" width={phone ? "xl" : "measure.xs"} maxWidth="full" presentation="modal" restoreFocus={restoreFocus} aria-label={title}>
        <Stack gap="lg">
          <Inline justify="between" align="center" gap="md">
            <Text as="h2" variant="subheading">{title}</Text>
            <IconButton as={Floating.Close} size="xs" variant="ghost" aria-label={closeLabel}>
              <Glyph name="x" />
            </IconButton>
          </Inline>
          {children}
          {actions ? <Inline justify="end" gap="sm" wrap>{actions}</Inline> : null}
        </Stack>
      </Floating.Content>
    </Floating>
  );
};
