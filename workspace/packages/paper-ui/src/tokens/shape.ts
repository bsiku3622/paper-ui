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

// ───── radius — interaction(단일) · layout(3 단) · full(scope 없음) ─────────
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
//
// `full` 은 사다리의 끝이 아니라 **사다리 밖**이다 — 999px 은 크기가 아니라 "높이의
// 절반까지" 라는 규칙이라, 어디에 얹히느냐로 실제 반경이 달라진다. 그래서 intent 로
// 갈리지 않는다(알약 버튼도 알약 컨테이너도 같은 값을 쓴다). interaction·layout 과
// 나란한 셋째 가지로 둔다.
//
// ⚠ 이 값은 constants 서랍(옛 `pillRadius`)에 있었다. 이름은 맞았는데 자리가 틀렸다 —
// radius 축을 읽는 사람에게 알약이 안 보였고, 쓰려면 축 밖을 뒤져야 했다. 실제로 데모의
// hero CTA 는 라이브러리 밖에서 CSS 로 버튼 모서리를 덮어쓰고 있었다.
// **축이 자기 최대값을 못 들면 소비처가 축을 우회한다.**

export const RADIUS_LAYOUT_SIZES = ["sm", "md", "lg"] as const;
export type RadiusLayoutSize = (typeof RADIUS_LAYOUT_SIZES)[number];

export const SHAPE_RADIUS = {
  interaction: REM(6), // Button·Field·Badge·Select — 날만 죽인 6
  layout: {
    sm: REM(6), // Tooltip·Popover — 작은 면은 interaction 과 같은 곡선
    md: REM(8), // Card ◀ anchor
    lg: REM(12), // Modal·큰 면
  },
  full: "999px", // 알약 — 높이의 절반. intent 로 안 갈린다(어느 면에나 같은 값)
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

// ───── input paddingInline — 입력칸 전용 가로 여백 (3 단) ───────────────────
//
// **보이는 잉크를 정사각으로 맞춘다.** 한 줄 입력의 세로 잉크는 높이가 정한다:
// (height − 글자 14) / 2 = 8 · 10 · 13. 가로는 테두리 1px도 함께 보이므로 CSS padding은
// 한 픽셀 작은 7 · 9 · 12가 된다. Field·Select·Textarea가 이 값을 함께 쓴다.
//
// 버튼은 이 표를 안 쓴다. 거기 라벨은 상자를 *정의하는* 글자라 좌우가 넉넉해야 형태가
// 살고, 입력칸은 상자가 먼저 있고 값이 그 안에 놓이는 자리다(shadcn 버튼 16 · 입력 12,
// Ant 15 · 11 도 같은 방향으로 갈라 둔다).
//
// 이 값은 한때 답답하다는 이유로 10 · 12 · 15까지 벌렸지만, 아이콘과 chevron이 들어간
// Field·Select에서 좌우만 길어져 비대칭이 더 크게 읽혔다. 높이를 키우면 Button과의 정렬과
// 34px 밀도 앵커가 깨지므로, 높이는 유지하고 공통 form 여백을 줄이는 쪽을 최종 선택했다.

export const INPUT_PADDING_X = {
  sm: REM(7), // 테두리 포함 잉크 8 (세로 8)
  md: REM(9), // 테두리 포함 잉크 10 (세로 10) ◀ anchor
  lg: REM(12), // 테두리 포함 잉크 13 (세로 13)
} as const;

// ───── textarea paddingBlock — 글 상자의 세로 여백 (3 단) ───────────────────
//
// **가로에서 세로를 계산한다** — 여기서는 정사각이 뜻을 갖는다. 글이 여러 줄로 흐르면
// 위·아래·좌·우가 다 보이기 때문이다(한 줄짜리 Field 는 좌우만 보인다).
//
//   paddingBlock = inputPaddingX − 반 줄 여백 3.5
//   (반 줄 여백 = (줄상자 21 − 글자 14) / 2. 줄상자가 글자 위아래에 이미 갖고 있는 몫이라,
//    그만큼 빼야 잉크가 가로와 같은 자리에 앉는다. 테두리는 양쪽에 똑같이 붙어 상쇄된다.)
//
// md 기준 1 + 5.5 + 3.5 = 10 = 1 + 9. 선언값을 정사각(9 / 9)으로 맞추면 되레 첫 줄이
// 왼쪽 여백보다 3.5 내려간다 — 눈이 읽는 건 선언값이 아니라 잉크의 자리다.
//
// ⚠ **여러 줄은 가로 여백이 매 줄 눈에 걸린다.** 글이 넘어가는 상자는 줄마다 오른쪽 벽에
// 닿으므로, 같은 값이라도 Field 보다 좁게 느껴진다.

export const TEXTAREA_PADDING_Y = {
  sm: REM(3.5), //  7 − 3.5
  md: REM(5.5), //  9 − 3.5 ◀ anchor
  lg: REM(8.5), // 12 − 3.5
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

// ───── icon — 아이콘·스피너의 아트보드 (3 단) ───────────────────────────────
//
// ⚠ **이 값은 아트보드지 잉크가 아니다.** Icon 은 viewBox 24 짜리 path 를 받아 그리는데,
// 아이콘 규격(lucide 등)은 그 24 안에 여백을 두고 18~20 만 채운다. 그래서 아트보드 16 은
// 화면에서 12~13 으로 읽힌다 — 같은 16 인 Checkbox 는 16 이 통째로 잉크(채운 사각형)라,
// 숫자가 같은데도 아이콘만 한 단 작아 보였다.
//
// 그래서 한 단 올렸다(14 · 16 · 18 → 16 · 18 · 20). md 18 이면 잉크가 13.5~15 로 나와
// Checkbox 16 과 같은 무게로 앉는다. 20 까지 올리면 이번엔 아이콘이 체크박스보다 커
// 보인다(실측 비교로 고름).
//
// ⚠ 이름이 `dot` 이었다. status dot 은 이 축을 안 쓴다(Badge 는 0.5em, 유틸 dot 은 자기
// 값) — 소비처는 Icon 과 Spinner 둘뿐이라 이름이 축을 잘못 가리키고 있었다.

export const SHAPE_ICON = {
  sm: REM(16),
  md: REM(18), // ◀ anchor (Icon 기본)
  lg: REM(20),
} as const;

// ───── badge — 인라인 라벨 높이 사다리 (3 단) ───────────────────────────────
//
// control 높이(28~40)보다 낮은 열. 낱말 하나를 담는 pill. md=22 anchor.

export const SHAPE_BADGE = {
  sm: REM(20),
  md: REM(22), // ◀ anchor
  lg: REM(24),
} as const;

// ───── badge paddingInline — 배지 전용 가로 여백 (3 단) ─────────────────────
//
// 배지는 컨트롤이 아니다. 컨트롤의 가로 여백은 세로 여백에 대한 비(1.25~1.31)로
// 잡히는데, 배지는 20~24 짜리 상자에 18 짜리 줄상자가 들어가 세로가 0~2 밖에 안 남는다
// — 나눌 분모가 없다. 그래서 자기 사다리를 따로 든다.
//
// **높이와 같은 보폭으로 움직인다(20·22·24 ↔ 6·8·10, 둘 다 Δ2).** 그래야 세 크기가
// 같은 실루엣의 축소·확대로 읽힌다.
//
// ⚠ 예전엔 Box 여백 사다리(padding.{xs,sm,md}.interaction = 4 · 8 · 12)를 빌려 썼다.
// 그 사다리는 Δ4 라 높이보다 두 배 빨리 벌어졌고, 글자가 12 로 고정된 뒤 어긋남이
// 드러났다 — sm 은 4px 여백에 12px 글자가 눌려 답답했고 lg 는 12px 이 헐거웠다.
// **Box 여백을 컨트롤에 빌리지 말 것** 이라는 규칙이 배지에도 그대로 걸린다
// (CONTROL_PADDING_X 가 같은 이유로 떨어져 나왔다).

export const BADGE_PADDING_X = {
  sm: REM(6),
  md: REM(8), // ◀ anchor (값은 그대로 — 양 끝만 안으로 모았다)
  lg: REM(10),
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

// ───── switch — 트랙·손잡이 사다리 (3 단) ───────────────────────────────────
//
// w(트랙 가로) · h(트랙 세로) · thumb(손잡이). 켜짐 이동은 css 가 이 값으로 calc.
//
// **묶는 규칙이 뒤집혔다 — 이제 손잡이가 아니라 전체 실루엣이 Checkbox 를 따라간다.**
//   옛 규칙: thumb = checkbox 변(16) → 트랙이 20 이 되어 체크박스보다 늘 4 컸다.
//   새 규칙: thumb = checkbox 변 − 2 → 트랙 = checkbox + 2. 나란히 세우면 높이가 맞는다.
// 스위치는 체크박스와 같은 자리(폼의 한 줄)에 서는데, 폭이 트랙 두 배라 같은 높이여도
// 면적이 세 배다. 높이까지 크면 그 줄에서 스위치만 튄다.
//
// 가로는 손잡이가 자기 크기만큼 이동하는 폭이다 — w = thumb × 2 + 여백 2 × 2.
// 그래서 **이동 거리 = w − h** 가 되고(양쪽 여백이 (h − thumb) / 2 로 같으므로),
// Switch.css.ts 는 이 항등식 하나로 켜짐 위치를 계산한다.

export const SHAPE_SWITCH = {
  sm: { w: REM(30), h: REM(17), thumb: REM(13) }, // checkbox 15
  md: { w: REM(32), h: REM(18), thumb: REM(14) }, // ◀ anchor — checkbox 16
  lg: { w: REM(36), h: REM(20), thumb: REM(16) }, // checkbox 18
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
// 원칙 4: "떠 있는 것만 지속 그림자를 갖는다". 붙어있는 면(Button·Field·Card·Table)은
// resting 그림자 없음 — semantic Form hover의 일시적 pigment 피드백만 아래 helper로 예외다.
// radius·size 와 나란한 shape 토큰일 뿐,
// "elevation" 같은 추상 축이 아니다 (그 이름은 surface 의 'raised' 와 충돌했다 —
// 떠오른 흰 면(raised)은 그림자 없이 뜨는데 elevation.raised 는 그림자였다).
//
// overlay        — 자유롭게 뜬 것 (Modal · Tooltip · Popover · 제품 목업).
// overlayMinimal — 아주 살짝 뜬 것 (Switch 손잡이 등). overlay 결의 최소치.

// 곡선을 조인 만큼 그림자도 조였다(24px → 18px blur) — 얕은 모서리에 넓은 blur 를
// 두면 형태의 윤곽과 그림자의 윤곽이 어긋나 떠 있는 게 흐릿해진다.

export const SHADOW = {
  // 2026-09-07 — lab 의 Lozenge 결로 교체. 무거운 단일 그림자 대신 낮고 푸른 기가 도는
  // 두 겹이다. Vercel·Stripe 가 공통으로 명시하는 규칙("never a single heavy drop-shadow")
  // 이기도 하고, 흰 면 위에서 회색 그림자보다 덜 탁하다.
  overlay: "0 8px 24px 0 rgba(0, 55, 112, 0.08), 0 2px 6px 0 rgba(0, 55, 112, 0.04)",
  overlayMinimal: "0 1px 3px 0 rgba(0, 55, 112, 0.08)",
} as const;

// 다크 그림자 — near-black 은 어두운 면 위에서 사라져 elevation 단서를 잃는다. 순검정을
// 더 짙고 넓게 깔아 떠오름을 살린다. theme.css.ts 가 [data-theme="dark"] 스코프에 이
// 세트로 shadow var 를 덮어쓴다(색과 함께, shape 축은 그대로).
export const SHADOW_DARK = {
  overlay: "0 8px 22px -5px rgba(0, 0, 0, 0.62), 0 3px 7px -2px rgba(0, 0, 0, 0.5)",
  overlayMinimal: "0 1px 2px 0 rgba(0, 0, 0, 0.45)",
} as const;

// semantic Form의 hover는 elevation이 아니라 상태 pigment가 잠깐 번지는 피드백이다.
// 색은 status마다 달라 CSS var 하나로 고정할 수 없으므로, geometry와 농도를 이 helper에
// 모으고 소비처는 accent.solid만 건넨다. 아래로 떨어뜨리지 않은 0/0 offset이 핵심이다.
export const semanticFormHoverShadow = (pigment: string): string =>
  `0 0 ${REM(12)} color-mix(in srgb, ${pigment} 22%, transparent)`;

// z 층 tier 는 shape 가 아니라 layout 책임 — tokens/layout.ts 로 옮겼다.

// ───── constants — 전역 1D ──────────────────────────────────────────────────

export const SHAPE_CONSTANTS = {
  borderWidth: "1px",
  focusRingWidth: "2px",
  focusRingOffset: "2px",
  iconStrokeWidth: "1.75",
  overlayBlur: "2px",
  textureCell: "16px",
} as const;

// ───── atom intrinsic — ladder 안 맞는 atom·컴포넌트 자체 1D ────────────────
//
// 5 단 ladder 에 안 맞아 자기 값을 갖는 자리. 여기 모아두면 컴포넌트가 raw 리터럴
// 대신 토큰을 참조한다 (상위 레이어 하드코딩 제거의 근거).
//
// ⚠ **이 서랍은 절반이 안 쓰인다.** checkbox · checkMark · checkboxRadius · badgeHeight ·
// radioDot · spinner 는 각자 3 단 사다리(SHAPE_CHECKBOX · SHAPE_BADGE · SHAPE_ICON)가
// 생기면서 소비처를 잃었는데 값만 남아 있다. 지금 지우지 않는 건 이번 작업 범위 밖이라서고,
// 남겨 두는 값이 아니라 **정리 대상**이다. 새 코드는 사다리를 본다.
// (switchWidth · switchHeight · switchThumb 셋은 지웠다 — "손잡이 = checkbox" 라는 옛
//  규칙을 주석으로 못 박고 있어, 뒤집힌 새 규칙과 나란히 두면 둘 중 뭐가 참인지 알 수 없다.)

export const ATOM_INTRINSIC = {
  checkbox: REM(16), //        Checkbox 크기
  checkMark: REM(8), //        체크 표식 폭
  checkboxRadius: REM(3), //   Checkbox 모서리 (작아서 radius 사다리와 별도)
  badgeHeight: REM(22), //     Badge 높이 (control 34 보다 낮은 인라인 라벨)
  navbar: REM(52), //          Navbar · 사이트 GNB 바 높이
  // ⚠ tabsTrackPad 는 여백이면서 **동심 반경의 분모**다. 각진 탭(shape="default")의 항목
  //   반경을 `radius.interaction − tabsTrackPad` 로 계산하므로, 이 값을 건드리면 안쪽
  //   곡선이 같이 움직인다. 3 → 6 이면 항목 반경이 0 이 되어 안쪽만 직각이 된다.
  //
  // ⚠ 옛 `tabsItemPadX`(9px)는 지웠다. 항목 여백을 사다리보다 한 단 좁게 두려던 값인데,
  //   tabItemSize 가 뒤에 와서 공통 사다리(10 · 13 · 17)로 덮고 있었다 — 살아 있는 척만
  //   하는 값이었다. 탭도 컨트롤이라 사다리를 그대로 진다.
  tabsTrackGap: "1px", //      세그먼트 트랙 항목 간격
  tabsTrackPad: "3px", //      세그먼트 트랙 안쪽 여백 — 2px 면 활성 면이 트랙에 낀다
  modalWidth: REM(432), //     Modal 기본 최대 폭 (27rem)
  selectArrow: REM(10), //     Select 화살표 아이콘 크기 (0.625rem)
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
  inputPaddingX: INPUT_PADDING_X,
  textareaPaddingY: TEXTAREA_PADDING_Y,
  controlFontSize: CONTROL_FONT_SIZE,
  icon: SHAPE_ICON,
  badge: SHAPE_BADGE,
  badgePaddingX: BADGE_PADDING_X,
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
