// L1 — Palette → calibrated color ladders
//
// Raw literal은 이 파일에만 둔다. Palette는 색 family의 identity(hue·chroma)를, 여기서는
// 그 family가 paper-ui의 두 테마에서 실제로 지나는 tone step을 정한다. 컴포넌트는 다음
// 레이어(colors.ts)의 semantic token만 본다.

import { PALETTE } from "./palette";
import type { AccentPalette, ColorMode } from "./palette";

export const NEUTRAL_STEPS = ["0", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "925", "950"] as const;
export type NeutralStep = (typeof NEUTRAL_STEPS)[number];

export const ACCENT_STEPS = ["50", "100", "200", "400", "600", "700"] as const;
export type AccentStep = (typeof ACCENT_STEPS)[number];

type NeutralLadder = Record<NeutralStep, string>;
type AccentLadder = Record<AccentStep, string>;

// palette가 mode별 hue의 정본이다. Ladder는 그 위에 mode별 L/C 곡선을 얹는다. hue를
// 억지로 하나로 평탄화하지 않아 기존 Veil의 차분한 warning·green 결을 보존한다.
const oklch = (mode: ColorMode, palette: AccentPalette, lightness: number, chroma: number): string =>
  `oklch(${lightness} ${chroma} ${PALETTE[palette].hue[mode]})`;

// 낮은 번호는 시각적으로 더 어둡고, 높은 번호는 더 밝다. 다크에서도 같은 방향을
// 유지하므로 token layer는 테마에 따라 "몇 번째 밝기"를 다시 해석할 필요가 없다.
export const NEUTRAL_LADDER: Record<ColorMode, NeutralLadder> = {
  light: {
    "0": "#18181b",
    "50": "#3f3f46",
    "100": "#71717a",
    "200": "#92929b",
    "300": "#a1a1aa",
    "400": "#b3b3bb",
    "500": "#ccccd1",
    "600": "#e2e2e5",
    "700": "#e8e8ea",
    "800": "#f4f4f5",
    "900": "#fcfcfc",
    "925": "#fefefe",
    "950": "#ffffff",
  },
  dark: {
    "0": "#0d0d10",
    "50": "#101013",
    "100": "#161619",
    "200": "#252529",
    "300": "#2b2b31",
    "400": "#3d3d44",
    "500": "#4f4f58",
    "600": "#6e6e75",
    "700": "#8b8b92",
    "800": "#a1a1a8",
    "900": "#d6d6d9",
    "925": "#e8e8ea",
    "950": "#e9e9eb",
  },
};

// Accent의 step은 hue마다 동일한 UI 역할을 가진다.
// 50=veil/wash · 100=soft surface · 200=soft edge · 400=standalone outline
// 600=solid surface · 700=AA ink. soft와 wash를 분리해 Muted가 실제 면의 무게를
// 낮출 수 있게 한다.
export const ACCENT_LADDER: Record<ColorMode, Record<AccentPalette, AccentLadder>> = {
  light: {
    blue: {
      "50": "#f5f9fe",
      "100": oklch("light", "blue", 0.9304, 0.0263),
      "200": "#d1e1f5",
      "400": "#5694e9",
      "600": "#2563eb",
      "700": "#1d4ed8",
    },
    green: {
      "50": "#f5fdf8",
      "100": oklch("light", "green", 0.9319, 0.0355),
      "200": "#cff0dc",
      "400": "#35a75f",
      "600": "#15803d",
      // 600은 의미 면, 700은 지면 위 일반 글자다. 둘을 같은 값으로 두면
      // green Muted가 outline·ghost에서 normal과 구별되지 않는다.
      "700": "#166534",
    },
    amber: {
      "50": "#fefbf3",
      "100": oklch("light", "amber", 0.9323, 0.0524),
      "200": "#f4e7b5",
      "400": "#c5861b",
      "600": "#b45309",
      "700": "#92400e",
    },
    red: {
      "50": "#fdf7f7",
      "100": oklch("light", "red", 0.9304, 0.025),
      "200": "#f4d8d8",
      "400": "#ed6969",
      "600": "#dc2626",
      "700": "#b91c1c",
    },
  },
  dark: {
    blue: {
      "50": "#0d1c32",
      "100": oklch("dark", "blue", 0.2561, 0.0708),
      "200": "#1a355d",
      "400": "#4c6fa3",
      "600": "#5492ec",
      "700": "#8ebcff",
    },
    green: {
      "50": "#062211",
      "100": oklch("dark", "green", 0.2558, 0.07),
      "200": "#094021",
      "400": "#3a7b52",
      "600": "#32ac64",
      "700": "#81cf99",
    },
    amber: {
      "50": "#291800",
      "100": oklch("dark", "amber", 0.2561, 0.0654),
      "200": "#4c2e00",
      "400": "#8e672c",
      "600": "#c58300",
      "700": "#e4b066",
    },
    red: {
      "50": "#2f1211",
      "100": oklch("dark", "red", 0.2562, 0.0711),
      "200": "#572223",
      "400": "#a15a59",
      "600": "#df6768",
      "700": "#f99e9b",
    },
  },
};

export const INTERACTION_LADDER: Record<ColorMode, { hover: string; selected: string; active: string; scrim: string }> = {
  light: {
    hover: "rgba(24, 25, 28, 0.05)",
    selected: "rgba(24, 25, 28, 0.13)",
    active: "rgba(24, 25, 28, 0.16)",
    scrim: "rgba(24, 25, 28, 0.32)",
  },
  dark: {
    hover: "rgba(251, 252, 255, 0.036)",
    selected: "rgba(251, 252, 255, 0.10)",
    active: "rgba(251, 252, 255, 0.13)",
    scrim: "rgba(4, 4, 8, 0.58)",
  },
};
