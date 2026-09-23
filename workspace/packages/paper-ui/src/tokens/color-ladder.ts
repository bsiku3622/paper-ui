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

type Oklch = readonly [lightness: number, chroma: number, hue: number];
type AccentAnchors = Partial<Record<AccentStep, Oklch>>;

// 기존 Veil의 인상을 대표하는 기준색만 OKLCH 좌표로 둔다. 그 사이의 step은 각 anchor
// 사이를 perceptual space에서 보간하므로 중간색을 hex로 일일이 찍어 맞추지 않는다.
// 기준점은 기존 화면의 50·100·200·400·600·700·950 색을 OKLCH로 옮긴 값이다.
const ACCENT_ANCHORS: Record<ColorMode, Record<AccentPalette, AccentAnchors>> = {
  light: {
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
      "50": [0.9882, 0.011, 89.7201], "100": [0.9323, 0.0524, 95.2],
      "200": [0.9262, 0.0662, 95.2168], "400": [0.6678, 0.1343, 73.8263],
      "600": [0.5553, 0.1455, 48.9975], "700": [0.4732, 0.1247, 46.2007],
      "950": [0.2838, 0.0641, 51.3381],
    },
    red: {
      "50": [0.9808, 0.0064, 17.2665], "100": [0.9304, 0.025, 17.7],
      "200": [0.9053, 0.0312, 17.742], "400": [0.6825, 0.1639, 22.4015],
      "600": [0.5771, 0.2152, 27.325], "700": [0.5054, 0.1905, 27.5181],
      "950": [0.2979, 0.0947, 24.998],
    },
  },
  dark: {
    blue: {
      "50": [0.2261, 0.0478, 257.9054], "100": [0.2561, 0.0708, 258.2],
      "200": [0.3301, 0.0784, 258.1557], "400": [0.5384, 0.0915, 258.093],
      "600": [0.6601, 0.1493, 257.7728], "700": [0.7882, 0.108, 257.6984],
      "950": [0.9651, 0.0165, 259.4182],
    },
    green: {
      "50": [0.225, 0.0475, 153.7054], "100": [0.2558, 0.07, 153.2],
      "200": [0.3285, 0.0774, 153.1526], "400": [0.5284, 0.0934, 153.9897],
      "600": [0.6606, 0.1505, 152.9257], "700": [0.7894, 0.1094, 153.091],
      "950": [0.968, 0.0264, 152.3826],
    },
    amber: {
      "50": [0.2261, 0.0479, 74.2484], "100": [0.2561, 0.0654, 70.9],
      "200": [0.3304, 0.0712, 70.8511], "400": [0.5422, 0.0905, 74.8975],
      "600": [0.6613, 0.1404, 73.7148], "700": [0.7896, 0.11, 74.7696],
      "950": [0.9639, 0.0404, 86.7306],
    },
    red: {
      "50": [0.2265, 0.0478, 23.6114], "100": [0.2562, 0.0711, 21.3],
      "200": [0.33, 0.0788, 21.267], "400": [0.5495, 0.0936, 21.4075],
      "600": [0.6595, 0.1505, 21.5679], "700": [0.7901, 0.1093, 21.8758],
      "950": [0.953, 0.0233, 27.3417],
    },
  },
};

const formatOklch = ([lightness, chroma, hue]: Oklch): string =>
  `oklch(${lightness.toFixed(4)} ${chroma.toFixed(4)} ${hue.toFixed(2)})`;

const interpolateHue = (from: number, to: number, ratio: number): number => {
  const delta = ((to - from + 540) % 360) - 180;
  return (from + delta * ratio + 360) % 360;
};

const interpolateOklch = (from: Oklch, to: Oklch, ratio: number): Oklch => [
  from[0] + (to[0] - from[0]) * ratio,
  from[1] + (to[1] - from[1]) * ratio,
  interpolateHue(from[2], to[2], ratio),
];

const buildAccentLadder = (mode: ColorMode, palette: AccentPalette): AccentLadder => {
  const anchors = ACCENT_ANCHORS[mode][palette];
  const anchorSteps = ACCENT_STEPS.filter((step) => anchors[step]);
  return Object.fromEntries(ACCENT_STEPS.map((step) => {
    const exact = anchors[step];
    if (exact) return [step, formatOklch(exact)];

    const index = ACCENT_STEPS.indexOf(step);
    const lower = [...anchorSteps].reverse().find((anchor) => ACCENT_STEPS.indexOf(anchor) < index)!;
    const upper = anchorSteps.find((anchor) => ACCENT_STEPS.indexOf(anchor) > index)!;
    const start = ACCENT_STEPS.indexOf(lower);
    const end = ACCENT_STEPS.indexOf(upper);
    return [step, formatOklch(interpolateOklch(anchors[lower]!, anchors[upper]!, (index - start) / (end - start)))];
  })) as AccentLadder;
};

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
  light: Object.fromEntries(Object.keys(PALETTE).filter((name) => name !== "zinc").map((name) => [name, buildAccentLadder("light", name as AccentPalette)])) as Record<AccentPalette, AccentLadder>,
  dark: Object.fromEntries(Object.keys(PALETTE).filter((name) => name !== "zinc").map((name) => [name, buildAccentLadder("dark", name as AccentPalette)])) as Record<AccentPalette, AccentLadder>,
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
