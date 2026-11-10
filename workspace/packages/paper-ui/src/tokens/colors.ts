import type { ColorMode } from "./color-modes";
import { buildVarTree, keys, mapValues } from "./helpers";
import { ALPHA_OPACITY, PALETTE_TOKENS, type PaletteToken } from "./palette";
import type { AccentPalette, AccentStep, AlphaStep, PaletteStep } from "./palette";

export const STATUSES = ["info", "success", "warning", "error"] as const;
export type Status = (typeof STATUSES)[number];

export const CHOICE_STATUSES = ["error"] as const satisfies readonly Status[];
export type ChoiceStatus = (typeof CHOICE_STATUSES)[number];

export const ACCENTS = ["primary", ...STATUSES] as const;
export type Accent = (typeof ACCENTS)[number];

export const ACCENT_TONES = ["solid", "wash", "ink", "soft", "subtle"] as const;
export type AccentTone = (typeof ACCENT_TONES)[number];
export type AccentToken = Record<AccentTone, PaletteToken>;

export const STATUS_PALETTE = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
} satisfies Record<Status, AccentPalette>;

export const ACCENT_PALETTE: Record<Accent, "neutral" | AccentPalette> = { primary: "neutral", ...STATUS_PALETTE };

export type PalettePath =
  | `neutral.${PaletteStep}`
  | `${AccentPalette}.${AccentStep}`
  | `alpha${AlphaStep}.neutral.${"0" | "950"}`
  | "marker";

export const paletteValue = (path: PalettePath): PaletteToken => {
  const [head, second, third] = path.split(".") as [string, string, string?];
  if (head === "marker") return PALETTE_TOKENS.marker;
  if (head === "neutral") return PALETTE_TOKENS.neutral[second as PaletteStep];
  if (head.startsWith("alpha")) return PALETTE_TOKENS[head as `alpha${AlphaStep}`].neutral[third as "0" | "950"];
  return PALETTE_TOKENS.accent[head as AccentPalette][second as AccentStep];
};

export const ACCENT_TONE_STEPS = {
  solid: ["600", "600"],
  wash: ["50", "50"],
  ink: ["650", "300"],
  soft: ["100", "925"],
  subtle: ["700", "400"],
} as const satisfies Record<AccentTone, readonly [light: AccentStep, dark: AccentStep]>;

export const PRIMARY_TONE_STEPS = {
  solid: ["950", "50"],
  wash: ["0", "950"],
  ink: ["925", "100"],
  soft: ["150", "875"],
  subtle: ["700", "500"],
} as const satisfies Record<AccentTone, readonly [light: PaletteStep, dark: PaletteStep]>;

type ToneException = { accent: AccentStep } | { neutral: PaletteStep };
type StatusExceptions = { [S in Status]?: { [M in ColorMode]?: Partial<Record<AccentTone, ToneException>> } };

// Light error keeps a brighter ink: red.600 is the one 600 that still reads at 4.5:1 on its soft face with the hover tint over it.
export const STATUS_EXCEPTIONS = {
  error: { light: { ink: { accent: "600" } } },
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

const selection = (mode: ColorMode) => {
  const pick = (light: PalettePath, dark: PalettePath): PalettePath => (mode === "dark" ? dark : light);
  return {
    bg: {
      canvas: pick("neutral.100", "neutral.950"),
      raised: pick("neutral.0", "neutral.925"),
      sunken: pick("neutral.150", "neutral.950"),
    },
    control: {
      track: pick("neutral.150", "neutral.875"),
      knob: pick("neutral.0", "neutral.400"),
      thumb: pick("neutral.0", "neutral.800"),
      field: pick("neutral.0", "neutral.875"),
      mark: pick("neutral.0", "neutral.875"),
      chosen: pick("neutral.150", "neutral.800"),
    },
    ink: {
      primary: pick("neutral.925", "neutral.100"),
      secondary: pick("neutral.700", "neutral.400"),
      // In light it stays under 4.5:1 on purpose, a documented exception; prefers-contrast: more lifts it to 4.5:1.
      tertiary: pick("neutral.500", "neutral.500"),
    },
    border: {
      base: pick("neutral.200", "neutral.875"),
      strong: pick("neutral.300", "neutral.800"),
      hover: pick("neutral.400", "neutral.700"),
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
      resting: pick("alpha10.neutral.950", "alpha10.neutral.0"),
      inset: pick("alpha10.neutral.950", "alpha45.neutral.950"),
    },
    marker: {
      fill: pick("marker", "marker"),
      ink: pick("neutral.950", "neutral.950"),
    },
  };
};

export const COLOR_SELECTION = { light: selection("light"), dark: selection("dark") } as const;

type MapLeaves<T, V> = { [K in keyof T]: T[K] extends string ? V : MapLeaves<T[K], V> };
const mapLeaves = <T extends object, V>(tree: T, fn: (leaf: PalettePath) => V): MapLeaves<T, V> =>
  Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, typeof value === "string" ? fn(value as PalettePath) : mapLeaves(value, fn)])) as MapLeaves<T, V>;

export const COLOR_VALUES = mapLeaves(COLOR_SELECTION.light, paletteValue);

export const SURFACE_FILLS = keys(COLOR_VALUES.bg);
export type SurfaceFill = keyof typeof COLOR_VALUES.bg;
export const INK_LEVELS = keys(COLOR_VALUES.ink);
export type InkLevel = keyof typeof COLOR_VALUES.ink;
export const INKS = [...INK_LEVELS, ...STATUSES, "inherit"] as const;
export type Ink = (typeof INKS)[number];
export const BORDER_LEVELS = keys(COLOR_VALUES.border);
export type BorderLevel = keyof typeof COLOR_VALUES.border;
export const DIVIDER_LEVELS = ["base", "strong"] as const satisfies readonly BorderLevel[];
export type DividerLevel = (typeof DIVIDER_LEVELS)[number];
export const DEPTHS = keys(COLOR_VALUES.shadow);
export type Depth = keyof typeof COLOR_VALUES.shadow;

type SameShapeStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : SameShapeStrings<T[K]>;
};

export const COLOR_VALUES_DARK = mapLeaves(COLOR_SELECTION.dark, paletteValue) satisfies SameShapeStrings<typeof COLOR_VALUES>;

export const COLOR_VALUES_BY_MODE = { light: COLOR_VALUES, dark: COLOR_VALUES_DARK } satisfies Record<ColorMode, SameShapeStrings<typeof COLOR_VALUES>>;

export const COLOR = buildVarTree(COLOR_VALUES, ["color"]);

export const SURFACE_ORDER = ["raised", "canvas", "sunken"] as const satisfies readonly SurfaceFill[];

export const GROUND_ROLES = [["interaction", "focus"], ["shadow"]] as const;
export const isGroundRole = (path: readonly string[]): boolean =>
  (GROUND_ROLES as readonly (readonly string[])[]).some((role) => role.every((key, index) => path[index] === key));

export const OPACITY_ROLES = { disabled: "50", subdued: "70" } as const satisfies Record<string, AlphaStep>;
export const OPACITY_VALUES = mapValues(OPACITY_ROLES, (step) => String(ALPHA_OPACITY[step]));

export const SYSTEM_COLORS = {
  canvas: "Canvas",
  canvasText: "CanvasText",
  buttonFace: "ButtonFace",
  buttonText: "ButtonText",
  highlight: "Highlight",
  highlightText: "HighlightText",
  grayText: "GrayText",
  linkText: "LinkText",
  mark: "Mark",
  markText: "MarkText",
} as const;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

export const COLOR_CONTRAST_MORE = {
  light: {
    border: { base: paletteValue("neutral.600"), strong: paletteValue("neutral.650"), hover: paletteValue("neutral.700") },
    ink: { tertiary: paletteValue("neutral.700") },
  },
  dark: {
    border: { base: paletteValue("neutral.600"), strong: paletteValue("neutral.500"), hover: paletteValue("neutral.400") },
    ink: { tertiary: paletteValue("neutral.400") },
  },
} satisfies Record<ColorMode, DeepPartial<SameShapeStrings<typeof COLOR_VALUES>>>;
