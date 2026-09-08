import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, CONTROL_SIZES, type ControlSize } from "../tokens";

// 켬/끔 토글. well 트랙 위 흰 손잡이, 켜지면 검정 트랙(색이 아니라 primary).
// 크기(트랙·손잡이·켜짐 이동)는 size 축(switchSize)이 정한다.
export const switchRoot = style({
  appearance: "none",
  position: "relative",
  flexShrink: 0,
  margin: 0,
  borderRadius: tokens.shape.radius.full,
  background: tokens.color.paper.well,
  cursor: "pointer",
  transition: stateTransition("background"),
  selectors: {
    "&::after": {
      content: "''",
      position: "absolute",
      top: "50%",
      left: tokens.shape.constants.borderWidth,
      transform: "translate(0, -50%)",
      borderRadius: tokens.shape.radius.full,
      background: tokens.color.paper.raised,
      boxShadow: tokens.shape.shadow.overlayMinimal,
      transition: `transform ${tokens.motion.duration.base} ${tokens.motion.easing.standard}`,
    },
    "&:checked": { background: tokens.color.primary.base },
    "&:focus-visible": {
      outline: `${tokens.shape.constants.focusRingWidth} solid ${tokens.color.focus.ring}`,
      outlineOffset: tokens.shape.constants.focusRingOffset,
    },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
});

// size 3 단 — 트랙(w·h) · 손잡이(thumb) · 켜짐 이동(트랙 − 손잡이 − 양쪽 여백).
export const switchSize = styleVariants(
  Object.fromEntries(
    CONTROL_SIZES.map((s) => {
      const sw = tokens.shape.switch[s];
      return [
        s,
        {
          width: sw.w,
          height: sw.h,
          selectors: {
            "&::after": { width: sw.thumb, height: sw.thumb },
            "&:checked::after": {
              transform: `translate(calc(${sw.w} - ${sw.thumb} - ${tokens.shape.constants.borderWidth} * 2), -50%)`,
            },
          },
        },
      ];
    }),
  ) as Record<ControlSize, object>,
);
