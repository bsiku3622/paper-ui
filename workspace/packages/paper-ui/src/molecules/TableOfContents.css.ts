import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const tocRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.shape.gap.xs,
  borderLeftWidth: tokens.shape.constants.borderWidth,
  borderLeftStyle: "solid",
  borderLeftColor: tokens.color.border.base,
});
export const tocLabel = style({ paddingInline: tokens.shape.padding.md.interaction, marginBottom: tokens.shape.gap.xs });
export const tocItem = style({
  minHeight: tokens.shape.height.sm.interaction,
  display: "flex",
  alignItems: "center",
  marginLeft: `calc(${tokens.shape.constants.borderWidth} * -1)`,
  borderLeftWidth: tokens.shape.constants.borderWidth,
  borderLeftStyle: "solid",
  borderLeftColor: "transparent",
  color: tokens.color.content.secondary,
  fontSize: tokens.text.size.caption,
  textDecoration: "none",
  transition: stateTransition("background", "color", "border-color"),
  selectors: { "&:hover": { background: tokens.color.interaction.hover, color: tokens.color.content.primary } },
});
export const tocItemActive = style({
  borderLeftColor: tokens.color.accent.primary.solid,
  color: tokens.color.content.primary,
  fontWeight: tokens.text.weight.medium,
  background: tokens.color.interaction.hover,
});
export const tocDepth = styleVariants({
  0: { paddingLeft: tokens.shape.padding.md.interaction, paddingRight: tokens.shape.padding.sm.interaction },
  1: { paddingLeft: tokens.shape.padding.lg.interaction, paddingRight: tokens.shape.padding.sm.interaction },
  2: { paddingLeft: tokens.shape.padding.xl.interaction, paddingRight: tokens.shape.padding.sm.interaction },
});
