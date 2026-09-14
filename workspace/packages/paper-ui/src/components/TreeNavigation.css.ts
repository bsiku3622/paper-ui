import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const treeRoot = style({ display: "flex", flexDirection: "column", gap: tokens.shape.gap.xs });
export const treeGroup = style({ display: "flex", flexDirection: "column", gap: tokens.shape.gap.xs });
export const treeRow = style({
  width: "100%",
  minHeight: tokens.shape.height.sm.interaction,
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.xs,
  border: 0,
  borderRadius: tokens.shape.radius.interaction,
  background: "transparent",
  color: tokens.color.ink.soft,
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  textAlign: "start",
  textDecoration: "none",
  cursor: "pointer",
  transition: stateTransition("background", "color"),
  selectors: {
    "&:hover, &:focus-visible": { background: tokens.color.interaction.hover, color: tokens.color.ink.base },
  },
});
export const treeRowActive = style({
  background: tokens.color.interaction.selected,
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.medium,
  selectors: { "&:hover": { background: tokens.color.interaction.selected } },
});
export const treeDepth = styleVariants({
  1: { paddingLeft: tokens.shape.padding.xs.interaction, paddingRight: tokens.shape.padding.sm.interaction },
  2: { paddingLeft: tokens.shape.padding.md.interaction, paddingRight: tokens.shape.padding.sm.interaction },
  3: { paddingLeft: tokens.shape.padding.xl.interaction, paddingRight: tokens.shape.padding.sm.interaction },
  4: { paddingLeft: `calc(${tokens.shape.padding.xl.interaction} + ${tokens.shape.padding.md.interaction})`, paddingRight: tokens.shape.padding.sm.interaction },
});
export const treeChevron = style({ display: "inline-flex", color: tokens.color.ink.faint, transition: stateTransition("transform") });
export const treeChevronOpen = style({ transform: "rotate(90deg)" });
export const treeSpacer = style({ width: tokens.shape.icon.sm, flex: "0 0 auto" });
export const treeLabel = style({ flex: 1, minWidth: 0 });
