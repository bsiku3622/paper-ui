// What the well shows for a page: the page pulled straight, the photo it came from with what was found traced over it, the
// steps it is going through, or the reason it could not be opened. (The corner editor has its own screen.)

import type { ReactNode } from "react";

import { Box, Inline, Spinner, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Meter } from "../../../kit";
import { Layers } from "../content/Layers";
import { FlatPage, Lines, SourcePhoto, comparisonPath } from "../content/Photo";
import { TRIM, activeFit, isTrimmed, outputOf } from "../model/derive";
import { latticePath, outlinePath } from "../model/geometry";
import { STEPS, stepsFor } from "../model/steps";
import type { Page } from "../model/types";
import { useGridphoto } from "../state/document";

export type StageView = "result" | "source";

// The picture is as wide as its shape allows without pushing the strip below the fold.
export const widthFor = (aspect: number): "measure.xs" | "measure.md" => (aspect > 1.05 ? "measure.md" : "measure.xs");

const Steps = ({ page, value }: { page: Page; value: number }) => {
  const steps = stepsFor(page.scenario);
  return (
    <Surface fill="raised" border radius="md" padding="lg" width="full" maxWidth="xl" role="status" aria-label={`${page.name} 처리 중`}>
      <Stack gap="md">
        <Meter value={value} label={page.name} valueText={`${Math.round(value * 100)}%`} />
        <Stack gap="xs">
          {steps.map((id, index) => (
            <Inline key={id} gap="sm" align="center">
              {index < page.stepIndex ? <Glyph name="circle-check" ink="secondary" /> : index === page.stepIndex ? <Spinner size="inline" decorative /> : <Glyph name="circle" ink="tertiary" />}
              <Text as="span" ink={index === page.stepIndex ? "primary" : "tertiary"}>{index < page.stepIndex ? STEPS[id].done : STEPS[id].doing}</Text>
            </Inline>
          ))}
        </Stack>
      </Stack>
    </Surface>
  );
};

const Waiting = ({ page }: { page: Page }) => (
  <Layers
    base={<SourcePhoto photo={page.photo} dim large label={`${page.name}, 차례를 기다리는 중`} />}
    over={{
      center: (
        <Surface fill="raised" border radius="md" padding="lg" role="status" aria-label={`${page.name} 차례를 기다리는 중`}>
          <Inline gap="sm" align="center">
            <Spinner size="inline" decorative />
            <Text as="span">앞 사진을 처리하고 있습니다</Text>
          </Inline>
        </Surface>
      ),
    }}
  />
);

const Source = ({ page, showGrid }: { page: Page; showGrid: boolean }) => {
  const fit = activeFit(page);
  const paths: { d: string; strong?: boolean }[] = [];
  if (fit && fit.origin !== "none") {
    if (fit.kind === "sheet") paths.push({ d: outlinePath(fit.quad), strong: true });
    else if (showGrid) paths.push({ d: latticePath(fit.quad, fit.cols ?? 1, fit.rows ?? 1, fit.lines === "ruled") });
  }
  return (
    <SourcePhoto photo={page.photo} large label="원본 사진">
      <Lines paths={paths} />
    </SourcePhoto>
  );
};

const Result = ({ page, showGrid, rendering }: { page: Page; showGrid: boolean; rendering: boolean }) => {
  const fit = activeFit(page);
  const out = outputOf(page);
  if (!fit || !out) return null;
  const overlay = showGrid && fit.kind === "grid" ? comparisonPath(fit.cols ?? 1, fit.rows ?? 1, page.settings.rotation, fit.lines === "ruled" ? "rows" : "both", isTrimmed(page) ? TRIM : 0) : "";
  return (
    <FlatPage photo={page.photo} quad={out.quad} aspect={out.shownRatio} rotation={page.settings.rotation} filter={page.settings.filter} stale={rendering} large label="펴진 사진">
      {overlay ? <Lines paths={[{ d: overlay }]} /> : null}
    </FlatPage>
  );
};

export const Stage = ({ page, view }: { page: Page; view: StageView }) => {
  const { doc, rendering, progress } = useGridphoto();
  const fit = activeFit(page);
  const out = outputOf(page);
  const showGrid = doc.showGrid && fit?.kind === "grid";
  let aspect = page.photo.ratio;
  let body: ReactNode;
  if (page.status === "failed") {
    body = <Empty glyph="file-warning" title="이 사진은 열지 못했습니다" description="이 쪽을 지우고 다른 사진을 올려 주세요." />;
  } else if (page.status === "queued") {
    body = <Waiting page={page} />;
  } else if (page.status === "working") {
    body = <Layers base={<SourcePhoto photo={page.photo} dim large label={`${page.name} 원본`} />} over={{ center: <Steps page={page} value={progress[page.id] ?? 0} /> }} />;
  } else if (view === "source") {
    body = <Source page={page} showGrid={showGrid} />;
  } else {
    body = <Result page={page} showGrid={showGrid} rendering={rendering} />;
    if (out) aspect = page.settings.rotation % 2 !== 0 ? 1 / out.pageRatio : out.pageRatio;
  }
  return (
    <Stack align="center" paddingY="sm">
      <Box as="section" width="full" maxWidth={page.status === "failed" ? "measure.sm" : widthFor(aspect)} aria-label={view === "source" ? "원본 사진" : "펴진 사진"}>
        {body}
      </Box>
    </Stack>
  );
};
