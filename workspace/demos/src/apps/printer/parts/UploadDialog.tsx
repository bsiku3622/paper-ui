// Uploading G-code. A file is dropped on the dialog or chosen with the button; the mock reads only its name and size, "sends"
// it on a timer with a progress bar, and adds it to the list. A file that is not G-code is refused with a reason. A sample file
// lets the flow be tried without one.

import { useEffect, useRef, useState } from "react";

import { Button, Droppable, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter, useToast } from "../../../kit";
import { FilePicker } from "../content/files";
import { makeFile } from "../files";
import { bytesText } from "../format";
import { useActions } from "../sim/Provider";
import { Dialog } from "../ui/Dialog";

type Upload = { id: number; name: string; size: number; progress: number; done: boolean; error?: string };

let counter = 0;

const GCODE = /\.(gcode|gco|g)$/i;

export const UploadDialog = ({ open, folder, onClose }: { open: boolean; folder: string; onClose: () => void }) => {
  const { update } = useActions();
  const toast = useToast();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const working = uploads.some((upload) => !upload.done);
  useEffect(() => {
    if (!working) return;
    const timer = window.setInterval(() => setUploads((list) => list.map((upload) => (upload.done ? upload : { ...upload, progress: Math.min(1, upload.progress + 0.18), done: upload.progress + 0.18 >= 1 }))), 250);
    return () => window.clearInterval(timer);
  }, [working]);
  const added = useRef<Set<number>>(new Set());
  useEffect(() => {
    for (const upload of uploads) {
      if (!upload.done || upload.error || added.current.has(upload.id)) continue;
      added.current.add(upload.id);
      update((s) => {
        if (s.files.some((file) => file.name === upload.name && file.folder === folder)) return s;
        return { ...s, files: [...s.files, makeFile(upload.name, upload.size, Math.round(s.clock / 1000), folder)] };
      });
      toast(`${upload.name}을 올렸습니다 (모의)`);
    }
  }, [uploads, folder, update, toast]);
  const add = (items: readonly { name: string; size: number }[]) =>
    setUploads((list) => [
      ...list.filter((upload) => !upload.done || upload.error),
      ...items.map<Upload>((item) => (GCODE.test(item.name) ? { id: ++counter, name: item.name, size: item.size, progress: 0, done: false } : { id: ++counter, name: item.name, size: item.size, progress: 1, done: true, error: "G-code 파일(.gcode)만 올릴 수 있습니다" })),
    ]);
  return (
    <Dialog open={open} onClose={onClose} title="G-code 올리기" description={`올릴 곳: ${folder ? `/gcodes/${folder}` : "/gcodes"}`} size="md" footer={<Button variant="ghost" onClick={onClose}>닫기</Button>}>
      <Stack gap="lg">
        <Droppable
          onDrop={(event) => {
            const found: { name: string; size: number }[] = [];
            const reads = event.items.map(async (item) => {
              if (item.kind !== "file") return;
              const file = await item.getFile();
              found.push({ name: file.name, size: file.size });
            });
            void Promise.all(reads).then(() => found.length > 0 && add(found));
          }}
        >
          <FilePicker multiple onPick={(files) => add(files.map((file) => ({ name: file.name, size: file.size })))}>
            {(openPicker) => (
              <Button variant="dashed" size="lg" fullWidth onClick={openPicker}><Glyph name="upload" />파일을 끌어다 놓거나 눌러서 고르세요</Button>
            )}
          </FilePicker>
        </Droppable>
        <Inline gap="sm" wrap>
          <Button variant="hairline" size="sm" onClick={() => add([{ name: "sample_PLA_12m47s.gcode", size: 456130 }])}>샘플 파일로 시험</Button>
          <Button variant="ghost" size="sm" onClick={() => add([{ name: "메모.txt", size: 812 }])}>G-code가 아닌 파일로 시험</Button>
        </Inline>
        <Text as="span" variant="caption" ink="tertiary">파일의 내용은 읽지 않고 이름과 크기만 씁니다.</Text>
        {uploads.length > 0 ? (
          <Stack as="ul" gap="md" aria-label="올리는 파일">
            {uploads.map((upload) => (
              <Stack as="li" key={upload.id} gap="xs">
                <Inline justify="between" gap="md">
                  <Text as="span" truncate>{upload.name}</Text>
                  <Text as="span" variant="caption" ink={upload.error ? "error" : upload.done ? "success" : "tertiary"} numeric>
                    {upload.error ?? (upload.done ? "올렸습니다" : `${Math.round(upload.progress * 100)}%`)} · {bytesText(upload.size)}
                  </Text>
                </Inline>
                <Meter value={upload.progress} tone={upload.error ? "error" : upload.done ? "success" : "primary"} weight="thin" />
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Dialog>
  );
};
