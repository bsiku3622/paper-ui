// 의미 역할은 COLOR_SELECTION(테마별 역할 → Palette 경로) 하나에서 고르고, 값은 그 선택표에서 파생한다.
//
// Every semantic leaf selects a generated palette token. No semantic value contains a raw color,
// performs color math, or reads another semantic branch.

import type { ColorMode } from "./color-modes";
import { buildVarTree, keys, mapValues } from "./helpers";
import { ALPHA_OPACITY, PALETTE_TOKENS, type PaletteToken } from "./palette";
import type { AccentPalette, AccentStep, AlphaStep, PaletteStep } from "./palette";

export const STATUSES = ["info", "success", "warning", "error"] as const;
export type Status = (typeof STATUSES)[number];

// The statuses a selection mark can show: it is either fine or in error.
export const CHOICE_STATUSES = ["error"] as const satisfies readonly Status[];
export type ChoiceStatus = (typeof CHOICE_STATUSES)[number];

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
    // Light has three steps; dark has two — the page (canvas) is already the deepest step, so sunken
    // shares neutral.950. A sunken surface on canvas is told apart by its border; on raised it
    // recedes in both modes.
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
export const SURFACE_FILLS = keys(COLOR_VALUES.bg);
export type SurfaceFill = keyof typeof COLOR_VALUES.bg;
export const INK_LEVELS = keys(COLOR_VALUES.ink);
export type InkLevel = keyof typeof COLOR_VALUES.ink;
// The ink a mark (Text, Icon) asks for: a level, a status's own ink, or `inherit` to leave the colour to
// the surface it stands on — a coloured surface has already set its text colour, and a role would paint over it.
export const INKS = [...INK_LEVELS, ...STATUSES, "inherit"] as const;
export type Ink = (typeof INKS)[number];
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

// Each mode with its values — the emitter walks this, one set of variables per mode.
export const COLOR_VALUES_BY_MODE = { light: COLOR_VALUES, dark: COLOR_VALUES_DARK } satisfies Record<ColorMode, SameShapeStrings<typeof COLOR_VALUES>>;

export const COLOR = buildVarTree(COLOR_VALUES, ["color"]);

// Front to back, the order surfaces recede in. Dark folds sunken into canvas, but the order holds.
export const SURFACE_ORDER = ["raised", "canvas", "sunken"] as const satisfies readonly SurfaceFill[];

// ───── Ground roles ──────────────────────────────────────────────────────────
// Roles painted outside their element, on the ground it stands on — a theme scope changes them from
// its children down. A path is relative to the Color tree.

export const GROUND_ROLES = [["interaction", "focus"], ["shadow"]] as const;
export const isGroundRole = (path: readonly string[]): boolean =>
  (GROUND_ROLES as readonly (readonly string[])[]).some((role) => role.every((key, index) => path[index] === key));

// ───── Beyond the selection table ────────────────────────────────────────────
// Roles that are not a palette token per mode, so COLOR_VALUES leaves them out and the Color page
// does not show them.

// Opacity is a state's strength, the same in every mode: an alpha step of the palette.
export const OPACITY_ROLES = { disabled: "50", subdued: "70" } as const satisfies Record<string, AlphaStep>;
export const OPACITY_VALUES = mapValues(OPACITY_ROLES, (step) => String(ALPHA_OPACITY[step]));

// The forced-colors palette. The OS owns the values; the names are what a component may ask for.
export const SYSTEM_COLORS = {
  canvas: "Canvas",
  canvasText: "CanvasText",
  buttonFace: "ButtonFace",
  buttonText: "ButtonText",
  highlight: "Highlight",
  highlightText: "HighlightText",
  grayText: "GrayText",
  linkText: "LinkText",
} as const;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

// prefers-contrast: more lifts the quiet roles one step: borders to 3:1 and tertiary ink to 4.5:1 on
// every surface of the mode. The lift replaces a role's value inside the same scope that holds it.
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
