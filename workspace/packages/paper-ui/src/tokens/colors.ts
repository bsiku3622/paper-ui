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

// ───── border — 괘선 (한 벌) ───────────────────────────────────────────────
//
// 이 시스템의 구획은 얇은 뉴트럴 선으로 나뉜다 (shadcn/Atlassian 의 결).
//
// ⚠ **화면의 회색 선은 한 종류다.** 한동안 컨트롤 전용 회색(`border.control`)을 따로 뒀다.
// 근거는 그럴듯했다 — 빈 Field 는 상자 말고 아무 단서가 없으니 카드 헤어라인보다 진해야
// 한다는 것. 그런데 실물에서는 **그게 바로 어긋남으로 읽혔다**: 표를 감싼 카드 테두리는
// 거의 안 보이는데 그 위 검색창만 진하니, 한 화면에 회색이 두 벌이 된다. 선의 *역할* 이
// 다르다고 *색* 까지 갈리면, 화면은 그걸 두 팔레트로 읽는다(백재원, 2026-09-09).
//
// 그래서 컨트롤도 이 두 값을 그대로 쓴다 — 쉬는 상태 base, hover 는 strong.
// 컨트롤을 더 또렷하게 하려면 컨트롤만 진하게 하는 게 아니라 **이 표를 올린다.**
// 그러면 카드·구획·입력이 함께 움직여 회색은 계속 한 벌로 남는다.
//
// ⚠ 강도는 아직 확정이 아니다. 지금 값(1.19 · 1.42)은 원래 값이고, 빈 입력칸 경계로는
// 비텍스트 기준(3:1)에 한참 못 미친다. lab 으로 훑어 고르는 중이다.
//
// accent 는 사정이 다르다 — 그쪽은 `edge`(wash 괘선)와 `edgeStrong`(outline 테두리)이
// 갈려 있는데, 색이 있는 선은 *라벨 색과 맞아야* 하므로 애초에 뉴트럴 괘선과 다른 물건이다.

export const BORDER = {
  base: "#e8e8ea", // 쉬는 경계 — 카드 헤어라인 · 구획 · 입력칸 · 체크박스 · outline
  strong: "#d8d8dc", // 한 단 또렷하게 — table head 밑 · 컨트롤 hover
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
//   edge    — wash 의 괘선, 그리고 soft 의 hover 면. 200 톤.
//   edgeStrong — **홀로 서는 테두리** (outline 변형). canvas 대비 3:1 로 맞춘 값.
//
// ⚠ edge 와 edgeStrong 을 가르는 이유. 예전엔 outline 이 edge 를 빌려 썼는데, 두 자리가
// 요구하는 세기가 다르다. wash 의 괘선은 이미 색이 깔린 면의 가장자리라 살짝만 진하면
// 되지만, **outline 은 그 선이 곧 컴포넌트다** — 흰 면 위에서 혼자 형태를 만들어야 한다.
// 200 톤은 canvas 대비 1.18~1.41 이라 그 일을 못 했다(비텍스트 기준 3:1 의 절반도 안 된다).
// 다크 팔레트 주석이 "edge 가 두 일을 겸하는 구조 문제" 라고 이미 적어 둔 그 문제다.
//
// ⚠ **톤은 램프 인덱스가 아니라 대비로 고른다.** 넷을 다 400 톤으로 맞춰 보면 초록·amber
// 가 파랑·빨강보다 눈에 띄게 옅다 — hue 마다 고유 명도가 달라서다. 그래서 각자 canvas
// 대비 3.0 이 되는 자리를 따로 찾았다(solid 를 "진한 톤으로 낮춤" 한 것과 같은 이유).
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
    edgeStrong: "#5694e9", // canvas 3.01
  },
  success: {
    solid: "#15803d", // 진한 초록으로 낮춤(옅은 글자 대비 확보)
    solidFg: "#d6f2df", // 옅은 초록 글자
    ink: "#15803d",
    wash: "#f0fdf4",
    edge: "#bbf7d0",
    edgeStrong: "#35a75f", // canvas 2.99
  },
  warning: {
    solid: "#b45309", // 진한 amber 로 낮춤
    solidFg: "#fbe7b4", // 옅은 amber 글자
    ink: "#b45309",
    wash: "#fffbeb",
    edge: "#fde68a",
    edgeStrong: "#c5861b", // canvas 3.01
  },
  error: {
    solid: "#dc2626",
    solidFg: "#ffe0e0", // 옅은 빨강 글자
    ink: "#b91c1c",
    wash: "#fef2f2",
    edge: "#fecaca",
    edgeStrong: "#ed6969", // canvas 3.00
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

// ⚠ primary 는 자기 `edgeStrong` 을 들지 않는다. 한때 뒀다가 `border.control` 로 합쳤는데,
// **중립 컨트롤의 경계는 하나**이기 때문이다 — outline 버튼의 테두리와 빈 Field 의 테두리는
// 같은 일을 하는 같은 선이다. Field 는 색 family 의 소비자가 아니라서, primary 밑에 두면
// 입력이 "primary 색"을 참조하는 이상한 모양이 된다. accent 는 반대다 — 그쪽 테두리는
// 라벨 색과 맞아야 하므로 각 색이 자기 edgeStrong 을 소유한다.

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
// 4 종. **validation 축이다** — Field · TextField · Textarea 만 받는다. Button · Badge ·
// Alert 는 status 가 아니라 color × variant 로 색을 받는다(그쪽은 검증이 아니라 의미다).
// boolean(invalid · error) 을 난립시키지 않고 이 하나의 축으로 말한다. info 도 색을
// 갖는다 — 파랑을 포인트로 쓰기로 한 정체성의 귀결. 이름은 accent 와 항등이다.

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

// ⚠ **불변식 — 사다리는 양 테마에서 거울이다. 순서가 반대다.**
//
// **각 테마에는 목표(objective)가 있고, raised 는 그 목표에 가장 가까운 면이다.**
//
//     라이트   WHITE | raised | canvas | sunken | well | GRAY
//     다크     BLACK | raised | canvas | sunken | well | GRAY
//
// 오랫동안 "raised = 언제나 최명" 을 양 테마 공통 불변식으로 뒀는데, 그러면 다크의 raised
// 는 *검정에서 가장 먼* 면이 된다 — 뒤집히지 않는 축이 하나 남아 있던 셈이다. 값을 맞춰도
// 다크에 어색함이 남던 원인이 여기였다. 뒤집고 나서 확정(백재원, 2026-09-04).
//
// 간격은 canvas 를 축으로 라이트를 접었다 — 쌍의 거리가 양 테마에서 거의 같아진다
// (canvas↔raised 1.019 vs 1.026 · well↔sunken 1.171 vs 1.176).
// 부수 효과: **Tabs 의 오버레이 충돌이 사라진다.** 트랙(well)이 최명, 활성 pill(raised)이
// 최암이라 밝히는 오버레이가 hover 된 비활성 탭을 활성에서 *멀어지는* 쪽으로 민다.
//
// ── 뒤집기 전 기록 ─────────────────────────────────────────────────────────
// 폐기된 옛 불변식 — 사다리의 순서는 양 테마가 같다. well < sunken < canvas < raised.
// 틀리는 것은 순서가 아니라 **간격**이다.
//
// 예전 값(sunken #101010 · well #0a0a0a)은 라이트의 간격을 그대로 쓴 것이었는데,
// 다크 canvas 는 L .2046 이라 아래로 그만큼밖에 없다. 거기 두 단을 라이트처럼 벌리면
// 바닥에 잠겨 — **table head 가 몸통보다 어두운 구멍이 되고 사이드바가 뭉갠다.**
//
// canvas 아래 두 칸은 .021 · .019 로 촘촘히 둔다(well 이 L .165 — 예전 .145 처럼
// 순검정에 잠기지 않는 선). 한동안 그 위의 raised 만 .065 로 크게 띄웠는데
// — "어두운 지면에서 카드가 뜨려면 라이트의 .0167 로는 어림없다" —
// **그 넓은 칸은 깊이가 요구한 게 아니라 과한 hover 오버레이를 피해 벌려 둔 자리였다**
// (→ INTERACTION_DARK). 오버레이를 제자리로 돌리고 raised 를 .248 로 내렸다.
//
// 이 배치가 라이트가 만족하던 관계를 세운다:
//     사이드바(sunken) ↔ 본문(canvas)   인접   1.04  ← 은은
//     본문(canvas) ↔ 카드(raised)              1.11  ← 갈리기만 (라이트 1.03)
//     Tabs 트랙(well) ↔ 활성(raised)     세 칸  1.20  ← 확실
//
// ⚠ 라이트의 canvas↔raised 는 1.03 이다 — smoke 위 순백이라 **톤이 아니라 헤어라인과
// 그림자로 갈린다.** 다크도 같은 방향으로 좁혔고, 그만큼 헤어라인이 일을 넘겨받는다.
// ── 2026-09-08 · stone cast ────────────────────────────────────────────────
//
// 다크가 **완전 무채**였다(C 0.0000, 전 항목). 라이트는 그렇지 않다 — 재 보니
// **hue 286°** 의 zinc 계열로, sunken C .0013 부터 ink.soft C .0138 까지 일관된
// 옅은 캐스트를 갖고 있다. 그래서 라이트는 "돌 같은" 결이 있고 다크는 밋밋했다.
// 뒤집히지 않은 축이 또 하나 남아 있던 셈이다(사다리 순서 · accent 채움에 이어 셋째).
//
// **hue 는 시스템 상수다 — 286°. 양 테마가 같은 램프에서 값을 뽑는다.**
// chroma 는 저명도에서 지각이 약해지므로 다크 쪽을 조금 올린다(라이트 면 C .001~.004
// → 다크 면 C .006~.009). 라이트의 잉크가 C .006~.014 를 갖는 것과 같은 세기다.
// 캐스트를 통째로 바꾸려면 이 각도 하나만 돌리면 된다.
const PAPER_DARK = {
  // 사다리 자체(L)는 2026-09-07 값 그대로 — Neon Night 의 명도 위계를 무채 등가로
  // 옮긴 것이다. 여기서 바뀐 건 chroma 뿐이라 대비는 한 자리도 움직이지 않는다.
  raised: "#0d0d10", // 떠오른 면 = **최암** (카드 · 입력 · 모달) — BLACK 에 가장 가깝다
  canvas: "#101013", // 지면 — 앵커라 안 움직인다
  sunken: "#161619", // 얕은 홈 — 사이드바 · table head
  well: "#252529", //   가장 깊은 홈 = **최명** — 트랙 · soft. GRAY 쪽 끝
} as const;

// 면이 통째로 밝아진 만큼 잉크·괘선도 따라 오른다 — 가장 밝은 면(raised) 위에서
// 대비를 풀어 잡은 값이다. 예전 faint(#6a6a6a)는 새 raised 위에서 2.62,
// border.base(#2a2a2a)는 1.01 로 사실상 보이지 않았다.
const INK_DARK = {
  base: "#e9e9eb", // 본문 — soft white. 딥다크 위 순백은 대비가 세 눈이 아프다(raised 위 16.00:1)
  soft: "#a1a1a8", //  보조 · 라벨 (raised 위 7.56:1)
  faint: "#8b8b92", // 흐린 · placeholder (raised 위 5.73:1 — 예전 2.99 에서 올라와 이제 넘긴다)
} as const;

// 괘선도 같은 대칭으로 옮겼다. **라이트에서 괘선은 well 너머 GRAY 쪽에 있다**
// (base #e8e8ea 는 well #e2e2e5 보다 위). 뒤집으면 다크 괘선은 well 너머 — 사다리보다
// *위* 다. 그러면 면 위 대비가 양 테마에서 거의 같아진다:
//
//                   raised  canvas  sunken  well
//     다크 base       1.38    1.35    1.27   1.10
//     라이트 base     1.22    1.19    1.11   1.06
const BORDER_DARK = {
  base: "#2b2b31", //   쉬는 경계 (raised 위 1.38:1)
  strong: "#3d3d44", // 한 단 또렷하게 (1.80:1)
} as const;

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ 다크 accent — 2026-09-08 전면 재설계                                      ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// ⚠ **wash 가 색이 아니라 회색 덩어리였다.** 이게 "다크 accent 가 별로" 의 실체다.
// 두 테마를 재서 나란히 놓으면 한눈에 보인다 (canvas 기준 ΔL · chroma):
//
//                 ΔL(canvas→wash)   chroma
//     라이트          −0.004~−0.021   .013~.021   ← 지면에 색만 얹은 *틴트*
//     예전 다크       **+0.194**      .033        ← 지면에서 한 층 뜬 *진흙*
//
// 라이트 wash 는 밝기가 거의 안 움직이고 **색만** 바뀐다. 예전 다크 wash 는 그 10 배를
// 밝기로 움직이면서 chroma 는 그대로였다 — 그래서 파랑·초록·주황이 다 같은 탁한
// 회갈색으로 읽혔다. 배지가 지저분했던 건 hue 선택이 아니라 이 비율 때문이다.
//
// ⚠ **폐기 — "wash 는 사다리 밖(well 너머)이어야 한다."** wash 를 L .37 까지 밀어
// 올린 게 바로 이 규칙이었다. 근거는 "면 위에 놓인 배지가 그 면과 같은 밝기면 사라진다"
// 였는데, **라이트가 반례다**: 라이트 wash(L .970~.987)는 사다리 *안* 이고 well(.914)
// 보다도 밝다. 그런데 안 사라진다 — 화면에서 유일하게 유채색이기 때문이다.
// **wash 를 가르는 것은 밝기가 아니라 색이다.** 규칙을 그렇게 고쳐 적는다.
//
// 그래서 새 wash 는 canvas 를 축으로 라이트를 접은 자리에 둔다(ΔL +0.05 안쪽),
// chroma 는 .048 로 올렸다(저명도 보정 — 라이트 .013~.021 과 같은 세기로 읽힌다).
//
// **accent 하나당 hue 하나.** 라이트는 Tailwind 램프를 섞어 쓴 흔적이 남아 warning 이
// solid H49(주황) / wash H95(노랑) 로 46° 벌어져 있다. 다크는 5 톤이 한 각을 공유한다:
//     info 258 · success 153 · warning 75 · error 22
//
// 톤별 자리 (L / C):
//     wash    .225 / .048   면 — 지면 바로 위, 색으로만 갈린다
//     edge    .330 / .078   wash 의 hover · outline 테두리
//     solid   .660 / .150   채운 면 (밝은 채움 + 어두운 글자 — 불변식 C)
//     solidFg .215 / .050   solid 위 글자
//     ink     .790 / .110   어두운 면 위 글자
//
// ⚠ edge 만 접기에서 벗어난다(엄밀한 거울은 L .305). 거기서는 canvas 위 1.42 로
// border.base(1.35)와 거의 같아 **outline 버튼의 테두리가 안 보인다.** .330 으로
// 올려 1.50~1.60 을 준다 — 대신 soft 의 hover 폭이 ΔL .104 로 라이트(.073)보다 넓다.
//
// ✅ **그 구조 문제는 풀렸다** (2026-09-09). 여기 "edge 가 두 일(테두리 · hover 면)을
// 겸한다" 고 적어 둔 게 원인이었고, 자리를 갈라 `edgeStrong` 을 신설했다. edge 는 이제
// wash 의 괘선 + soft 의 hover 면만 지고, outline 테두리는 edgeStrong 이 진다.
// 다크 edgeStrong 은 **가장 밝은 면(well)** 위에서 3:1 이 되는 자리다 — 이 파일이
// solid 를 well 기준으로 잡은 것과 같은 기준이라, 트랙 위에 얹혀도 테두리가 산다.
//
// 계약 (전 항목 통과):
//     solid↔well     4.56~5.25  (비텍스트 3:1)
//     solidFg↔solid  5.29~5.93  (AA 4.5)
//     ink↔wash       8.55~9.09  · ink↔raised 9.60~10.46
//
// ⚠ **라이트 solidFg 는 아직 AA 미달이다** (3.91~4.21, error 가 최악). 라이트는 채움을
// 더 진하게 내리면 풀리므로 구조가 아니라 값의 문제다. 이번 범위 밖이라 남겨 둔다.
//
// ⚠ **Banner 는 채운 면 위 글자를 solidFg 로 쓴다.** 한때 `paper.raised` 로 하드코딩돼
// 있었는데 다크의 raised 는 최암이라 2.24~2.45 였다. 되돌리지 말 것.
const ACCENT_DARK = {
  info: { solid: "#5492ec", solidFg: "#0a1930", ink: "#8ebcff", wash: "#0d1c32", edge: "#1a355d", edgeStrong: "#4c6fa3" },
  success: { solid: "#32ac64", solidFg: "#03200e", ink: "#81cf99", wash: "#062211", edge: "#094021", edgeStrong: "#3a7b52" },
  warning: { solid: "#c58300", solidFg: "#271500", ink: "#e4b066", wash: "#291800", edge: "#4c2e00", edgeStrong: "#8e672c" },
  error: { solid: "#df6768", solidFg: "#2d0f0f", ink: "#f99e9b", wash: "#2f1211", edge: "#572223", edgeStrong: "#a15a59" },
} as const;

const PRIMARY_DARK = {
  base: "#e8e8ea", // 일꾼 면 — 순백은 딥다크 위에서 튄다. soft white 로 눌러도 "가장 밝은 = primary" 유지
  hover: "#d6d6d9", // 밝은 면은 hover 때 살짝 어두워진다
  fg: "#18181b",
} as const;

const FOCUS_DARK = {
  ring: "#5492ec", // accent.info.solid(dark) 와 같은 값 — 한 곳에서 굳힌다
} as const;

// ⚠⚠ hover 가 다크 면 사다리를 망가뜨리고 있었다. `.055` 는 라이트(`.05`)와 비슷한
// 숫자로 읽혔지만 **지각적으로는 1.9 배**였다. 블렌드는 sRGB 8bit 에서 일어나고
// 밝기 곡선은 검정 근처에서 가파르다 — 어두운 면에 밝은 색을 얹으면 크게 움직이고,
// 밝은 면에 어두운 색을 얹으면 조금 움직인다. 같은 alpha 가 방향에 따라 다른 크기다:
//
//     라이트  잉크 .05  를 well 에  → ΔL .0305   (사다리 한 칸쯤)
//     다크    흰빛 .055 를 well 에  → ΔL .0584   (사다리 **세 칸**)
//
// 그래서 hover 하나가 면을 통째로 건너뛰었고 **Tabs 가 눌려 있었다** — 트랙 위에서
// hover 된 *비활성* 탭이 활성 pill 을 따라잡아, raised 를 내릴 수 없었다. 라이트엔
// 이 문제가 없다: 잉크 오버레이는 비활성 탭을 활성 pill 에서 *멀어지는* 쪽으로 민다.
// **다크에서만 오버레이가 깊이와 같은 방향이라, 상태와 층이 같은 축에서 경쟁한다.**
//
// alpha 가 아니라 **ΔL 로 맞춘다.** `.036` 은 canvas 위 ΔL .0347 — 라이트 .0329 의
// 1.05 배다. selected·active 는 이미 라이트의 1.07·1.14 배라 그대로 둔다.
//
// 틴트도 캐스트를 탄다 — 라이트가 순검정이 아니라 ink 계열(24,25,28)인 것의 거울로,
// 다크는 순백이 아니라 r·g 를 내린 (251,252,255)다. alpha 가 작아 실측은 안 움직이지만,
// 나중에 alpha 를 올려도 캐스트가 어긋나지 않는다.
const INTERACTION_DARK = {
  hover: "rgba(251, 252, 255, 0.036)", // 깊은 base 위 맑은 터치 — ΔL 로 맞춘 값 (0.055→0.036)
  selected: "rgba(251, 252, 255, 0.10)", // 선택·활성 — 과하게 밝지 않게 (0.14→0.10)
  active: "rgba(251, 252, 255, 0.13)",
} as const;

const SCRIM_DARK = "rgba(4, 4, 8, 0.58)"; // 다크 캔버스 위에서도 앞면을 확실히 띄우게 더 짙게. 캐스트를 탄 딥 스톤

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
