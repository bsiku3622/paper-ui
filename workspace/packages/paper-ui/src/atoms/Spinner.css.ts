import { style, styleVariants, keyframes } from "@vanilla-extract/css";

import { tokens, CONTROL_SIZES, type ControlSize } from "../tokens";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

// 도는 원. 옅은 링에 한 조각만 진해 회전으로 읽힌다. loop 주기는 motion 토큰.
// 크기는 size 축(spinnerSize)이 정한다 — Icon 과 같은 icon 사다리(16·18·20). 속이 빈
// 링이라 같은 지름의 채운 사각형(Checkbox)보다 가볍게 읽히는데, 그건 스피너가 지고 가는
// 성질이라 지름으로 보정하지 않는다.
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
    CONTROL_SIZES.map((s) => [s, { width: tokens.shape.icon[s], height: tokens.shape.icon[s] }]),
  ) as Record<ControlSize, { width: string; height: string }>,
);
