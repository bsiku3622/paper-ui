// 의미 역할은 COLOR_SELECTION(테마별 역할 → Palette 경로) 하나에서 고르고, 값은 그 선택표에서 파생한다.
//
// Every semantic leaf selects a generated palette token. No semantic value contains a raw color,
// performs color math, or reads another semantic branch.

import { buildVarTree, keys } from "./helpers";
import { PALETTE_TOKENS, type PaletteToken } from "./palette";
import type { AccentPalette, AccentStep, AlphaStep, ColorMode, PaletteStep } from "./palette";

export const STATUSES = ["info", "success", "warning", "error"] as const;
export type Status = (typeof STATUSES)[number];

export const ACCENTS = ["primary", ...STATUSES] as const;
export type Accent = (typeof ACCENTS)[number];

// The five tones every accent shares, one palette token each.
export const ACCENT_TONES = ["solid", "wash", "ink", "soft", "subtle"] as const;
export type AccentTone = (typeof ACCENT_TONES)[number];
export type AccentToken = Record<AccentTone, PaletteToken>;

export const STATUS_PALETTE = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
} satisfies Record<Status, AccentPalette>;

// The ramp each accent draws from; primary is the neutral one.
export const ACCENT_PALETTE: Record<Accent, "neutral" | AccentPalette> = { primary: "neutral", ...STATUS_PALETTE };

// A palette token, named by where it sits in the generated palette: a neutral step, an accent ramp
// step, or a neutral alpha end point.
export type PalettePath =
  | `neutral.${PaletteStep}`
  | `${AccentPalette}.${AccentStep}`
  | `alpha${AlphaStep}.neutral.${"0" | "950"}`;

export const paletteValue = (path: PalettePath): PaletteToken => {
  const [head, second, third] = path.split(".") as [string, string, string?];
  if (head === "neutral") return PALETTE_TOKENS.neutral[second as PaletteStep];
  if (head.startsWith("alpha")) return PALETTE_TOKENS[head as `alpha${AlphaStep}`].neutral[third as "0" | "950"];
  return PALETTE_TOKENS.accent[head as AccentPalette][second as AccentStep];
};

// ───── Accent tones ──────────────────────────────────────────────────────────
// The step each tone takes in [light, dark]. primary draws from the neutral ramp.

export const ACCENT_TONE_STEPS = {
  solid: ["600", "600"],
  wash: ["50", "50"],
  ink: ["700", "300"],
  soft: ["150", "925"],
  subtle: ["700", "400"],
} as const satisfies Record<AccentTone, readonly [light: AccentStep, dark: AccentStep]>;

export const PRIMARY_TONE_STEPS = {
  solid: ["950", "50"],
  wash: ["0", "950"],
  ink: ["900", "100"],
  soft: ["200", "875"],
  subtle: ["700", "500"],
} as const satisfies Record<AccentTone, readonly [light: PaletteStep, dark: PaletteStep]>;

type ToneException = { accent: AccentStep } | { neutral: PaletteStep };
type StatusExceptions = { [S in Status]?: { [M in ColorMode]?: Partial<Record<AccentTone, ToneException>> } };

// Where a status leaves the tone table. Light warning is deliberate: amber.400 is the solid that
// reads as a middle-bright orange, and white stays on it as the wash.
export const STATUS_EXCEPTIONS = {
  warning: { light: { solid: { accent: "400" }, wash: { neutral: "0" } } },
} as const satisfies StatusExceptions;

const toneSelection = <Step extends string>(tones: Record<AccentTone, readonly [Step, Step]>, mode: ColorMode, path: (step: Step) => PalettePath) =>
  Object.fromEntries(ACCENT_TONES.map((tone) => [tone, path(tones[tone][mode === "dark" ? 1 : 0])])) as Record<AccentTone, PalettePath>;

const primarySelection = (mode: ColorMode): Record<AccentTone, PalettePath> =>
  toneSelection(PRIMARY_TONE_STEPS, mode, (step) => `neutral.${step}`);

const statusSelection = (status: Status, mode: ColorMode): Record<AccentTone, PalettePath> => {
  const palette = STATUS_PALETTE[status];
  const exceptions = (STATUS_EXCEPTIONS as StatusExceptions)[status]?.[mode] ?? {};
  const selection = toneSelection(ACCENT_TONE_STEPS, mode, (step) => `${palette}.${step}` as const);
  for (const tone of ACCENT_TONES) {
    const exception = exceptions[tone];
    if (exception) selection[tone] = "accent" in exception ? `${palette}.${exception.accent}` : `neutral.${exception.neutral}`;
  }
  return selection;
};

// ───── Selection — the one table ─────────────────────────────────────────────
// Every semantic role picks one palette token per theme. The key order is the display order.

const selection = (mode: ColorMode) => {
  const pick = (light: PalettePath, dark: PalettePath): PalettePath => (mode === "dark" ? dark : light);
  return {
    // Dark surfaces use a narrow range: the page and inset cells recede, while panels lift gently.
    bg: {
      canvas: pick("neutral.50", "neutral.950"),
      raised: pick("neutral.0", "neutral.925"),
      sunken: pick("neutral.100", "neutral.950"),
    },
    control: { track: pick("neutral.200", "neutral.800") },
    ink: {
      primary: pick("neutral.900", "neutral.100"),
      secondary: pick("neutral.700", "neutral.400"),
      tertiary: pick("neutral.650", "neutral.500"),
    },
    border: {
      base: pick("neutral.200", "neutral.800"),
      strong: pick("neutral.300", "neutral.700"),
      hover: pick("neutral.400", "neutral.600"),
    },
    accent: {
      primary: primarySelection(mode),
      info: statusSelection("info", mode),
      success: statusSelection("success", mode),
      warning: statusSelection("warning", mode),
      error: statusSelection("error", mode),
    } satisfies Record<Accent, Record<AccentTone, PalettePath>>,
    interaction: {
      bgHover: {
        onSurface: pick("alpha05.neutral.950", "alpha05.neutral.0"),
        onPrimarySolid: pick("alpha10.neutral.0", "alpha10.neutral.950"),
        onAccentSolid: pick("alpha15.neutral.950", "alpha15.neutral.950"),
      },
      selected: pick("alpha15.neutral.950", "alpha10.neutral.0"),
      active: pick("alpha15.neutral.950", "alpha15.neutral.0"),
      focus: pick("blue.600", "blue.400"),
      link: pick("blue.700", "blue.300"),
    },
    overlay: {
      scrim: pick("alpha30.neutral.950", "alpha60.neutral.950"),
    },
    shadow: {
      floating: pick("alpha10.neutral.950", "alpha60.neutral.950"),
      lifted: pick("alpha10.neutral.950", "alpha45.neutral.950"),
    },
  };
};

export const COLOR_SELECTION = { light: selection("light"), dark: selection("dark") } as const;

type MapLeaves<T, V> = { [K in keyof T]: T[K] extends string ? V : MapLeaves<T[K], V> };
const mapLeaves = <T extends object, V>(tree: T, fn: (leaf: PalettePath) => V): MapLeaves<T, V> =>
  Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, typeof value === "string" ? fn(value as PalettePath) : mapLeaves(value, fn)])) as MapLeaves<T, V>;

export const COLOR_VALUES = mapLeaves(COLOR_SELECTION.light, paletteValue);

// Each axis lists the keys of the tree that authors it.
export const SURFACES = keys(COLOR_VALUES.bg);
export type Surface = keyof typeof COLOR_VALUES.bg;
export const INK_LEVELS = keys(COLOR_VALUES.ink);
export type InkLevel = keyof typeof COLOR_VALUES.ink;
export const BORDER_LEVELS = keys(COLOR_VALUES.border);
export type BorderLevel = keyof typeof COLOR_VALUES.border;
export const DIVIDER_LEVELS = ["base", "strong"] as const satisfies readonly BorderLevel[];
export type DividerLevel = (typeof DIVIDER_LEVELS)[number];
// How deep a shadow reads: lifted is a small rise off the page, floating is a layer above it.
export const DEPTHS = keys(COLOR_VALUES.shadow);
export type Depth = keyof typeof COLOR_VALUES.shadow;

type SameShapeStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : SameShapeStrings<T[K]>;
};

export const COLOR_VALUES_DARK = mapLeaves(COLOR_SELECTION.dark, paletteValue) satisfies SameShapeStrings<typeof COLOR_VALUES>;

export const COLOR = buildVarTree(COLOR_VALUES, ["color"]);
