import { memo, useEffect } from "react";

import { Badge, Box, Button, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter, SurfaceLink } from "../../../kit";
import { Layers } from "../content/Layers";
import { FlatPage, SourcePhoto } from "../content/Photo";
import { isFlagged, outputOf } from "../model/derive";
import type { Page } from "../model/types";
import { paths } from "../paths";
import { useCoarsePointer } from "../state/coarse";
import { useGridphoto } from "../state/document";

const TILE = 3 / 4;

const Picture = ({ page }: { page: Page }) => {
  if (page.status === "failed") return <Glyph name="file-warning" size="subheading" ink="tertiary" />;
  const out = page.status === "ready" ? outputOf(page) : null;
  if (!out) {
    return (
      <Box width="full">
        <SourcePhoto photo={page.photo} dim />
      </Box>
    );
  }
  const aspect = page.settings.rotation % 2 !== 0 ? 1 / out.pageRatio : out.pageRatio;
  return (
    <Box width={`${Math.round(Math.min(1, aspect / TILE) * 88)}%`}>
      <FlatPage photo={page.photo} quad={out.quad} aspect={out.shownRatio} rotation={page.settings.rotation} filter={page.settings.filter} />
    </Box>
  );
};

const Thumb = memo(function Thumb({ page, number, here, progress }: { page: Page; number: number; here: boolean; progress: number }) {
  const flagged = isFlagged(page);
  const working = page.status === "working" || page.status === "queued";
  return (
    <Stack gap="xs" align="center">
      <Layers
        ratio="3 / 4"
        base={
          <Stack align="center" justify="center" width="full" height="full">
            <Picture page={page} />
          </Stack>
        }
        over={{
          topEnd: flagged ? <Badge size="xs" variant="solid" accent={page.status === "failed" ? "error" : "warning"}>!</Badge> : null,
          center: working ? <Spinner size="sm" label={`${number}쪽 처리 중`} /> : null,
          bottom: working ? <Box paddingX="sm" paddingY="xs"><Meter value={progress} weight="thin" /></Box> : null,
        }}
      />
      <Text as="span" variant="label" strong={here} ink={here ? "primary" : "tertiary"} numeric>{number}</Text>
    </Stack>
  );
});

export const PageStrip = ({ currentId }: { currentId: string | null }) => {
  const { pages, progress, addMock } = useGridphoto();
  const coarse = useCoarsePointer();

  useEffect(() => {
    const strip = document.querySelector("[data-strip]");
    const here = strip?.querySelector('[aria-current="page"]');
    if (!strip || !here) return;
    const box = strip.getBoundingClientRect();
    const item = here.getBoundingClientRect();
    if (item.left < box.left) strip.scrollLeft -= box.left - item.left;
    else if (item.right > box.right) strip.scrollLeft += item.right - box.right;
  }, [currentId, pages.length]);

  return (
    <Inline as="nav" aria-label="페이지" gap="sm" align="center" overflowX="auto" paddingY="xs" data-strip="">
      <Inline as="ul" gap="sm" align="start" minWidth="max-content">
        {pages.map((page, index) => {
          const here = page.id === currentId;
          return (
            <Stack as="li" key={page.id}>
              <SurfaceLink to={paths.page(page.id)} radius="md" padding="xs" selected={here} aria-current={here ? "page" : undefined} aria-label={`${index + 1}쪽${isFlagged(page) ? ", 확인 필요" : ""}`}>
                <Box width="xs">
                  <Thumb page={page} number={index + 1} here={here} progress={progress[page.id] ?? 0} />
                </Box>
              </SurfaceLink>
            </Stack>
          );
        })}
      </Inline>
      <Button variant="dashed" size="sm" onClick={() => addMock(3)}>
        <Glyph name="plus" />
        사진 추가
      </Button>
      {coarse ? (
        <Button variant="dashed" size="sm" onClick={() => addMock(1)}>
          <Glyph name="camera" />
          카메라로 찍기
        </Button>
      ) : null}
    </Inline>
  );
};
