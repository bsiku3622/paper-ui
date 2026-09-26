import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

const BP = tokens.layout.breakpoint;

// 페이지의 제목과 행동은 카드에 넣지 않는다. 한 줄의 양끝을 맞춰 정보의 시작점을 만들고,
// 좁아지면 자연스럽게 두 줄로 풀린다.
export const pageHeaderRoot = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "end",
  columnGap: tokens.shape.gap.lg,
  rowGap: tokens.shape.gap.md,
  minWidth: 0,
});

export const pageHeaderLocation = style({ gridColumn: "1 / -1" });

export const pageHeaderContent = style({ minWidth: 0, maxWidth: tokens.shape.component.pageHeaderContentWidth });

export const pageHeaderActions = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  flexWrap: "wrap",
  justifyContent: "end",
  "@media": {
    [`screen and (max-width: ${BP.md})`]: {
      gridColumn: "1 / -1",
      justifyContent: "start",
    },
  },
});
