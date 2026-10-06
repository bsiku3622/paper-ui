// L0 — OKLCH palette source
//
// Palette identity and color anchors live here. Semantic roles, CSS names, and component
// vocabulary do not. This file assembles the completed palette by calling pure color-ladder
// operations, then exports both its OKLCH coordinates and generated HEX tokens.

import { completeOklchRamp, interpolateOklch, toPaletteToken, withAlpha } from "./color-ladder";
import type { PaletteToken } from "./color-ladder";
export type { PaletteToken } from "./color-ladder";

export type ColorMode = "light" | "dark";

export const PALETTE_STEPS = ["0", "50", "100", "150", "200", "300", "400", "500", "600", "700", "800", "900", "925", "950"] as const;
export type PaletteStep = (typeof PALETTE_STEPS)[number];
export const ACCENT_STEPS = ["50", "100", "150", "200", "300", "400", "500", "600", "700", "800", "900", "925", "950"] as const;
export type AccentStep = (typeof ACCENT_STEPS)[number];
export const ALPHA_STEPS = ["05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80", "85", "90", "95"] as const;
export type AlphaStep = (typeof ALPHA_STEPS)[number];
export const ALPHA_OPACITY: Record<AlphaStep, number> = {
  "05": 0.05, "10": 0.10, "15": 0.15, "20": 0.20, "25": 0.25, "30": 0.30, "35": 0.35,
  "40": 0.40, "45": 0.45, "50": 0.50, "55": 0.55, "60": 0.60, "65": 0.65, "70": 0.70,
  "75": 0.75, "80": 0.80, "85": 0.85, "90": 0.90, "95": 0.95,
};

export type Oklch = readonly [lightness: number, chroma: number, hue: number];
export const NEUTRAL_BASE_STEPS = ["0", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
export type NeutralBaseStep = (typeof NEUTRAL_BASE_STEPS)[number];

// Neutral step numbers always run from light to dark: 0 is white and 950 is near-black.
// Preserve the existing reviewed colors while expressing them with that shared direction.
export const NEUTRAL_ANCHORS: Partial<Record<NeutralBaseStep, Oklch>> = {
  "0": [1, 0.003, 286],
  "100": [0.965, 0.003, 286],
  "300": [0.88, 0.003, 286],
  "500": [0.68, 0.003, 286],
  "700": [0.48, 0.003, 286],
  "900": [0.28, 0.003, 286],
  "950": [0.18, 0.003, 286],
};

export const ACCENT_PALETTES = ["blue", "green", "amber", "red"] as const;
export type AccentPalette = (typeof ACCENT_PALETTES)[number];
type AccentAnchors = Partial<Record<AccentStep, Oklch>>;

// Theme-independent accent anchors. Semantic roles choose steps from the completed shared ramp.
const ACCENT_ANCHORS: Record<AccentPalette, AccentAnchors> = {
    blue: {
      "50": [0.9805, 0.0079, 253.852], "100": [0.9304, 0.0263, 254],
      "200": [0.9039, 0.0324, 254.0011], "400": [0.6636, 0.1426, 256.7203],
      "600": [0.5461, 0.2152, 262.8809], "700": [0.4882, 0.2172, 264.3763],
      "950": [0.2853, 0.1048, 263.5904],
    },
    green: {
      "50": [0.9867, 0.0107, 158.8533], "100": [0.9319, 0.0355, 158.8],
      "200": [0.9259, 0.0437, 158.8359], "400": [0.6472, 0.1473, 151.7973],
      "600": [0.5273, 0.1371, 150.0693], "700": [0.4479, 0.1083, 151.3277],
      "950": [0.2567, 0.0572, 154.1303],
    },
    amber: {
      "50": [0.9882, 0.0260, 89.7201], "100": [0.9323, 0.0674, 88],
      "200": [0.9262, 0.0812, 84], "400": [0.6678, 0.1600, 75],
      "600": [0.5553, 0.1750, 68], "700": [0.4732, 0.1500, 64],
      "950": [0.2838, 0.0870, 60],
    },
    red: {
      "50": [0.9808, 0.0064, 17.2665], "100": [0.9304, 0.0250, 17.7],
      "200": [0.9053, 0.0312, 17.7420], "400": [0.6825, 0.1639, 22.4015],
      "600": [0.5771, 0.2152, 27.3250], "700": [0.5054, 0.1905, 27.5181],
      "950": [0.2979, 0.0947, 24.9980],
    },
};

const neutralBaseRamp = completeOklchRamp(NEUTRAL_BASE_STEPS, NEUTRAL_ANCHORS);
const neutral: Record<PaletteStep, Oklch> = Object.fromEntries(PALETTE_STEPS.map((step) => [
  step,
  step === "150"
    ? interpolateOklch(neutralBaseRamp["100"], neutralBaseRamp["200"], 0.5)
    : step === "925"
      ? interpolateOklch(neutralBaseRamp["900"], neutralBaseRamp["950"], 0.5)
      : neutralBaseRamp[step as Exclude<PaletteStep, "150" | "925">],
])) as Record<PaletteStep, Oklch>;

const accent = Object.fromEntries(ACCENT_PALETTES.map((name) => [
  name,
  completeOklchRamp(ACCENT_STEPS, ACCENT_ANCHORS[name]),
])) as Record<AccentPalette, Record<AccentStep, Oklch>>;

// Complete theme-independent OKLCH palette. Semantic systems select from these coordinates' HEX
// companions; changing the active theme never changes this source ramp.
export const OKLCH_PALETTE = { neutral, accent };

type NeutralPalette = Record<PaletteStep, PaletteToken>;
type AccentRamp = Record<AccentStep, PaletteToken>;
type AlphaPalette = Record<`alpha${AlphaStep}`, { neutral: { "0": PaletteToken; "950": PaletteToken } }>;

const neutralTokens = Object.fromEntries(PALETTE_STEPS.map((step) => [step, toPaletteToken(neutral[step])])) as NeutralPalette;
const accentTokens = Object.fromEntries(ACCENT_PALETTES.map((name) => [
  name,
  Object.fromEntries(ACCENT_STEPS.map((step) => [step, toPaletteToken(accent[name][step])])) as AccentRamp,
])) as Record<AccentPalette, AccentRamp>;
const alphaTokens = Object.fromEntries(ALPHA_STEPS.map((step) => [`alpha${step}`, {
  neutral: {
    "0": withAlpha(neutralTokens["0"], ALPHA_OPACITY[step]),
    "950": withAlpha(neutralTokens["950"], ALPHA_OPACITY[step]),
  },
}])) as AlphaPalette;

export const PALETTE_TOKENS = { neutral: neutralTokens, accent: accentTokens, ...alphaTokens };
