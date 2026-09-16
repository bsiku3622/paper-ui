import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";
import type { IconSize } from "./Icon";

// 이름은 typography ladder를 따르고, 값은 viewBox 안의 path 여백을 고려한
// 광학 아트보드 크기(14·16·18·20)로 매핑한다.
export const iconRoot = style({
  display: "inline-block",
  flexShrink: 0,
  stroke: "currentColor",
  fill: "none",
  strokeWidth: tokens.shape.constants.iconStrokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const iconSize = styleVariants({
  label: { width: tokens.shape.iconTextSize.label, height: tokens.shape.iconTextSize.label },
  caption: { width: tokens.shape.iconTextSize.caption, height: tokens.shape.iconTextSize.caption },
  body: { width: tokens.shape.iconTextSize.body, height: tokens.shape.iconTextSize.body },
  subheading: { width: tokens.shape.iconTextSize.subheading, height: tokens.shape.iconTextSize.subheading },
} satisfies Record<IconSize, { width: string; height: string }>);
