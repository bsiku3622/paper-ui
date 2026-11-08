import { LAYOUT } from "./layout";
import { DURATION, MOTION_TIMING, type MotionRole, type MotionRoleSpec } from "./motion";
import { SHAPE } from "./shape";

export const MOTION = {
  ...MOTION_TIMING,
  press: { ...MOTION_TIMING.press, offset: SHAPE.stroke.border },
  enter: { duration: MOTION_TIMING.enter.duration, easing: MOTION_TIMING.enter.easing, offset: LAYOUT.gap.xs, scale: MOTION_TIMING.enter.scale },
  reveal: { ...MOTION_TIMING.reveal, offset: LAYOUT.gap.lg, blur: LAYOUT.gap.sm, step: DURATION.fast },
} as const satisfies Record<MotionRole, MotionRoleSpec>;

export const REVEAL_AFTER = {
  0: DURATION.instant,
  1: DURATION.fast,
  2: `calc(${DURATION.fast} * 2)`,
  3: `calc(${DURATION.fast} * 3)`,
  4: `calc(${DURATION.fast} * 4)`,
  5: `calc(${DURATION.fast} * 5)`,
  6: `calc(${DURATION.fast} * 6)`,
  7: `calc(${DURATION.fast} * 7)`,
} as const;
