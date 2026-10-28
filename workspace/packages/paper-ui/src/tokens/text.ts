// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Text — 타이포그래피 시스템                                               ║
// ║                                                                          ║
// ║ Typography Palette가 원본 수치를 소유한다. Text와 Control은 이 값을      ║
// ║ 조합한 완성 스타일이다. 컴포넌트는 임의 수치 대신 스타일을 선택한다.    ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// 구조 —
//   TYPOGRAPHY_PALETTE         fontSize · weight · leading · tracking · family 원본값
//   TEXT_SPEC                  의미 역할별 완성 스타일
//   CONTROL_SPEC               공유 사용처를 묶은 완성 Control 스타일
//   TEXT_VALUES.text.palette   → tokens.text.palette.* CSS variables
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
  //  소비 앱은 D2Coding 같은 한글 mono 를 로드해야 한다 — docs/get-started/install.md 폰트 참고.)
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'D2Coding', monospace",
} as const;

// mono는 sans 대비 시각 크기가 커 보여 동일한 잉크 크기를 위해 살짝 줄인다.
export const MONO_SIZE_SCALE = "0.95";

// ───── Typography Palette — 재사용하는 원자 값 ──────────────────────────────
//
// 컴포넌트가 임의 숫자를 하드코딩하지 않게, 굵기도 Palette 토큰이다. Button ·
// Navigation 등은 여기서 골라 역할별 preset을 완성한다.
//
// 450은 작은 sans 글씨가 Retina에서 힘이 빠지지 않도록 둔 보정 단계다.
// Button primary는 Demo 기준의 strong weight를 별도 사용한다.
export const TYPOGRAPHY_PALETTE = {
  family: FONT,
  fontSize: {
    "12": REM(12),
    "13": REM(13),
    "14": REM(14),
    "16": REM(16),
    "20": REM(20),
    "24": REM(24),
    "32": REM(32),
  },
  weight: {
    regular: "400", // caption처럼 가벼운 보조 정보
    normal: "450", // 본문 · 부연 (읽기)
    medium: "500", // UI 컨트롤 — Button · Tab · Nav
    strong: "650", // 기본 primary action — Demo button anchor
    semibold: "600", // 라벨 · 소제목 · 활성/강조
    bold: "700", // 제목 · 특대
  },
  leading: {
    "16": REM(16),
    "20": REM(20),
    "24": REM(24),
    "28": REM(28),
    "32": REM(32),
    "40": REM(40),
  },
  tracking: {
    mono: "-0.04em",
    tight: "-0.02em",
    snug: "-0.01em",
    normal: "0",
    wide: "0.01em",
  },
  // 밑줄은 글자의 장식이라 글자 크기(em)를 따른다.
  decoration: { underlineOffset: "0.2em" },
  monoSizeScale: MONO_SIZE_SCALE,
} as const;
export const WEIGHT = TYPOGRAPHY_PALETTE.weight;
export type WeightKey = keyof typeof WEIGHT;

// ───── variant — 역할별 텍스트 스타일 ───────────────────────────────────────
//
// display·title·heading·subheading은 제목 계층, body·caption·label은 사용 역할이다. 서체(mono)는
// 위계가 아니라 family 축이라 여기 없다 — 어느 variant 에도 얹는다.

export const TEXT_VARIANTS = [
  "display",
  "title",
  "heading",
  "subheading",
  "body",
  "caption",
  "label",
] as const;
export type TextVariant = (typeof TEXT_VARIANTS)[number];

// ───── Text · Control — Palette 값을 조합한 완성 스타일 ──────────────────────

type StyleKeys = {
  size: keyof typeof TYPOGRAPHY_PALETTE.fontSize;
  weight: keyof typeof TYPOGRAPHY_PALETTE.weight;
  leading: keyof typeof TYPOGRAPHY_PALETTE.leading;
  tracking: keyof typeof TYPOGRAPHY_PALETTE.tracking;
};

export const TEXT_SPEC = {
  display: { size: "32", weight: "bold", leading: "40", tracking: "tight" },
  title: { size: "24", weight: "bold", leading: "32", tracking: "snug" },
  heading: { size: "20", weight: "semibold", leading: "28", tracking: "normal" },
  subheading: { size: "16", weight: "semibold", leading: "24", tracking: "normal" },
  body: { size: "14", weight: "medium", leading: "20", tracking: "normal" },
  caption: { size: "13", weight: "regular", leading: "16", tracking: "normal" },
  label: { size: "12", weight: "semibold", leading: "16", tracking: "wide" },
} as const satisfies Record<TextVariant, StyleKeys>;

const BUTTON_REGULAR = {
  sm: { size: "13", weight: "medium", leading: "16", tracking: "normal" },
  md: { size: "13", weight: "medium", leading: "16", tracking: "normal" },
  lg: { size: "14", weight: "medium", leading: "16", tracking: "normal" },
} as const satisfies Record<"sm" | "md" | "lg", StyleKeys>;
const BUTTON_STRONG = {
  sm: { ...BUTTON_REGULAR.sm, weight: "strong" },
  md: { ...BUTTON_REGULAR.md, weight: "strong" },
  lg: { ...BUTTON_REGULAR.lg, weight: "strong" },
} as const satisfies Record<"sm" | "md" | "lg", StyleKeys>;
const FIELD_CONTROL = {
  sm: { size: "13", weight: "normal", leading: "16", tracking: "normal" },
  md: { size: "13", weight: "normal", leading: "16", tracking: "normal" },
  lg: { size: "14", weight: "normal", leading: "16", tracking: "normal" },
} as const satisfies Record<"sm" | "md" | "lg", StyleKeys>;
const TEXTAREA_CONTROL = {
  sm: { ...FIELD_CONTROL.sm, leading: "20" },
  md: { ...FIELD_CONTROL.md, leading: "20" },
  lg: { ...FIELD_CONTROL.lg, leading: "20" },
} as const satisfies Record<"sm" | "md" | "lg", StyleKeys>;
const BADGE_PRESET = { size: "12", weight: "medium", leading: "16", tracking: "normal" } as const satisfies StyleKeys;

export const CONTROL_SPEC = {
  button: { regular: BUTTON_REGULAR, strong: BUTTON_STRONG },
  field: FIELD_CONTROL,
  textarea: TEXTAREA_CONTROL,
  badge: BADGE_PRESET,
} as const;

// variant 별 기본 ink — caption · label 은 secondary(부연/짧은 이름 자리).
export const TEXT_CONTENT: Record<TextVariant, "primary" | "secondary"> = {
  display: "primary",
  title: "primary",
  heading: "primary",
  subheading: "primary",
  body: "primary",
  caption: "secondary",
  label: "secondary",
};

// ───── VALUES — emit 대상 트리 (tokens.text.*) ──────────────────────────────
//
// Typography Palette를 buildVarTree가 tokens.text.palette.* CSS var로 내보낸다.
// Text/Control 스타일은 tokens/index.ts에서 이 Palette var를 조합해 참조한다.

export const TEXT_VALUES = {
  text: {
    palette: TYPOGRAPHY_PALETTE,
  },
} as const;
