// 파일 · 폴더 올리기: pick files or a folder (or drop them), choose how they are shared, and watch them go. Nothing leaves the
// page: a "upload" is a progress that fills for as long as that many bytes would take, and then a row on the shelf. The
// chosen files are only listed by name and size; their bytes are never read. A password typed here is checked and dropped.

import { useCallback, useEffect, useRef, useState } from "react";

import { Box, Button, Divider, Droppable, Field, FormField, Grid, Inline, Paint, Radio, Select, Stack, Surface, Text, type DropEvent } from "@studio-baeks/paper-ui";

import { Glyph, Meter, useToast } from "../../../../kit";
import { FilePicker, type PickedFile } from "../../content/FilePicker";
import type { Visibility } from "../../data/types";
import { messageOf } from "../../lib/errors";
import { formatBytes, fromLocalInput } from "../../lib/format";
import { animate } from "../../lib/hooks";
import { makeId } from "../../lib/fake";
import { uploadDuration, useFilesApi } from "../../store/api";
import { Dialog } from "../../ui/Dialog";
import { FormGrid } from "../../ui/Form";
import { Alert } from "../../ui/Parts";

type Item = PickedFile & { id: string };

const MB = 1024 * 1024;
const SAMPLE: readonly PickedFile[] = [
  { name: "발표자료_초안.pptx", path: "발표자료_초안.pptx", size: Math.round(14.2 * MB) },
  { name: "측정결과_정리.xlsx", path: "측정결과_정리.xlsx", size: 380 * 1024 },
  { name: "현장사진_01.jpg", path: "현장사진_01.jpg", size: Math.round(4.1 * MB) },
];

export const UploadDialog = ({ open, onClose, sample = false }: { open: boolean; onClose: () => void; sample?: boolean }) => {
  const { createFile } = useFilesApi();
  const toast = useToast();
  const cancelled = useRef(false);

  const [items, setItems] = useState<Item[]>([]);
  const [folder, setFolder] = useState<string | null>(null);
  const [mode, setMode] = useState<"zip" | "separate">("zip");
  const [phase, setPhase] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxDownloads, setMaxDownloads] = useState("");

  const busy = progress !== null;
  const total = items.reduce((sum, item) => sum + item.size, 0);

  const reset = () => {
    setItems([]);
    setFolder(null);
    setMode("zip");
    setPhase("");
    setProgress(null);
    setError(null);
    setTitle("");
    setDescription("");
    setSlug("");
    setVisibility("public");
    setPassword("");
    setExpiresAt("");
    setMaxDownloads("");
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const pick = useCallback((files: PickedFile[], isFolder: boolean) => {
    if (files.length === 0) return;
    setItems(files.map((file) => ({ ...file, id: makeId("u", file.path) })));
    setFolder(isFolder ? (files[0]?.path.split("/")[0] ?? "folder") : null);
    if (isFolder || files.length === 1) setMode("zip");
    setTitle(files.length === 1 && !isFolder ? (files[0]?.name ?? "") : "");
    setError(null);
  }, []);

  // The demo's own files, for trying the dialog without looking for a file. They are offered once each time it opens.
  const sampled = useRef(false);
  useEffect(() => {
    if (!open) {
      sampled.current = false;
      return;
    }
    if (sample && !sampled.current && items.length === 0) {
      sampled.current = true;
      pick([...SAMPLE], false);
    }
  }, [open, sample, items.length, pick]);

  const drop = async ({ items: dropped }: DropEvent) => {
    if (busy) return;
    if (dropped.some((item) => item.kind === "directory")) {
      setError("폴더는 ‘폴더 선택’ 버튼으로 골라주세요.");
      return;
    }
    const files: PickedFile[] = [];
    for (const item of dropped) {
      if (item.kind !== "file") continue;
      const file = await item.getFile();
      files.push({ name: file.name, path: file.name, size: file.size });
    }
    pick(files, false);
  };

  const submit = async () => {
    if (items.length === 0) return setError("올릴 파일이나 폴더를 골라주세요.");
    if (visibility === "password" && password.length === 0) return setError("비밀번호 공개를 골랐으면 비밀번호가 있어야 합니다.");
    const bundled = folder !== null || (items.length > 1 && mode === "zip");
    const separate = mode === "separate" && !bundled;
    if (separate && slug.trim()) return setError("따로 올릴 때는 주소를 비워주세요. 파일마다 자동으로 만듭니다.");
    setError(null);
    setProgress(0);
    cancelled.current = false;
    const stopped = () => cancelled.current;
    const limit = maxDownloads.trim();
    const given = title.trim();
    let completed = 0;
    try {
      const uploads: { name: string; size: number }[] = bundled ? [{ name: `${folder ?? "files"}.zip`, size: total }] : items.map((item) => ({ name: item.name, size: item.size }));
      if (bundled) {
        setPhase("ZIP 묶는 중");
        await animate(Math.min(1400, 500 + total / (200 * MB) * 900), setProgress, stopped);
      }
      for (const [index, upload] of uploads.entries()) {
        setPhase(`업로드 ${index + 1} / ${uploads.length}`);
        setProgress(0);
        await animate(uploadDuration(upload.size), setProgress, stopped);
        createFile({
          title: separate && given ? `${given} — ${upload.name}` : given || upload.name,
          description,
          slug,
          name: upload.name,
          size: upload.size,
          visibility,
          password,
          expiresAt: fromLocalInput(expiresAt),
          maxDownloads: limit ? Number.parseInt(limit, 10) : null,
        });
        completed += 1;
      }
      toast(uploads.length > 1 ? `${uploads.length}개를 올렸습니다` : "올렸습니다");
      reset();
      onClose();
    } catch (reason) {
      setProgress(null);
      if (separate && completed > 0) setItems((list) => list.slice(completed));
      const message = messageOf(reason, "업로드가 실패했습니다.");
      setError(completed > 0 ? `${completed}건 완료. 남은 파일만 다시 올립니다. ${message}` : message);
    }
  };

  const separately = mode === "separate" && items.length > 1;
  return (
    <Dialog
      open={open}
      onClose={close}
      title="파일 · 폴더 올리기"
      size="lg"
      busy={busy}
      footer={
        busy ? (
          <>
            <Button variant="ghost" onClick={() => { cancelled.current = true; }}>멈추기</Button>
            <Button loading loadingLabel={phase}>{phase}</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>취소</Button>
            <Button onClick={() => void submit()} disabled={items.length === 0}>올리기</Button>
          </>
        )
      }
    >
      <Stack gap="lg" paddingY="xs">
        <Droppable aria-label="올릴 파일을 끌어다 놓는 곳" getDropOperation={() => (busy ? "cancel" : "copy")} onDrop={(event) => void drop(event)}>
          {({ isDropTarget }) => (
            <Surface as={Paint} accent={isDropTarget ? "info" : "primary"} variant={isDropTarget ? "soft" : "dashed"} radius="md" padding="xl">
              <Stack gap="md" align="center">
                <Glyph name={folder ? "folder" : "upload"} ink="secondary" />
                <Stack gap="xs" align="center">
                  <Text as="p" variant="subheading">{items.length ? (folder ?? `${items.length}개 파일 선택됨`) : "공유할 파일을 선택하세요"}</Text>
                  <Text as="p" variant="caption" ink="secondary">{items.length ? `${formatBytes(total)} · 아래에서 선택 내용을 확인하세요` : "여기로 끌어다 놓거나 버튼으로 고르세요"}</Text>
                </Stack>
                <Inline gap="sm" justify="center" wrap>
                  <FilePicker disabled={busy} onPick={(files) => pick(files, false)}>
                    {(openPicker) => <Button variant="hairline" disabled={busy} onClick={openPicker}>파일 선택</Button>}
                  </FilePicker>
                  <FilePicker directory disabled={busy} onPick={(files) => pick(files, true)}>
                    {(openPicker) => <Button variant="ghost" disabled={busy} onClick={openPicker}>폴더 선택</Button>}
                  </FilePicker>
                  <Button variant="ghost" disabled={busy} onClick={() => pick([...SAMPLE], false)}>예시 파일</Button>
                </Inline>
              </Stack>
            </Surface>
          )}
        </Droppable>

        {items.length > 0 ? (
          <Stack as="ul" gap="xs" maxHeight="lg" overflowY="auto" aria-label="선택한 파일">
            {items.map((item) => (
              <Stack as="li" key={item.id}>
                <Surface as={Grid} fill="sunken" radius="sm" padding="sm" columns="minmax(0, 1fr) auto" gap="sm" align="center">
                  <Stack minWidth={0}>
                    <Text as="span" truncate>{item.path}</Text>
                    <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{formatBytes(item.size)}</Text>
                  </Stack>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    aria-label={`${item.name} 선택 해제`}
                    onClick={() => {
                      const rest = items.filter((other) => other.id !== item.id);
                      setItems(rest);
                      if (rest.length === 0) setFolder(null);
                    }}
                  >
                    제거
                  </Button>
                </Surface>
              </Stack>
            ))}
          </Stack>
        ) : null}

        {folder ? <Text as="p" variant="caption" ink="secondary">폴더 구조를 유지한 ZIP 하나로 공유합니다. 빈 폴더는 포함되지 않습니다.</Text> : null}

        {items.length > 1 && !folder ? (
          <FormGrid>
            <Surface fill="sunken" radius="sm">
              <Grid as="label" columns="auto minmax(0, 1fr)" columnGap="md" rowGap="xs" padding="md">
                <Radio name="upload-mode" value="zip" checked={mode === "zip"} disabled={busy} onChange={() => setMode("zip")} />
                <Text as="span" strong>묶어서 올리기</Text>
                <Box />
                <Text as="span" variant="caption" ink="secondary">ZIP 하나 · 공유 링크 하나</Text>
              </Grid>
            </Surface>
            <Surface fill="sunken" radius="sm">
              <Grid as="label" columns="auto minmax(0, 1fr)" columnGap="md" rowGap="xs" padding="md">
                <Radio name="upload-mode" value="separate" checked={mode === "separate"} disabled={busy} onChange={() => { setMode("separate"); setSlug(""); }} />
                <Text as="span" strong>따로 올리기</Text>
                <Box />
                <Text as="span" variant="caption" ink="secondary">파일마다 개별 공유 링크</Text>
              </Grid>
            </Surface>
          </FormGrid>
        ) : null}

        {busy ? <Meter value={progress} label={phase} valueText={`${Math.round(progress * 100)}%`} weight="thick" /> : null}

        <Divider />

        <FormGrid>
          <FormField label={separately ? "제목 접두사" : "제목"} disabled={busy}>
            <Field value={title} placeholder="비우면 파일 이름을 사용합니다" onChange={(event) => setTitle(event.currentTarget.value)} />
          </FormField>
          <FormField label="설명" disabled={busy}>
            <Field value={description} placeholder="공유할 사람에게 남길 설명" onChange={(event) => setDescription(event.currentTarget.value)} />
          </FormField>
        </FormGrid>
        <FormField label="공개 범위" disabled={busy}>
          <Select value={visibility} onChange={(event) => setVisibility(event.currentTarget.value as Visibility)}>
            <Select.Option value="public">전체 공개 — 링크만 있으면 받는다</Select.Option>
            <Select.Option value="password">비밀번호 — 아는 사람만 받는다</Select.Option>
          </Select>
        </FormField>
        {visibility === "password" ? (
          <FormField label="다운로드 비밀번호" disabled={busy}>
            <Field type="password" autoComplete="off" showPasswordToggle value={password} onChange={(event) => setPassword(event.currentTarget.value)} />
          </FormField>
        ) : null}
        <Box as="details">
          <Box as="summary"><Text as="span" variant="label">주소와 다운로드 제한</Text></Box>
          <Stack gap="lg" paddingY="md">
            <FormField label="주소" disabled={busy || separately} description={separately ? "파일별 주소는 자동으로 만듭니다" : "비우면 제목으로 주소를 만듭니다"}>
              <Field value={slug} onChange={(event) => setSlug(event.currentTarget.value)} />
            </FormField>
            <FormGrid>
              <FormField label="만료 시각" disabled={busy} description="비우면 만료 없음">
                <Field type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.currentTarget.value)} />
              </FormField>
              <FormField label="다운로드 제한" disabled={busy} description="비우면 횟수 제한 없음">
                <Field type="number" min={1} numeric value={maxDownloads} onChange={(event) => setMaxDownloads(event.currentTarget.value)} />
              </FormField>
            </FormGrid>
          </Stack>
        </Box>
        {error ? <Alert>{error}</Alert> : null}
      </Stack>
    </Dialog>
  );
};
