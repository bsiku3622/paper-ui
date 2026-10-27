import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const dividerRoot = style({
  border: "none",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.border.base,
});

export const dividerWeight = styleVariants({
  base: { background: tokens.color.border.base },
  strong: { background: tokens.color.border.strong },
});

export const dividerAxis = styleVariants({
  horizontal: { height: tokens.shape.stroke.border, width: "100%" },
  vertical: { width: tokens.shape.stroke.border, alignSelf: "stretch" },
});
