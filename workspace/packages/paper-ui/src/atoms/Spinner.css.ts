import { style, styleVariants, keyframes } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

// 도는 원. 옅은 링에 한 조각만 진해 회전으로 읽힌다. loop 주기는 motion 토큰.
// 크기는 size 축(spinnerSize)이 정한다 — Icon 과 같은 dot 사다리(12~20).
export const spinnerRoot = style({
  display: "inline-block",
  flexShrink: 0,
  borderRadius: tokens.shape.radius.full,
  borderWidth: tokens.shape.constants.focusRingWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  borderTopColor: tokens.color.ink.base,
  animation: `${spin} ${tokens.motion.loop.spin} linear infinite`,
});

export const spinnerSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => [s, { width: tokens.shape.dot[s], height: tokens.shape.dot[s] }]),
  ) as Record<ControlSize, { width: string; height: string }>,
);
