// L0 — Palette identity
//
// palette는 색의 *정체성*만 든다. UI role·명도 단계·CSS 변수 이름은 여기 없다.
// 실제 tone 값은 다음 레이어(color-ladder.ts)가 theme 별로 보관하고, semantic token은
// 그 ladder를 역할에 맞춰 재배열한다.
//
// 컴포넌트·resolver·provider는 palette를 import하지 않는다. 이 파일은 ladder가 색
// family를 완결했는지 type으로 검증하는 registry다.

export type PaletteSeed = {
  hue: number;
  chroma: number;
};

export const PALETTE = {
  zinc: { hue: 286, chroma: 0.01 },
  blue: { hue: 260, chroma: 0.16 },
  green: { hue: 151, chroma: 0.14 },
  amber: { hue: 55, chroma: 0.15 },
  red: { hue: 25, chroma: 0.16 },
} as const satisfies Record<string, PaletteSeed>;

export type PaletteName = keyof typeof PALETTE;
export type AccentPalette = Exclude<PaletteName, "zinc">;

export const PALETTE_NAMES = ["zinc", "blue", "green", "amber", "red"] as const satisfies readonly PaletteName[];
export const ACCENT_PALETTES = ["blue", "green", "amber", "red"] as const satisfies readonly AccentPalette[];

export const COLOR_MODES = ["light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
