// The export menu (App.tsx's `export-menu`): "완성한 문서를 남기는 방법", four ways to keep the document: a PDF, a PNG, the
// Paperdown file with everything in it, and the Markdown. The trigger is the header's one solid button; while an export is
// working it says what it is doing.

import type { ReactNode } from "react";

import { Box, Button, Divider, Floating, Inline, Spinner, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, type GlyphName } from "../../../kit";
import type { PageMode } from "../lib/types";

export type ExportKind = "pdf" | "png" | "json" | "md";

const Row = ({ glyph, title, hint, tag, onPress }: { glyph: GlyphName; title: string; hint: ReactNode; tag?: string; onPress: () => void }) => (
  <Button as={Floating.Close} variant="ghost" size="lg" fullWidth justify="between" onClick={onPress}>
    <Inline as="span" gap="md" align="center" minWidth={0}>
      <Glyph name={glyph} />
      <Stack as="span" align="start" minWidth={0}>
        <Text as="span" ink="inherit">{title}</Text>
        <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{hint}</Text>
      </Stack>
    </Inline>
    {tag ? <Text as="span" variant="label" strong={false} ink="tertiary">{tag}</Text> : null}
  </Button>
);

export const ExportMenu = ({ mode, pages, busy, onExport }: { mode: PageMode; pages: number; busy: string; onExport: (kind: ExportKind) => void }) => (
  <Floating>
    <Button as={Floating.Trigger} size="sm" disabled={busy !== ""} aria-label={busy || "내보내기"}>
      {busy ? <Spinner size="inline" ink="inherit" decorative /> : <Glyph name="download" />}
      {/* On a phone the label gives way: the header has no room for it. */}
      <Box as="span" hideBelow="md">{busy || "내보내기"}</Box>
      <Glyph name="chevron-down" />
    </Button>
    <Floating.Content as={Surface} fill="raised" radius="md" padding="xs" placement="bottom end" width="xl" maxWidth="full" aria-label="내보내기">
      <Stack gap="xs">
        <Box paddingX="md" paddingY="sm">
          <Text as="span" variant="label" strong={false} ink="tertiary">완성한 문서를 남기는 방법</Text>
        </Box>
        <Row glyph="file-text" title="PDF로 저장" hint={mode === "pages" ? `${pages}페이지 · 선택·검색 가능한 텍스트` : "한 장의 긴 문서 · 현재 높이"} tag="PDF" onPress={() => onExport("pdf")} />
        <Row glyph="image-plus" title="PNG 이미지" hint="현재 문서 전체를 선명하게" tag="PNG" onPress={() => onExport("png")} />
        <Divider />
        <Row glyph="panel-top" title="Paperdown 문서" hint="서식 · 표 · 이미지 보존" onPress={() => onExport("json")} />
        <Row glyph="code-xml" title="Markdown 원본" hint="선택 서식과 정렬은 포함되지 않습니다" tag="MD" onPress={() => onExport("md")} />
      </Stack>
    </Floating.Content>
  </Floating>
);
