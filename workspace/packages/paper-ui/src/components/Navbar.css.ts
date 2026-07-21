import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const navbarRoot = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.shape.z.sticky,
  minHeight: "3.25rem",
  borderBottomWidth: tokens.shape.borderWidth.base,
  borderBottomStyle: "solid",
  borderBottomColor: tokens.color.border.base,
});

export const navItem = style({
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  height: "2rem",
  paddingInline: tokens.shape.space.sm,
  borderRadius: tokens.shape.radius.sm,
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  color: tokens.color.ink.soft,
  transition: "background 130ms ease, color 130ms ease",
  selectors: { "&:hover": { color: tokens.color.ink.base, background: tokens.color.paper.muted } },
});

export const navItemActive = style({
  color: tokens.color.ink.base,
  fontWeight: tokens.weight.medium,
});
