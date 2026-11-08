// A look inside a material: its pages, one at a time (the pictures are drawn by the kit's Art — there is no real file
// behind them), the file's name and size, and a download that only says it is a demo. A ZIP has no preview.

import { useEffect, useState } from "react";

import { Badge, Button, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Art, Empty, formatBytes, Glyph, useToast } from "../../../kit";
import { CATEGORY_LABEL, extensionOf, type Material } from "../data/materials";
import { Dialog } from "./parts";

export const MaterialPreview = ({ material, onClose }: { material: Material | null; onClose: () => void }) => {
  const toast = useToast();
  const [fileIndex, setFileIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const file = material?.files[fileIndex];

  useEffect(() => {
    setFileIndex(0);
    setPage(0);
  }, [material?.id]);
  // the preview "arrives" a moment after you open it, as a converted file does
  const fileId = file?.id;
  useEffect(() => {
    if (fileId === undefined) return;
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [fileId]);

  const extension = file ? extensionOf(file.name) : "";
  const previewable = extension !== "zip";
  const last = Math.max(0, (file?.pages ?? 1) - 1);

  return (
    <Dialog open={material !== null} onOpenChange={(open) => { if (!open) onClose(); }} title={material?.title ?? "자료"} description={material ? `${material.subject} · ${CATEGORY_LABEL[material.category]}` : undefined} size="measure.md">
      {material && file ? (
        <Stack gap="md">
          {material.files.length > 1 ? (
            <Inline gap="xs" wrap>
              {material.files.map((item, index) => (
                <Button key={item.id} variant="hairline" size="sm" selected={index === fileIndex} onClick={() => { setFileIndex(index); setPage(0); }}>{item.name}</Button>
              ))}
            </Inline>
          ) : null}
          <Inline justify="between" align="center" gap="md" wrap>
            <Inline gap="sm" align="center" minWidth={0}>
              <Glyph name="file-text" ink="tertiary" />
              <Text as="span" truncate>{file.name}</Text>
              <Badge size="sm" variant="soft">{extension.toUpperCase()}</Badge>
              <Text as="span" variant="caption" ink="tertiary" numeric>{formatBytes(file.sizeBytes)}</Text>
            </Inline>
            <Button variant="hairline" size="sm" onClick={() => toast("데모라서 파일은 받지 않습니다")}><Glyph name="download" />내려받기</Button>
          </Inline>
          <Surface fill="sunken" radius="md" padding="lg">
            {loading ? (
              <Stack align="center" gap="sm" paddingY="2xl">
                <Text ink="tertiary">미리보기를 불러오는 중입니다</Text>
              </Stack>
            ) : !previewable ? (
              <Empty glyph="file" title="미리보기가 없는 형식입니다" description="압축 파일은 내려받아서 열어 주세요." />
            ) : (
              <Stack align="center" gap="md">
                <Stack width="full" maxWidth="measure.xs" aria-label={`${file.name} ${page + 1}쪽`}>
                  <Art seed={`${file.id}-${page}`} kind={file.image ? "photo" : "document"} ratio={file.image ? "4 / 3" : "3 / 4"} grid={material.category === "worksheet"} radius="sm" label={`${file.name}의 ${page + 1}쪽 미리보기`} />
                </Stack>
                {file.pages > 1 ? (
                  <Inline gap="sm" align="center">
                    <IconButton variant="hairline" size="sm" aria-label="이전 쪽" disabled={page <= 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><Glyph name="chevron-left" /></IconButton>
                    <Text as="span" variant="caption" numeric>{page + 1} / {file.pages}쪽</Text>
                    <IconButton variant="hairline" size="sm" aria-label="다음 쪽" disabled={page >= last} onClick={() => setPage((value) => Math.min(last, value + 1))}><Glyph name="chevron-right" /></IconButton>
                  </Inline>
                ) : null}
              </Stack>
            )}
          </Surface>
          {material.description ? <Text ink="secondary">{material.description}</Text> : null}
        </Stack>
      ) : null}
    </Dialog>
  );
};
