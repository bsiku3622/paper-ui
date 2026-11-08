import { Button } from "@studio-baeks/paper-ui";

import { Dialog } from "./Dialog";

export const Confirm = ({ title, onConfirm, onClose, label = "삭제" }: { title: string | null; onConfirm: () => void; onClose: () => void; label?: string }) => (
  <Dialog
    open={title !== null}
    onOpenChange={(open) => !open && onClose()}
    title={title ?? ""}
    actions={
      <>
        <Button variant="hairline" size="sm" onClick={onClose}>취소</Button>
        <Button accent="error" size="sm" onClick={onConfirm}>{label}</Button>
      </>
    }
  />
);
