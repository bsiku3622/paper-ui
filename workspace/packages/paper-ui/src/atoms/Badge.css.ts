import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 상태를 한 낱말로. wash 면 + 같은 색 괘선 (resolver 가 색을 결정).
export const badgeRoot = style({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.shape.space.xs,
  height: "1.375rem",
  paddingInline: tokens.shape.space.sm,
  borderRadius: tokens.shape.radius.pill,
  borderWidth: tokens.shape.ruleWidth.base,
  borderStyle: "solid",
  borderColor: tokens.color.rule.base,
  fontFamily: tokens.font.mono,
  fontSize: "0.6875rem",
  fontWeight: "500",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});
