// The Color inspector's view of the source — the palette as authored, the table that selects from it,
// and what each variant is made of. The Playground reads it as @paper-ui/inspect/color and shows it;
// nothing in the package imports this directory.

export { ACCENT_PALETTES, ACCENT_STEPS, ALPHA_STEPS, PALETTE_STEPS, PALETTE_TOKENS } from "../palette";
export { ACCENT_PALETTE, COLOR_SELECTION, COLOR_VALUES, COLOR_VALUES_BY_MODE, COLOR_VALUES_DARK, STATUS_PALETTE, paletteValue } from "../colors";
export type { PalettePath } from "../colors";
export { VARIANT_RECIPE } from "../color-recipes";
