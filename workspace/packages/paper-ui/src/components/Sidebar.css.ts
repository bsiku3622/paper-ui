import { globalStyle, style } from "@vanilla-extract/css";

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
globalStyle(`${sidebarGroup} + ${sidebarGroup}`, { marginTop: tokens.shape.gap.lg });

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
  // route 전환 직후 badge overlay는 즉시 생긴다. 행 배경도 같은 프레임에 selected로
  // 바뀌어야 둘이 갈라지지 않으므로, active에서는 background transition을 끈다.
  transition: stateTransition("color"),
  // 포인터가 클릭 위치에 남아 있어도 일반 hover가 selected 면을 덮지 못하게 한다.
  selectors: {
    "&:hover": { background: tokens.color.interaction.selected, color: tokens.color.ink.base },
  },
});

export const sidebarBadge = style({ marginLeft: "auto", flex: "0 0 auto" });

// selected는 행과 badge를 같은 neutral overlay 아래에 둔다. soft pigment를 없애지 않고
// 그 위에 행과 같은 selected tint를 합성하므로, 색의 뜻은 남되 별도 층처럼 뜨지 않는다.
export const sidebarBadgeSelectedOverlay = style({
  backgroundImage: `linear-gradient(${tokens.color.interaction.selected}, ${tokens.color.interaction.selected})`,
});
