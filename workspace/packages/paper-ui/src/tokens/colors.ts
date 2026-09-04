// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Color — 순백 위의 검정, 포인트로 작게 얹는 색                            ║
// ║                                                                          ║
// ║ 베이스는 흰색과 검정 둘뿐이다. 그 조화가 화면의 골격을 만든다.          ║
// ║ 색(blue·green·amber·red)은 *작게 얹는 점* 이다 — status · focus ·      ║
// ║ 링크처럼 의미가 있는 자리에만, 면을 채우지 않고.                        ║
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

// ───── paper — 면 깊이 사다리 (smoke 바닥 위로 순백이 뜬다) ────────────────
//
// ChatGPT 결: canvas 는 순백이 아니라 옅은 smoke, 순백(raised)은 그 위로 떠오르는
// 하이라이트(카드·입력·모달). sunken·well 은 canvas 아래로 가라앉는 자리
// (사이드바·table head·깊은 well). "종이"는 순백이 아니라 살짝 뜬 시트다.
// 한 깊이 축: raised(순백) — canvas(smoke, 기준) — sunken — well.
// 상호작용(hover 등)은 이제 solid 회색이 아니라 interaction 오버레이가 맡는다.

export const PAPER = {
  canvas: "#fcfcfc", // smoke — 페이지 바닥 (기준면). ChatGPT 본문 톤 — 순백과 3단 차라
  //                    canvas↔raised 는 톤이 아니라 헤어라인·그림자로 갈린다.
  raised: "#ffffff", // 순백 — 떠오르는 면 (카드 · 입력 · 모달)
  sunken: "#f4f4f5", // well 1 — 사이드바 · table head (canvas 아래). ChatGPT 사이드바 톤
  well: "#e2e2e5", // well 2 — 더 깊은 well
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
// 4 색. 이름이 곧 의미다 — info(정보/상호작용) · success(성공) · warning(주의) ·
// error(위험). API 에 hue 이름(blue 등)은 없다. 각 색은 4 자리를 갖는다:
//   solid   — 채운 면/점 (dot · 채운 배지 · status 버튼). 진한 톤(그 위 옅은 색 글자와 대비).
//   solidFg — solid 위 *글자* 색. **같은 hue 의 옅은 톤**(모노크로매틱, 한 방향으로 통일) —
//             흰색이 아니라 그 색의 옅은 톤. 채움은 다 진하게 맞춰(green·amber 포함) 늘 옅은
//             글자가 얹힌다. 버튼 전체가 한 색으로 통일된다.
//   ink     — 흰 배경 위 *글자* 색 (AA 대비). 700 톤.
//   wash    — 아주 옅은 면 (subtle 배지 · soft 버튼 · 선택 행). 50 톤.
//   edge    — wash 의 괘선. 200 톤.
//
// 색 면은 그 색의 *의미* 를 짊어질 때만 쓴다 (error 버튼처럼). 장식으로 면을
// 채우지 않는다 — 큰 면을 채우는 건 primary(검정) 뿐.

export const ACCENT = {
  info: {
    solid: "#2563eb",
    solidFg: "#d6e4fd", // 옅은 파랑 글자
    ink: "#1d4ed8",
    wash: "#eff6ff",
    edge: "#bfdbfe",
  },
  success: {
    solid: "#15803d", // 진한 초록으로 낮춤(옅은 글자 대비 확보)
    solidFg: "#d6f2df", // 옅은 초록 글자
    ink: "#15803d",
    wash: "#f0fdf4",
    edge: "#bbf7d0",
  },
  warning: {
    solid: "#b45309", // 진한 amber 로 낮춤
    solidFg: "#fbe7b4", // 옅은 amber 글자
    ink: "#b45309",
    wash: "#fffbeb",
    edge: "#fde68a",
  },
  error: {
    solid: "#dc2626",
    solidFg: "#ffe0e0", // 옅은 빨강 글자
    ink: "#b91c1c",
    wash: "#fef2f2",
    edge: "#fecaca",
  },
} as const;

export type AccentName = keyof typeof ACCENT;
export const ACCENT_NAMES = ["info", "success", "warning", "error"] as const satisfies readonly AccentName[];

// ───── primary — 검정 일꾼 ──────────────────────────────────────────────────
//
// 1 차 액션의 면. 이 시스템에서 색이 아니라 검정이 채우는 유일한 자리.

export const PRIMARY = {
  base: "#18181b",
  hover: "#3f3f46", // 어두운 면은 hover 때 *밝아진다* — 이미 검정에 가까워 더 어둡게는 안 보인다. 한 단 확실히.
  fg: "#ffffff",
} as const;

// ───── focus — 파란 링 ──────────────────────────────────────────────────────
//
// 키보드 포커스. blue 가 가장 작게, 가장 자주 등장하는 포인트 자리 (Apple ·
// Atlassian 의 시그니처). ring 은 accent.info.solid 와 같은 값 — 한 곳에서 굳힌다.

export const FOCUS = {
  ring: "#2563eb",
} as const;

// ───── interaction — 오버레이 (면 위에 얹는 상호작용 틴트) ──────────────────
//
// hover · selected · active 를 alpha 로. 어떤 면(smoke·순백·well) 위든 밑을 그대로
// 어둡게 만들어, "자리마다 다른 회색을 고르는" 문제를 없앤다. 틴트는 순검정이 아니라
// ink 계열(24,25,28) — 넓게 얹혀도 눈을 찌르지 않게. 색 변형(danger 등)의 상호작용은
// 이 오버레이가 아니라 accent 스텝을 쓴다 (중립=오버레이 / 색=accent 스텝).

export const INTERACTION = {
  hover: "rgba(24, 25, 28, 0.05)", // 포인터가 올라온 자리 — 맑은 터치 (얼룩 아님)
  selected: "rgba(24, 25, 28, 0.13)", // 선택·활성 nav·현재 행 — hover 와 확실히 벌려 위계 (≈ 예전 muted)
  active: "rgba(24, 25, 28, 0.16)", // 눌리는 순간 — 가장 진하게
} as const;

// ───── scrim — 떠오른 앞면 뒤의 어둠 ─────────────────────────────────────────
//
// Modal·Dialog 뒤를 덮어 초점을 앞면으로 모은다. 테마 인식 — 라이트는 ink 계열을
// 옅게, 다크는 캔버스가 이미 어두워 near-black 로는 dim 이 안 먹으니 순검정을 더 짙게.

export const SCRIM = "rgba(24, 25, 28, 0.32)";

// ───── status — 의미 → 색 ───────────────────────────────────────────────────
//
// 4 종. 컴포넌트(Button · Field · Badge)는 상태를 이 하나의 축으로 받는다 —
// boolean(invalid · danger) 을 난립시키지 않는다. info 도 색을 갖는다 — 파랑을
// 포인트로 쓰기로 한 정체성의 귀결. accent 도 의미색이라 hue 이름은 없다:
// status 3 종은 accent 와 이름이 같고, danger 만 error 색을 가리킨다.

export const STATUS = ["info", "success", "warning", "error"] as const;
export type StatusName = (typeof STATUS)[number];

// status 이름 == accent color 이름 (danger/red 분리 폐기). 항등이지만, resolveStatus·
// Banner 가 이 map 을 거치므로 한 자리로 남겨 둔다.
export const STATUS_ACCENT: Record<StatusName, AccentName> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

// ───── VALUES — emit 대상 트리 ─────────────────────────────────────────────

export const COLOR_VALUES = {
  paper: PAPER,
  ink: INK,
  border: BORDER,
  accent: ACCENT,
  primary: PRIMARY,
  focus: FOCUS,
  interaction: INTERACTION,
  scrim: SCRIM,
} as const;

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Dark — 같은 트리, 값만 뒤집는다                                          ║
// ║                                                                          ║
// ║ theme.css.ts 가 이 세트를 [data-theme="dark"] 스코프에 굽는다. var 이름은 ║
// ║ 그대로라 소비처는 한 줄도 안 바뀐다 — 스코프만 바뀌면 값이 바뀐다.       ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 불변식 A — raised 는 언제나 최명, well 은 최암. 다크는 사다리를 통째로 어둡게
//   내리되 순서는 유지한다("떠오른 면 = 밝다" 가 light·dark 공통. Material 결).
// 불변식 B — interaction 오버레이는 다크에서 흰빛 alpha 로 뒤집힌다(밑을 밝게).
// primary(일꾼 면)도 뒤집힌다 — 검정 채움/흰 글자 → 흰 채움/검정 글자.
//
// 값은 손으로 잡는다 (OKLCH 생성 없음). YouTube(#0f0f0f base)·ChatGPT(#212121 surface·
// #ececec 텍스트)를 참고해 **깊고 중립적인(파란기 없는) base + 눌린 surface**로 잡았다 —
// 중간 회색 base 는 "다크인데 붕 뜨고 밝은" 인상을 준다. base 가 깊어야 지면이 가라앉고,
// 떠오름(카드·모달)은 값의 큰 점프가 아니라 얇은 그림자/헤어라인으로 읽힌다.

// ⚠ **다크는 깊이의 방향이 라이트와 반대다.** 라이트는 canvas 아래로 파고
// (well < sunken < canvas < raised), 다크는 canvas 위로 쌓는다
// (canvas < well < sunken < raised).
//
// 반전되는 건 조명이 아니라 지면의 재질이다. 빛은 다크에서도 위에서 오므로 올라온
// 면은 여전히 밝다 — raised 가 최명인 것은 양쪽이 같다. 움직이는 건 canvas 다:
// 라이트에서 canvas 는 종이라 홈을 파면 그늘이 지지만, **다크에서 canvas 는 어둠
// 그 자체라 홈을 팔 수 없다.** 그래서 sunken·well 은 "파인 것" 이 아니라 "지면 위에
// 낮게 놓인 것" 이 되고, 깊은 것일수록 지면에 가깝게 앉는다.
//
// 예전 값(sunken #101010 · well #0a0a0a)은 canvas 아래 남은 L .20 을 쥐어짠 것이라
// **table head 가 몸통보다 어두운 구멍이 되고 사이드바가 뭉갰다.** 실제 다크 UI 는
// 전부 반대다(GitHub #0d1117→#161b22 · VS Code #1e1e1e→#252526 · Notion #191919→#202020).
const PAPER_DARK = {
  raised: "#2b2b2b", // 떠오른 면 = 최명 (카드 · 입력 · 모달)
  sunken: "#252525", // 사이드바 · table head — 지면 위 한 겹
  well: "#1f1f1f", //   트랙 · secondary 면 — 지면에 가장 가깝게
  canvas: "#171717", // 지면 = 최암
} as const;

// 면이 통째로 밝아진 만큼 잉크·괘선도 따라 오른다 — 가장 밝은 면(raised) 위에서
// 대비를 풀어 잡은 값이다. 예전 faint(#6a6a6a)는 새 raised 위에서 2.62,
// border.base(#2a2a2a)는 1.01 로 사실상 보이지 않았다.
const INK_DARK = {
  base: "#dcdcdc", // 본문 — soft white. 딥다크 위 순백은 대비가 세 눈이 아프다(≈83% 회백)
  soft: "#9a9a9a", //  보조 · 라벨 (raised 위 5.03:1)
  faint: "#737373", // 흐린 · placeholder (raised 위 2.99:1)
} as const;

const BORDER_DARK = {
  base: "#3c3c3c", //   헤어라인 (raised 위 1.28:1)
  strong: "#585858", // 강한 경계 — table head·섹션·컨트롤 테두리 (1.99:1)
} as const;

// 다크 accent — 딥 뉴트럴 base 위에서 순채도(Tailwind-500/300)는 "붕 떠" 진동한다.
// 채도를 눌러(muted jewel) 면 안에 앉힌다 — 그래도 hue 는 또렷하게.
//
// ⚠ **wash·edge 는 alpha 가 아니라 solid 다.** 예전엔 색을 alpha .15/.30 으로 얹었는데,
// 그러면 밑면에 따라 색이 달라져 **밝은 면 위에서 대비를 잃는다** — 배지는 canvas 에도
// 카드(raised)에도 놓이므로 어느 면 위든 같은 색이어야 대비가 예측된다. 라이트가 이미
// solid 였으니 구조도 이쪽이 맞다. wash 는 raised 보다 위에 둔다 — 카드 위에 놓인 배지가
// 카드와 같은 밝기면 사라지기 때문이다.
//
// ink(글자)도 L .745 로 올렸다. 면이 밝아진 만큼 따라 오르지 않으면 raised 위에서
// info 가 4.46 으로 AA 를 놓친다.
const ACCENT_DARK = {
  info: { solid: "#32547e", solidFg: "#d6e4fd", ink: "#88afe2", wash: "#334051", edge: "#3c516b" },
  success: { solid: "#295f43", solidFg: "#d6f2df", ink: "#81bc9a", wash: "#33473b", edge: "#3b5a48" },
  warning: { solid: "#684e15", solidFg: "#fbe7b4", ink: "#c6a86e", wash: "#483e2b", edge: "#5d4d2f" },
  error: { solid: "#7b3d3f", solidFg: "#ffe0e0", ink: "#e09595", wash: "#503736", edge: "#694242" },
} as const;

const PRIMARY_DARK = {
  base: "#e8e8e8", // 일꾼 면 — 순백은 딥다크 위에서 튄다. soft white 로 눌러도 "가장 밝은 = primary" 유지
  hover: "#d6d6d6", // 밝은 면은 hover 때 살짝 어두워진다
  fg: "#18181b",
} as const;

const FOCUS_DARK = {
  ring: "#4a82c7", // accent.info.solid(dark) 와 같은 값 (muted 로 함께 앉힘)
} as const;

const INTERACTION_DARK = {
  hover: "rgba(255, 255, 255, 0.055)", // 깊은 base 위 맑은 터치
  selected: "rgba(255, 255, 255, 0.10)", // 선택·활성 — 과하게 밝지 않게 (0.14→0.10)
  active: "rgba(255, 255, 255, 0.13)",
} as const;

const SCRIM_DARK = "rgba(0, 0, 0, 0.58)"; // 다크 캔버스 위에서도 앞면을 확실히 띄우게 더 짙게

// 구조 강제 — light 트리와 키가 하나라도 어긋나면(추가하고 dark 를 빠뜨리면)
// 컴파일 에러. 잎은 string 으로 넓혀 값 자체는 자유롭게 둔다.
type SameShapeStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : SameShapeStrings<T[K]>;
};

export const COLOR_VALUES_DARK = {
  paper: PAPER_DARK,
  ink: INK_DARK,
  border: BORDER_DARK,
  accent: ACCENT_DARK,
  primary: PRIMARY_DARK,
  focus: FOCUS_DARK,
  interaction: INTERACTION_DARK,
  scrim: SCRIM_DARK,
} satisfies SameShapeStrings<typeof COLOR_VALUES>;
