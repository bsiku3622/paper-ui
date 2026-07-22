import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

// 크기는 size 축(iconSize)이 정한다 — dot 사다리(12·14·16·18·20). Spinner 와 같은
// 사다리라 아이콘·스피너가 나란히 두면 크기가 맞는다.
export const iconRoot = style({
  display: "inline-block",
  flexShrink: 0,
  stroke: "currentColor",
  fill: "none",
  strokeWidth: tokens.shape.constants.iconStrokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const iconSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [s, { width: tokens.shape.dot[s], height: tokens.shape.dot[s] }]),
  ) as Record<ControlSize, { width: string; height: string }>,
);
