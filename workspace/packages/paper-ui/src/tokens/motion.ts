// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Motion — 시간의 토큰 (studio-ui 구조 이식, 값은 paper-ui)                ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 다른 축과 달리 CSS var 로 emit 하지 않는다 — 컴포넌트의 정적 .css.ts 에 값을
// 직접 인라인한다. duration + easing (+ transform 변위) 세 필드는 한 var 로
// 줄여 쓰기 어렵고, transition 문자열 조립은 빌드 타임에 하는 게 맞기 때문.
// 그래서 tokens.motion 은 var 참조가 아니라 *값* 을 든다.
//
// paper-ui 는 조용한 밀도의 시스템 — 모션도 짧고 차분하다(80~200ms). 튀는 전이는
// 없다. hover 는 거의 즉각, 상태 전이는 130ms, 떠오르는 overlay 만 살짝 길게.

// ───── duration — 전이 시간 ─────────────────────────────────────────────────

export const DURATION = {
  instant: "0ms",
  fast: "100ms", // hover · table 행 배경
  base: "130ms", // 상태 전이 (background · color · border) ◀ 기본
  moderate: "200ms", // overlay 등장
  slow: "300ms",
} as const;
export type MotionDuration = keyof typeof DURATION;

// ───── easing — 가속 곡선 ───────────────────────────────────────────────────

export const EASING = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)", // 대부분의 상태 전이
  decelerate: "cubic-bezier(0, 0, 0.2, 1)", // 등장 (끝에서 부드럽게 멈춤)
  accelerate: "cubic-bezier(0.4, 0, 1, 1)", // 퇴장
  overshoot: "cubic-bezier(0.22, 1, 0.36, 1)", // 떠오르는 overlay (살짝 튀어 안착)
} as const;
export type MotionEasing = keyof typeof EASING;

// ───── loop — 반복 주기 (spinner 등, 전이와 별도 축) ────────────────────────

export const LOOP = {
  spin: "900ms",
  pulse: "1400ms",
} as const;

// ───── role — 의미별 모션 묶음 ──────────────────────────────────────────────
//
// 컴포넌트는 "무슨 상황의 모션인지"(role)만 고른다. hover · state 는 duration+
// easing, enter 는 등장 변위(offset·scale)도 갖는다 (Modal·Tooltip 이 keyframe 에
// 그 값을 인라인).

export type MotionRole = {
  duration: string;
  easing: string;
  offset?: string;
  scale?: string;
};

export const MOTION = {
  hover: { duration: DURATION.fast, easing: EASING.standard },
  focus: { duration: DURATION.fast, easing: EASING.standard },
  state: { duration: DURATION.base, easing: EASING.standard },
  enter: { duration: DURATION.moderate, easing: EASING.overshoot, offset: "6px", scale: "0.99" },
  exit: { duration: DURATION.fast, easing: EASING.accelerate },
} as const satisfies Record<string, MotionRole>;

// ───── VALUES — motion 은 var 로 굽지 않는다. tokens.motion 이 값을 직접 든다 ─

export const MOTION_VALUES = {
  duration: DURATION,
  easing: EASING,
  loop: LOOP,
  role: MOTION,
} as const;

// transition 문자열 조립 헬퍼 — `prop {duration} {easing}` 조각을 잇는다.
//   stateTransition("background", "color") → "background 130ms …, color 130ms …"
export const stateTransition = (...props: string[]): string =>
  props.map((p) => `${p} ${MOTION.state.duration} ${MOTION.state.easing}`).join(", ");
