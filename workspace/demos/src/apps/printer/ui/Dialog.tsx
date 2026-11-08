import type { ReactNode } from "react";

import { Button } from "@studio-baeks/paper-ui";

import { Dialog } from "../content/Dialog";

export { Dialog, type DialogProps } from "../content/Dialog";

export type ConfirmProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
};

export const ConfirmDialog = ({ open, title, description, confirmLabel, cancelLabel = "취소", danger = false, disabled, onConfirm, onClose, children }: ConfirmProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
        <Button accent={danger ? "error" : undefined} disabled={disabled} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </>
    }
  >
    {children}
  </Dialog>
);
