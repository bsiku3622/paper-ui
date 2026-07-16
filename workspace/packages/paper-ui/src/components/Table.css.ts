import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const tableRoot = style({
  width: "100%",
  borderCollapse: "collapse",
});

// 표 머리는 파인 칸 — 아래에 강한 괘선.
export const tableHead = style({
  background: tokens.color.paper.sunk,
  borderBottomWidth: tokens.shape.ruleWidth.base,
  borderBottomStyle: "solid",
  borderBottomColor: tokens.color.rule.strong,
});

// 표 머리도 장부의 한 줄이다 — line 높이라야 배경 괘선과 격자가 맞는다.
// (control 높이(33px) 로 두면 아래 모든 행이 11px 씩 밀려 배경 괘선과 이중선이 된다.)
export const tableTh = style({
  height: tokens.shape.height.row,
  paddingInline: tokens.shape.space.md,
  textAlign: "left",
  whiteSpace: "nowrap",
});

// 행 높이 = line. 배경 괘선과 정확히 맞아 항목이 선 위에 앉는다.
export const tableTr = style({
  height: tokens.shape.height.row,
  borderBottomWidth: tokens.shape.ruleWidth.base,
  borderBottomStyle: "solid",
  borderBottomColor: tokens.color.rule.base,
  selectors: { "&:last-child": { borderBottom: "none" } },
});

export const tableTd = style({
  paddingInline: tokens.shape.space.md,
  fontSize: "0.9375rem",
});

// 숫자 열 — mono·우측정렬. 합계를 눈으로 따라갈 수 있게.
export const tableNumeric = style({
  fontFamily: tokens.font.mono,
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});
