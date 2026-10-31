// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Typography — 타이포그래피 시스템                                         ║
// ║                                                                          ║
// ║ Palette가 원본 수치를 소유한다. 역할과 preset은 이 값을 조합한다.        ║
// ║ 컴포넌트는 임의 수치 대신 스타일을 선택한다.                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// 구조 —
//   TYPOGRAPHY_SOURCE          fontSize · weight · leading · tracking · family 원본값 (dp · em)
//   TYPOGRAPHY_VALUES          원본을 굽는 트리 → --pui-typography-palette-* (tokens/variables.css.ts)
//   TYPOGRAPHY                 tokens.typography = palette · role · preset 의 var() 참조
//   ROLE_SPEC · PRESET_SPEC    역할과 preset 이 Palette 에서 고르는 값
//   CODE_SPEC                  코드 블록이 Palette 에서 고르는 값
//   FONT_STYLESHEETS           서체를 불러오는 주소
//
// 선언으로 조합하는 자리는 typography-recipes.ts 다 — 역할 · preset · 코드 · 강조의 규칙을 거기서 만든다.
//
// 서체 —
//   Pretendard 를 맨 앞에 둔다. 라틴·한글을 한 폰트가 함께 그려 굵기가 균형 잡힌다.
//   -apple-system 을 앞에 두면 라틴만 San Francisco 로, 한글은 Apple SD Gothic Neo
//   로 갈라져 같은 weight 라도 한글이 얇게 보인다 — Pretendard 는 SF 결을 모방하며
//   한 몸으로 렌더해 그 어긋남이 없다. -apple-system 은 Pretendard 미로드 시 fallback.
//   400 · 450 · 500 · 600 · 650 · 700 사다리는 Pretendard Variable 을 전제한다 — 서체가 없으면
//   시스템 폰트가 가까운 굵기로 접는다 (행간이 고정이라 기하는 그대로다).
//   mono 는 family 축이다 — 어느 크기에도 얹을 수 있고, 코드·토큰 같은 기술적
//   자리에만 쓴다. 숫자를 무조건 등폭으로 두지 않는다 (표의 숫자 열은 sans + tabular-nums).

import { buildVarTree, em, keys, lengths, mapValues, rem } from "./helpers";

// ───── Typography Source — 원본 수치 ─────────────────────────────────────────
//
// 컴포넌트가 임의 숫자를 하드코딩하지 않게, 굵기도 Palette 토큰이다. Button ·
// Navigation 등은 여기서 골라 역할별 preset을 완성한다.
//
// 450은 입력값을 위한 보정 단계다 — 작은 sans 글씨가 Retina에서 힘이 빠지지 않게 Field · Textarea 의
// 값에만 쓴다. 읽기 본문은 500 이다. Button primary는 Demo 기준의 strong weight를 별도 사용한다.

const FAMILY = {
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  // 시스템 mono 를 앞에 — SF Mono(macOS)·Cascadia(Windows)는 x-height 가 커서
  // Pretendard 옆에서 크기·무게가 맞는다. 라틴·숫자는 여기서 그린다. 한글은 이들에
  // 글리프가 없어 뒤의 CJK mono(D2Coding)로 떨어진다 — 한글도 등폭이 된다.
  // (Pretendard 는 proportional 이라 mono 스택에서 뺐다 — 넣으면 한글이 sans 로 샌다.
  //  소비 앱은 D2Coding 같은 한글 mono 를 로드해야 한다 — docs/get-started/install.md 폰트 참고.)
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'D2Coding', monospace",
} as const;

export const TYPOGRAPHY_SOURCE = {
  family: FAMILY,
  fontSize: { "12": 12, "13": 13, "14": 14, "16": 16, "20": 20, "24": 24, "32": 32 },
  // 유동 단계 — 크기가 뷰포트 폭(vw)을 따라 min 과 max 사이에서 자라고, 행간은 단위 없는 비율이다.
  // 고정 dp 사다리의 유일한 예외이며 hero 역할만 쓴다.
  fluid: { hero: { min: 36, vw: 6, max: 60, leading: 1.04 } },
  weight: {
    regular: 400, // caption처럼 가벼운 보조 정보
    normal: 450, // 입력값 — Field · Textarea
    medium: 500, // 읽기 본문 · UI 컨트롤 — Button · Tab · Nav
    strong: 650, // 기본 primary action — Demo button anchor
    semibold: 600, // 라벨 · 소제목 · 활성/강조
    bold: 700, // 제목 · 특대
  },
  leading: { "16": 16, "20": 20, "24": 24, "28": 28, "32": 32, "40": 40 },
  tracking: { mono: -0.04, tighter: -0.035, tight: -0.02, snug: -0.01, normal: 0, wide: 0.01 },
  // 밑줄은 글자의 장식이라 글자 크기(em)를 따른다.
  decoration: { underlineOffset: 0.2 },
  // mono는 sans 대비 시각 크기가 커 보여 동일한 잉크 크기를 위해 살짝 줄인다.
  monoSizeScale: 0.95,
  // 문장 속 코드는 둘러싼 글자의 비율로 줄어든다 — inline 은 문단, compact 는 표 칸.
  codeScale: { inline: 0.85, compact: 0.8 },
  // 줄바꿈은 서체가 정한다. 한글 산문은 어절 사이에서만 끊고, 식별자는 어디서든 끊는다.
  breaking: {
    sans: { wordBreak: "keep-all", overflowWrap: "break-word" },
    mono: { wordBreak: "normal", overflowWrap: "anywhere" },
  } as const satisfies Record<keyof typeof FAMILY, { wordBreak: "keep-all" | "normal"; overflowWrap: "break-word" | "anywhere" }>,
} as const;

// ───── VALUES — emit 대상 트리 ─────────────────────────────────────────────
//
// Palette를 buildVarTree가 --pui-typography-palette-* CSS var로 내보낸다. 역할과 preset은
// 아래에서 이 Palette var를 조합해 참조한다.

export const TYPOGRAPHY_VALUES = {
  palette: {
    family: TYPOGRAPHY_SOURCE.family,
    fontSize: {
      ...lengths(TYPOGRAPHY_SOURCE.fontSize),
      ...mapValues(TYPOGRAPHY_SOURCE.fluid, ({ min, vw, max }) => `clamp(${rem(min)}, ${vw}vw, ${rem(max)})`),
    },
    weight: mapValues(TYPOGRAPHY_SOURCE.weight, String),
    leading: {
      ...lengths(TYPOGRAPHY_SOURCE.leading),
      ...mapValues(TYPOGRAPHY_SOURCE.fluid, ({ leading }) => String(leading)),
    },
    tracking: lengths(TYPOGRAPHY_SOURCE.tracking, em),
    decoration: lengths(TYPOGRAPHY_SOURCE.decoration, em),
    monoSizeScale: String(TYPOGRAPHY_SOURCE.monoSizeScale),
    codeScale: mapValues(TYPOGRAPHY_SOURCE.codeScale, String),
  },
} as const;

const palette = buildVarTree(TYPOGRAPHY_VALUES, ["typography"]).palette;

export const TEXT_FAMILIES = keys(TYPOGRAPHY_SOURCE.family);
export type TextFamily = keyof typeof TYPOGRAPHY_SOURCE.family;

export const FONT_STYLESHEETS = {
  sans: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css",
  mono: "https://cdn.jsdelivr.net/gh/fonts-archive/D2Coding@5ac6fc6fada70f1d8a8561cec826722574c51a6e/D2Coding.css",
} as const satisfies Record<TextFamily, string>;

// ───── Control size — 컨트롤 크기 축 ───────────────────────────────────────
//
// Typography의 preset과 Shape의 geometry가 이 같은 축을 읽는다.

export const CONTROL_SIZES = ["sm", "md", "lg"] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

// ───── Role · Preset — Palette 값을 고르는 명세 ────────────────────────────

type StyleKeys = {
  size: keyof typeof TYPOGRAPHY_SOURCE.fontSize | keyof typeof TYPOGRAPHY_SOURCE.fluid;
  weight: keyof typeof TYPOGRAPHY_SOURCE.weight;
  leading: keyof typeof TYPOGRAPHY_SOURCE.leading | keyof typeof TYPOGRAPHY_SOURCE.fluid;
  tracking: keyof typeof TYPOGRAPHY_SOURCE.tracking;
};

export const ROLE_SPEC = {
  hero: { size: "hero", weight: "bold", leading: "hero", tracking: "tighter" },
  display: { size: "32", weight: "bold", leading: "40", tracking: "tight" },
  title: { size: "24", weight: "bold", leading: "32", tracking: "snug" },
  heading: { size: "20", weight: "semibold", leading: "28", tracking: "normal" },
  subheading: { size: "16", weight: "semibold", leading: "24", tracking: "normal" },
  body: { size: "14", weight: "medium", leading: "20", tracking: "normal" },
  caption: { size: "13", weight: "regular", leading: "16", tracking: "normal" },
  label: { size: "12", weight: "semibold", leading: "16", tracking: "wide" },
} as const satisfies Record<string, StyleKeys>;

// hero·display·title·heading·subheading은 제목 계층, body·caption·label은 사용 역할이다. 서체(mono)는
// 위계가 아니라 family 축이라 여기 없다 — 어느 variant 에도 얹는다.
export const TEXT_VARIANTS = keys(ROLE_SPEC);
export type TextVariant = keyof typeof ROLE_SPEC;

// 컨트롤 상자가 담을 수 있는 글자 — 크기만 바꾸는 fontSize 탈출구의 값이다.
export const CONTROL_FONT_SIZES = ["label", "caption", "body"] as const satisfies readonly TextVariant[];
export type ControlFontSize = (typeof CONTROL_FONT_SIZES)[number];

// 문장 속 강조가 고르는 굵기. 이름은 Palette 의 이름 그대로다.
export const EMPHASES = ["regular", "medium", "semibold", "bold"] as const satisfies readonly (keyof typeof TYPOGRAPHY_SOURCE.weight)[];
export type Emphasis = (typeof EMPHASES)[number];

// 링크의 밑줄이 드러나는 때. always 는 늘 밑줄이 있고(문장 안 링크가 색만으로 본문과 구분되지 않는다), hover 는 가리킬 때만 그린다.
export const LINK_UNDERLINES = ["always", "hover"] as const;
export type LinkUnderline = (typeof LINK_UNDERLINES)[number];

const BUTTON_MEDIUM = {
  sm: { size: "13", weight: "medium", leading: "16", tracking: "normal" },
  md: { size: "13", weight: "medium", leading: "16", tracking: "normal" },
  lg: { size: "14", weight: "medium", leading: "16", tracking: "normal" },
} as const satisfies Record<ControlSize, StyleKeys>;
const BUTTON_STRONG = {
  sm: { ...BUTTON_MEDIUM.sm, weight: "strong" },
  md: { ...BUTTON_MEDIUM.md, weight: "strong" },
  lg: { ...BUTTON_MEDIUM.lg, weight: "strong" },
} as const satisfies Record<ControlSize, StyleKeys>;
const FIELD_FONT = {
  sm: { size: "13", weight: "normal", leading: "16", tracking: "normal" },
  md: { size: "13", weight: "normal", leading: "16", tracking: "normal" },
  lg: { size: "14", weight: "normal", leading: "16", tracking: "normal" },
} as const satisfies Record<ControlSize, StyleKeys>;
// leading 16 은 글자 한 줄이고 Shape 의 안쪽 여백이 읽는 값이다. inputLeading 은 입력값이 앉는 줄상자 —
// caret 과 한글 fallback glyph 가 눌리지 않을 만큼 높다.
const FIELD_CONTROL = {
  sm: { ...FIELD_FONT.sm, inputLeading: "20" },
  md: { ...FIELD_FONT.md, inputLeading: "20" },
  lg: { ...FIELD_FONT.lg, inputLeading: "20" },
} as const satisfies Record<ControlSize, StyleKeys & { inputLeading: keyof typeof TYPOGRAPHY_SOURCE.leading }>;
const TEXTAREA_CONTROL = {
  sm: { ...FIELD_FONT.sm, leading: "20" },
  md: { ...FIELD_FONT.md, leading: "20" },
  lg: { ...FIELD_FONT.lg, leading: "20" },
} as const satisfies Record<ControlSize, StyleKeys>;
const BADGE_PRESET = { size: "12", weight: "medium", leading: "16", tracking: "normal" } as const satisfies StyleKeys;

export const PRESET_SPEC = {
  button: { medium: BUTTON_MEDIUM, strong: BUTTON_STRONG },
  field: FIELD_CONTROL,
  textarea: TEXTAREA_CONTROL,
  badge: BADGE_PRESET,
} as const;

export const CONTROL_PRESETS = keys(PRESET_SPEC);
export type ControlPreset = keyof typeof PRESET_SPEC;

// 코드 블록 — mono 13 / 20, 입력값과 같은 normal 굵기. 문장 속 코드는 크기만 비율(codeScale)로 줄인다.
export const CODE_SPEC = {
  block: { size: "13", weight: "normal", leading: "20" },
} as const satisfies Record<string, Pick<StyleKeys, "size" | "weight"> & { leading: keyof typeof TYPOGRAPHY_SOURCE.leading }>;

// ───── typography — Palette var 를 조합한 역할과 preset ─────────────────────

type Refs = { size: string; weight: string; leading: string; tracking: string };
const refsOf = (spec: StyleKeys): Refs => ({
  size: palette.fontSize[spec.size],
  weight: palette.weight[spec.weight],
  leading: palette.leading[spec.leading],
  tracking: palette.tracking[spec.tracking],
});

export const TYPOGRAPHY = {
  palette,
  role: mapValues(ROLE_SPEC, refsOf),
  preset: {
    button: mapValues(PRESET_SPEC.button, (ladder) => mapValues(ladder, refsOf)),
    field: mapValues(PRESET_SPEC.field, (spec) => ({ ...refsOf(spec), inputLeading: palette.leading[spec.inputLeading] })),
    textarea: mapValues(PRESET_SPEC.textarea, refsOf),
    badge: refsOf(PRESET_SPEC.badge),
  },
} as const;

// variant 별 기본 ink — caption · label 은 secondary(부연/짧은 이름 자리).
export const TEXT_INK: Record<TextVariant, "primary" | "secondary"> = {
  hero: "primary",
  display: "primary",
  title: "primary",
  heading: "primary",
  subheading: "primary",
  body: "primary",
  caption: "secondary",
  label: "secondary",
};
