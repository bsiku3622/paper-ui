// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Layout — 배치 자리의 토큰 (studio-ui 구조 이식)                          ║
// ║                                                                          ║
// ║ 책임은 *배치* — z 층 · breakpoint · 자기 크기 intent · position.         ║
// ║ 절대 크기 값(width/height ladder)은 shape 책임(SHAPE_WIDTH·HEIGHT.layout)║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// paper-ui 는 "고를 것을 줄인다" — 그래서 layout 은 *어휘* 를 노출하되(z tier ·
// breakpoint · size intent · position), 반응형 Box 프로퍼티를 전면 열지는 않는다.
// 유연함은 escape(Box style)로 연다(정체성: 구조 안전 > 자유도). 이 파일은 그
// 어휘의 단일 출처다.
//
// z 만 CSS var 로 emit(LAYOUT_VALUES). breakpoint 는 @media 쿼리 조건이라 CSS var
// 를 못 읽으므로 값으로만 둔다(motion 과 같은 결). size intent · position 은
// keyword 어휘 — var 인디렉션 없이 값을 직접 쓴다.

import { SHAPE_VALUES } from "./shape";

// ───── z — 층 tier (6 단, 10 간격) ──────────────────────────────────────────
//
// 같은 tier 안에서 ±1~2 미세조정 여지를 남긴 10 간격. raised(카드 살짝 위) 와
// toast(가장 위)를 더해 studio-ui 의 6 tier 를 채운다.

export const Z = {
  base: "0",
  raised: "10", // 살짝 뜬 것 (세그먼트 활성 등)
  sticky: "20", // sticky 헤더 · 사이드바
  overlay: "30", // Tooltip · Popover
  modal: "40", // Modal · Drawer
  toast: "50", // 가장 위 알림
} as const;
export type ZTier = keyof typeof Z;

// ───── breakpoint — 뷰포트 분기 (값. @media 는 CSS var 를 못 읽는다) ────────
//
// mobile 은 base(0). 앱이 @media 를 손으로 쓸 때 이 값을 기준으로 맞춘다.

export const BREAKPOINT = {
  sm: "480px",
  md: "768px", // 2 열 → 1 열로 접히는 기준 (hero · 격자)
  lg: "1024px",
  xl: "1280px",
} as const;
export type Breakpoint = keyof typeof BREAKPOINT;

// ───── size intent — width/height keyword 어휘 ──────────────────────────────
//
// 절대값은 shape(SHAPE_WIDTH·HEIGHT.layout) 자리. 여기는 keyword 만.

export const SIZE_INTENT = {
  full: "100%",
  auto: "auto",
  fit: "fit-content",
  min: "min-content",
  max: "max-content",
  screenW: "100vw",
  screenH: "100vh",
} as const;
export type SizeIntent = keyof typeof SIZE_INTENT;

// ───── position — 자기 자리 keyword ─────────────────────────────────────────

export const POSITIONS = ["relative", "absolute", "fixed", "sticky"] as const;
export type Position = (typeof POSITIONS)[number];

// ───── inset — container 안에서 띄우는 여백 어휘 (shape padding.layout 재사용) ─

export const INSET = {
  "0": "0",
  xs: SHAPE_VALUES.padding.xs.layout,
  sm: SHAPE_VALUES.padding.sm.layout,
  md: SHAPE_VALUES.padding.md.layout,
  lg: SHAPE_VALUES.padding.lg.layout,
  xl: SHAPE_VALUES.padding.xl.layout,
} as const;
export type InsetSize = keyof typeof INSET;

// ───── VALUES — z 만 CSS var 로 굽는다 ──────────────────────────────────────

export const LAYOUT_VALUES = {
  z: Z,
} as const;

// ───── container — 앱 셸 최대 폭 (읽기 폭 measure 와 별개) ──────────────────

export const CONTAINER = {
  content: "72rem", // 사이트 본문 격자·GNB 가 이 폭 안에서 가운데 정렬
} as const;
export type ContainerSize = keyof typeof CONTAINER;

// var 로 굽지 않는 어휘(값). tokens.layout 이 z(var) 옆에 이들을 값으로 든다.
export const LAYOUT_CONST = {
  breakpoint: BREAKPOINT,
  sizeIntent: SIZE_INTENT,
  inset: INSET,
  container: CONTAINER,
} as const;
