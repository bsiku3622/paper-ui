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
  closeLabel?: string;
  restoreFocus?: boolean;
};

export const Dialog = ({ open, onOpenChange, title, children, actions, closeLabel = "대화상자 닫기", restoreFocus = true }: DialogProps) => {
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
