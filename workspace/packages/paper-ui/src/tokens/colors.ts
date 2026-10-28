// L2 — Generated HEX palette tokens → semantic color systems
//
// Every semantic leaf selects a generated palette token. No semantic value contains a raw color,
// performs color math, or reads another semantic branch.

import { buildVarTree, keys } from "./helpers";
import { PALETTE_TOKENS, type PaletteToken } from "./palette";
import type { AccentPalette, ColorMode } from "./palette";

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

const colorTokens = (mode: ColorMode) => {
  const { neutral, accent } = PALETTE_TOKENS;
  const isDark = mode === "dark";
  const primary: AccentToken = {
    solid: neutral[isDark ? "50" : "950"],
    wash: neutral[isDark ? "950" : "0"],
    ink: neutral[isDark ? "100" : "900"],
    soft: neutral[isDark ? "875" : "200"],
    subtle: neutral[isDark ? "500" : "700"],
  };
  const accentToken = (palette: AccentPalette): AccentToken => ({
    solid: accent[palette][!isDark && palette === "amber" ? "400" : "600"],
    wash: !isDark && palette === "amber" ? neutral["0"] : accent[palette]["50"],
    ink: accent[palette][isDark ? "300" : "700"],
    soft: accent[palette][isDark ? "925" : "150"],
    subtle: accent[palette][isDark ? "400" : "700"],
  });

  const accents: Record<Accent, AccentToken> = {
    primary,
    info: accentToken(STATUS_PALETTE.info),
    success: accentToken(STATUS_PALETTE.success),
    warning: accentToken(STATUS_PALETTE.warning),
    error: accentToken(STATUS_PALETTE.error),
  };
  const blackAlpha = (step: "05" | "10" | "15" | "30" | "45" | "60") => PALETTE_TOKENS[`alpha${step}`].neutral["950"];
  const whiteAlpha = (step: "05" | "10" | "15" | "30" | "45" | "60") => PALETTE_TOKENS[`alpha${step}`].neutral["0"];

  return {
    // Dark surfaces use a narrow range: the page and inset cells recede, while panels lift gently.
    bg: {
      canvas: neutral[isDark ? "950" : "50"],
      raised: neutral[isDark ? "925" : "0"],
      sunken: neutral[isDark ? "950" : "100"],
    },
    control: { track: neutral[isDark ? "800" : "200"] },
    border: {
      base: neutral[isDark ? "800" : "200"],
      strong: neutral[isDark ? "700" : "300"],
      hover: neutral[isDark ? "600" : "400"],
    },
    ink: {
      primary: neutral[isDark ? "100" : "900"],
      secondary: neutral[isDark ? "400" : "700"],
      tertiary: neutral[isDark ? "500" : "650"],
    },
    accent: accents,
    interaction: {
      bgHover: {
        onSurface: isDark ? whiteAlpha("05") : blackAlpha("05"),
        onPrimarySolid: isDark ? blackAlpha("10") : whiteAlpha("10"),
        onAccentSolid: blackAlpha("15"),
      },
      selected: isDark ? whiteAlpha("10") : blackAlpha("15"),
      active: isDark ? whiteAlpha("15") : blackAlpha("15"),
      focus: accent.blue[isDark ? "400" : "600"],
    },
    overlay: {
      scrim: blackAlpha(isDark ? "60" : "30"),
    },
    shadow: {
      overlay: blackAlpha(isDark ? "60" : "10"),
      overlayMinimal: blackAlpha(isDark ? "45" : "10"),
    },
  };
};

export const COLOR_VALUES = colorTokens("light");

// Each axis lists the keys of the tree that authors it.
export const SURFACES = keys(COLOR_VALUES.bg);
export type Surface = keyof typeof COLOR_VALUES.bg;
export const INK_LEVELS = keys(COLOR_VALUES.ink);
export type InkLevel = keyof typeof COLOR_VALUES.ink;
export const BORDER_LEVELS = keys(COLOR_VALUES.border);
export type BorderLevel = keyof typeof COLOR_VALUES.border;
export const DIVIDER_LEVELS = ["base", "strong"] as const satisfies readonly BorderLevel[];
export type DividerLevel = (typeof DIVIDER_LEVELS)[number];

type SameShapeStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : SameShapeStrings<T[K]>;
};

export const COLOR_VALUES_DARK = colorTokens("dark") satisfies SameShapeStrings<typeof COLOR_VALUES>;

export const COLOR = buildVarTree(COLOR_VALUES, ["color"]);
