import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// geometry 만. 색은 resolveColorClassnames("soft", status) 가 붙이는 pui-c-soft-*
// 클래스가 정한다 (옅은 색 면 = soft variant). Badge 는 gate(pui-interactive)를
// 붙이지 않아 hover 색이 뜨지 않는다 — 표시용이지 누르는 자리가 아니다.
export const badgeRoot = style({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.shape.space.xs,
  height: "1.375rem",
  paddingInline: tokens.shape.space.sm,
  borderRadius: tokens.shape.radius.sm,
  borderWidth: tokens.shape.borderWidth.base,
  borderStyle: "solid",
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.label,
  fontWeight: tokens.text.weight.medium,
  letterSpacing: tokens.text.tracking.caption,
  whiteSpace: "nowrap",
});
