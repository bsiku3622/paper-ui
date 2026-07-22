import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const navbarRoot = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.layout.z.sticky,
  minHeight: tokens.shape.atom.navbar,
  borderBottomWidth: tokens.shape.constants.borderWidth,
  borderBottomStyle: "solid",
  borderBottomColor: tokens.color.border.base,
});

export const navItem = style({
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  height: tokens.shape.atom.navItem,
  paddingInline: tokens.shape.padding.sm.interaction,
  borderRadius: tokens.shape.radius.interaction,
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  color: tokens.color.ink.soft,
  transition: stateTransition("background", "color"),
  selectors: { "&:hover": { color: tokens.color.ink.base, background: tokens.color.paper.muted } },
});

export const navItemActive = style({
  color: tokens.color.ink.base,
  fontWeight: tokens.text.weight.medium,
});
