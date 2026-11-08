// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ Typography — 타이포그래피 시스템                                         ║
// ║                                                                          ║
// ║ Palette가 원본 수치를 소유한다. 역할과 preset은 이 값을 조합한다.        ║
// ║ 컴포넌트는 임의 수치 대신 스타일을 선택한다.                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// 구조 —
//   TYPOGRAPHY_SOURCE          fontSize · weight · leading · tracking · family 원본값 (dp · em)
//   TYPOGRAPHY_VALUES          원본을 굽는 트리 → --pui-typography-palette-* (tokens/variables.css.ts)
//   TYPOGRAPHY                 palette · role · preset 의 var() 참조 — 공개되는 tokens.typography 는 role · preset 뿐이다
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
//   400 · 450 · 500 · 600 · 700 사다리는 Pretendard Variable 을 전제한다 — 서체가 없으면
//   시스템 폰트가 가까운 굵기로 접는다 (행간이 고정이라 기하는 그대로다).
//   mono 는 family 축이다 — 어느 크기에도 얹을 수 있고, 코드·토큰 같은 기술적
//   자리에만 쓴다. 숫자를 무조건 등폭으로 두지 않는다 (표의 숫자 열은 sans + tabular-nums).

import { buildVarTree, em, keys, lengths, mapValues, rem } from "./helpers";
import type { ControlSize } from "./control-sizes";

// ───── Typography Source — 원본 수치 ─────────────────────────────────────────
//
// 컴포넌트가 임의 숫자를 하드코딩하지 않게, 굵기도 Palette 토큰이다. Button ·
// Navigation 등은 여기서 골라 역할별 preset을 완성한다.
//
// 450은 입력값을 위한 보정 단계다 — 작은 sans 글씨가 Retina에서 힘이 빠지지 않게 Field · Textarea 의
// 값에만 쓴다. 읽기 본문은 400, Button 은 500 이다.

const FAMILY = {
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  // 시스템 mono 를 앞에 — SF Mono(macOS)·Consolas(Windows)는 x-height 가 커서
  // Pretendard 옆에서 크기·무게가 맞는다. 라틴·숫자는 여기서 그린다. 한글은 이들에
  // 글리프가 없어 뒤의 CJK mono(D2Coding)로 떨어진다 — 한글도 등폭이 된다.
  // (Pretendard 는 proportional 이라 mono 스택에서 뺐다 — 넣으면 한글이 sans 로 샌다.
  //  소비 앱은 D2Coding 같은 한글 mono 를 로드해야 한다 — docs/get-started/install.md 폰트 참고.)
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'D2Coding', monospace",
} as const;

export const TYPOGRAPHY_SOURCE = {
  family: FAMILY,
  fontSize: { "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "20": 20, "24": 24, "32": 32, "48": 48 },
  // 유동 단계 — 크기가 뷰포트 폭(vw)을 따라 min 과 max 사이에서 자라고, 행간은 단위 없는 비율이다.
  // 고정 dp 사다리의 유일한 예외이며 hero 역할만 쓴다.
  fluid: { hero: { min: 44, vw: 5.2, max: 76, leading: 1.12 } },
  weight: {
    regular: 400, // 읽는 글 — lead · 본문 · caption
    normal: 450, // 입력값 — Field · Textarea
    medium: 500, // UI 컨트롤 — Button · Badge, 본문과 caption 의 강조
    semibold: 600, // 제목 · 라벨 · 소제목, 큰 제목의 강조
    bold: 700, // 문장 속 강조
  },
  leading: { "16": 16, "20": 20, "24": 24, "28": 28, "32": 32, "40": 40, "56": 56 },
  tracking: { mono: -0.04, tightest: -0.035, tighter: -0.03, tight: -0.02, normal: 0, wide: 0.01 },
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

// ───── Role · Preset — Palette 값을 고르는 명세 ────────────────────────────

type StyleKeys = {
  size: keyof typeof TYPOGRAPHY_SOURCE.fontSize | keyof typeof TYPOGRAPHY_SOURCE.fluid;
  weight: keyof typeof TYPOGRAPHY_SOURCE.weight;
  leading: keyof typeof TYPOGRAPHY_SOURCE.leading | keyof typeof TYPOGRAPHY_SOURCE.fluid;
  tracking: keyof typeof TYPOGRAPHY_SOURCE.tracking;
};

// 역할은 자기 굵기와, 강조할 때의 굵기(strong)를 함께 정한다. Text 의 strong prop 은 굵기 이름을 고르지 않고 이 값을 켠다.
// 제목은 hero 부터 subheading 까지 semibold 하나라 크기만 줄어든다 — 큰 제목이 regular 면 바로 아래 title(24 · 600)보다 얇아
// 보여 위계가 뒤집혀 읽혔다(11/8).
export const ROLE_SPEC = {
  hero: { size: "hero", weight: "semibold", strong: "semibold", leading: "hero", tracking: "tightest" },
  headline: { size: "48", weight: "semibold", strong: "semibold", leading: "56", tracking: "tightest" },
  display: { size: "32", weight: "semibold", strong: "semibold", leading: "40", tracking: "tighter" },
  title: { size: "24", weight: "semibold", strong: "semibold", leading: "32", tracking: "tight" },
  heading: { size: "20", weight: "semibold", strong: "semibold", leading: "28", tracking: "normal" },
  subheading: { size: "16", weight: "semibold", strong: "semibold", leading: "24", tracking: "normal" },
  // 일하는 화면이 아니라 읽는 글 — 페이지 첫머리의 설명, 문서의 본문. body 보다 한 단 크고 굵기는 같다.
  lead: { size: "16", weight: "regular", strong: "medium", leading: "24", tracking: "normal" },
  body: { size: "14", weight: "regular", strong: "medium", leading: "20", tracking: "normal" },
  caption: { size: "13", weight: "regular", strong: "medium", leading: "16", tracking: "normal" },
  label: { size: "12", weight: "semibold", strong: "semibold", leading: "16", tracking: "wide" },
} as const satisfies Record<string, StyleKeys & { strong: keyof typeof TYPOGRAPHY_SOURCE.weight }>;

// hero·headline·display·title·heading·subheading은 제목 계층, lead·body·caption·label은 사용 역할이다. 서체(mono)는
// 위계가 아니라 family 축이라 여기 없다 — 어느 variant 에도 얹는다.
export const TEXT_VARIANTS = keys(ROLE_SPEC);
export type TextVariant = keyof typeof ROLE_SPEC;

// 컨트롤 상자가 담을 수 있는 글자 — 크기만 바꾸는 fontSize 탈출구의 값이다.
export const CONTROL_FONT_SIZES = ["label", "caption", "body"] as const satisfies readonly TextVariant[];
export type ControlFontSize = (typeof CONTROL_FONT_SIZES)[number];

// 문장 속 강조가 고르는 굵기(emphasisRule). 이름은 Palette 의 이름 그대로다.
export const EMPHASES = ["regular", "medium", "semibold", "bold"] as const satisfies readonly (keyof typeof TYPOGRAPHY_SOURCE.weight)[];
export type Emphasis = (typeof EMPHASES)[number];

// 링크의 밑줄이 드러나는 때. always 는 늘 밑줄이 있고(문장 안 링크가 색만으로 본문과 구분되지 않는다), hover 는 가리킬 때만 그린다.
export const LINK_UNDERLINES = ["always", "hover"] as const;
export type LinkUnderline = (typeof LINK_UNDERLINES)[number];

const BUTTON_CONTROL = {
  xs: { size: "13", weight: "medium", leading: "16", tracking: "normal" },
  sm: { size: "14", weight: "medium", leading: "16", tracking: "normal" },
  md: { size: "14", weight: "medium", leading: "16", tracking: "normal" },
  lg: { size: "15", weight: "medium", leading: "16", tracking: "normal" },
  xl: { size: "16", weight: "medium", leading: "16", tracking: "normal" },
} as const satisfies Record<ControlSize, StyleKeys>;
// 같은 size 의 입력값은 버튼 글자와 크기가 같고 굵기만 다르다. 버튼 글자는 상자를 정하는 라벨이라 medium 이고, 입력값은 읽는 값이라
// normal 이다.
const FIELD_FONT = {
  xs: { size: "13", weight: "normal", leading: "16", tracking: "normal" },
  sm: { size: "14", weight: "normal", leading: "16", tracking: "normal" },
  md: { size: "14", weight: "normal", leading: "16", tracking: "normal" },
  lg: { size: "15", weight: "normal", leading: "16", tracking: "normal" },
  xl: { size: "16", weight: "normal", leading: "16", tracking: "normal" },
} as const satisfies Record<ControlSize, StyleKeys>;
// leading 16 은 글자 한 줄이고 2차 Control 의 안쪽 여백이 읽는 값이다. inputLeading 은 입력값이 앉는 줄상자 —
// caret 과 한글 fallback glyph 가 눌리지 않을 만큼 높다.
const FIELD_CONTROL = {
  xs: { ...FIELD_FONT.xs, inputLeading: "20" },
  sm: { ...FIELD_FONT.sm, inputLeading: "20" },
  md: { ...FIELD_FONT.md, inputLeading: "20" },
  lg: { ...FIELD_FONT.lg, inputLeading: "20" },
  xl: { ...FIELD_FONT.xl, inputLeading: "20" },
} as const satisfies Record<ControlSize, StyleKeys & { inputLeading: keyof typeof TYPOGRAPHY_SOURCE.leading }>;
const TEXTAREA_CONTROL = {
  xs: { ...FIELD_FONT.xs, leading: "20" },
  sm: { ...FIELD_FONT.sm, leading: "20" },
  md: { ...FIELD_FONT.md, leading: "20" },
  lg: { ...FIELD_FONT.lg, leading: "20" },
  xl: { ...FIELD_FONT.xl, leading: "20" },
} as const satisfies Record<ControlSize, StyleKeys>;
const BADGE_PRESET = { size: "12", weight: "medium", leading: "16", tracking: "normal" } as const satisfies StyleKeys;

export const PRESET_SPEC = {
  button: BUTTON_CONTROL,
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
  role: mapValues(ROLE_SPEC, (spec) => ({ ...refsOf(spec), strong: palette.weight[spec.strong] })),
  preset: {
    button: mapValues(PRESET_SPEC.button, refsOf),
    field: mapValues(PRESET_SPEC.field, (spec) => ({ ...refsOf(spec), inputLeading: palette.leading[spec.inputLeading] })),
    textarea: mapValues(PRESET_SPEC.textarea, refsOf),
    badge: refsOf(PRESET_SPEC.badge),
  },
} as const;

// variant 별 기본 ink — caption · label 은 secondary(부연/짧은 이름 자리).
export const TEXT_INK: Record<TextVariant, "primary" | "secondary"> = {
  hero: "primary",
  headline: "primary",
  display: "primary",
  title: "primary",
  heading: "primary",
  subheading: "primary",
  lead: "primary",
  body: "primary",
  caption: "secondary",
  label: "secondary",
};
