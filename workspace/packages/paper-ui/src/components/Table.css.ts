import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const tableRoot = style({
  width: "100%",
  borderCollapse: "collapse",
});

// 표 머리 — 옅은 면. 강한 밑줄 대신 조용히.
export const tableHead = style({
  background: tokens.color.paper.sunken,
});

export const tableTh = style({
  height: tokens.shape.height.md.interaction,
  paddingInline: tokens.shape.padding.md.interaction,
  textAlign: "left",
  whiteSpace: "nowrap",
});

// 행 — **선을 긋지 않는다.** 행을 가르는 건 줄이 아니라 높이(44px)와 hover 다.
// 헤어라인 여섯 줄이 들어가면 표가 격자로 읽히고, 한 화면에 표·패널·섹션이 함께
// 서면 그 줄들이 전부 같은 굵기로 쌓여 화면이 줄무늬가 된다. 머리는 sunken 면으로
// 이미 갈리므로 몸통에는 줄이 필요 없다.
export const tableTr = style({
  height: tokens.shape.height.xl.interaction,
  transition: stateTransition("background"),
  selectors: {
    // hover 는 interaction 오버레이 — 어느 면(순백·smoke·well) 위든 그 면을 조금
    // 어둡게 만든다. solid 회색을 자리마다 고르지 않는다 (중립 상호작용 = 오버레이).
    "&:hover": { background: tokens.color.interaction.hover },
  },
});

export const tableTd = style({
  paddingInline: tokens.shape.padding.md.interaction,
  fontSize: tokens.text.size.body,
});

// 숫자 열 — mono 로 시선을 뺏지 않는다. sans 그대로 tabular-nums 로 자리만 맞추고
// 우측정렬. (숫자라고 무조건 등폭이면 표가 시끄러워진다.)
export const tableNumeric = style({
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});
