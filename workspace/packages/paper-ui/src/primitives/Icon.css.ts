import { createVar, fallbackVar } from "@vanilla-extract/css";

import { tokens, ICON_SIZES, type IconSize } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 안을 채우는 쪽이 정하는 크기. 컨트롤은 자기 높이를 따르는 크기를 여기 적고(Control), 그 안의 Icon 은 이 값을 읽는다.
// 아무도 안 적었으면 body 이고, Icon 에 직접 준 size 가 이긴다.
export const iconSizeVar = createVar();
const inherited = fallbackVar(iconSizeVar, tokens.shape.icon.size.body);

// 이름은 옆에 서는 Text 역할을 따르고, 값은 viewBox 안의 path 여백을 고려한
// 광학 아트보드 크기(14·16·18·20)로 매핑한다.
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
