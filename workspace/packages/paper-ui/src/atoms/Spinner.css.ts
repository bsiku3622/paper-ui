import { style, keyframes } from "@vanilla-extract/css";

import { tokens } from "../tokens";

const spin = keyframes({ to: { transform: "rotate(360deg)" } });

// 도는 원. 옅은 링에 한 조각만 진해 회전으로 읽힌다. loop 주기는 motion 토큰.
export const spinnerRoot = style({
  display: "inline-block",
  flexShrink: 0,
  width: tokens.shape.atom.spinner,
  height: tokens.shape.atom.spinner,
  borderRadius: tokens.shape.constants.pillRadius,
  borderWidth: tokens.shape.constants.focusRingWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
  borderTopColor: tokens.color.ink.base,
  animation: `${spin} ${tokens.motion.loop.spin} linear infinite`,
});
