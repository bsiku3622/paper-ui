// The Motion inspector's notes: what the page says about values it cannot derive a reason for. Each map is
// keyed by its source, so a role or loop added there fails typecheck until it has a note.

import { MOTION_CONSUMERS, STATE_TINT_PROPERTY, type MotionRole } from "@studio-baeks/paper-ui/tokens";
import { pick as inLocale, type Bilingual, type SiteLocale } from "../../site/locale";
import type { Loop } from "@paper-ui/inspect/motion";

export const MOTION_NOTES: Record<MotionRole, Bilingual> = {
  press: { ko: "누르는 순간 stroke.border 두께만큼 내려앉음", en: "Sinks by the stroke.border width at the moment of the press" },
  hover: { ko: "hover tint·테두리·글자색의 짧은 반응", en: "A short response of hover tint, border and text colour" },
  state: { ko: "켜짐·선택 같은 상태 전이", en: "State transitions such as on and selected" },
  enter: { ko: "떠오르는 overlay — 빠르게 떠서 부드럽게 안착", en: "A rising overlay: lifts quickly and settles softly" },
  exit: { ko: "사라질 때는 짧게 가속", en: "Leaves with a short acceleration" },
  reveal: { ko: "화면에 처음 들어오는 덩어리 — 아래에서, 흐림에서 길게 내려앉음", en: "A block that first enters the screen: settles long from below, out of a blur" },
  theme: { ko: "테마 전환 — 컨트롤도 페이지와 같은 프레임에 바뀜", en: "Theme change: controls change in the same frame as the page" },
};

const APP_SCREENS = (role: MotionRole): Bilingual => ({ ko: `앱 화면(${role} class)`, en: `App screens (${role} class)` });

// A role's note, then the components that use it; a role no component takes is the app's screens', through its class.
export const roleNote = (role: MotionRole, locale: SiteLocale = "ko"): string =>
  [inLocale(MOTION_NOTES[role], locale), ...(MOTION_CONSUMERS[role].length > 0 ? MOTION_CONSUMERS[role] : [inLocale(APP_SCREENS(role), locale)])].join(" · ");

// The properties each transition role animates across its consumers, as the Atoms' stylesheets write them (state
// is the union: a Switch fades a ring and moves a thumb, and a mark turns its border with its face, while a Button's
// and an input frame's border rise on hover). enter and exit move a surface through presence, and theme ends every
// transition at once, so they have no transition string.
export const TRANSITION_PROPERTIES = {
  press: ["transform"],
  hover: [STATE_TINT_PROPERTY, "border-color", "color"],
  state: ["background-color", "color", "border-color", "box-shadow", "inset-inline-start", "transform", "width"],
} as const satisfies Partial<Record<MotionRole, readonly string[]>>;

export const LOOP_NOTES: Record<Loop, { note: Bilingual; usedBy: Bilingual }> = {
  spin: { note: { ko: "Spinner 회전", en: "The Spinner's rotation" }, usedBy: { ko: "Spinner · Button", en: "Spinner · Button" } },
  pulse: { note: { ko: "대기 중인 표식", en: "A mark that is waiting" }, usedBy: { ko: "reduced-motion의 모든 반복", en: "Every loop under reduced-motion" } },
};

// The span of the roles' durations in ms, the instant one (theme) left out: "100~200ms".
export const roleRange = (durations: readonly string[]): string => {
  const ms = durations.map(parseFloat).filter((value) => value > 0);
  return `${Math.min(...ms)}~${Math.max(...ms)}ms`;
};
