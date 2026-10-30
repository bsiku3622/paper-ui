// The vocabulary — every axis the package names, as one constant and one type. Each pair is defined
// in the file of its system (derived from the tree that authors it, or bound to it with `satisfies`),
// and this file lists them all: the barrel and the `/tokens` entry both re-export it.

export { STATUSES, ACCENTS, ACCENT_TONES, SURFACE_FILLS, INK_LEVELS, INKS, BORDER_LEVELS, DIVIDER_LEVELS, DEPTHS } from "./colors";
export type { Status, Accent, AccentTone, SurfaceFill, InkLevel, Ink, BorderLevel, DividerLevel, Depth } from "./colors";

export { COLOR_MODES, THEME_PREFERENCES, SURFACE_THEMES } from "./color-modes";
export type { ColorMode, ThemePreference, SurfaceTheme } from "./color-modes";

export { VARIANTS, SELECTABLE_VARIANTS } from "./color-recipes";
export type { Variant, SelectableVariant } from "./color-recipes";

export { TEXT_VARIANTS, TEXT_FAMILIES, CONTROL_SIZES, CONTROL_FONT_SIZES, CONTROL_PRESETS, EMPHASES } from "./typography";
export type { TextVariant, TextFamily, ControlSize, ControlFontSize, ControlPreset, Emphasis } from "./typography";

export { SPACES, DIMENSIONS, MEASURES, ICON_SIZES, CONTROL_SHAPES, SURFACE_RADII } from "./shape";
export type { Space, Dimension, Measure, IconSize, ControlShape, SurfaceRadius } from "./shape";

export { ELEVATIONS, BREAKPOINTS, CONTAINERS, ALIGNS, JUSTIFIES, JUSTIFY_ITEMS, ORIENTATIONS } from "./layout";
export type { Elevation, Breakpoint, Container, Align, Justify, JustifyItem, Orientation } from "./layout";

export { MOTION_ROLES } from "./motion";
export type { MotionRole } from "./motion";
