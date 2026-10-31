// The Motion inspector's notes: what the page says about values it cannot derive a reason for. Each map is
// keyed by its source, so a role or loop added there fails typecheck until it has a note.

import { MOTION_CONSUMERS, STATE_TINT_PROPERTY, type MotionRole } from "@studio-baeks/paper-ui/tokens";

import type { Loop } from "../../../../packages/paper-ui/src/tokens/motion";

export const MOTION_NOTES: Record<MotionRole, string> = {
  press: "누르는 순간 1px 내려앉음",
  hover: "hover tint·테두리·글자색의 짧은 반응",
  state: "켜짐·선택 같은 상태 전이",
  enter: "떠오르는 overlay — 살짝 튀어 안착",
  exit: "사라질 때는 짧게 가속",
  theme: "테마 전환 — 컨트롤도 페이지와 같은 프레임에 바뀜",
};

// A role's note, then the components that use it.
export const roleNote = (role: MotionRole): string => [MOTION_NOTES[role], ...MOTION_CONSUMERS[role]].join(" · ");

// The properties each transition role animates across its consumers, as the Atoms' stylesheets write them (state
// is the union: a Switch fades a ring and moves a thumb). enter and exit move a surface through presence, and theme
// ends every transition at once, so they have no transition string.
export const TRANSITION_PROPERTIES = {
  press: ["transform"],
  hover: [STATE_TINT_PROPERTY, "border-color", "color"],
  state: ["background-color", "color", "border-color", "box-shadow", "inset-inline-start"],
} as const satisfies Partial<Record<MotionRole, readonly string[]>>;

export const LOOP_NOTES: Record<Loop, { note: string; usedBy: string }> = {
  spin: { note: "Spinner 회전", usedBy: "Spinner · Button" },
  pulse: { note: "대기 중인 표식", usedBy: "reduced-motion의 모든 반복" },
};

// The span of the roles' durations in ms, the instant one (theme) left out: "100~200ms".
export const roleRange = (durations: readonly string[]): string => {
  const ms = durations.map(parseFloat).filter((value) => value > 0);
  return `${Math.min(...ms)}~${Math.max(...ms)}ms`;
};
