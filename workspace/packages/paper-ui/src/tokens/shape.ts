// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Shape — 단정한 격자                                                      ║
// ║                                                                          ║
// ║ 절제된 radius, 촘촘하고 정확한 간격, 필요할 때만 옅게 뜨는 그림자.      ║
// ║ 복잡한 웹앱의 밀도(Atlassian)와 SwiftUI 의 여백감을 함께 노린다.        ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const REM = (px: number) => `${px / 16}rem`;

// ───── space — 간격 (4px 배수) ─────────────────────────────────────────────
//
// 촘촘하게. 복잡한 화면은 여백이 넓으면 스크롤만 길어진다.

export const SPACE = {
  xs: REM(4),
  sm: REM(8),
  md: REM(12),
  lg: REM(16),
  xl: REM(24),
} as const;

// ───── height — 컨트롤 높이 ─────────────────────────────────────────────────
//
// shadcn(36) 과 Atlassian(32) 사이. 밀도를 위해 md=34 를 기본으로.
// row 는 데이터 표의 한 줄 (Atlassian issue 행 감각).

export const HEIGHT = {
  sm: REM(28), // 조밀한 컨트롤 · 작은 배지 열
  control: REM(34), // Button · Field · Select ◀ default
  lg: REM(40), // 큰 CTA · 검색
  row: REM(44), // Table 한 줄
} as const;

// ───── radius — 모서리 ─────────────────────────────────────────────────────
//
// 넉넉하게. ChatGPT 의 부드러운 라운드(버튼 8~10 · 면 12~16)를 향한다.
// 각진 데가 없어 화면 전체가 말랑하게 읽힌다.

export const RADIUS = {
  sm: REM(8), // Button · Field · Badge · Select
  md: REM(12), // Card · Popover
  lg: REM(16), // Modal · 큰 면
  pill: "999px", // 원형 · pill (기하 상수)
} as const;

// ───── border width ─────────────────────────────────────────────────────────

export const BORDER_WIDTH = "1px";

// ───── shadow — 옅은 부상 ──────────────────────────────────────────────────
//
// cool. 순백 위 그림자는 따뜻하지 않다. 카드는 border 로 정의되고, 그림자는
// *떠 있는 것*(overlay) 의 표식이다. 아주 절제된 두 단.

export const SHADOW = {
  raised: "0 1px 2px 0 rgba(24, 25, 28, 0.05)",
  overlay: "0 8px 24px -6px rgba(24, 25, 28, 0.14), 0 2px 6px -2px rgba(24, 25, 28, 0.08)",
} as const;

// ───── z — 층 ──────────────────────────────────────────────────────────────

export const Z = {
  base: "0",
  sticky: "20",
  overlay: "30",
  modal: "40",
} as const;

// ───── measure — 본문 줄길이 ───────────────────────────────────────────────

export const MEASURE = REM(608); // 38rem

// ───── VALUES — emit 대상 트리 ─────────────────────────────────────────────

export const SHAPE_VALUES = {
  space: SPACE,
  height: HEIGHT,
  radius: RADIUS,
  shadow: SHADOW,
  z: Z,
  measure: { base: MEASURE },
  borderWidth: { base: BORDER_WIDTH },
} as const;

export type Space = keyof typeof SPACE;
export const SPACE_KEYS = ["xs", "sm", "md", "lg", "xl"] as const satisfies readonly Space[];
