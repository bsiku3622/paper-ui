// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Motion — 시간의 토큰 (studio-ui 구조 이식, 값은 paper-ui)                ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 다른 축과 달리 CSS var 로 emit 하지 않는다. duration + easing 은 transition 문자열로,
// 변위는 keyframe 안에서 한꺼번에 조립되므로 빌드 타임에 값으로 읽는 게 맞다. 시간과 곡선은
// 이 파일의 값이고, 변위(offset)는 길이라서 Motion 이 갖지 않는다 — motion-recipes.ts 가 역할에 더한다.
//
// paper-ui 는 조용한 밀도의 시스템 — 모션도 짧고 차분하다(100~200ms). 튀는 전이는
// 없다. hover 는 거의 즉각, 상태 전이는 base, 떠오르는 overlay 만 살짝 길게.
//
// 컴포넌트는 duration · easing · loop 원본에 닿지 않는다. 역할(role)을 고르고
// transition(role, …속성) 으로 조립하거나, 조립된 class(styles/motion.css.ts) 를 쓴다.

import { keys } from "./helpers";

// ───── duration — 전이 시간 ─────────────────────────────────────────────────

export const DURATION = {
  instant: "0ms",
  reduced: "0.01ms", // prefers-reduced-motion 안전한 최소 양수 duration
  fast: "100ms", // hover · press
  base: "130ms", // 상태 전이 (background · color · border) ◀ 기본
  moderate: "200ms", // overlay 등장
  slow: "300ms",
  scene: "700ms", // 화면에 처음 들어오는 덩어리(reveal) — 컴포넌트의 전이가 아니라 장면의 시간
} as const;

// ───── easing — 가속 곡선 ───────────────────────────────────────────────────

export const EASING = {
  linear: "linear", // 반복 회전·등속 진행
  standard: "cubic-bezier(0.4, 0, 0.2, 1)", // 대부분의 상태 전이
  decelerate: "cubic-bezier(0, 0, 0.2, 1)", // 등장 (끝에서 부드럽게 멈춤)
  accelerate: "cubic-bezier(0.4, 0, 1, 1)", // 퇴장
  overshoot: "cubic-bezier(0.22, 1, 0.36, 1)", // 떠오르는 overlay (이름과 달리 목표를 지나치지 않는다 — 빠르게 떠서 부드럽게 멈춘다)
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)", // 화면에 들어오는 덩어리 — 처음에 거의 다 오고 남은 길을 길게 내려앉는다
} as const;

// ───── loop — 반복 (spinner 등, 전이와 별도 축) ─────────────────────────────

export const LOOP = {
  spin: { duration: "900ms", easing: EASING.linear },
  pulse: { duration: "1400ms", easing: EASING.standard },
} as const;
export type Loop = keyof typeof LOOP;

export const LOOP_FRAMES = {
  spin: { to: { transform: "rotate(360deg)" } },
  pulse: { "50%": { opacity: "0.25" } },
} as const satisfies Record<Loop, Record<string, Record<string, string>>>;

// reduced-motion 에서 반복은 멈추지 않고 제자리에서 맥박친다 — 화면을 가로질러 도는 움직임만 걷어내고 진행 중이라는 신호는 남긴다.
export const LOOP_REDUCED = { spin: "pulse", pulse: "pulse" } as const satisfies Record<Loop, Loop>;

// ───── role — 의미별 모션 묶음 ──────────────────────────────────────────────
//
// 컴포넌트는 "무슨 상황의 모션인지"(role)만 고른다. press · enter 의 변위(offset)는 motion-recipes.ts 가 더한다.
// enter 는 scale 도 갖는다.

export type MotionRoleSpec = {
  duration: string;
  easing: string;
  offset?: string;
  scale?: string;
  // reveal 만: 흐림에서 또렷해지는 길이와, 함께 들어오는 형제 사이의 걸음.
  blur?: string;
  step?: string;
};

// 포커스 링은 즉시 나타난다 — 포커스에는 모션이 없다.
export const MOTION_TIMING = {
  press: { duration: DURATION.fast, easing: EASING.standard },
  hover: { duration: DURATION.fast, easing: EASING.standard },
  state: { duration: DURATION.base, easing: EASING.standard },
  enter: { duration: DURATION.moderate, easing: EASING.overshoot, scale: "0.99" },
  exit: { duration: DURATION.fast, easing: EASING.accelerate },
  // 화면에 처음 들어오는 덩어리 — 제목 · 섹션 · 카드. 컴포넌트의 전이보다 길게, 빠르게 떠서 길게 내려앉는다.
  reveal: { duration: DURATION.scene, easing: EASING.emphasized },
  // 테마 전환 — 모드가 바뀌는 프레임에 모든 전이를 즉시 끝낸다 (theme/engine.ts 의 holdTransitions).
  theme: { duration: DURATION.instant, easing: EASING.linear },
} as const satisfies Record<string, MotionRoleSpec>;

export const MOTION_ROLES = keys(MOTION_TIMING);
export type MotionRole = (typeof MOTION_ROLES)[number];

// 역할을 쓰는 곳. 문서와 Playground 가 이 목록을 읽는다.
export const MOTION_CONSUMERS = {
  press: ["Button", "IconButton"],
  hover: ["Button", "IconButton", "Field", "Select", "Textarea", "Surface"],
  state: ["Button", "IconButton", "Field", "Select", "Textarea", "Checkbox", "Radio", "Switch", "SegmentControl"],
  enter: ["Floating"],
  exit: ["Floating"],
  // 패키지의 컴포넌트는 등장하지 않는다 — 앱의 화면이 reveal class 로 고른다.
  reveal: [],
  theme: ["PaperProvider", "Surface"],
} as const satisfies Record<MotionRole, readonly string[]>;

// ───── 조합 — styles/motion.css.ts 만 읽는다 ────────────────────────────────

// 반복: 틀(frames) · 주기 · 곡선, 그리고 reduced-motion 에서 대신 도는 반복의 이름.
export const MOTION_LOOPS = {
  spin: { frames: LOOP_FRAMES.spin, ...LOOP.spin, reduced: LOOP_REDUCED.spin },
  pulse: { frames: LOOP_FRAMES.pulse, ...LOOP.pulse, reduced: LOOP_REDUCED.pulse },
} as const;

export const MOTION_REDUCED = { duration: DURATION.reduced } as const;

// transition 문자열 조립 헬퍼 — `prop {duration} {easing}` 조각을 잇는다.
//   transition("state", "background", "color") → "background 130ms …, color 130ms …"
export const transition = (role: MotionRole, ...properties: string[]): string =>
  properties.map((property) => `${property} ${MOTION_TIMING[role].duration} ${MOTION_TIMING[role].easing}`).join(", ");
