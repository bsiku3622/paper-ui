// L0 — Palette identity
//
// palette는 색의 *정체성*만 든다. UI role·명도 단계·CSS 변수 이름은 여기 없다.
// 실제 tone 값은 다음 레이어(color-ladder.ts)가 theme 별로 보관하고, semantic token은
// 그 ladder를 역할에 맞춰 재배열한다.
//
// 컴포넌트·resolver·provider는 palette를 import하지 않는다. 이 파일은 ladder가 색
// family를 완결했는지 type으로 검증하는 registry다.

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

export const COLOR_MODES = ["light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
