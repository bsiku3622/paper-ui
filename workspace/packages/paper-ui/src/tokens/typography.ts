import { buildVarTree, em, keys, lengths, mapValues, rem } from "./helpers";
import type { ControlSize } from "./control-sizes";

const FAMILY = {
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'D2Coding', monospace",
} as const;

export const TYPOGRAPHY_SOURCE = {
  family: FAMILY,
  fontSize: { "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "20": 20, "24": 24, "32": 32, "48": 48 },
  fluid: { hero: { min: 44, vw: 5.2, max: 76, leading: 1.12 } },
  weight: {
    regular: 400,
    normal: 450,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  leading: { "16": 16, "20": 20, "24": 24, "28": 28, "32": 32, "40": 40, "56": 56 },
  tracking: { mono: -0.04, tightest: -0.035, tighter: -0.03, tight: -0.02, normal: 0, wide: 0.01 },
  decoration: { underlineOffset: 0.2 },
  monoSizeScale: 0.95,
  codeScale: { inline: 0.85, compact: 0.8 },
  breaking: {
    sans: { wordBreak: "keep-all", overflowWrap: "break-word" },
    mono: { wordBreak: "normal", overflowWrap: "anywhere" },
  } as const satisfies Record<keyof typeof FAMILY, { wordBreak: "keep-all" | "normal"; overflowWrap: "break-word" | "anywhere" }>,
} as const;

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

type StyleKeys = {
  size: keyof typeof TYPOGRAPHY_SOURCE.fontSize | keyof typeof TYPOGRAPHY_SOURCE.fluid;
  weight: keyof typeof TYPOGRAPHY_SOURCE.weight;
  leading: keyof typeof TYPOGRAPHY_SOURCE.leading | keyof typeof TYPOGRAPHY_SOURCE.fluid;
  tracking: keyof typeof TYPOGRAPHY_SOURCE.tracking;
};

export const ROLE_SPEC = {
  hero: { size: "hero", weight: "semibold", strong: "semibold", leading: "hero", tracking: "tightest" },
  headline: { size: "48", weight: "semibold", strong: "semibold", leading: "56", tracking: "tightest" },
  display: { size: "32", weight: "semibold", strong: "semibold", leading: "40", tracking: "tighter" },
  title: { size: "24", weight: "semibold", strong: "semibold", leading: "32", tracking: "tight" },
  heading: { size: "20", weight: "semibold", strong: "semibold", leading: "28", tracking: "normal" },
  subheading: { size: "16", weight: "semibold", strong: "semibold", leading: "24", tracking: "normal" },
  lead: { size: "16", weight: "regular", strong: "medium", leading: "24", tracking: "normal" },
  body: { size: "14", weight: "regular", strong: "medium", leading: "20", tracking: "normal" },
  caption: { size: "13", weight: "regular", strong: "medium", leading: "16", tracking: "normal" },
  label: { size: "12", weight: "semibold", strong: "semibold", leading: "16", tracking: "wide" },
} as const satisfies Record<string, StyleKeys & { strong: keyof typeof TYPOGRAPHY_SOURCE.weight }>;

export const TEXT_VARIANTS = keys(ROLE_SPEC);
export type TextVariant = keyof typeof ROLE_SPEC;

export const CONTROL_FONT_SIZES = ["label", "caption", "body"] as const satisfies readonly TextVariant[];
export type ControlFontSize = (typeof CONTROL_FONT_SIZES)[number];

export const EMPHASES = ["regular", "medium", "semibold", "bold"] as const satisfies readonly (keyof typeof TYPOGRAPHY_SOURCE.weight)[];
export type Emphasis = (typeof EMPHASES)[number];

export const LINK_UNDERLINES = ["always", "hover"] as const;
export type LinkUnderline = (typeof LINK_UNDERLINES)[number];

const BUTTON_CONTROL = {
  xs: { size: "13", weight: "medium", leading: "16", tracking: "normal" },
  sm: { size: "14", weight: "medium", leading: "16", tracking: "normal" },
  md: { size: "14", weight: "medium", leading: "16", tracking: "normal" },
  lg: { size: "15", weight: "medium", leading: "16", tracking: "normal" },
  xl: { size: "16", weight: "medium", leading: "16", tracking: "normal" },
} as const satisfies Record<ControlSize, StyleKeys>;
const FIELD_FONT = {
  xs: { size: "13", weight: "normal", leading: "16", tracking: "normal" },
  sm: { size: "14", weight: "normal", leading: "16", tracking: "normal" },
  md: { size: "14", weight: "normal", leading: "16", tracking: "normal" },
  lg: { size: "15", weight: "normal", leading: "16", tracking: "normal" },
  xl: { size: "16", weight: "normal", leading: "16", tracking: "normal" },
} as const satisfies Record<ControlSize, StyleKeys>;
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

export const CODE_SPEC = {
  block: { size: "13", weight: "normal", leading: "20" },
} as const satisfies Record<string, Pick<StyleKeys, "size" | "weight"> & { leading: keyof typeof TYPOGRAPHY_SOURCE.leading }>;

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
