// Modal — 구조가 드러나는 compound dialog API.

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Box, Stack, Inline, Text } from "../primitives";
import { Button, Divider, Icon, type ButtonProps } from "../atoms";
import { joinClass } from "../internal/joinClass";
import { modalBackdrop, modalPanel, modalSize, modalStack, modalBody, modalHeaderCopy } from "./Modal.css";

export type ModalSize = "sm" | "md" | "lg";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: ModalSize;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  "aria-label"?: string;
};

type ModalContextValue = {
  titleId: string;
  descriptionId: string;
  close: () => void;
  setHasDescription: (present: boolean) => void;
};
const ModalContext = createContext<ModalContextValue | null>(null);
const useModal = () => {
  const value = useContext(ModalContext);
  if (!value) throw new Error("Modal parts must be used inside <Modal>");
  return value;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const ModalRoot = ({ open, onOpenChange, size = "md", children, closeOnBackdrop = true, closeOnEscape = true, "aria-label": ariaLabel }: ModalProps) => {
  const mid = useId();
  const titleId = `${mid}-title`;
  const descriptionId = `${mid}-description`;
  const [hasDescription, setHasDescription] = useState(false);
  const close = () => onOpenChange(false);

  useEffect(() => {
    if (!open) return;
    const backdrop = document.getElementById(mid);
    const panel = backdrop?.querySelector<HTMLElement>('[role="dialog"]') ?? null;
    const prevActive = document.activeElement as HTMLElement | null;
    const inerted: HTMLElement[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el !== backdrop && !el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        inerted.push(el as HTMLElement);
      }
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      for (const el of inerted) el.removeAttribute("inert");
      prevActive?.focus?.();
    };
  }, [open, mid]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) { onOpenChange(false); return; }
      if (event.key !== "Tab") return;
      const panel = document.getElementById(mid)?.querySelector<HTMLElement>('[role="dialog"]');
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) { event.preventDefault(); panel.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, mid, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <ModalContext.Provider value={{ titleId, descriptionId, close, setHasDescription }}>
      <Box id={mid} className={modalBackdrop} onClick={() => { if (closeOnBackdrop) close(); }}>
        <Box
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : titleId}
          aria-describedby={hasDescription ? descriptionId : undefined}
          tabIndex={-1}
          surface="raised"
          radius="lg"
          shadow="overlay"
          className={joinClass(modalPanel, modalSize[size])}
          onClick={(event) => event.stopPropagation()}
        >
          <Stack className={modalStack}>{children}</Stack>
        </Box>
      </Box>
    </ModalContext.Provider>,
    document.body,
  );
};

export type ModalHeaderProps = { children: ReactNode; closeButton?: boolean };
export const ModalHeader = ({ children, closeButton = true }: ModalHeaderProps) => {
  const { close } = useModal();
  return (
    <Box>
      <Inline padding="lg" gap="md" justify="between" align="start">
        <Stack gap="xs" className={modalHeaderCopy}>{children}</Stack>
        {closeButton ? (
          <Button variant="quiet" size="sm" iconOnly aria-label="닫기" onClick={close}>
            <Icon><path d="M6 6l12 12M18 6L6 18" /></Icon>
          </Button>
        ) : null}
      </Inline>
      <Divider />
    </Box>
  );
};

export const ModalTitle = ({ children }: { children: ReactNode }) => {
  const { titleId } = useModal();
  return <Text id={titleId} variant="heading">{children}</Text>;
};

export const ModalDescription = ({ children }: { children: ReactNode }) => {
  const { descriptionId, setHasDescription } = useModal();
  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);
  return <Text id={descriptionId} variant="caption" ink="soft">{children}</Text>;
};

export const ModalBody = ({ children }: { children: ReactNode }) => <Box padding="lg" className={modalBody}>{children}</Box>;

export const ModalFooter = ({ children }: { children: ReactNode }) => (
  <Box>
    <Divider />
    <Inline padding="md" gap="sm" justify="end">{children}</Inline>
  </Box>
);

export type ModalCloseProps = Omit<ButtonProps<"button">, "onClick"> & { iconOnly?: false };
export const ModalClose = ({ children = "닫기", ...rest }: ModalCloseProps) => {
  const { close } = useModal();
  return <Button {...rest} iconOnly={false} onClick={close}>{children}</Button>;
};

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});
