// L0 — Palette identity
//
// palette는 색의 출발점이다. accent의 hue identity와 neutral surface의 실제 zinc ramp를
// 함께 보관하지만, UI role·CSS 변수 이름은 여기 없다. 다음 layer(color-ladder.ts)가
// 이 출발점을 calibrated tone step으로, semantic token이 그 step을 화면 역할로 바꾼다.
//
// 컴포넌트·resolver·provider는 palette를 import하지 않는다. 이 파일은 ladder가 색
// family를 완결했는지 type으로 검증하는 registry다.

export const COLOR_MODES = ["light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

// Surface는 semantic 역할 전의 중립 원재료다. 낮은 번호는 어둡고, 높은 번호는 밝다.
// light/dark는 같은 방향을 유지한다 — semantic layer가 각 테마의 역할을 재배열한다.
export const SURFACE_STEPS = ["0", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "925", "950"] as const;
export type SurfaceStep = (typeof SURFACE_STEPS)[number];

// L0 surface palette — 순백 paper-ui의 zinc cast. 이 값은 color-ladder가 neutral ladder로
// 그대로 옮기고, `surface.raised` 같은 UI role은 L2에서만 생긴다.
export const SURFACE_PALETTE = {
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
} as const satisfies Record<ColorMode, Record<SurfaceStep, string>>;

export type PaletteSeed = {
  // 같은 pigment가 light/dark에서 완전히 같은 각도로 보이지는 않는다. 이 시스템의
  // 기존 Veil 색감을 보존하기 위해 각 mode의 보정 hue를 palette identity에 둔다.
  hue: Record<ColorMode, number>;
  chroma: number;
};

export const PALETTE = {
  zinc: { hue: { light: 286, dark: 286 }, chroma: 0.01 },
  blue: { hue: { light: 254, dark: 258.2 }, chroma: 0.16 },
  green: { hue: { light: 158.8, dark: 153.2 }, chroma: 0.14 },
  amber: { hue: { light: 95.2, dark: 70.9 }, chroma: 0.15 },
  red: { hue: { light: 17.7, dark: 21.3 }, chroma: 0.16 },
} as const satisfies Record<string, PaletteSeed>;

export type PaletteName = keyof typeof PALETTE;
export type AccentPalette = Exclude<PaletteName, "zinc">;

export const PALETTE_NAMES = ["zinc", "blue", "green", "amber", "red"] as const satisfies readonly PaletteName[];
export const ACCENT_PALETTES = ["blue", "green", "amber", "red"] as const satisfies readonly AccentPalette[];
