// The vocabulary — every axis the package names, as one constant and one type. Each pair is defined
// in the file of its system (derived from the tree that authors it, or bound to it with `satisfies`),
// and this file lists them all: the barrel and the `/tokens` entry both re-export it.

export { STATUSES, ACCENTS, ACCENT_TONES, SURFACES, INK_LEVELS, BORDER_LEVELS, DIVIDER_LEVELS } from "./colors";
export type { Status, Accent, AccentTone, Surface, InkLevel, BorderLevel, DividerLevel } from "./colors";

export { VARIANTS } from "./color-recipes";
export type { Variant } from "./color-recipes";

export { TEXT_VARIANTS, TEXT_FAMILIES, CONTROL_SIZES, CONTROL_PRESETS } from "./typography";
export type { TextVariant, TextFamily, ControlSize, ControlPreset } from "./typography";

export { SPACES, DIMENSIONS, MEASURES, ICON_SIZES, CONTROL_SHAPES } from "./shape";
export type { Space, Dimension, Measure, IconSize, ControlShape } from "./shape";

export { ELEVATIONS, BREAKPOINTS, CONTAINERS, ORIENTATIONS } from "./layout";
export type { Elevation, Breakpoint, Container, Orientation } from "./layout";
