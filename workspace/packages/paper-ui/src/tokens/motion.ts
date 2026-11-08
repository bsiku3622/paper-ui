import { keys } from "./helpers";

export const DURATION = {
  instant: "0ms",
  reduced: "0.01ms",
  fast: "100ms",
  base: "130ms",
  moderate: "200ms",
  slow: "300ms",
  scene: "700ms",
} as const;

export const EASING = {
  linear: "linear",
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0, 1, 1)",
  overshoot: "cubic-bezier(0.22, 1, 0.36, 1)",
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const LOOP = {
  spin: { duration: "900ms", easing: EASING.linear },
  pulse: { duration: "1400ms", easing: EASING.standard },
} as const;
export type Loop = keyof typeof LOOP;

export const LOOP_FRAMES = {
  spin: { to: { transform: "rotate(360deg)" } },
  pulse: { "50%": { opacity: "0.25" } },
} as const satisfies Record<Loop, Record<string, Record<string, string>>>;

export const LOOP_REDUCED = { spin: "pulse", pulse: "pulse" } as const satisfies Record<Loop, Loop>;

export type MotionRoleSpec = {
  duration: string;
  easing: string;
  offset?: string;
  scale?: string;
  blur?: string;
  step?: string;
};

export const MOTION_TIMING = {
  press: { duration: DURATION.fast, easing: EASING.standard },
  hover: { duration: DURATION.fast, easing: EASING.standard },
  state: { duration: DURATION.base, easing: EASING.standard },
  enter: { duration: DURATION.moderate, easing: EASING.overshoot, scale: "0.99" },
  exit: { duration: DURATION.fast, easing: EASING.accelerate },
  reveal: { duration: DURATION.scene, easing: EASING.emphasized },
  theme: { duration: DURATION.instant, easing: EASING.linear },
} as const satisfies Record<string, MotionRoleSpec>;

export const MOTION_ROLES = keys(MOTION_TIMING);
export type MotionRole = (typeof MOTION_ROLES)[number];

export const MOTION_CONSUMERS = {
  press: ["Button", "IconButton"],
  hover: ["Button", "IconButton", "Field", "Select", "Textarea", "Surface"],
  state: ["Button", "IconButton", "Field", "Select", "Textarea", "Checkbox", "Radio", "Switch", "SegmentControl"],
  enter: ["Floating"],
  exit: ["Floating"],
  reveal: [],
  theme: ["PaperProvider", "Surface"],
} as const satisfies Record<MotionRole, readonly string[]>;

export const MOTION_LOOPS = {
  spin: { frames: LOOP_FRAMES.spin, ...LOOP.spin, reduced: LOOP_REDUCED.spin },
  pulse: { frames: LOOP_FRAMES.pulse, ...LOOP.pulse, reduced: LOOP_REDUCED.pulse },
} as const;

export const MOTION_REDUCED = { duration: DURATION.reduced } as const;

export const transition = (role: MotionRole, ...properties: string[]): string =>
  properties.map((property) => `${property} ${MOTION_TIMING[role].duration} ${MOTION_TIMING[role].easing}`).join(", ");
