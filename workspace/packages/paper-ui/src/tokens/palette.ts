// L0 — OKLCH palette source
//
// Palette identity and color anchors live here. Semantic roles, CSS names, and component
// vocabulary do not. This file assembles the completed palette by calling pure color-ladder
// operations, then exports both its OKLCH coordinates and generated HEX tokens.

import { completeOklchRamp, interpolateOklch, toPaletteToken, withAlpha } from "./color-ladder";
import type { PaletteToken } from "./color-ladder";
export type { PaletteToken } from "./color-ladder";

export type ColorMode = "light" | "dark";

export const PALETTE_STEPS = ["0", "50", "100", "150", "200", "300", "400", "500", "600", "650", "700", "800", "875", "900", "925", "950"] as const;
export type PaletteStep = (typeof PALETTE_STEPS)[number];
export const ACCENT_STEPS = ["50", "100", "150", "200", "300", "400", "500", "600", "650", "700", "800", "900", "925", "950"] as const;
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
// All accent families share perceptual lightness and a base chroma envelope.
// Hue-specific chroma ceilings preserve pigment identity within the sRGB gamut.
const ACCENT_CURVE: Record<AccentStep, readonly [lightness: number, chromaRatio: number]> = {
  "50": [0.985, 0.04], "100": [0.955, 0.16], "150": [0.930, 0.26],
  "200": [0.900, 0.38], "300": [0.800, 0.65], "400": [0.670, 0.80],
  "500": [0.610, 0.95], "600": [0.525, 1],
  "650": [0.4975, 0.95], "700": [0.470, 0.90],
  "800": [0.400, 0.75], "900": [0.330, 0.55], "925": [0.295, 0.475],
  "950": [0.260, 0.40],
};
const ACCENT_IDENTITIES: Record<AccentPalette, readonly [hue: number, chroma: number]> = {
  blue: [263, 0.215], green: [153, 0.155], amber: [65, 0.240], red: [25, 0.215],
};

const neutralBaseRamp = completeOklchRamp(NEUTRAL_BASE_STEPS, NEUTRAL_ANCHORS);
const neutral: Record<PaletteStep, Oklch> = Object.fromEntries(PALETTE_STEPS.map((step) => [
  step,
  step === "150"
    ? interpolateOklch(neutralBaseRamp["100"], neutralBaseRamp["200"], 0.5)
    : step === "650"
      ? interpolateOklch(neutralBaseRamp["600"], neutralBaseRamp["700"], 0.5)
      : step === "875"
      ? interpolateOklch(neutralBaseRamp["800"], neutralBaseRamp["900"], 0.75)
      : step === "925"
      ? interpolateOklch(neutralBaseRamp["900"], neutralBaseRamp["950"], 0.5)
      : neutralBaseRamp[step as Exclude<PaletteStep, "150" | "650" | "875" | "925">],
])) as Record<PaletteStep, Oklch>;

const accent = Object.fromEntries(ACCENT_PALETTES.map((name) => [
  name,
  Object.fromEntries(ACCENT_STEPS.map((step) => {
    const [lightness, ratio] = ACCENT_CURVE[step];
    const [hue, chroma] = ACCENT_IDENTITIES[name];
    // Pale amber starts yellow, then transitions into its orange pigment by 400.
    const rampHue = name === "amber" ? 90 - (90 - hue) * Math.max(0, Math.min(1, (Number(step) - 200) / 200)) : hue;
    // Ease amber into its vivid middle range instead of jumping from pale 200 to 300.
    const rampRatio = name === "amber" && step === "200" ? 0.44
      : name === "amber" && step === "300" ? 0.55 : ratio;
    return [step, [lightness, chroma * rampRatio, rampHue] as Oklch];
  })) as Record<AccentStep, Oklch>,
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
