import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

// 크기는 size 축(iconSize)이 정한다 — icon 사다리(16·18·20). Spinner 와 같은 사다리라
// 아이콘·스피너를 나란히 두면 크기가 맞는다.
//
// ⚠ 이 값은 **아트보드**다. viewBox 24 안에서 path 는 18~20 만 채우므로 화면의 잉크는
// 아트보드의 75~83% 다. Checkbox 16 과 나란히 세울 때 아트보드도 16 이면 아이콘만 작아
// 보이는 이유고, 사다리가 한 단 위(md 18)에 있는 이유다.
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
    CONTROL_SIZES.map((s) => [s, { width: tokens.shape.icon[s], height: tokens.shape.icon[s] }]),
  ) as Record<ControlSize, { width: string; height: string }>,
);
