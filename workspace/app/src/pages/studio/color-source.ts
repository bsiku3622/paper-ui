// The studio's reader of Color's originals: the palette's steps with their colours (what the step picker offers), and the step each
// colour role takes in each mode (the roles' place in the tree an override is written in, and their values).

import { ACCENT_PALETTES, ACCENT_STEPS, ALPHA_STEPS, COLOR_SELECTION, PALETTE_STEPS, paletteValue, type PalettePath } from "@paper-ui/inspect/color";

import { leafPaths } from "./paths";

export type PaletteStep = { path: string; ramp: string; step: string; hex: string };
export type Ramp = { id: string; label: string; steps: PaletteStep[] };
type Mode = "light" | "dark";

export const hexOf = (path: string): string => paletteValue(path as PalettePath);

const stepOf = (ramp: string, step: string, path: string): PaletteStep => ({ path, ramp, step, hex: hexOf(path) });

export const RAMPS: Ramp[] = [
  { id: "neutral", label: "neutral", steps: PALETTE_STEPS.map((step) => stepOf("neutral", step, `neutral.${step}`)) },
  ...ACCENT_PALETTES.map((name) => ({ id: name, label: name, steps: ACCENT_STEPS.map((step) => stepOf(name, step, `${name}.${step}`)) })),
  { id: "marker", label: "marker", steps: [stepOf("marker", "marker", "marker")] },
  // The strengths of black and of white over whatever lies under them.
  { id: "alpha-950", label: "alpha · neutral.950", steps: ALPHA_STEPS.map((step) => stepOf("alpha-950", step, `alpha${step}.neutral.950`)) },
  { id: "alpha-0", label: "alpha · neutral.0", steps: ALPHA_STEPS.map((step) => stepOf("alpha-0", step, `alpha${step}.neutral.0`)) },
];

// Every palette step the picker offers, and the ones a palette override can be made of (a plain six-digit hex).
export const STEPS: PaletteStep[] = RAMPS.flatMap((ramp) => ramp.steps);

export const stepByHex = (hex: string): PaletteStep | undefined => {
  const lower = hex.toLowerCase();
  return STEPS.find((step) => step.hex.toLowerCase() === lower);
};

const at = (tree: object, path: readonly string[]): string => path.reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], tree) as string;

export type Role = { path: string[]; select: Record<Mode, string>; value: Record<Mode, string> };

export const ROLES: Role[] = leafPaths(COLOR_SELECTION.light).map((path) => {
  const select = { light: at(COLOR_SELECTION.light, path), dark: at(COLOR_SELECTION.dark, path) };
  return { path, select, value: { light: hexOf(select.light), dark: hexOf(select.dark) } };
});
