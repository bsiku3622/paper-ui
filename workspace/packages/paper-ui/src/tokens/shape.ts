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
// studio-ui 의 shape 아키텍처(size × intent ladder)를 가져오되 *값은 paper-ui* 다.
// radius 는 절제된 곡선이다 — 각지지도, 말랑하지도 않게. 모서리가 형태를 부드럽게
// 하는 게 아니라 *날을 죽이는* 정도까지만 굴린다. 밀도를 감싸는 일은 radius 가
// 아니라 여백과 면이 한다.
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
  sm: { interaction: REM(30), layout: REM(96) }, // 30 = 작은 컨트롤·배지 열. 28 은 14px 라벨에 세로 7px 뿐이라 글자가 상자를 꽉 채웠다
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
// 절제된 곡선 — 모서리의 날만 죽인다. interaction 은 단일(chrome 은 size 별 radius
// 차이가 거의 안 보임), layout 은 3 단(큰 면일수록 한 호흡 곡선).
//
// 사다리 전체를 한 단씩 조였다(8/8·12·16 → 6/6·8·12). 이유는 두 가지다 —
//   · 큰 radius 는 밀도와 싸운다. 34px 컨트롤에 radius 8 은 높이의 1/4 이라
//     모서리가 형태를 먹는다. 6 이면 사각형이 사각형으로 남는다.
//   · 곡선이 얕아지면 면과 헤어라인이 앞으로 나온다. 이 시스템은 선이 아니라
//     면으로 나누므로, 모서리가 물러날수록 그 면이 또렷해진다.
// 비율은 유지한다 — layout 은 interaction 보다 크고, 큰 면일수록 크다.

export const RADIUS_LAYOUT_SIZES = ["sm", "md", "lg"] as const;
export type RadiusLayoutSize = (typeof RADIUS_LAYOUT_SIZES)[number];

export const SHAPE_RADIUS = {
  interaction: REM(6), // Button·Field·Badge·Select — 날만 죽인 6
  layout: {
    sm: REM(6), // Tooltip·Popover — 작은 면은 interaction 과 같은 곡선
    md: REM(8), // Card ◀ anchor
    lg: REM(12), // Modal·큰 면
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

// ───── control paddingInline — 밀도와 분리한 컨트롤 가로 여백 (3 단) ────────
//
// Button·Field·Select·Tabs 의 좌우 여백. Box 여백 사다리(SHAPE_PADDING)에서 떼어
// 냈다 — 면의 여백과 컨트롤의 여백은 다른 요구인데 같은 값을 쓰고 있었다.
//
// 라벨이 14 로 고정이라 세로 여백은 (height − 14) / 2 로 height 가 정해 버린다.
// 그래서 두 축을 **함께** 잡는다 — 세로 8 · 10 · 13, 가로 10 · 13 · 17.
// (세로 8 을 만들려고 sm 높이를 28 → 30 으로 올렸다. 28 이면 세로가 7px 뿐이라
//  14px 한글이 상자를 꽉 채워, 가로를 아무리 벌려도 답답함이 안 풀린다.)
//
// 비는 1.25 · 1.30 · 1.31 로 거의 균일하다. 라틴 UI 의 통념(shadcn 1.45 ·
// Ant 1.67 · Material 1.85)보다 좁은데, 그쪽 수치를 그대로 가져와 16·20 까지
// 벌려 보니 짧은 라벨의 버튼이 부풀어 밀도가 무너졌다 — 한글 라벨은 같은 글자
// 수에서 폭이 넓어 라틴만큼의 가로 여백이 필요하지 않다. **세로를 먼저 확보하고
// 가로는 한 단만 더** 가 이 시스템의 답이다.
//
// 4px 그리드는 여기서만 깨진다(13 · 17). 이 축은 그리드에 앉는 값이 아니라
// 세로 여백에 대한 비로 정해지므로, 격자보다 비를 따른다.

export const CONTROL_PADDING_X = {
  sm: REM(10),
  md: REM(13), // ◀ anchor
  lg: REM(17),
} as const;

// ───── control fontSize — 밀도와 분리한 컨트롤 라벨 크기 (14 고정) ───────────
//
// 컨트롤 크기가 바뀌어도 글자는 14 로 고정 — 밀도(height·padding)와 가독성(fontSize)은
// 다른 축이다. 사이드바를 sm 으로 줄였더니 글자가 12 로 떨어져 맥없어진 게 이 둘을
// 묶었기 때문. lg 도 16 이 아니라 14 — 큰 컨트롤이라고 글자까지 키우면 밀도 축이 흔들린다.
// height·padding 만 세 단으로 움직인다. Atlassian(14 고정) 모델.

export const CONTROL_FONT_SIZE = {
  sm: REM(14),
  md: REM(14),
  lg: REM(14),
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
//
// radius 는 컨트롤(34px 에 6)과 같은 비율 ≈ 0.18 로 다시 잡았다(4·5·6 → 2.5·3·3.5).
// 체크박스만 옛 곡선으로 두면 16px 짜리 작은 사각형이 버튼보다 둥글어 보인다 —
// 작은 것일수록 같은 radius 가 크게 읽히기 때문이다.

export const SHAPE_CHECKBOX = {
  sm: { box: REM(15), mark: REM(7), short: REM(3.5), radius: REM(2.5) },
  md: { box: REM(16), mark: REM(8), short: REM(4), radius: REM(3) }, // ◀ anchor
  lg: { box: REM(18), mark: REM(9), short: REM(4.5), radius: REM(3.5) },
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

// ───── shadow — 떠 있는 것의 표식 (2단, 축 아님) ────────────────────────────
//
// 원칙 4: "떠 있는 것만 그림자를 갖는다". 붙어있는 면(Button·Field·Card·Table)은
// 그림자 없음 — 그냥 prop 을 안 준다. radius·size 와 나란한 shape 토큰일 뿐,
// "elevation" 같은 추상 축이 아니다 (그 이름은 surface 의 'raised' 와 충돌했다 —
// 떠오른 흰 면(raised)은 그림자 없이 뜨는데 elevation.raised 는 그림자였다).
//
// overlay        — 자유롭게 뜬 것 (Modal · Tooltip · Popover · 제품 목업).
// overlayMinimal — 아주 살짝 뜬 것 (Switch 손잡이 등). overlay 결의 최소치.

// 곡선을 조인 만큼 그림자도 조였다(24px → 18px blur) — 얕은 모서리에 넓은 blur 를
// 두면 형태의 윤곽과 그림자의 윤곽이 어긋나 떠 있는 게 흐릿해진다.

export const SHADOW = {
  overlay: "0 6px 18px -5px rgba(24, 25, 28, 0.16), 0 2px 5px -2px rgba(24, 25, 28, 0.09)",
  overlayMinimal: "0 1px 2px 0 rgba(24, 25, 28, 0.06)",
} as const;

// 다크 그림자 — near-black 은 어두운 면 위에서 사라져 elevation 단서를 잃는다. 순검정을
// 더 짙고 넓게 깔아 떠오름을 살린다. theme.css.ts 가 [data-theme="dark"] 스코프에 이
// 세트로 shadow var 를 덮어쓴다(색과 함께, shape 축은 그대로).
export const SHADOW_DARK = {
  overlay: "0 8px 22px -5px rgba(0, 0, 0, 0.62), 0 3px 7px -2px rgba(0, 0, 0, 0.5)",
  overlayMinimal: "0 1px 2px 0 rgba(0, 0, 0, 0.45)",
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
  checkboxRadius: REM(3), //   Checkbox 모서리 (작아서 radius 사다리와 별도)
  badgeHeight: REM(22), //     Badge 높이 (control 34 보다 낮은 인라인 라벨)
  navbar: REM(52), //          Navbar · 사이트 GNB 바 높이
  navItem: REM(32), //         Navbar 항목 높이
  tabsTrackGap: "2px", //      세그먼트 트랙 항목 간격
  tabsTrackPad: "3px", //      세그먼트 트랙 안쪽 여백 — 2px 면 활성 pill 이 트랙에 낀다
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
  controlPaddingX: CONTROL_PADDING_X,
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
