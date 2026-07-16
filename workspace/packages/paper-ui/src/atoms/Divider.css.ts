import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const dividerRoot = style({
  border: "none",
  margin: 0,
  flexShrink: 0,
  background: tokens.color.rule.base,
});

export const dividerWeight = styleVariants({
  base: { background: tokens.color.rule.base },
  strong: { background: tokens.color.rule.strong },
});

export const dividerAxis = styleVariants({
  horizontal: { height: tokens.shape.ruleWidth.base, width: "100%" },
  vertical: { width: tokens.shape.ruleWidth.base, alignSelf: "stretch" },
});
