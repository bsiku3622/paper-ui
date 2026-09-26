import { globalStyle, style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const sidebarRoot = style({
  alignSelf: "start",
  background: tokens.color.bg.canvas,
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
  color: tokens.color.ink.primary,
  fontWeight: tokens.text.weight.semibold,
});

export const sidebarItem = style({
  appearance: "none",
  width: "100%",
  position: "relative",
  isolation: "isolate",
  minHeight: tokens.shape.height.sm.interaction,
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  paddingInline: tokens.shape.padding.md.interaction,
  border: "none",
  borderRadius: tokens.shape.radius.interaction,
  background: "transparent",
  color: tokens.color.ink.secondary,
  textDecoration: "none",
  textAlign: "start",
  cursor: "pointer",
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  fontWeight: tokens.text.weight.normal,
  transition: stateTransition("color"),
  selectors: {
    "&::after": {
      content: "\"\"",
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      background: tokens.color.interaction.bgHover.onSurface,
      opacity: 0,
      pointerEvents: "none",
      zIndex: 1,
      transition: stateTransition("opacity"),
    },
    "&:hover": { color: tokens.color.ink.primary },
    "&:hover::after": { opacity: 1 },
  },
});

// 행의 텍스트와 Badge는 overlay 아래에 둔다. 그래야 선택/hover 면이 Badge를
// 따로 떠 있는 칩처럼 남기지 않고 같은 틴트로 덮는다.
globalStyle(`${sidebarItem} > *`, { position: "relative", zIndex: 0 });

export const sidebarItemActive = style({
  color: tokens.color.ink.primary,
  fontWeight: tokens.text.weight.medium,
  // route 전환 직후 badge overlay는 즉시 생긴다. 행 배경도 같은 프레임에 selected로
  // 바뀌어야 둘이 갈라지지 않으므로, active에서는 background transition을 끈다.
  transition: stateTransition("color"),
  // 포인터가 클릭 위치에 남아 있어도 일반 hover가 selected 면을 덮지 못하게 한다.
  selectors: {
    "&::after": { background: tokens.color.interaction.selected, opacity: 1 },
    "&:hover": { color: tokens.color.ink.primary },
    "&:hover::after": { background: tokens.color.interaction.selected },
  },
});

export const sidebarBadge = style({ marginLeft: "auto", flex: "0 0 auto" });
