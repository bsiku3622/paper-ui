import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const paginationRoot = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.xs,
  flexWrap: "wrap",
});

export const paginationPage = style({
  minWidth: tokens.shape.height.sm.interaction,
  paddingInline: tokens.shape.padding.xs.interaction,
});

export const paginationEllipsis = style({
  width: tokens.shape.height.sm.interaction,
  color: tokens.color.ink.tertiary,
  textAlign: "center",
  lineHeight: tokens.shape.height.sm.interaction,
});
