// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Color — 순백 위의 검정, 포인트로 작게 얹는 색                            ║
// ║                                                                          ║
// ║ 베이스는 흰색과 검정 둘뿐이다. 그 조화가 화면의 골격을 만든다.          ║
// ║ 색(red·green·blue)은 *작게 얹는 점* 이다 — status · focus · 링크처럼    ║
// ║ 의미가 있는 자리에만, 면을 채우지 않고.                                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 지향 — Atlassian 의 밀도 · shadcn 의 절제된 뉴트럴 · SwiftUI 의 단정한 여백.
// 복잡한 웹앱을 위한 표면: 흰 바탕, 얇은 회색 괘선, 필요할 때만 옅게 뜨는 그림자.
//
// 왜 primary 가 검정인가 —
//   "순백+검정 조화에 색은 작게" 라는 정체성에서 파랑 버튼이 매 화면 등장하면
//   색이 더는 포인트가 아니다. 그래서 일꾼(primary 액션)은 검정이고, 파랑은
//   focus · 링크 · info 처럼 *작은* 자리에만 나온다.
//
// 검정은 순검정이 아니다 —
//   #18181b. 넓은 면에 순검정(#000)은 눈을 찌른다. 살짝 문 뉴트럴이 더 단정하다.

// ───── surface — 흰 바탕 3 단 ───────────────────────────────────────────────
//
// base 가 순백. 위로 갈수록(subtle · muted) 아주 옅게 내려앉는 회색 — hover ·
// table head · 눌린 자리. 종이가 아니라 *깨끗한 시트* 다.

export const SURFACE = {
  base: "#ffffff", // 순백 — 페이지 캔버스
  subtle: "#f7f7f8", // 카드 · 사이드바 · table head (ChatGPT 의 옅은 면)
  muted: "#ececee", // hover · 눌린 칸 · 선택
} as const;

// ───── ink — 검정 3 단 ──────────────────────────────────────────────────────

export const INK = {
  base: "#18181b", // 본문 (검정으로 읽히는 뉴트럴)
  soft: "#71717a", // 보조 · 라벨 · placeholder 위
  faint: "#a1a1aa", // 흐린 · placeholder · disabled
} as const;

// ───── border — 괘선 ───────────────────────────────────────────────────────
//
// 이 시스템의 구획은 얇은 뉴트럴 선으로 나뉜다 (shadcn/Atlassian 의 결).

export const BORDER = {
  base: "#e8e8ea", // 기본 경계 — 거의 안 보이게. 선보다 면으로 나누는 게 먼저.
  strong: "#d8d8dc", // 강한 경계 — 섹션 · table head 밑처럼 선이 필요한 자리만
} as const;

// ───── accent — 작게 얹는 점 ────────────────────────────────────────────────
//
// 3 색. 각자 의미를 진다: blue = 정보/상호작용, green = 성공, red = 위험.
// 각 색은 4 자리를 갖는다:
//   solid — 채운 면/점 (dot · 채운 배지). 600 톤.
//   ink   — 흰 배경 위 *글자* 색 (AA 대비). 700 톤.
//   wash  — 아주 옅은 면 (subtle 배지 · 선택 행). 50 톤.
//   edge  — wash 의 괘선. 200 톤.
//
// solid 로 꽉 찬 큰 면은 만들지 않는다 — 색은 점이지 배경이 아니다.

export const ACCENT = {
  blue: {
    solid: "#2563eb",
    ink: "#1d4ed8",
    wash: "#eff6ff",
    edge: "#bfdbfe",
  },
  green: {
    solid: "#16a34a",
    ink: "#15803d",
    wash: "#f0fdf4",
    edge: "#bbf7d0",
  },
  red: {
    solid: "#dc2626",
    ink: "#b91c1c",
    wash: "#fef2f2",
    edge: "#fecaca",
  },
} as const;

export type AccentName = keyof typeof ACCENT;
export const ACCENT_NAMES = ["blue", "green", "red"] as const satisfies readonly AccentName[];

// ───── primary — 검정 일꾼 ──────────────────────────────────────────────────
//
// 1 차 액션의 면. 이 시스템에서 색이 아니라 검정이 채우는 유일한 자리.

export const PRIMARY = {
  base: "#18181b",
  hover: "#0a0a0a", // hover 는 어두워진다 — 검정 버튼도 예외 아님 (원칙 4 · danger 와 같은 방향)
  fg: "#ffffff",
} as const;

// ───── focus — 파란 링 ──────────────────────────────────────────────────────
//
// 키보드 포커스. blue 가 가장 작게, 가장 자주 등장하는 포인트 자리 (Apple ·
// Atlassian 의 시그니처). ring 은 accent.blue.solid 와 같은 값 — 한 곳에서 굳힌다.

export const FOCUS = {
  ring: "#2563eb",
} as const;

// ───── status — 의미 → 색 ───────────────────────────────────────────────────
//
// 3 종. ledger 와 달리 info 도 색을 갖는다 (blue) — 파랑을 포인트로 쓰기로 한
// 정체성의 귀결.

export const STATUS = ["info", "success", "error"] as const;
export type StatusName = (typeof STATUS)[number];

export const STATUS_ACCENT: Record<StatusName, AccentName> = {
  info: "blue",
  success: "green",
  error: "red",
};

// ───── VALUES — emit 대상 트리 ─────────────────────────────────────────────

export const COLOR_VALUES = {
  surface: SURFACE,
  ink: INK,
  border: BORDER,
  accent: ACCENT,
  primary: PRIMARY,
  focus: FOCUS,
} as const;
