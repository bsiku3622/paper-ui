import { useRef, useState, type ReactNode } from "react";

import { Button, Stack } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

import { messageOf } from "../lib/errors";
import { Dialog } from "./Dialog";
import { Alert } from "./Parts";

export const ConfirmDialog = ({ open, onClose, title, children, confirmLabel, busyLabel = "처리 중", accent = "error", onConfirm }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busyLabel?: string;
  accent?: Accent;
  onConfirm: () => Promise<void>;
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const body = useRef<ReactNode>(children);
  if (open) body.current = children;

  const close = () => {
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setBusy(false);
      onClose();
    } catch (reason) {
      setError(messageOf(reason, "처리하지 못했습니다."));
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      size="sm"
      busy={busy}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={close}>취소</Button>
          <Button accent={accent} loading={busy} loadingLabel={busyLabel} onClick={() => void confirm()}>{confirmLabel}</Button>
        </>
      }
    >
      <Stack gap="lg">
        {body.current}
        {error ? <Alert>{error}</Alert> : null}
      </Stack>
    </Dialog>
  );
};
