// The vocabulary — every axis the package names, as one constant and one type. Each pair is defined
// in the file of its system (derived from the tree that authors it, or bound to it with `satisfies`),
// and this file lists them all: the barrel and the `/tokens` entry both re-export it.

export { STATUSES, CHOICE_STATUSES, ACCENTS, ACCENT_TONES, SURFACE_FILLS, INK_LEVELS, INKS, BORDER_LEVELS, DIVIDER_LEVELS, DEPTHS } from "./colors";
export type { Status, ChoiceStatus, Accent, AccentTone, SurfaceFill, InkLevel, Ink, BorderLevel, DividerLevel, Depth } from "./colors";

export { COLOR_MODES, THEME_PREFERENCES, SURFACE_THEMES } from "./color-modes";
export type { ColorMode, ThemePreference, SurfaceTheme } from "./color-modes";

export { VARIANTS, SELECTABLE_VARIANTS, FILLABLE_VARIANTS, INPUT_VARIANTS, SEGMENT_VARIANTS } from "./color-recipes";
export type { Variant, SelectableVariant, FillableVariant, InputVariant, SegmentVariant } from "./color-recipes";

export { TEXT_VARIANTS, TEXT_FAMILIES, CONTROL_FONT_SIZES, CONTROL_PRESETS, EMPHASES, LINK_UNDERLINES } from "./typography";
export type { TextVariant, TextFamily, ControlFontSize, ControlPreset, Emphasis, LinkUnderline } from "./typography";

export { CONTROL_SIZES } from "./control-sizes";
export type { ControlSize } from "./control-sizes";

export { CONTROL_ANATOMIES } from "./control-recipes";
export type { ControlAnatomy } from "./control-recipes";

export { LINE_SIDES, LINE_STYLES, LINE_WEIGHTS } from "./line-recipes";
export type { LineSide, LineStyle, LineWeight } from "./line-recipes";

export { SPACES, DIMENSIONS, MEASURES, ICON_SIZES, CONTROL_SHAPES, SURFACE_RADII } from "./shape";
export type { Space, Dimension, Measure, IconSize, ControlShape, SurfaceRadius } from "./shape";

export { ELEVATIONS, BREAKPOINTS, CONTAINERS, ALIGNS, JUSTIFIES, JUSTIFY_ITEMS, ORIENTATIONS } from "./layout";
export type { Elevation, Breakpoint, Container, Align, Justify, JustifyItem, Orientation } from "./layout";

export { MOTION_ROLES } from "./motion";
export type { MotionRole } from "./motion";

export { PREVIEW_STATES, STATE_NAMES } from "./state";
export type { PreviewState, StateName } from "./state";
