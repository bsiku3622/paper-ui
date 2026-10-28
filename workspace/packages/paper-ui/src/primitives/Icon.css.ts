import { tokens, ICON_SIZES, type IconSize } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 이름은 옆에 서는 Text 역할을 따르고, 값은 viewBox 안의 path 여백을 고려한
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

export const iconSize = styleVariants(Object.fromEntries(ICON_SIZES.map((size) => [size, {
  width: tokens.shape.icon.size[size],
  height: tokens.shape.icon.size[size],
}])) as Record<IconSize, { width: string; height: string }>);
