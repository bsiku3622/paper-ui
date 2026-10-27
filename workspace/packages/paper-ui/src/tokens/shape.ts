// Shared geometry roles. Component anatomy belongs to shape-recipes.ts.
import { SHAPE_PALETTE as p } from "./shape-palette";

export const SPACE_KEYS = ["xs", "sm", "md", "lg", "xl"] as const;
export type Space = (typeof SPACE_KEYS)[number];
export const CONTROL_SIZES = ["sm", "md", "lg"] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

// One typed size map; recipes choose a role instead of patching arbitrary CSS keys.
export const controlSizes = <T>(recipe: (size: ControlSize) => T): Record<ControlSize, T> =>
  Object.fromEntries(CONTROL_SIZES.map((size) => [size, recipe(size)])) as Record<ControlSize, T>;

export const SHAPE_VALUES = {
  space: { xs: p.space[4], sm: p.space[8], md: p.space[12], lg: p.space[16], xl: p.space[24] },
  radius: {
    control: p.radius[4],
    surface: { sm: p.radius[4], md: p.radius[6], lg: p.radius[8] },
    full: p.radius.full,
  },
  stroke: { border: p.stroke[1], emphasis: p.stroke[2], icon: p.stroke.icon },
  focus: { width: p.stroke[2], offset: p.stroke[2] },
  control: {
    height: { sm: p.size[30], md: p.size[32], lg: p.size[36] },
    inset: {
      button: { sm: p.space[10], md: p.space[11], lg: p.space[14] },
      input: { sm: p.space[7], md: p.space[8], lg: p.space[10] },
    },
  },
  selection: { size: { sm: p.size[15], md: p.size[16], lg: p.size[18] } },
  icon: { size: { label: p.size[14], caption: p.size[16], body: p.size[18], heading3: p.size[20] } },
} as const;

// Geometry adapts to the theme; tint is supplied by semantic Color.
export const SHADOW_GEOMETRY = {
  light: {
    overlay: ["0 8px 24px 0", "0 2px 6px 0"],
    overlayMinimal: ["0 1px 3px 0"],
  },
  dark: {
    overlay: ["0 8px 22px -5px", "0 3px 7px -2px"],
    overlayMinimal: ["0 1px 2px 0"],
  },
} as const;
export type ShadowName = keyof typeof SHADOW_GEOMETRY.light;
export const SHADOW_NAMES = Object.keys(SHADOW_GEOMETRY.light) as ShadowName[];

/** @deprecated Use Space / SPACE_KEYS for spacing; ControlSize for controls. */
export type ShapeSize = Space;
/** @deprecated Use SPACE_KEYS. */
export const SHAPE_SIZES = SPACE_KEYS;
