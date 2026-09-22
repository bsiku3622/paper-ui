// L2 — Calibrated ladders → semantic color tokens
//
// 소비처는 palette hue나 step을 모른다. surface·content·border·accent처럼 화면에서 맡은
// 역할만 고른다. primary도 zinc 기반 accent family라 status와 정확히 같은 tone contract를
// 공유한다. `status`는 Form validation API의 이름일 뿐 별도 색 tree가 아니다.

import { ACCENT_LADDER, INTERACTION_LADDER, NEUTRAL_LADDER } from "./color-ladder";
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

// Shared variant가 보는 것은 다섯 자리뿐이다. solid는 지면 위 텍스트와 채운 면의
// pigment를 함께 맡고, solid 위의 전경은 반대 끝 `wash`다. ink/softInk/mutedInk처럼
// 같은 pigment를 다른 이름으로 복제하지 않는다.
export type AccentToken = {
  solid: string;
  wash: string;
  soft: string;
  edge: string;
  edgeStrong: string;
};

const statusAccent = (mode: ColorMode): Record<StatusName, AccentToken> => {
  const ladder = ACCENT_LADDER[mode];
  return Object.fromEntries(
    STATUS.map((status) => {
      const tone = ladder[STATUS_PALETTE[status]];
      return [status, {
        solid: tone["600"],
        wash: tone["50"],
        soft: tone["100"],
        edge: tone["200"],
        edgeStrong: tone["400"],
      }];
    }),
  ) as Record<StatusName, AccentToken>;
};

const colorTokens = (mode: ColorMode) => {
  const neutral = NEUTRAL_LADDER[mode];
  const isDark = mode === "dark";
  const status = statusAccent(mode);
  const primary: AccentToken = {
    solid: neutral[isDark ? "925" : "0"],
    wash: neutral[isDark ? "0" : "950"],
    soft: neutral[isDark ? "200" : "600"],
    edge: neutral[isDark ? "300" : "700"],
    edgeStrong: neutral[isDark ? "600" : "200"],
  };
  const accent: Record<AccentName, AccentToken> = { primary, ...status };

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
    accent,
    focus: { ring: accent.info.solid },
    interaction: INTERACTION_LADDER[mode],
    scrim: INTERACTION_LADDER[mode].scrim,
  };
};

export const COLOR_VALUES = colorTokens("light");

type SameShapeStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : SameShapeStrings<T[K]>;
};

export const COLOR_VALUES_DARK = colorTokens("dark") satisfies SameShapeStrings<typeof COLOR_VALUES>;
