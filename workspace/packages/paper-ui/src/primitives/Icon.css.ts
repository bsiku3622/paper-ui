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
  strokeWidth: tokens.shape.stroke.icon,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const iconSize = styleVariants({
  label: { width: tokens.shape.icon.size.label, height: tokens.shape.icon.size.label },
  caption: { width: tokens.shape.icon.size.caption, height: tokens.shape.icon.size.caption },
  body: { width: tokens.shape.icon.size.body, height: tokens.shape.icon.size.body },
  heading3: { width: tokens.shape.icon.size.heading3, height: tokens.shape.icon.size.heading3 },
} satisfies Record<IconSize, { width: string; height: string }>);
