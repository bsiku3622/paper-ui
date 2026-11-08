// The panel beside the photo: where this page sits in the document and what became of it, then how it is shown and filtered,
// and under it the one summary of the document with the buttons that save it.

import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useId } from "react";

import { Badge, Box, Button, Divider, Grid, IconButton, Inline, Select, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";

import { Anchor, Glyph, Meter, Segmented, Stat, StatRow, formatBytes, useFace } from "../../../kit";
import { activeFit, hasSheet, headingOf, isFlagged, isUnsure, pdfBytes, sizeLine } from "../model/derive";
import type { Filter, Page, RatioChoice } from "../model/types";
import { paths } from "../paths";
import { useGridphoto } from "../state/document";
import { Notice } from "./Notice";

// Where this page sits in the document, and the means to change that.
const PageTools = ({ page }: { page: Page }) => {
  const { pages, movePage, removePage } = useGridphoto();
  const index = pages.findIndex((item) => item.id === page.id);
  return (
    <Inline justify="between" align="center" gap="sm">
      <Inline gap="sm" align="baseline" minWidth={0}>
        <Text as="span" variant="caption" ink="secondary" numeric>{index + 1} / {pages.length}쪽</Text>
        <Text as="span" variant="caption" ink="tertiary" truncate>{page.name}</Text>
      </Inline>
      <Inline gap="xs">
        <IconButton variant="ghost" size="sm" aria-label="앞으로 옮기기" disabled={index <= 0} onClick={() => movePage(page.id, -1)}><Glyph name="arrow-left" /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="뒤로 옮기기" disabled={index >= pages.length - 1} onClick={() => movePage(page.id, 1)}><Glyph name="arrow-right" /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="이 페이지 지우기" onClick={() => removePage(page.id)}><Glyph name="trash-2" /></IconButton>
      </Inline>
    </Inline>
  );
};

const SwitchRow = ({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) => (
  <Inline as="label" justify="between" align="center" gap="md">
    <Text as="span">{label}</Text>
    <Switch checked={checked} disabled={disabled} onChange={(event) => onChange(event.currentTarget.checked)} />
  </Inline>
);

const ResultCard = ({ page, view }: { page: Page; view: "result" | "source" }) => {
  const g = useGridphoto();
  const { doc, searching } = g;
  const navigate = useNavigate();
  const face = useFace();
  const ratioId = useId();
  const formatId = useId();
  const fit = activeFit(page);
  const done = page.status === "ready" && fit !== null;
  const isSheet = fit?.kind === "sheet";
  const nothing = fit?.origin === "none";
  const unsure = isUnsure(page);
  const aligned = Boolean(page.settings.align && page.aligned);
  const noGridHere = Boolean(page.gridSearched && !page.aligned);
  const searchingHere = searching === page.id;
  const alignLabel = searchingHere ? "선 찾는 중…" : page.aligned?.lines === "ruled" ? "줄 정렬" : page.aligned ? "격자 정렬" : "격자·줄 정렬";
  return (
    <Surface as="section" aria-label="페이지 설정" {...face} radius="lg" padding="lg">
      <Stack gap="lg">
        <PageTools page={page} />
        <Stack gap="sm">
          <Inline align="center" gap="sm">
            <Text as="h2" variant="subheading">{headingOf(page)}</Text>
            {unsure ? <Badge accent="warning" size="sm">불확실</Badge> : null}
          </Inline>
          {page.status === "failed" ? <Notice tone="error">{page.problem ?? "이 사진은 열지 못했습니다."}</Notice> : null}
          {nothing ? <Notice tone="warning">사진 전체를 그대로 넣었습니다. 네 모서리를 직접 맞추면 직사각형으로 폅니다.</Notice> : null}
          {nothing ? (
            <Button as={RouterLink} to={paths.corners(page.id)} variant="hairline" fullWidth>
              <Glyph name="crop" />
              직접 맞추기
            </Button>
          ) : null}
          {unsure ? <Notice tone="warning">{isSheet ? "윤곽을 확신하지 못했습니다. 원본에서 파란 선을 확인하고, 어긋나면 직접 맞춰 주세요." : "격자를 확신하지 못했습니다. 격자선을 켜서 확인하고, 어긋나면 직접 맞춰 주세요."}</Notice> : null}
          {page.reduced ? <Notice tone="warning">사진이 이 기기에서 다룰 수 있는 크기보다 커서 줄여서 처리했습니다.</Notice> : null}
          {done && page.filled > 0.002 && !aligned ? <Notice tone="warning">종이 일부가 사진 밖으로 나가서 그 부분은 종이색으로 채웠습니다.</Notice> : null}
          {done ? <Text variant="caption" ink="tertiary" numeric>{sizeLine(page)}</Text> : null}
        </Stack>
        {done && fit ? (
          <>
            <Divider />
            <Grid columns="minmax(0, 1fr) auto" gap="sm" align="center">
              <Segmented
                label="보기"
                stretch
                value={view}
                onChange={(next) => navigate(next === "source" ? paths.original(page.id) : paths.page(page.id))}
                options={[
                  { id: "result", label: hasSheet(page) ? "스캔본" : "펴진 사진" },
                  { id: "source", label: "원본" },
                ]}
              />
              <IconButton variant="hairline" aria-label="시계 방향으로 90° 돌리기" onClick={() => g.patchSettings(page.id, { rotation: (page.settings.rotation + 1) % 4 })}><Glyph name="rotate-cw" /></IconButton>
            </Grid>
            <Stack gap="md">
              <Inline justify="between" align="center" gap="md">
                <Text as="span">보정</Text>
                <Segmented
                  label="보정"
                  value={page.settings.filter}
                  onChange={(filter) => g.patchSettings(page.id, { filter: filter as Filter })}
                  options={[
                    { id: "original", label: "원본" },
                    { id: "scan", label: "스캔" },
                    { id: "bw", label: "흑백" },
                  ]}
                />
              </Inline>
              {hasSheet(page) ? (
                <>
                  <SwitchRow label={alignLabel} checked={aligned} disabled={searchingHere || noGridHere} onChange={(value) => g.setAlign(page.id, value)} />
                  {noGridHere ? <Text variant="caption" ink="tertiary">이 쪽에서는 맞출 격자나 줄을 찾지 못했습니다.</Text> : null}
                </>
              ) : null}
              {!isSheet ? <SwitchRow label={fit.lines === "ruled" ? "줄 겹쳐 보기" : "격자선 겹쳐 보기"} checked={doc.showGrid} onChange={g.setShowGrid} /> : null}
              {!isSheet && !fit.rect ? <SwitchRow label="빈 모서리 잘라내기" checked={page.settings.crop} onChange={(crop) => g.patchSettings(page.id, { crop })} /> : null}
              {isSheet ? (
                <Inline justify="between" align="center" gap="md">
                  <Text as="label" htmlFor={ratioId}>비율</Text>
                  <Box width="sm">
                    <Select id={ratioId} size="sm" value={page.settings.ratio} onChange={(event) => g.patchSettings(page.id, { ratio: event.currentTarget.value as RatioChoice })}>
                      <Select.Option value="auto">자동</Select.Option>
                      <Select.Option value="a">A 용지</Select.Option>
                      <Select.Option value="letter">Letter</Select.Option>
                      <Select.Option value="square">정사각형</Select.Option>
                    </Select>
                  </Box>
                </Inline>
              ) : null}
              <Inline justify="between" align="center" gap="md">
                <Text as="label" htmlFor={formatId}>이미지 형식</Text>
                <Box width="sm">
                  <Select id={formatId} size="sm" value={doc.format} onChange={(event) => g.setFormat(event.currentTarget.value as "png" | "jpeg")}>
                    <Select.Option value="png">PNG</Select.Option>
                    <Select.Option value="jpeg">JPEG</Select.Option>
                  </Select>
                </Box>
              </Inline>
            </Stack>
            {nothing ? null : (
              <Button as={RouterLink} to={paths.corners(page.id)} variant="hairline" fullWidth>
                <Glyph name="crop" />
                직접 맞추기
              </Button>
            )}
          </>
        ) : null}
      </Stack>
    </Surface>
  );
};

// The one summary of the document, and the buttons that save it. Nothing is written: a save is a bar that fills.
const ExportBlock = ({ page }: { page: Page }) => {
  const g = useGridphoto();
  const { ready, busy, saving, pages } = g;
  const percent = saving ? Math.round((saving.done / saving.total) * 100) : 0;
  const flagged = pages.filter(isFlagged).length;
  const waiting = pages.filter((item) => item.status === "queued" || item.status === "working").length;
  const [size, unit] = ready.length > 0 ? formatBytes(pdfBytes(ready)).split(" ") : ["—", undefined];
  const can = page.status === "ready";
  return (
    <Anchor>
      <Stack gap="lg">
        <StatRow>
          <Stat small label="PDF에 들어가는 쪽" value={ready.length} unit="쪽" note={waiting > 0 ? `${waiting}쪽 처리 중` : flagged > 0 ? `확인 필요 ${flagged}쪽` : "모두 확인했습니다"} />
          <Stat small label="예상 크기" value={size} unit={unit} note="A4 · 300 dpi" />
        </StatRow>
        <Stack gap="xs">
          <Button size="lg" fullWidth loading={saving?.kind === "pdf"} disabled={ready.length === 0 || busy || saving !== null} onClick={g.exportPdf}>
            {saving?.kind !== "pdf" ? <Glyph name="download" /> : null}
            {saving?.kind === "pdf" ? `PDF 만드는 중 ${percent}%` : busy ? "처리 중…" : `PDF로 저장 · ${ready.length}쪽`}
          </Button>
          <Button variant="ghost" fullWidth loading={saving?.kind === "image"} disabled={!can || saving !== null} onClick={() => g.exportImage(page.id)}>
            {saving?.kind === "image" ? `저장 중 ${percent}%` : "이 쪽만 이미지로"}
          </Button>
        </Stack>
        {saving ? <Meter value={saving.done / saving.total} weight="thin" label={saving.kind === "pdf" ? "PDF 만드는 중" : "이미지 저장 중"} valueText={`${percent}%`} /> : null}
      </Stack>
    </Anchor>
  );
};

export const ResultPanel = ({ page, view }: { page: Page; view: "result" | "source" }) => {
  const { problem } = useGridphoto();
  return (
    <Stack gap="lg">
      {problem ? <Notice tone="error">{problem}</Notice> : null}
      <ResultCard page={page} view={view} />
      <ExportBlock page={page} />
    </Stack>
  );
};
