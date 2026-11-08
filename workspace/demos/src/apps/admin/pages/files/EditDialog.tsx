import { useEffect, useRef, useState } from "react";

import { Button, Field, FormField, Select, Stack } from "@studio-baeks/paper-ui";

import { useToast } from "../../../../kit";
import type { AdminFile, Visibility } from "../../data/types";
import { messageOf } from "../../lib/errors";
import { fromLocalInput, toLocalInput } from "../../lib/format";
import { useFilesApi } from "../../store/api";
import { useFileList } from "../../store/views";
import { Dialog } from "../../ui/Dialog";
import { Alert } from "../../ui/Parts";

export const EditDialog = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const files = useFileList();
  const { patchFile } = useFilesApi();
  const toast = useToast();
  const found = files.find((item) => item.id === id) ?? null;
  const last = useRef<AdminFile | null>(null);
  if (found) last.current = found;
  const file = found ?? last.current;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxDownloads, setMaxDownloads] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);

  const filled = useRef<string | null>(null);
  useEffect(() => {
    if (id === null) {
      filled.current = null;
      return;
    }
    if (!found || filled.current === id) return;
    filled.current = id;
    setTitle(found.title);
    setDescription(found.description);
    setSlug(found.slug);
    setVisibility(found.visibility);
    setPassword("");
    setExpiresAt(toLocalInput(found.expiresAt));
    setMaxDownloads(found.maxDownloads === null ? "" : String(found.maxDownloads));
    setError(null);
  }, [id, found]);

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const limit = maxDownloads.trim();
      await patchFile(file.id, {
        title,
        description,
        slug,
        visibility,
        ...(password ? { password } : {}),
        expiresAt: fromLocalInput(expiresAt),
        maxDownloads: limit ? Number.parseInt(limit, 10) : null,
      });
      setPassword("");
      toast("저장했습니다");
      onClose();
    } catch (reason) {
      setError(messageOf(reason, "저장하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={id !== null}
      onClose={onClose}
      title="설정 고치기"
      busy={busy}
      focusRef={first}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>취소</Button>
          <Button onClick={() => void submit()} loading={busy} loadingLabel="저장 중">저장</Button>
        </>
      }
    >
      <Stack gap="lg" paddingY="xs">
        <FormField label="제목"><Field ref={first} value={title} onChange={(event) => setTitle(event.currentTarget.value)} /></FormField>
        <FormField label="설명"><Field value={description} onChange={(event) => setDescription(event.currentTarget.value)} /></FormField>
        <FormField label="주소" description="바꾸면 이전 링크는 더 이상 열리지 않습니다">
          <Field value={slug} onChange={(event) => setSlug(event.currentTarget.value)} />
        </FormField>
        <FormField label="공개 범위">
          <Select value={visibility} onChange={(event) => setVisibility(event.currentTarget.value as Visibility)}>
            <Select.Option value="public">전체 공개</Select.Option>
            <Select.Option value="password">비밀번호</Select.Option>
          </Select>
        </FormField>
        {visibility === "password" ? (
          <FormField label="새 비밀번호" description={file?.visibility === "password" ? "비워 두면 지금 비밀번호를 유지합니다" : undefined}>
            <Field type="password" autoComplete="off" showPasswordToggle value={password} onChange={(event) => setPassword(event.currentTarget.value)} />
          </FormField>
        ) : null}
        <FormField label="만료" description="비우면 만료 없음">
          <Field type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.currentTarget.value)} />
        </FormField>
        <FormField label="다운로드 제한" description={file ? `지금까지 ${file.downloadCount}회 받았습니다` : undefined}>
          <Field type="number" min={1} numeric value={maxDownloads} onChange={(event) => setMaxDownloads(event.currentTarget.value)} />
        </FormField>
        {error ? <Alert>{error}</Alert> : null}
      </Stack>
    </Dialog>
  );
};
