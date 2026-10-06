import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const menuRoot = style({
  minWidth: tokens.shape.width.md.layout,
  padding: tokens.shape.padding.xs.interaction,
  display: "flex",
  flexDirection: "column",
  gap: tokens.shape.gap.xs,
});

export const menuItem = style({
  width: "100%",
  minHeight: tokens.shape.height.sm.interaction,
  paddingInline: tokens.shape.padding.sm.interaction,
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.gap.sm,
  border: "none",
  borderRadius: tokens.shape.radius.interaction,
  background: "transparent",
  color: tokens.color.ink.primary,
  textAlign: "start",
  textDecoration: "none",
  cursor: "pointer",
  transition: stateTransition("background", "color"),
  selectors: {
    "&:hover:not([aria-disabled='true']), &:focus-visible:not([aria-disabled='true'])": {
      background: tokens.color.interaction.bgHover.onSurface,
    },
    "&[aria-disabled='true']": { color: tokens.color.ink.tertiary, cursor: "default" },
  },
});

export const menuItemActive = style({
  background: tokens.color.interaction.selected,
  selectors: { "&:hover": { background: tokens.color.interaction.selected } },
});

export const menuItemDanger = style({ color: tokens.color.accent.error.solid });
export const menuItemCopy = style({ flex: 1, minWidth: 0 });
export const menuItemIcon = style({ color: "currentColor", display: "inline-flex" });
export const menuShortcut = style({ color: tokens.color.ink.tertiary, whiteSpace: "nowrap" });
