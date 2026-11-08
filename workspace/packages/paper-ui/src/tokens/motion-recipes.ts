// Motion's second order: a role that also moves. Motion owns the time and the curve and has no length of its own, so what a
// press or an entrance travels points at a role of Shape and Layout. The whole role reaches the package from here.

import { LAYOUT } from "./layout";
import { DURATION, MOTION_TIMING, type MotionRole, type MotionRoleSpec } from "./motion";
import { SHAPE } from "./shape";

export const MOTION = {
  ...MOTION_TIMING,
  // A press sinks by one border stroke.
  press: { ...MOTION_TIMING.press, offset: SHAPE.stroke.border },
  // An entrance rises by the smallest gap.
  enter: { duration: MOTION_TIMING.enter.duration, easing: MOTION_TIMING.enter.easing, offset: LAYOUT.gap.xs, scale: MOTION_TIMING.enter.scale },
  // A reveal rises by a reading step of the gap scale and comes into focus from a smaller one, and the siblings that come in with
  // it follow a fast beat apart.
  reveal: { ...MOTION_TIMING.reveal, offset: LAYOUT.gap.lg, blur: LAYOUT.gap.sm, step: DURATION.fast },
} as const satisfies Record<MotionRole, MotionRoleSpec>;

// How many beats a revealing sibling waits: the first starts at once, each one after it a step later. A group longer than this
// lets the rest come in with the last.
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
