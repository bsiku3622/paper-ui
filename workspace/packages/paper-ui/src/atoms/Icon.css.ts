import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const iconRoot = style({
  display: "inline-block",
  flexShrink: 0,
  width: tokens.shape.dot.md,
  height: tokens.shape.dot.md,
  stroke: "currentColor",
  fill: "none",
  strokeWidth: tokens.shape.constants.iconStrokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});
