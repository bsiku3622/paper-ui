// L0 — OKLCH palette source
//
// Palette identity and all color anchors live here. Semantic roles, CSS names, and component
// vocabulary do not. color-ladder.ts turns these coordinates into HEX palette tokens.

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
type AccentAnchors = Partial<Record<AccentStep, Oklch>>;
const NEUTRAL_BASE_STEPS = ["0", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
type NeutralBaseStep = (typeof NEUTRAL_BASE_STEPS)[number];
type PaletteSource = {
  neutral: Record<PaletteStep, Oklch>;
  blue: AccentAnchors;
  green: AccentAnchors;
  amber: AccentAnchors;
  red: AccentAnchors;
};

// Neutral step numbers always run from light to dark: 0 is white and 950 is near-black.
// Preserve the existing reviewed colors while expressing them with that shared direction.
const NEUTRAL_ANCHORS: Partial<Record<NeutralBaseStep, number>> = {
  "0": 1,
  "100": 0.965,
  "300": 0.88,
  "500": 0.68,
  "700": 0.48,
  "900": 0.28,
  "950": 0.18,
};

const createNeutralRamp = (
  anchors: Partial<Record<NeutralBaseStep, number>>,
  chroma: number,
  hue: number,
): Record<PaletteStep, Oklch> => {
  const anchorIndexes = NEUTRAL_BASE_STEPS.flatMap((step, index) => anchors[step] === undefined ? [] : [index]);
  const baseRamp = Object.fromEntries(NEUTRAL_BASE_STEPS.map((step, index) => {
    const exact = anchors[step];
    if (exact !== undefined) return [step, [exact, chroma, hue] as const];

    const lowerIndex = [...anchorIndexes].reverse().find((anchorIndex) => anchorIndex < index)!;
    const upperIndex = anchorIndexes.find((anchorIndex) => anchorIndex > index)!;
    const lowerStep = NEUTRAL_BASE_STEPS[lowerIndex]!;
    const upperStep = NEUTRAL_BASE_STEPS[upperIndex]!;
    const progress = (index - lowerIndex) / (upperIndex - lowerIndex);
    const lightness = anchors[lowerStep]! + (anchors[upperStep]! - anchors[lowerStep]!) * progress;
    return [step, [lightness, chroma, hue] as const];
  })) as Record<NeutralBaseStep, Oklch>;

  return Object.fromEntries(PALETTE_STEPS.map((step) => [
    step,
    step === "150"
      ? [(baseRamp["100"][0] + baseRamp["200"][0]) / 2, chroma, hue] as const
      : step === "925"
        ? [(baseRamp["900"][0] + baseRamp["950"][0]) / 2, chroma, hue] as const
        : baseRamp[step as Exclude<PaletteStep, "150" | "925">],
  ])) as Record<PaletteStep, Oklch>;
};

// One theme-independent palette spans light to dark. Semantic roles choose the appropriate step
// for each theme; the palette itself never reverses or changes with the active theme.
export const OKLCH_PALETTE: PaletteSource = {
    neutral: createNeutralRamp(NEUTRAL_ANCHORS, 0.003, 286),
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
      "50": [0.9882, 0.0110, 89.7201], "100": [0.9323, 0.0524, 95.2],
      "200": [0.9262, 0.0662, 95.2168], "400": [0.6678, 0.1343, 73.8263],
      "600": [0.5553, 0.1455, 48.9975], "700": [0.4732, 0.1247, 46.2007],
      "950": [0.2838, 0.0641, 51.3381],
    },
    red: {
      "50": [0.9808, 0.0064, 17.2665], "100": [0.9304, 0.0250, 17.7],
      "200": [0.9053, 0.0312, 17.7420], "400": [0.6825, 0.1639, 22.4015],
      "600": [0.5771, 0.2152, 27.3250], "700": [0.5054, 0.1905, 27.5181],
      "950": [0.2979, 0.0947, 24.9980],
    },
};

export const ACCENT_PALETTES = ["blue", "green", "amber", "red"] as const;
export type AccentPalette = (typeof ACCENT_PALETTES)[number];
