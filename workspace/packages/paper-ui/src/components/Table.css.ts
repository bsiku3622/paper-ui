import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const tableRoot = style({
  width: "100%",
  borderCollapse: "collapse",
});

// 표 머리 — 옅은 면. 강한 밑줄 대신 조용히.
export const tableHead = style({
  background: tokens.color.paper.subtle,
});

export const tableTh = style({
  height: tokens.shape.height.control,
  paddingInline: tokens.shape.space.md,
  textAlign: "left",
  whiteSpace: "nowrap",
});

// 행 — 구분선은 아주 옅게. hover 때만 배경이 조용히 바뀐다.
export const tableTr = style({
  height: tokens.shape.height.row,
  transition: "background 100ms ease",
  selectors: {
    "&:not(:last-child)": {
      borderBottom: `${tokens.shape.borderWidth.base} solid ${tokens.color.border.base}`,
    },
    // 표는 subtle 패널 안에 들어가는 일이 많다 — hover 를 subtle 로 두면 안 보인다.
    // muted 로 한 단 더 내려 어느 컨테이너에서도 어두워지게 (원칙 4).
    "&:hover": { background: tokens.color.paper.muted },
  },
});

export const tableTd = style({
  paddingInline: tokens.shape.space.md,
  fontSize: "0.875rem",
});

export const tableNumeric = style({
  fontFamily: tokens.font.mono,
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
});
