import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const tableRoot = style({
  width: "100%",
  borderCollapse: "collapse",
});

export const tableCaption = style({
  padding: tokens.shape.padding.md.interaction,
  textAlign: "start",
});

// 표 머리 — 옅은 면. 강한 밑줄 대신 조용히.
export const tableHead = style({
  background: tokens.color.bg.sunken,
});

export const tableHeadSticky = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.layout.z.sticky,
});

export const tableTh = style({
  textAlign: "left",
  whiteSpace: "nowrap",
});

// 행 — **선을 긋지 않는다.** 행을 가르는 건 줄이 아니라 높이(44px)와 hover 다.
// 헤어라인 여섯 줄이 들어가면 표가 격자로 읽히고, 한 화면에 표·패널·섹션이 함께
// 서면 그 줄들이 전부 같은 굵기로 쌓여 화면이 줄무늬가 된다. 머리는 sunken 면으로
// 이미 갈리므로 몸통에는 줄이 필요 없다.
export const tableTr = style({
  transition: stateTransition("background", "background-image"),
  selectors: {
    // hover 는 interaction 오버레이 — 어느 면(순백·smoke·well) 위든 그 면을 조금
    // 어둡게 만든다. solid 회색을 자리마다 고르지 않는다 (중립 상호작용 = 오버레이).
    "&:hover": {
      backgroundImage: `linear-gradient(${tokens.color.interaction.bgHover.onSurface}, ${tokens.color.interaction.bgHover.onSurface})`,
    },
  },
});

// variant는 행을 **어떻게 구분하는가**만 고른다. striped와 ruled를 동시에 허용하지 않아
// 면과 선이 같은 정보를 두 번 말하지 않게 한다.
export const tableRowVariant = styleVariants({
  plain: {},
  ruled: {
    borderBottomWidth: tokens.shape.constants.borderWidth,
    borderBottomStyle: "solid",
    borderBottomColor: tokens.color.border.base,
    selectors: { "&:last-child": { borderBottomColor: "transparent" } },
  },
  striped: {
    selectors: { "&:nth-child(even)": { background: tokens.color.bg.sunken } },
  },
});

// density는 컨트롤 size가 아니다. 같은 body 14를 유지한 채 행 높이와 좌우 여백만 움직인다.
export const tableRowDensity = styleVariants({
  compact: { height: tokens.shape.component.tableRowHeight.compact },
  default: { height: tokens.shape.component.tableRowHeight.default },
  comfortable: { height: tokens.shape.component.tableRowHeight.comfortable },
});

export const tableHeadDensity = styleVariants({
  compact: { height: tokens.shape.height.sm.interaction },
  default: { height: tokens.shape.height.md.interaction },
  comfortable: { height: tokens.shape.height.lg.interaction },
});

export const tableTd = style({
  fontSize: tokens.text.size.body,
  whiteSpace: "nowrap",
});

export const tableCellDensity = styleVariants({
  compact: { paddingInline: tokens.shape.padding.sm.interaction },
  default: { paddingInline: tokens.shape.padding.md.interaction },
  comfortable: { paddingInline: tokens.shape.padding.lg.interaction },
});

export const tableEmptyCell = style({ padding: 0 });

export const tableAlign = styleVariants({
  start: { textAlign: "start" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
});

// 숫자 열 — mono 로 시선을 뺏지 않는다. sans 그대로 tabular-nums 로 자리만 맞추고
// 우측정렬. (숫자라고 무조건 등폭이면 표가 시끄러워진다.)
export const tableNumeric = style({
  fontVariantNumeric: "tabular-nums",
});
