// L2 — Calibrated ladders → semantic color tokens
//
// 소비처는 raw palette의 hue나 step을 모른다. surface·content·border·action·status처럼
// 화면에서 맡은 역할만 본다. theme.css.ts가 이 두 mode tree를 같은 CSS var 이름에 emit하고,
// components는 tokens.color.* var reference로만 닿는다.

import { ACCENT_LADDER, INTERACTION_LADDER, NEUTRAL_LADDER } from "./color-ladder";
import type { AccentPalette, ColorMode } from "./palette";

export const STATUS = ["info", "success", "warning", "error"] as const;
export type StatusName = (typeof STATUS)[number];
// Public `color` prop이 status hues를 가리키던 기존 API의 이름을 보존한다.
export type AccentName = StatusName;

// Status는 semantic 이름이고, palette hue와 분리된다. 색 family를 바꾸거나 새 palette를
// 추가해도 API·component 사용처는 이 map 아래에서 그대로다.
export const STATUS_PALETTE: Record<StatusName, AccentPalette> = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
};

type StatusToken = {
  solid: string;
  mutedInk: string;
  ink: string;
  wash: string;
  soft: string;
  softInk: string;
  edge: string;
  edgeStrong: string;
};

const statusTokens = (mode: ColorMode): Record<StatusName, StatusToken> => {
  const accents = ACCENT_LADDER[mode];
  return Object.fromEntries(
    STATUS.map((status) => {
      const tone = accents[STATUS_PALETTE[status]];
      return [status, {
        solid: tone["600"],
        mutedInk: tone["600"],
        ink: tone["700"],
        wash: tone["50"],
        soft: tone["100"],
        // 600은 일반 지면에서 AA를 지키는 가장 낮은 text step이다. Muted는 이 step을
        // 쓰고, 기본 text는 더 진한 700을 쓴다. 면과 선도 wash/edge로 한 단계 낮춘다.
        softInk: tone["700"],
        edge: tone["200"],
        edgeStrong: tone["400"],
      }];
    }),
  ) as Record<StatusName, StatusToken>;
};

const colorTokens = (mode: ColorMode) => {
  const neutral = NEUTRAL_LADDER[mode];
  const status = statusTokens(mode);
  const isDark = mode === "dark";

  return {
    surface: {
      // 다크도 step의 밝기 방향은 같되, raised는 바닥에 가장 가까운 낮은 step이다.
      raised: neutral[isDark ? "0" : "950"],
      canvas: neutral[isDark ? "50" : "900"],
      sunken: neutral[isDark ? "100" : "800"],
      well: neutral[isDark ? "200" : "600"],
    },
    content: {
      primary: neutral[isDark ? "950" : "0"],
      secondary: neutral[isDark ? "800" : "100"],
      tertiary: neutral[isDark ? "700" : "300"],
    },
    border: {
      base: neutral[isDark ? "300" : "700"],
      strong: neutral[isDark ? "400" : "500"],
      hover: neutral[isDark ? "500" : "400"],
    },
    action: {
      primary: {
        // primary도 색이 없는 예외가 아니라 neutral color family다. status와 같은 tone
        // contract를 가지되, zinc surface/content/border에서 값을 가져온다. 따라서 모든
        // muted variant는 family와 관계없이 wash + mutedInk로 한 단계 물러난다.
        base: neutral[isDark ? "925" : "0"],
        hover: neutral[isDark ? "900" : "50"],
        fg: neutral[isDark ? "0" : "950"],
        wash: neutral[isDark ? "50" : "900"],
        soft: neutral[isDark ? "200" : "600"],
        mutedInk: neutral[isDark ? "800" : "100"],
        ink: neutral[isDark ? "950" : "0"],
        softInk: neutral[isDark ? "950" : "0"],
        edge: neutral[isDark ? "300" : "700"],
        edgeStrong: neutral[isDark ? "600" : "200"],
      },
    },
    status,
    focus: { ring: status.info.solid },
    interaction: INTERACTION_LADDER[mode],
    scrim: INTERACTION_LADDER[mode].scrim,
  };
};

export const COLOR_VALUES = colorTokens("light");

type SameShapeStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : SameShapeStrings<T[K]>;
};

export const COLOR_VALUES_DARK = colorTokens("dark") satisfies SameShapeStrings<typeof COLOR_VALUES>;
