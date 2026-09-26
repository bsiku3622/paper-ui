// L2 — Generated HEX palette tokens → semantic color systems
//
// Every semantic leaf selects a generated palette token. No semantic value contains a raw color,
// performs color math, or reads another semantic branch.

import { PALETTE_TOKENS, type PaletteToken } from "./color-ladder";
import type { AccentPalette, ColorMode } from "./palette";

export const STATUS = ["info", "success", "warning", "error"] as const;
export type StatusName = (typeof STATUS)[number];

export const ACCENTS = ["primary", ...STATUS] as const;
export type AccentName = (typeof ACCENTS)[number];

export const STATUS_PALETTE: Record<StatusName, AccentPalette> = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
};

export type AccentToken = {
  solid: PaletteToken;
  wash: PaletteToken;
  soft: PaletteToken;
  subtle: PaletteToken;
};

const colorTokens = (mode: ColorMode) => {
  const { neutral, accent } = PALETTE_TOKENS;
  const isDark = mode === "dark";
  const primary: AccentToken = {
    solid: neutral[isDark ? "100" : "950"],
    wash: neutral[isDark ? "950" : "0"],
    soft: neutral[isDark ? "800" : "300"],
    subtle: neutral[isDark ? "700" : "400"],
  };
  const accentToken = (palette: AccentPalette): AccentToken => ({
    solid: accent[palette][isDark ? "400" : "600"],
    wash: accent[palette][isDark ? "950" : "50"],
    soft: accent[palette][isDark ? "925" : "150"],
    subtle: accent[palette][isDark ? "800" : "300"],
  });

  const accents: Record<AccentName, AccentToken> = {
    primary,
    info: accentToken(STATUS_PALETTE.info),
    success: accentToken(STATUS_PALETTE.success),
    warning: accentToken(STATUS_PALETTE.warning),
    error: accentToken(STATUS_PALETTE.error),
  };
  const blackAlpha = (step: "05" | "10" | "15" | "30" | "45" | "60") => PALETTE_TOKENS[`alpha${step}`].neutral["950"];
  const whiteAlpha = (step: "05" | "10" | "15" | "30" | "45" | "60") => PALETTE_TOKENS[`alpha${step}`].neutral["0"];

  return {
    bg: {
      raised: neutral[isDark ? "950" : "0"],
      canvas: neutral[isDark ? "925" : "50"],
      sunken: neutral[isDark ? "800" : "200"],
      well: neutral[isDark ? "700" : "300"],
    },
    border: {
      base: neutral[isDark ? "800" : "200"],
      strong: neutral[isDark ? "700" : "300"],
      hover: neutral[isDark ? "600" : "400"],
    },
    ink: {
      primary: neutral[isDark ? "0" : "950"],
      secondary: neutral[isDark ? "400" : "700"],
      tertiary: neutral[isDark ? "500" : "500"],
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

type SameShapeStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : SameShapeStrings<T[K]>;
};

export const COLOR_VALUES_DARK = colorTokens("dark") satisfies SameShapeStrings<typeof COLOR_VALUES>;
