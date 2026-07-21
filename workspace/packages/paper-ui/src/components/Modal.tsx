// Modal — 종이 위로 뜬 쪽지. 이 시스템에서 그림자를 갖는 몇 안 되는 자리.

import { useEffect, type ReactNode } from "react";

import { Box, Stack, Inline, Text } from "../primitives";
import { Button, Divider } from "../atoms";
import { modalBackdrop, modalPanel } from "./Modal.css";

export type ModalProps = {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
};

export const Modal = ({ open, title, onClose, children, footer }: ModalProps) => {
  // Esc — 뜬 것은 반드시 닫을 수 있어야 한다.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Box className={modalBackdrop} onClick={onClose}>
      <Box
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        paper="base"
        radius="lg"
        shadow="overlay"
        className={modalPanel}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Stack>
          <Box padding="lg">
            <Text variant="heading">{title}</Text>
          </Box>
          <Divider />
          <Box padding="lg">{children}</Box>
          <Divider />
          <Inline padding="md" gap="sm" justify="end">
            {footer ?? (
              <Button variant="quiet" onClick={onClose}>
                닫기
              </Button>
            )}
          </Inline>
        </Stack>
      </Box>
    </Box>
  );
};
