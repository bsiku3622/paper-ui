// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Shape — 모든 shape 수치의 single source of truth (studio-ui 구조 이식)   ║
// ║                                                                          ║
// ║ 구조 —                                                                   ║
// ║   LADDER   5 단(xs/sm/md/lg/xl) 위계. 일부 축은 intent split            ║
// ║            (interaction=chrome · layout=container)                       ║
// ║   STANDALONE  shadow · z (ladder 아님)                                   ║
// ║   CONSTANTS   전역 1D + atom intrinsic                                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// studio-ui 의 shape 아키텍처(size × intent ladder)를 가져오되 *값은 paper-ui* 다:
// 넉넉한 radius(부드러운 밀도), sharp 하지 않게. studio-ui 의 simulizer density
// (radius 6px 등)는 심미성을 위해 따르지 않는다.
//
// 축 split:
//   height   interaction(chrome 34 anchor) · layout(container)
//   padding  interaction(chrome) · layout(container)
//   gap      flat
//   radius   interaction(단일) · layout(3 단) — 넉넉하게, 비대칭 split
//   width    layout 만 (interaction 폭은 content-driven)
//   fontSize · dot · measure  flat
//
// pure .ts — 부수효과 없음. theme.css.ts 와 tokens/index.ts 가 같은 VALUES 를
// walk 해 CSS var + TS 참조 객체를 각자 derive.

const REM = (px: number) => `${px / 16}rem`;

// ───── Ladder vocabulary ────────────────────────────────────────────────────
//
// 두 어휘가 직교한다:
//   SHAPE_SIZES (5 단 xs~xl)  = *간격* 축. Box 의 padding·gap (8pt 그리드).
//   CONTROL_SIZES (3 단 sm~lg) = *컨트롤 크기* 축. 컴포넌트 size prop.
//
// 이 둘을 섞으면 안 된다 — 간격은 세밀해야(5 단) 하고, 컨트롤 크기는 단순해야
// (3 단) 한다(Ant·Primer·Geist 전부 3 단; Nathan Curtis: "2~3 개면 충분, 그 이상은
// 복잡도만"). 그리고 컨트롤이 작아진다고 글자가 작아지면 안 된다 → CONTROL 크기는
// height·padding 만 움직이고 fontSize 는 CONTROL_FONT_SIZE 로 *따로* 정한다.

export const SHAPE_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
export type ShapeSize = (typeof SHAPE_SIZES)[number];

// 컨트롤 크기 3 단 — Button·Field·Select·Tabs·Icon·Spinner·Badge·Checkbox·Switch·
// Radio 의 size prop. md 가 anchor(기본), sm 은 밀집/보조, lg 는 강조/CTA.
export const CONTROL_SIZES = ["sm", "md", "lg"] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

export const SHAPE_INTENTS = ["interaction", "layout"] as const;
export type ShapeIntent = (typeof SHAPE_INTENTS)[number];

// ───── height — interaction · layout ────────────────────────────────────────
//
// interaction: chrome (Button · Field · Select · NavItem). md=34 anchor
//   (shadcn 36 · Atlassian 32 사이의 paper-ui 밀도). 차분한 범위 24~44.
// layout: container surface (Card · Sidebar · Modal). endpoint-driven.

export const SHAPE_HEIGHT = {
  xs: { interaction: REM(24), layout: REM(64) },
  sm: { interaction: REM(28), layout: REM(96) }, // 28 = 작은 컨트롤·배지 열
  md: { interaction: REM(34), layout: REM(144) }, // 34 = Button·Field·Select ◀ anchor
  lg: { interaction: REM(40), layout: REM(216) }, // 40 = 큰 CTA·검색
  xl: { interaction: REM(44), layout: REM(320) }, // 44 = Table 한 줄·가장 큰 CTA
} as const;

// ───── width — layout 만 ────────────────────────────────────────────────────
//
// interaction 폭 어휘는 없다 — Button·Field 폭은 content + padding 으로 결정.

export const SHAPE_WIDTH = {
  xs: { layout: REM(72) },
  sm: { layout: REM(108) },
  md: { layout: REM(160) },
  lg: { layout: REM(240) },
  xl: { layout: REM(360) },
} as const;

// ───── padding — interaction · layout ───────────────────────────────────────
//
// interaction: interactive·chrome 여백 (Button·Field·Tab·Box). 4px 배수, md=12
//   anchor — 기존 space 사다리와 같은 값이라 Box padding 심미성이 그대로 유지된다.
// layout: block container uniform padding (Card·block). 한 단 더 넉넉히. md=16.

export const SHAPE_PADDING = {
  xs: { interaction: REM(4), layout: REM(8) },
  sm: { interaction: REM(8), layout: REM(12) },
  md: { interaction: REM(12), layout: REM(16) }, // ◀ anchor
  lg: { interaction: REM(16), layout: REM(24) },
  xl: { interaction: REM(24), layout: REM(32) },
} as const;

// ───── gap — flat ───────────────────────────────────────────────────────────
//
// flex/grid 간격. 4px 배수, 촘촘하게 (복잡한 화면은 여백이 넓으면 스크롤만 는다).

export const SHAPE_GAP = {
  xs: REM(4), // inline icon + label
  sm: REM(8), // 기본 Inline 짝 간격
  md: REM(12), // Card 내부 · 기본 Stack ◀ default
  lg: REM(16), // 블록 사이
  xl: REM(24), // 섹션 사이
} as const;

// ───── radius — interaction(단일) · layout(3 단) ────────────────────────────
//
// 넉넉하게 — ChatGPT 의 부드러운 라운드. interaction 은 단일(chrome 은 size 별
// radius 차이가 거의 안 보임), layout 은 3 단(큰 면일수록 한 호흡 곡선).

export const RADIUS_LAYOUT_SIZES = ["sm", "md", "lg"] as const;
export type RadiusLayoutSize = (typeof RADIUS_LAYOUT_SIZES)[number];

export const SHAPE_RADIUS = {
  interaction: REM(8), // Button·Field·Badge·Select — 넉넉한 8
  layout: {
    sm: REM(8), // Tooltip·Popover
    md: REM(12), // Card ◀ anchor
    lg: REM(16), // Modal·큰 면
  },
} as const;

// ───── fontSize — chrome text (interaction 자리, text variant 와 직교) ──────
//
// Button·Field 같은 interactive 내부 글자의 *일반* 스케일(Badge fontSize 등이 참조).
// 컨텐츠 위계(text variant)가 아니라 chrome 텍스트 — md=14 가 body anchor 와 정렬.

export const SHAPE_FONT_SIZE = {
  xs: REM(11),
  sm: REM(12),
  md: REM(14), // ◀ default (body 와 정렬)
  lg: REM(15),
  xl: REM(16),
} as const;

// ───── control fontSize — 밀도와 분리한 컨트롤 라벨 크기 (14 하한) ──────────
//
// 컨트롤이 작아져도(sm) 글자는 14 를 지킨다 — 밀도(height·padding)와 가독성(fontSize)은
// 다른 축이다. 사이드바를 sm 으로 줄였더니 글자가 12 로 떨어져 맥없어진 게 이 둘을
// 묶었기 때문. lg 에서만 16 으로 한 단(큰 CTA). Ant(14/14/16)·Atlassian(14 고정) 모델.

export const CONTROL_FONT_SIZE = {
  sm: REM(14),
  md: REM(14),
  lg: REM(16),
} as const;

// ───── dot — 작은 시각 요소 (Icon · status dot · Spinner 공용, 3 단) ────────

export const SHAPE_DOT = {
  sm: REM(14),
  md: REM(16), // ◀ anchor (Icon 기본)
  lg: REM(18),
} as const;

// ───── badge — 인라인 라벨 높이 사다리 (3 단) ───────────────────────────────
//
// control 높이(28~40)보다 낮은 열. 낱말 하나를 담는 pill. md=22 anchor.

export const SHAPE_BADGE = {
  sm: REM(20),
  md: REM(22), // ◀ anchor
  lg: REM(24),
} as const;

// ───── checkbox — 변·틱·모서리 사다리 (3 단) ────────────────────────────────
//
// box(변) 를 키우면 틱(mark 긴변·short 짧은변, 2:1)과 radius 가 비례해 커진다. md=16 anchor.

export const SHAPE_CHECKBOX = {
  sm: { box: REM(15), mark: REM(7), short: REM(3.5), radius: REM(4) },
  md: { box: REM(16), mark: REM(8), short: REM(4), radius: REM(5) }, // ◀ anchor
  lg: { box: REM(18), mark: REM(9), short: REM(4.5), radius: REM(6) },
} as const;

// ───── switch — 트랙·손잡이 사다리 (비례 스케일, 3 단) ──────────────────────
//
// w(트랙 가로) · h(트랙 세로) · thumb(손잡이). 켜짐 이동은 css 가 이 값으로 calc. md anchor.

export const SHAPE_SWITCH = {
  sm: { w: REM(32), h: REM(18), thumb: REM(14) },
  md: { w: REM(36), h: REM(20), thumb: REM(16) }, // ◀ anchor
  lg: { w: REM(42), h: REM(24), thumb: REM(19) },
} as const;

// ───── measure — prose 줄길이 ───────────────────────────────────────────────

export const SHAPE_MEASURE = {
  xs: "28rem",
  sm: "32rem",
  md: "38rem", // ◀ anchor (≈ 70ch)
  lg: "42rem",
  xl: "46rem",
} as const;

// ───── shadow — 옅은 부상 (standalone, ladder 아님) ─────────────────────────
//
// paper-ui 는 2 단. 카드는 border/면으로 정의되고 뜨지 않는다 — 그림자는 *떠 있는
// 것*(overlay)의 표식. raised(세그먼트 활성)·overlay(Modal·Tooltip) 뿐.

export const SHADOW = {
  raised: "0 1px 2px 0 rgba(24, 25, 28, 0.05)",
  overlay: "0 8px 24px -6px rgba(24, 25, 28, 0.14), 0 2px 6px -2px rgba(24, 25, 28, 0.08)",
} as const;

// z 층 tier 는 shape 가 아니라 layout 책임 — tokens/layout.ts 로 옮겼다.

// ───── constants — 전역 1D ──────────────────────────────────────────────────

export const SHAPE_CONSTANTS = {
  borderWidth: "1px",
  focusRingWidth: "2px",
  focusRingOffset: "2px",
  iconStrokeWidth: "1.75",
  pillRadius: "999px",
  overlayBlur: "2px",
  textureCell: "16px",
} as const;

// ───── atom intrinsic — ladder 안 맞는 atom·컴포넌트 자체 1D ────────────────
//
// 5 단 ladder 에 안 맞아 자기 값을 갖는 자리. 여기 모아두면 컴포넌트가 raw 리터럴
// 대신 토큰을 참조한다 (상위 레이어 하드코딩 제거의 근거).

export const ATOM_INTRINSIC = {
  checkbox: REM(16), //        Checkbox 크기
  checkMark: REM(8), //        체크 표식 폭
  checkboxRadius: REM(5), //   Checkbox 모서리 (작아서 radius 사다리와 별도)
  badgeHeight: REM(22), //     Badge 높이 (control 34 보다 낮은 인라인 라벨)
  navbar: REM(52), //          Navbar · 사이트 GNB 바 높이
  navItem: REM(32), //         Navbar 항목 높이
  tabsTrackGap: "2px", //      세그먼트 트랙 항목 간격
  tabsTrackPad: "3px", //      세그먼트 트랙 안쪽 여백
  modalWidth: REM(432), //     Modal 기본 최대 폭 (27rem)
  selectArrow: REM(10), //     Select 화살표 아이콘 크기 (0.625rem)
  switchWidth: REM(36), //     Switch 트랙 가로
  switchHeight: REM(20), //    Switch 트랙 세로
  switchThumb: REM(16), //     Switch 손잡이 (= checkbox)
  radioDot: REM(8), //         Radio 채운 점
  spinner: REM(18), //         Spinner 크기
} as const;

// ───── VALUES — emit 대상 트리 ─────────────────────────────────────────────

export const SHAPE_VALUES = {
  height: SHAPE_HEIGHT,
  width: SHAPE_WIDTH,
  padding: SHAPE_PADDING,
  gap: SHAPE_GAP,
  radius: SHAPE_RADIUS,
  fontSize: SHAPE_FONT_SIZE,
  controlFontSize: CONTROL_FONT_SIZE,
  dot: SHAPE_DOT,
  badge: SHAPE_BADGE,
  checkbox: SHAPE_CHECKBOX,
  switch: SHAPE_SWITCH,
  measure: SHAPE_MEASURE,
  shadow: SHADOW,
  constants: SHAPE_CONSTANTS,
  atom: ATOM_INTRINSIC,
} as const;

// ───── Box override prop keys ───────────────────────────────────────────────

export type ShapeOverrideKey = "padding" | "paddingX" | "paddingY" | "radius" | "gap";
export const SHAPE_OVERRIDE_KEYS = ["padding", "paddingX", "paddingY", "radius", "gap"] as const;

// space 어휘 재수출 — 기존 Space 타입 소비자 호환 (gap 사다리와 동일 5 단).
export type Space = ShapeSize;
export const SPACE_KEYS = SHAPE_SIZES;
