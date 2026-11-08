import { createVar, fallbackVar } from "@vanilla-extract/css";

import { tokens, ICON_SIZES, type IconSize } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

export const iconSizeVar = createVar();
const inherited = fallbackVar(iconSizeVar, tokens.shape.icon.size.body);

export const iconRoot = style({
  display: "inline-block",
  flexShrink: 0,
  width: inherited,
  height: inherited,
  stroke: "currentColor",
  fill: "none",
  strokeWidth: tokens.shape.stroke.icon,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const iconSize = styleVariants(Object.fromEntries(ICON_SIZES.map((size) => [size, {
  width: tokens.shape.icon.size[size],
  height: tokens.shape.icon.size[size],
}])) as Record<IconSize, { width: string; height: string }>);
