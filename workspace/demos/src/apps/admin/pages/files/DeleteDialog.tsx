// 정말 지울까요? One file or several. The words are the original's: the link goes with the file, and there is no way back.

import { useRef, useState } from "react";

import { Button, Stack, Text } from "@studio-baeks/paper-ui";

import { useToast } from "../../../../kit";
import type { AdminFile } from "../../data/types";
import { messageOf } from "../../lib/errors";
import { useFilesApi } from "../../store/api";
import { useFileList } from "../../store/views";
import { Dialog } from "../../ui/Dialog";
import { Alert } from "../../ui/Parts";

export const DeleteDialog = ({ ids, onClose, onDone }: { ids: readonly string[] | null; onClose: () => void; onDone?: () => void }) => {
  const files = useFileList();
  const { removeFile } = useFilesApi();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The words stay while the dialog fades out, after the ids are gone.
  const last = useRef<AdminFile[]>([]);
  const targets = files.filter((file) => ids?.includes(file.id));
  if (targets.length > 0) last.current = targets;
  const list = targets.length > 0 ? targets : last.current;

  const close = () => {
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await Promise.all(list.map((file) => removeFile(file.id)));
      toast(list.length > 1 ? `${list.length}개를 지웠습니다` : "지웠습니다");
      setBusy(false);
      onDone?.();
      onClose();
    } catch (reason) {
      setError(messageOf(reason, "지우지 못했습니다."));
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={ids !== null}
      onClose={close}
      title="정말 지울까요?"
      size="sm"
      busy={busy}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={close}>취소</Button>
          <Button accent="error" loading={busy} loadingLabel="지우는 중" onClick={() => void confirm()}>지우기</Button>
        </>
      }
    >
      <Stack gap="lg">
        {list.length > 1 ? (
          <Stack gap="sm">
            <Text as="p" strong>{list.length}개 파일을 한꺼번에 지웁니다</Text>
            <Stack as="ul" gap="xs">
              {list.slice(0, 4).map((file) => <Text key={file.id} as="li" variant="caption" ink="secondary" truncate>{file.title}</Text>)}
              {list.length > 4 ? <Text as="li" variant="caption" ink="tertiary">외 {list.length - 4}개</Text> : null}
            </Stack>
            <Text as="p" variant="caption" ink="secondary">파일과 링크가 함께 사라집니다. 되돌릴 수 없습니다.</Text>
          </Stack>
        ) : (
          <Stack gap="xs">
            <Text as="p" strong>{list[0]?.title}</Text>
            <Text as="p" variant="caption" ink="secondary">파일과 링크가 함께 사라집니다. 되돌릴 수 없습니다.</Text>
          </Stack>
        )}
        {error ? <Alert>{error}</Alert> : null}
      </Stack>
    </Dialog>
  );
};
