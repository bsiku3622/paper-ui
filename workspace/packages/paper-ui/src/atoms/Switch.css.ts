import { style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

// 켬/끔 토글. muted 트랙 위 흰 손잡이, 켜지면 검정 트랙(색이 아니라 primary).
export const switchRoot = style({
  appearance: "none",
  position: "relative",
  flexShrink: 0,
  width: tokens.shape.atom.switchWidth,
  height: tokens.shape.atom.switchHeight,
  margin: 0,
  borderRadius: tokens.shape.constants.pillRadius,
  background: tokens.color.paper.muted,
  cursor: "pointer",
  transition: stateTransition("background"),
  selectors: {
    "&::after": {
      content: "''",
      position: "absolute",
      top: "50%",
      left: tokens.shape.constants.borderWidth,
      width: tokens.shape.atom.switchThumb,
      height: tokens.shape.atom.switchThumb,
      transform: "translate(0, -50%)",
      borderRadius: tokens.shape.constants.pillRadius,
      background: tokens.color.paper.base,
      boxShadow: tokens.shape.shadow.raised,
      transition: `transform ${tokens.motion.duration.base} ${tokens.motion.easing.standard}`,
    },
    "&:checked": { background: tokens.color.primary.base },
    "&:checked::after": {
      // 트랙 가로 − 손잡이 − 양쪽 여백만큼 오른쪽으로.
      transform: `translate(calc(${tokens.shape.atom.switchWidth} - ${tokens.shape.atom.switchThumb} - ${tokens.shape.constants.borderWidth} * 2), -50%)`,
    },
    "&:focus-visible": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});
