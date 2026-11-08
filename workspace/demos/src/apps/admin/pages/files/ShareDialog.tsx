// 공유 링크: the address a file is shared at, who can open it and for how long, and the way to stop sharing it.

import { useRef, useState } from "react";

import { Button, Grid, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, useToast } from "../../../../kit";
import { publicUrl } from "../../data/files";
import type { AdminFile } from "../../data/types";
import { messageOf } from "../../lib/errors";
import { useCopy } from "../../lib/hooks";
import { useFilesApi } from "../../store/api";
import { useFileList } from "../../store/views";
import { Dialog } from "../../ui/Dialog";
import { Alert, Facts, Mono } from "../../ui/Parts";
import { downloadText, expiryText, StateBadge } from "./parts";

export const ShareDialog = ({ id, onClose, onEdit }: { id: string | null; onClose: () => void; onEdit: (id: string) => void }) => {
  const files = useFileList();
  const { stopSharing } = useFilesApi();
  const { copied, copy } = useCopy();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<AdminFile | null>(null);
  const found = files.find((item) => item.id === id) ?? null;
  if (found) last.current = found;
  const file = found ?? last.current;

  const stop = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await stopSharing(file.id);
      toast("공유를 멈췄습니다");
    } catch (reason) {
      setError(messageOf(reason, "공유를 멈추지 못했습니다."));
    } finally {
      setBusy(false);
    }
  };

  const link = file ? publicUrl(file.slug) : "";
  return (
    <Dialog
      open={id !== null}
      onClose={onClose}
      title="공유 링크"
      description={file?.title}
      busy={busy}
      footer={
        <>
          {file?.state === "live" ? <Button variant="ghost" accent="error" disabled={busy} onClick={() => void stop()}>공유 멈추기</Button> : null}
          <Button variant="hairline" disabled={busy} onClick={() => { if (file) onEdit(file.id); }}>설정 고치기</Button>
          <Button disabled={busy} onClick={() => void copy(link, "share")}>{copied === "share" ? <Glyph name="check" /> : <Glyph name="copy" />}{copied === "share" ? "복사됨" : "링크 복사"}</Button>
        </>
      }
    >
      {file ? (
        <Stack gap="xl">
          <Surface as={Grid} fill="sunken" radius="md" padding="md" columns="minmax(0, 1fr)" align="center">
            <Mono truncate>{link}</Mono>
          </Surface>
          <Facts
            items={[
              { label: "상태", value: <StateBadge file={file} /> },
              { label: "공개 범위", value: file.locked ? "비밀번호를 아는 사람만" : "링크만 있으면 누구나" },
              { label: "만료", value: expiryText(file) },
              { label: "다운로드", value: downloadText(file) },
            ]}
          />
          {file.state !== "live" ? <Text as="p" variant="caption" ink="secondary">지금은 이 링크가 열리지 않습니다. 설정을 고치면 다시 열 수 있습니다.</Text> : null}
          {error ? <Alert>{error}</Alert> : null}
        </Stack>
      ) : null}
    </Dialog>
  );
};
