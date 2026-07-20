import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 상태 한 낱말. status 면 wash(옅은 색 면), 아니면 조용한 회색.
export const badgeRoot = style({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.shape.space.xs,
  height: "1.375rem",
  paddingInline: tokens.shape.space.sm,
  borderRadius: tokens.shape.radius.sm,
  borderWidth: tokens.shape.borderWidth.base,
  borderStyle: "solid",
  borderColor: "transparent",
  fontFamily: tokens.font.sans,
  fontSize: "0.75rem",
  fontWeight: "500",
  letterSpacing: "0",
  whiteSpace: "nowrap",
});

// 무채색 기본 배지.
export const badgeNeutral = style({
  background: tokens.color.surface.muted,
  color: tokens.color.ink.soft,
});
