// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Text — 타이포그래피 시스템                                               ║
// ║                                                                          ║
// ║ 모든 수치의 단일 출처. 네 축이 직교한다 — size · weight · leading ·      ║
// ║ tracking. 각 축이 토큰이라 컴포넌트가 "0.875rem" 같은 raw 값을 박지      ║
// ║ 못한다. variant 는 이 축들을 조합한 7 단 위계일 뿐이다.                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 구조 —
//   SIZE · LEADING · TRACKING  7 단 variant 스케일 (정본 수치)
//   WEIGHT                     굵기 어휘 (variant 와 직교 — 컨트롤이 골라 씀)
//   FAMILY                     서체 축 (sans·mono) — variant 위에 교차. Text 의
//                              family prop 으로 고르고, .pui-mono 가 자간을 리셋
//   TEXT_SPEC                  variant = 위 축들의 조합
//   TEXT_VALUES.text           → tokens.text.{size,weight,leading,tracking,font}
//
// 서체 —
//   Pretendard 를 맨 앞에 둔다. 라틴·한글을 한 폰트가 함께 그려 굵기가 균형 잡힌다.
//   -apple-system 을 앞에 두면 라틴만 San Francisco 로, 한글은 Apple SD Gothic Neo
//   로 갈라져 같은 weight 라도 한글이 얇게 보인다 — Pretendard 는 SF 결을 모방하며
//   한 몸으로 렌더해 그 어긋남이 없다. -apple-system 은 Pretendard 미로드 시 fallback.
//   mono 는 family 축이다 — 어느 크기에도 얹을 수 있고, 코드·토큰 같은 기술적
//   자리에만 쓴다. 숫자를 무조건 등폭으로 두지 않는다 (표의 숫자 열은 sans + tabular-nums).

const REM = (px: number) => `${px / 16}rem`;

// ───── font — 서체 ──────────────────────────────────────────────────────────

export const FONT = {
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  // 시스템 mono 를 앞에 — SF Mono(macOS)·Cascadia(Windows)는 x-height 가 커서
  // Pretendard 옆에서 크기·무게가 맞는다. 라틴·숫자는 여기서 그린다. 한글은 이들에
  // 글리프가 없어 뒤의 CJK mono(D2Coding)로 떨어진다 — 한글도 등폭이 된다.
  // (Pretendard 는 proportional 이라 mono 스택에서 뺐다 — 넣으면 한글이 sans 로 샌다.
  //  소비 앱은 D2Coding 같은 한글 mono 를 로드해야 한다 — 앱 index.html 참고.)
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'D2Coding', monospace",
} as const;

// ───── weight — 굵기 어휘 (variant 와 직교) ─────────────────────────────────
//
// 컴포넌트가 "550" 같은 임의 숫자를 하드코딩하지 않게, 굵기도 토큰이다. Button ·
// Tab · Nav 는 여기서 골라 variant 기본 굵기를 덮는다.
//
// 값이 반 단계 무겁다 (450·550, not 400·500). dense 시스템이라 글씨가 작은데
// 400 은 Retina 에서 힘이 빠진다 — 작은 자리일수록 half-step 을 얹어 밀도에
// 눌리지 않게. 무거운 쪽(semibold·bold)은 이미 존재감이 있어 round 유지.
export const WEIGHT = {
  normal: "450", // 본문 · 부연 (읽기)
  medium: "550", // UI 컨트롤 — Button · Tab · Nav
  semibold: "600", // 라벨 · 소제목 · 활성/강조
  bold: "700", // 제목 · 특대
} as const;
export type WeightKey = keyof typeof WEIGHT;

// ───── variant — 7 단 컨텐츠 위계 ───────────────────────────────────────────
//
// display 부터 label 까지, 크기 내림차순. heading 위계가 셋(title·heading·
// subheading = h1·h2·h3) 이라 페이지·문서의 제목 계층이 또렷하다. 서체(mono)는
// 위계가 아니라 family 축이라 여기 없다 — 어느 variant 에도 얹는다.

export const TEXT_VARIANTS = [
  "display", // 랜딩 hero — 페이지당 단 한 자리의 큰 호흡
  "title", // 페이지 제목 (h1)
  "heading", // 섹션 제목 (h2)
  "subheading", // 카드 · 소제목 (h3)
  "body", // 본문 ◀ default
  "caption", // 부연 · 메타
  "label", // 폼 라벨 · 표 머리
] as const;
export type TextVariant = (typeof TEXT_VARIANTS)[number];

// ───── SIZE — variant 별 글자 크기 (base 16px) ──────────────────────────────
//
// body 14px 이 anchor — 복잡한 웹앱의 표준 밀도(shadcn text-sm · Atlassian).
// heading 셋은 22·18·15 로 한 단씩. label 은 12 로 가장 작지만 굵어서 또렷하다.

export const SIZE = {
  display: REM(32), // 2rem
  title: REM(22), // 1.375rem
  heading: REM(18), // 1.125rem
  subheading: REM(15), // 0.9375rem
  body: REM(14), // 0.875rem ◀ anchor
  caption: REM(13), // 0.8125rem
  label: REM(12), // 0.75rem
} as const;

// ───── LEADING — 행간 ───────────────────────────────────────────────────────
//
// 큰 글자는 촘촘하게(1.12~1.4), 읽는 본문은 넉넉하게(1.45~1.5).

export const LEADING = {
  display: "1.12",
  title: "1.25",
  heading: "1.35",
  subheading: "1.4",
  body: "1.5",
  caption: "1.45",
  label: "1.4",
} as const;

// ───── TRACKING — 자간 ──────────────────────────────────────────────────────
//
// 큰 글자는 조이고(음수), 작은 라벨은 살짝 벌린다(양수). 본문은 -0.006em 로
// 아주 미세하게만 — Retina 에서 sans 가 살짝 벌어져 보이는 걸 잡는 정도.

export const TRACKING = {
  display: "-0.03em",
  title: "-0.02em",
  heading: "-0.015em",
  subheading: "-0.01em",
  body: "-0.006em",
  caption: "0",
  label: "0.01em",
} as const;

// ───── TEXT_SPEC — variant = 축들의 조합 ────────────────────────────────────

type TextSpec = {
  size: string;
  weight: string;
  lineHeight: string;
  tracking: string;
};

export const TEXT_SPEC = {
  display: { size: SIZE.display, weight: WEIGHT.bold, lineHeight: LEADING.display, tracking: TRACKING.display },
  title: { size: SIZE.title, weight: WEIGHT.bold, lineHeight: LEADING.title, tracking: TRACKING.title },
  heading: { size: SIZE.heading, weight: WEIGHT.semibold, lineHeight: LEADING.heading, tracking: TRACKING.heading },
  subheading: { size: SIZE.subheading, weight: WEIGHT.semibold, lineHeight: LEADING.subheading, tracking: TRACKING.subheading },
  body: { size: SIZE.body, weight: WEIGHT.normal, lineHeight: LEADING.body, tracking: TRACKING.body },
  caption: { size: SIZE.caption, weight: WEIGHT.normal, lineHeight: LEADING.caption, tracking: TRACKING.caption },
  label: { size: SIZE.label, weight: WEIGHT.semibold, lineHeight: LEADING.label, tracking: TRACKING.label },
} as const satisfies Record<TextVariant, TextSpec>;

// variant 별 기본 잉크 농도 — label · caption 은 흐리게(부연 자리).
export const TEXT_INK: Record<TextVariant, "base" | "soft"> = {
  display: "base",
  title: "base",
  heading: "base",
  subheading: "base",
  body: "base",
  caption: "soft",
  label: "soft",
};

// ───── VALUES — emit 대상 트리 (tokens.text.*) ──────────────────────────────
//
// 네 축을 text 도메인으로 묶는다. buildVarTree 가 걸어 tokens.text.size.body
// = "var(--pui-text-size-body)" 를, theme.css.ts 가 :root 에 그 값을 emit 한다.

export const TEXT_VALUES = {
  text: {
    font: FONT,
    weight: WEIGHT,
    size: SIZE,
    leading: LEADING,
    tracking: TRACKING,
  },
} as const;
