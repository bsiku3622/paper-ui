import type { ReactNode, RefObject } from "react";

import { Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { dialogSteady, dialogWidth } from "./dialog.css";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  size?: keyof typeof dialogWidth;
  steady?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children?: ReactNode;
  footer?: ReactNode;
};

export const Dialog = ({ open, onClose, title, description, size = "md", steady = false, initialFocusRef, children, footer }: DialogProps) => (
  <Floating open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <Floating.Content as={Surface} fill="raised" radius="lg" presentation="modal" aria-label={title} initialFocusRef={initialFocusRef} className={steady ? `${dialogWidth[size]} ${dialogSteady}` : dialogWidth[size]}>
      <Stack gap="lg" padding="xl">
        <Inline justify="between" align="start" gap="md">
          <Stack gap="xs" minWidth={0}>
            <Text as="h2" variant="heading">{title}</Text>
            {description ? <Text ink="secondary">{description}</Text> : null}
          </Stack>
          <IconButton as={Floating.Close} variant="ghost" size="sm" aria-label="닫기"><Glyph name="x" /></IconButton>
        </Inline>
        {children}
        {footer ? <Inline justify="end" gap="sm" wrap>{footer}</Inline> : null}
      </Stack>
    </Floating.Content>
  </Floating>
);
