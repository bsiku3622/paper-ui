import { useEffect, useState, type ReactNode } from "react";

import { Box, Button, Divider, Field, Floating, IconButton, Inline, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Segmented } from "../../../kit";
import { PAPERS, ZOOMS, clamp, dimensions, type Paper, type Settings } from "../lib/types";

const Millimetres = ({ label, value, min, max, disabled, onCommit }: { label: string; value: number; min: number; max: number; disabled?: boolean; onCommit: (value: number) => void }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const next = Number(draft);
    if (draft.trim() === "" || !Number.isFinite(next)) setDraft(String(value));
    else onCommit(clamp(next, min, max));
  };
  return (
    <Field
      size="sm"
      type="number"
      aria-label={label}
      min={min}
      max={max}
      disabled={disabled}
      numeric
      value={draft}
      trailing={<Text as="span" variant="caption" ink="tertiary">mm</Text>}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        }
      }}
    />
  );
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <Inline justify="between" align="center" gap="md">
    <Text as="span" variant="caption" ink="secondary">{label}</Text>
    {children}
  </Inline>
);

export const PageOptions = ({ settings, pages, onChange }: { settings: Settings; pages: number; onChange: (patch: Partial<Settings>) => void }) => {
  const dim = dimensions(settings);
  const continuous = settings.mode === "continuous";
  const custom = settings.paper === "custom";
  const [open, setOpen] = useState(false);
  return (
    <Floating open={open} onOpenChange={setOpen}>
      <Button as={Floating.Trigger} variant="ghost" size="xs" selected={open}>
        <Glyph name="settings-2" />
        페이지 옵션
        <Glyph name="chevron-down" />
      </Button>
      <Floating.Content as={Surface} fill="raised" radius="md" padding="xl" width="xl" maxWidth="full" placement="bottom end" aria-label="페이지 옵션">
        <Stack gap="lg">
          <Inline justify="between" align="center">
            <Text as="h2" variant="subheading">페이지 옵션</Text>
            <IconButton as={Floating.Close} size="xs" variant="ghost" aria-label="페이지 옵션 닫기">
              <Glyph name="x" />
            </IconButton>
          </Inline>
          <Stack gap="sm">
            <Segmented
              label="페이지 방식"
              stretch
              value={settings.mode}
              onChange={(id) => onChange({ mode: id === "pages" ? "pages" : "continuous" })}
              options={[{ id: "continuous", label: "무한 높이" }, { id: "pages", label: "페이지 분할" }]}
            />
            <Text as="p" variant="label" strong={false} ink="tertiary">
              {continuous ? "내용과 위아래 여백에 딱 맞는 한 장의 문서입니다." : "용지 높이에 맞춰 종이를 나눕니다."}
            </Text>
          </Stack>
          <Stack gap="md">
            <Row label="페이지 크기">
              <Box width="lg">
                <Select size="sm" aria-label="페이지 크기" value={settings.paper} onChange={(event) => onChange({ paper: event.target.value as Paper })}>
                  {PAPERS.map((paper) => <Select.Option key={paper.id} value={paper.id}>{paper.label}</Select.Option>)}
                </Select>
              </Box>
            </Row>
            {custom ? (
              <Inline gap="lg" justify="between" align="start">
                <Stack gap="xs">
                  <Text as="span" variant="label" strong={false} ink="secondary">너비</Text>
                  <Box width="sm"><Millimetres label="페이지 너비" value={settings.width} min={80} max={500} onCommit={(width) => onChange({ width })} /></Box>
                </Stack>
                <Stack gap="xs">
                  <Text as="span" variant="label" strong={false} ink="secondary">높이</Text>
                  <Box width="sm"><Millimetres label="페이지 높이" value={settings.height} min={80} max={2000} disabled={continuous} onCommit={(height) => onChange({ height })} /></Box>
                </Stack>
              </Inline>
            ) : null}
            <Row label="방향">
              <Box width="sm">
                <Select size="sm" aria-label="페이지 방향" value={settings.landscape ? "landscape" : "portrait"} onChange={(event) => onChange({ landscape: event.target.value === "landscape" })}>
                  <Select.Option value="portrait">세로</Select.Option>
                  <Select.Option value="landscape">가로</Select.Option>
                </Select>
              </Box>
            </Row>
            <Row label="여백">
              <Box width="sm"><Millimetres label="페이지 여백" value={settings.margin} min={5} max={50} onCommit={(margin) => onChange({ margin })} /></Box>
            </Row>
          </Stack>
          <Divider />
          <Inline justify="between" gap="md">
            <Text as="span" variant="label" strong={false} ink="tertiary">
              {continuous ? `${Math.round(dim.width)} mm · 내용 높이` : `${Math.round(dim.width)} × ${Math.round(dim.height)} mm`}
            </Text>
            <Text as="span" variant="label" strong={false} ink="tertiary">{continuous ? "내용에 맞춤" : `${pages}페이지`}</Text>
          </Inline>
          {continuous ? (
            <Text as="p" variant="label" strong={false} ink="tertiary">무한 높이는 내용에 맞춰 자동으로 늘고 줄어듭니다. 고정 높이는 페이지 분할에서 설정하세요.</Text>
          ) : null}
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

export const ZoomSelect = ({ settings, onChange }: { settings: Settings; onChange: (patch: Partial<Settings>) => void }) => (
  <Select
    size="xs"
    variant="ghost"
    aria-label="화면 배율"
    value={String(settings.zoom)}
    onChange={(event) => onChange({ zoom: event.target.value === "fit" ? "fit" : Number(event.target.value) })}
  >
    <Select.Option value="fit">너비 맞춤</Select.Option>
    {ZOOMS.map((zoom) => <Select.Option key={zoom} value={String(zoom)}>{`${zoom}%`}</Select.Option>)}
  </Select>
);
