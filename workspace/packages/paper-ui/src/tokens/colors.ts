// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Color — 장부(ledger) 의 물성                                             ║
// ║                                                                          ║
// ║ 종이 위에 잉크로 쓴다. 이 시스템의 색은 두 축뿐이다 — paper 와 ink.      ║
// ║ 나머지 색은 "가끔 등장하는 잉크" 다.                                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 왜 무채색인가 —
//   화면의 99% 는 종이와 잉크다. 색이 등장하면 *반드시 의미가 있다*. 색을 아껴
//   쓰는 게 아니라, 색에 일을 시키지 않으면 아예 꺼낼 이유가 없는 구조다.
//   (accent 8 색을 깔아두고 "절제해서 쓰세요" 라고 문서로 부탁하면 지켜지지
//    않는다. 팔레트에 없으면 지켜진다.)
//
// paper 는 흰색이 아니다 —
//   #fbf9f5 는 RGB 편차 6. 순백(편차 0) 과 누런 장부지(편차 10+) 사이에서,
//   흰 화면 옆에 두면 종이인 게 보이고 혼자 있으면 흰색처럼 조용한 자리.
//
// ink 는 검정이 아니다 —
//   #1a1917 은 순검정보다 따뜻하다. 종이 위 잉크는 순검정으로 마르지 않는다.

// ───── paper — 지면 3 단 ────────────────────────────────────────────────────
//
// raised 가 아니라 sunk 로 내려간다. 장부에서 무언가를 강조하는 방법은
// 띄우는 게 아니라 *칸을 파는* 것이다 (table head · sidebar · input).

export const PAPER = {
  base: "#fbf9f5", // 편차 6 — 기본 지면
  sunk: "#f2efe8", // 편차 10 — 눌린 칸 (table head · sidebar · input 바닥)
  deep: "#e9e5dc", // 편차 13 — 더 눌린 칸 (code · well)
} as const;

// ───── ink — 잉크 3 단 ──────────────────────────────────────────────────────

export const INK = {
  base: "#1a1917", // 본문
  soft: "#6b655c", // 보조 · 라벨 · info
  faint: "#a8a29a", // 흐린 · placeholder · disabled
} as const;

// ───── rule — 괘선 ─────────────────────────────────────────────────────────
//
// 이 시스템에서 border 는 "테두리" 가 아니라 *괘선* 이다. 장부의 선은 요소를
// 감싸려고 있는 게 아니라 칸을 나누려고 있다. 그래서 ink 의 알파로 정의된다 —
// 종이 위에 옅게 그은 선.

export const RULE = {
  base: "rgba(26, 25, 23, 0.10)", // 기본 괘선
  strong: "rgba(26, 25, 23, 0.18)", // 강한 괘선 (섹션 경계 · table head 밑)
} as const;

// ───── accent — 가끔 등장하는 잉크 ──────────────────────────────────────────
//
// 3 색뿐이다. 그리고 *쨍하다* — 빛바랜 파스텔이 아니라 확실히 다른 잉크.
// 무채색 지면 위에서 색은 드물게 등장하므로, 등장할 땐 분명해야 한다.
// (옅게 깔면 무채색 배경에 묻혀 "색을 쓴 이유" 가 사라진다.)
//
// info 가 여기 없는 이유 — info 는 소리칠 일이 없다. ink.soft 로 충분하고,
// 그래서 유채색은 3 개다. status 4 종 중 하나가 무채색인 건 결함이 아니라
// 이 시스템의 주장이다.

export const ACCENT = {
  red: {
    ink: "#c8322a", // error — 쨍한 빨강
    wash: "#fbeceb", // paper 위에 아주 옅게 깐 면
    edge: "#eec7c4", // wash 의 괘선
  },
  green: {
    ink: "#1f7a3d", // success
    wash: "#e9f4ec",
    edge: "#c2dfcb",
  },
  orange: {
    ink: "#c2610d", // danger — error 보다 한 단계 아래의 경고
    wash: "#fdf0e3",
    edge: "#f0d3ae",
  },
} as const;

export type AccentName = keyof typeof ACCENT;
export const ACCENT_NAMES = ["red", "green", "orange"] as const satisfies readonly AccentName[];

// ───── status — 의미 → 색 매핑 ──────────────────────────────────────────────
//
// status 는 4 종인데 유채색은 3 개다. info 는 ink.soft 로 간다.

export const STATUS = ["error", "success", "danger", "info"] as const;
export type StatusName = (typeof STATUS)[number];

export const STATUS_ACCENT: Record<Exclude<StatusName, "info">, AccentName> = {
  error: "red",
  success: "green",
  danger: "orange",
};

// ───── VALUES — emit 대상 트리 ─────────────────────────────────────────────
//
// 이 트리 하나가 CSS var 와 TS 참조 트리 양쪽의 출처다 (tokens/helpers.ts).

export const COLOR_VALUES = {
  paper: PAPER,
  ink: INK,
  rule: RULE,
  accent: ACCENT,
} as const;
