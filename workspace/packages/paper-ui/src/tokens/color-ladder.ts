// L1 — Palette → calibrated color ladders
//
// Raw literal은 이 파일에만 둔다. Palette는 색 family의 identity(hue·chroma)를, 여기서는
// 그 family가 paper-ui의 두 테마에서 실제로 지나는 tone step을 정한다. 컴포넌트는 다음
// 레이어(colors.ts)의 semantic token만 본다.

import { PALETTE, SURFACE_PALETTE, SURFACE_STEPS } from "./palette";
import type { AccentPalette, ColorMode, SurfaceStep } from "./palette";

export const NEUTRAL_STEPS = SURFACE_STEPS;
export type NeutralStep = SurfaceStep;

// Accent도 surface와 같은 11-step ramp를 완결한다. semantic layer는 필요한 role만
// 고르지만, Palette에서는 중간 결까지 끊기지 않고 검토할 수 있다.
export const ACCENT_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
export type AccentStep = (typeof ACCENT_STEPS)[number];

type NeutralLadder = Record<NeutralStep, string>;
type AccentLadder = Record<AccentStep, string>;

// palette가 mode별 hue의 정본이다. Ladder는 그 위에 mode별 L/C 곡선을 얹는다. hue를
// 억지로 하나로 평탄화하지 않아 기존 Veil의 차분한 warning·green 결을 보존한다.
const oklch = (mode: ColorMode, palette: AccentPalette, lightness: number, chroma: number): string =>
  `oklch(${lightness} ${chroma} ${PALETTE[palette].hue[mode]})`;

// 낮은 번호는 시각적으로 더 어둡고, 높은 번호는 더 밝다. 다크에서도 같은 방향을
// 유지하므로 token layer는 테마에 따라 "몇 번째 밝기"를 다시 해석할 필요가 없다.
// L0의 zinc surface palette를 L1 neutral ladder로 연결한다. 여기서는 이름과 순서의
// 계약만 부여하며, 실제 색값은 palette 한 곳에 남겨 palette viewer와 token code가
// 같은 source를 본다.
export const NEUTRAL_LADDER: Record<ColorMode, NeutralLadder> = SURFACE_PALETTE;

// Accent의 semantic anchor는 hue마다 동일하다.
// 50=wash · 100=soft surface · 200=hairline edge · 400=standalone outline
// 600=solid pigment. 나머지는 palette의 연속성을 위한 중간/확장 step이다.
export const ACCENT_LADDER: Record<ColorMode, Record<AccentPalette, AccentLadder>> = {
  light: {
    blue: {
      "50": "#f5f9fe",
      "100": oklch("light", "blue", 0.9304, 0.0263),
      "200": "#d1e1f5",
      "300": "#9fbeef",
      "400": "#5694e9",
      "500": "#3a7ded",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1741ba",
      "900": "#11368d",
      "950": "#0d255d",
    },
    green: {
      "50": "#f5fdf8",
      "100": oklch("light", "green", 0.9319, 0.0355),
      "200": "#cff0dc",
      "300": "#8dd9a9",
      "400": "#35a75f",
      "500": "#20954c",
      "600": "#15803d",
      // 600은 의미 면, 700은 지면 위 일반 글자다. 둘을 같은 값으로 두면
      // green Muted가 outline·ghost에서 normal과 구별되지 않는다.
      "700": "#166534",
      "800": "#13522d",
      "900": "#0d3e22",
      "950": "#062b16",
    },
    amber: {
      "50": "#fefbf3",
      "100": oklch("light", "amber", 0.9323, 0.0524),
      "200": "#f4e7b5",
      "300": "#e7c864",
      "400": "#c5861b",
      "500": "#bd6a12",
      "600": "#b45309",
      "700": "#92400e",
      "800": "#78350f",
      "900": "#5c2d0b",
      "950": "#421f07",
    },
    red: {
      "50": "#fdf7f7",
      "100": oklch("light", "red", 0.9304, 0.025),
      "200": "#f4d8d8",
      "300": "#f5aaaa",
      "400": "#ed6969",
      "500": "#e84444",
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      "950": "#531313",
    },
  },
  dark: {
    blue: {
      "50": "#0d1c32",
      "100": oklch("dark", "blue", 0.2561, 0.0708),
      "200": "#1a355d",
      "300": "#294d7a",
      "400": "#4c6fa3",
      "500": "#4e80c5",
      "600": "#5492ec",
      "700": "#8ebcff",
      "800": "#b3d2ff",
      "900": "#d5e5ff",
      "950": "#edf4ff",
    },
    green: {
      "50": "#062211",
      "100": oklch("dark", "green", 0.2558, 0.07),
      "200": "#094021",
      "300": "#236438",
      "400": "#3a7b52",
      "500": "#3a925b",
      "600": "#32ac64",
      "700": "#81cf99",
      "800": "#a9e2b7",
      "900": "#cef1d6",
      "950": "#e8faec",
    },
    amber: {
      "50": "#291800",
      "100": oklch("dark", "amber", 0.2561, 0.0654),
      "200": "#4c2e00",
      "300": "#6f480e",
      "400": "#8e672c",
      "500": "#aa791a",
      "600": "#c58300",
      "700": "#e4b066",
      "800": "#f0c780",
      "900": "#fae0ae",
      "950": "#fff2d5",
    },
    red: {
      "50": "#2f1211",
      "100": oklch("dark", "red", 0.2562, 0.0711),
      "200": "#572223",
      "300": "#78383a",
      "400": "#a15a59",
      "500": "#bd6262",
      "600": "#df6768",
      "700": "#f99e9b",
      "800": "#f9b7b3",
      "900": "#ffd2ce",
      "950": "#ffeae7",
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
