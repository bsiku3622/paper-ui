import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const sidebarRoot = style({
  alignSelf: "start",
  background: tokens.color.paper.canvas,
  borderRightWidth: tokens.shape.constants.borderWidth,
  borderRightStyle: "solid",
  borderRightColor: tokens.color.border.base,
  paddingInline: tokens.shape.padding.md.interaction,
  paddingBlock: tokens.shape.padding.lg.interaction,
});

export const sidebarGroup = style({ display: "flex", flexDirection: "column", gap: tokens.shape.gap.xs });
export const sidebarGroupAfter = style({ marginTop: tokens.shape.gap.lg });

export const sidebarGroupLabel = style({
  paddingInline: tokens.shape.padding.md.interaction,
  marginBottom: tokens.shape.gap.xs,
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.semibold,
});

export const sidebarItem = style({
  appearance: "none",
  width: "100%",
  minHeight: tokens.shape.height.sm.interaction,
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  paddingInline: tokens.shape.padding.md.interaction,
  border: "none",
  borderRadius: tokens.shape.radius.interaction,
  background: "transparent",
  color: tokens.color.ink.soft,
  textDecoration: "none",
  textAlign: "start",
  cursor: "pointer",
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  fontWeight: tokens.text.weight.normal,
  transition: stateTransition("background", "color"),
  selectors: { "&:hover": { background: tokens.color.interaction.hover, color: tokens.color.ink.base } },
});

export const sidebarItemActive = style({
  background: tokens.color.interaction.selected,
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.medium,
});

export const sidebarItemLabel = style({ flex: 1, minWidth: 0 });

// selected는 행과 badge를 같은 neutral overlay 아래에 둔다. soft pigment를 없애지 않고
// 그 위에 행과 같은 selected tint를 합성하므로, 색의 뜻은 남되 별도 층처럼 뜨지 않는다.
export const sidebarBadgeSelectedOverlay = style({
  backgroundImage: `linear-gradient(${tokens.color.interaction.selected}, ${tokens.color.interaction.selected})`,
});
