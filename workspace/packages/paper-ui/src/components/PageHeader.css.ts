import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 페이지의 제목과 행동은 카드에 넣지 않는다. 한 줄의 양끝을 맞춰 정보의 시작점을 만들고,
// 좁아지면 자연스럽게 두 줄로 풀린다.
export const pageHeaderRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.shape.gap.md,
  minWidth: 0,
});

export const pageHeaderRow = style({
  display: "flex",
  alignItems: "end",
  justifyContent: "space-between",
  gap: tokens.shape.gap.lg,
  flexWrap: "wrap",
});

export const pageHeaderCopy = style({ minWidth: 0, maxWidth: "44rem" });

export const pageHeaderActions = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  flexWrap: "wrap",
});
