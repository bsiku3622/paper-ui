// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Shape — 괘선지의 격자                                                    ║
// ║                                                                          ║
// ║ 장부 한 줄(line) 이 이 시스템의 척추다. 괘선 간격도, 행 높이도, 버튼     ║
// ║ 높이도 전부 여기서 나온다. 하나를 바꾸면 화면 전체의 결이 같이 움직인다. ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ───── line — 장부 한 줄 ────────────────────────────────────────────────────
//
// 44px. 배경 괘선의 간격이자 Row 의 높이다. 둘이 같은 값이라 항목이 선 위에
// *앉는다* — 이 시스템이 종이로 읽히는 이유의 8 할.
//
// height ladder 가 여기서 파생된다: control 은 line 의 3/4, tall 은 line 그대로.
// 임의 높이를 새로 만들지 않는다 — 격자를 벗어나면 종이가 아니라 그냥 div 다.

const LINE_PX = 44;
const REM = (px: number) => `${px / 16}rem`;

export const LINE = REM(LINE_PX); // 2.75rem = 44px

export const HEIGHT = {
  control: REM(LINE_PX * 0.75), // 33px — Button · Field · Select (한 줄 안에 들어감)
  row: LINE, //                    44px — Row · Table 행 (괘선 그대로)
} as const;

// ───── space — 간격 ────────────────────────────────────────────────────────
//
// 4px 배수. line(44) 과 약수를 공유해 격자가 깨지지 않는다.

export const SPACE = {
  xs: REM(4),
  sm: REM(8),
  md: REM(12),
  lg: REM(20),
  xl: REM(32),
} as const;

// ───── radius — 모서리 ─────────────────────────────────────────────────────
//
// ledger 그대로. 장부는 각지지 않았다 — 종이 모서리는 닳아 둥글다.
// 3 단이 아니라 2 단 + pill. 큰 면일수록 조금 더 둥글다.

export const RADIUS = {
  base: REM(10), // Card · Button · Field · Table
  lg: REM(14), // Modal · 큰 면
  pill: "999px", // Badge · Tag (기하 상수 — ladder 밖)
} as const;

// ───── rule width — 괘선 굵기 ──────────────────────────────────────────────

export const RULE_WIDTH = "1px";

// ───── shadow — 그림자 ─────────────────────────────────────────────────────
//
// warm. 종이 위의 그림자는 파랗지 않다. 2 단뿐 — 이 시스템에서 뜨는 것은
// overlay 밖에 없다 (Card 는 괘선으로 정의되지 그림자로 뜨지 않는다).

export const SHADOW = {
  raised: "0 1px 2px rgba(26, 25, 23, 0.05), 0 2px 8px rgba(26, 25, 23, 0.06)",
  overlay: "0 8px 28px rgba(26, 25, 23, 0.12), 0 2px 6px rgba(26, 25, 23, 0.06)",
} as const;

// ───── z — 층 ──────────────────────────────────────────────────────────────

export const Z = {
  base: "0",
  sticky: "20",
  overlay: "30",
  modal: "40",
} as const;

// ───── measure — 본문 줄길이 ───────────────────────────────────────────────
//
// 읽는 글의 최대 폭. 한글 기준 한 줄 45자 언저리 (라틴 ≈70ch).

export const MEASURE = REM(608); // 38rem

// ───── VALUES — emit 대상 트리 ─────────────────────────────────────────────

export const SHAPE_VALUES = {
  line: { base: LINE },
  height: HEIGHT,
  space: SPACE,
  radius: RADIUS,
  shadow: SHADOW,
  z: Z,
  measure: { base: MEASURE },
  ruleWidth: { base: RULE_WIDTH },
} as const;

export type Space = keyof typeof SPACE;
export const SPACE_KEYS = ["xs", "sm", "md", "lg", "xl"] as const satisfies readonly Space[];
