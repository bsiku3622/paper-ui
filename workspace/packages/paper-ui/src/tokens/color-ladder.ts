// L1 — OKLCH source → HEX palette tokens
//
// This is the only color-generation layer. Semantic tokens and consumers see only generated
// HEX values; palette identity and generated values share one source of truth.

import {
  ACCENT_PALETTES,
  ACCENT_STEPS,
  ALPHA_OPACITY,
  ALPHA_STEPS,
  OKLCH_PALETTE,
  PALETTE_STEPS,
} from "./palette";
import type { AccentPalette, AccentStep, AlphaStep, Oklch, PaletteStep } from "./palette";

declare const paletteTokenBrand: unique symbol;
export type PaletteToken = string & { readonly [paletteTokenBrand]: true };
type NeutralPalette = Record<PaletteStep, PaletteToken>;
type AccentRamp = Record<AccentStep, PaletteToken>;
type AlphaPalette = Record<`alpha${AlphaStep}`, { neutral: { "0": PaletteToken; "950": PaletteToken } }>;

const linearToSrgb = (value: number): number => {
  const channel = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, channel)) * 255);
};

const oklchToLinearRgb = ([lightness, chroma, hue]: Oklch): readonly [number, number, number] => {
  const radians = hue * Math.PI / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
};

const inSrgbGamut = (rgb: readonly number[]): boolean => rgb.every((channel) => channel >= 0 && channel <= 1);

const gamutMapped = ([lightness, chroma, hue]: Oklch): readonly [number, number, number] => {
  let mappedChroma = chroma;
  let rgb = oklchToLinearRgb([lightness, mappedChroma, hue]);
  if (inSrgbGamut(rgb)) return rgb;

  let low = 0;
  let high = chroma;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    mappedChroma = (low + high) / 2;
    rgb = oklchToLinearRgb([lightness, mappedChroma, hue]);
    if (inSrgbGamut(rgb)) low = mappedChroma;
    else high = mappedChroma;
  }
  return oklchToLinearRgb([lightness, low, hue]);
};

const toHex = (color: Oklch): PaletteToken => {
  const channels = gamutMapped(color).map(linearToSrgb);
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}` as PaletteToken;
};

const withAlpha = (color: PaletteToken, opacity: number): PaletteToken => {
  if (opacity < 0 || opacity > 1) throw new Error(`Palette alpha must be between 0 and 1; received ${opacity}`);
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}` as PaletteToken;
};

const interpolateHue = (from: number, to: number, ratio: number): number => {
  const delta = ((to - from + 540) % 360) - 180;
  return (from + delta * ratio + 360) % 360;
};

const interpolateOklch = (from: Oklch, to: Oklch, ratio: number): Oklch => [
  from[0] + (to[0] - from[0]) * ratio,
  from[1] + (to[1] - from[1]) * ratio,
  interpolateHue(from[2], to[2], ratio),
];

const completeOklchRamp = <Step extends string>(
  steps: readonly Step[],
  anchors: Partial<Record<Step, Oklch>>,
): Record<Step, Oklch> => {
  const knownSteps = steps.filter((step) => anchors[step]);
  return Object.fromEntries(steps.map((step) => {
    const direct = anchors[step];
    if (direct) return [step, direct];

    const index = steps.indexOf(step);
    const lower = [...knownSteps].reverse().find((anchor) => steps.indexOf(anchor) < index);
    const upper = knownSteps.find((anchor) => steps.indexOf(anchor) > index);
    if (!lower || !upper) throw new Error(`Missing OKLCH anchors around palette step ${step}`);
    const startIndex = steps.indexOf(lower);
    const endIndex = steps.indexOf(upper);
    const color = interpolateOklch(anchors[lower]!, anchors[upper]!, (index - startIndex) / (endIndex - startIndex));
    return [step, color];
  })) as Record<Step, Oklch>;
};

const generateCoordinates = () => ({
  neutral: OKLCH_PALETTE.neutral,
  accent: Object.fromEntries(ACCENT_PALETTES.map((name) => [
    name,
    completeOklchRamp(ACCENT_STEPS, OKLCH_PALETTE[name]),
  ])) as Record<AccentPalette, Record<AccentStep, Oklch>>,
});

// The Palette inspector and every semantic theme share these exact generated values.
export const PALETTE_COORDINATES = generateCoordinates();

const neutral = Object.fromEntries(PALETTE_STEPS.map((step) => [step, toHex(OKLCH_PALETTE.neutral[step])])) as NeutralPalette;
const accent = Object.fromEntries(ACCENT_PALETTES.map((name) => [
    name,
    Object.fromEntries(ACCENT_STEPS.map((step) => [step, toHex(PALETTE_COORDINATES.accent[name][step])])) as AccentRamp,
  ])) as Record<AccentPalette, AccentRamp>;
const alpha = Object.fromEntries(ALPHA_STEPS.map((step) => [`alpha${step}`, {
  neutral: {
    "0": withAlpha(neutral["0"], ALPHA_OPACITY[step]),
    "950": withAlpha(neutral["950"], ALPHA_OPACITY[step]),
  },
}])) as AlphaPalette;

export const PALETTE_TOKENS = { neutral, accent, ...alpha };
