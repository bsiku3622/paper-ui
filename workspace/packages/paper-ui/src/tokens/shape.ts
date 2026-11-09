import { controlSizes, type ControlSize } from "./control-sizes";
import { buildVarTree, em, keys, lengths, px, rem } from "./helpers";
import type { TextVariant } from "./typography";

export const CONTROL_SHAPES = ["sharp", "small", "rounded", "pill"] as const;
export type ControlShape = (typeof CONTROL_SHAPES)[number];

const DIMENSION_WIDTH = { xs: 72, sm: 108, md: 160, lg: 240, xl: 360 } as const;
export const DIMENSIONS = keys(DIMENSION_WIDTH);
export type Dimension = keyof typeof DIMENSION_WIDTH;

export const SHAPE_SOURCE = {
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 },
  radius: {
    control: { xs: 8, sm: 12, md: 12, lg: 12, xl: 12 } satisfies Record<ControlSize, number>,
    small: { xs: 4, sm: 6, md: 6, lg: 6, xl: 6 } satisfies Record<ControlSize, number>,
    selection: 4,
    surface: { sm: 12, md: 16, lg: 20 },
    text: 4,
    pill: 999,
    full: 999,
  },
  stroke: { border: 1, emphasis: 2, icon: 1.75 },
  focus: { width: 2, offset: 2 },
  // The smallest area a press may land on (WCAG 2.5.8). CSS px: a hit area does not follow the root font.
  target: { min: 24 },
  control: {
    height: { xs: 32, sm: 36, md: 40, lg: 44, xl: 48 } satisfies Record<ControlSize, number>,
    buttonInset: { xs: 11, sm: 14, md: 17, lg: 20, xl: 23 } satisfies Record<ControlSize, number>,
  },
  selection: { size: { xs: 16, sm: 18, md: 18, lg: 20, xl: 20 } satisfies Record<ControlSize, number> },
  icon: { label: 14, caption: 16, body: 18, subheading: 20 } satisfies Partial<Record<TextVariant, number>>,
  dimension: {
    width: DIMENSION_WIDTH,
    height: { xs: 64, sm: 96, md: 144, lg: 216, xl: 320 } satisfies Record<Dimension, number>,
  },
  measure: { xs: 448, sm: 512, md: 608, lg: 672, xl: 736 },
  anatomy: {
    badge: {
      height: { xs: 20, sm: 22, md: 22, lg: 24, xl: 26 } satisfies Record<ControlSize, number>,
      inset: { xs: 6, sm: 8, md: 8, lg: 10, xl: 12 } satisfies Record<ControlSize, number>,
    },
    checkbox: { markShift: { x: 0.25, y: -0.5 } },
    radio: { dot: 0.4 },
    switch: { length: 1.5 },
    spinner: { tail: 8 },
    inline: { dot: 0.5, spinner: 1 },
    marker: { height: 84, position: 50, overrun: 0.08 },
  },
} as const;

export const SPACES = keys(SHAPE_SOURCE.space);
export type Space = keyof typeof SHAPE_SOURCE.space;
export const SURFACE_RADII = [...keys(SHAPE_SOURCE.radius.surface), "full"] as const;
export type SurfaceRadius = (typeof SURFACE_RADII)[number];
export const MEASURES = keys(SHAPE_SOURCE.measure);
export type Measure = keyof typeof SHAPE_SOURCE.measure;
export const ICON_SIZES = keys(SHAPE_SOURCE.icon);
export type IconSize = keyof typeof SHAPE_SOURCE.icon;
export const CONTROL_ICON = { xs: "caption", sm: "caption", md: "body", lg: "subheading", xl: "subheading" } as const satisfies Record<ControlSize, IconSize>;

const s = SHAPE_SOURCE;

export const SHAPE_VALUES = {
  space: lengths(s.space),
  radius: {
    control: lengths(s.radius.control),
    small: lengths(s.radius.small),
    selection: rem(s.radius.selection),
    surface: lengths(s.radius.surface),
    text: rem(s.radius.text),
    pill: px(s.radius.pill),
    full: px(s.radius.full),
  },
  stroke: { border: px(s.stroke.border), emphasis: px(s.stroke.emphasis), icon: String(s.stroke.icon) },
  focus: lengths(s.focus, px),
  target: lengths(s.target, px),
  control: { height: lengths(s.control.height), buttonInset: lengths(s.control.buttonInset) },
  selection: { size: lengths(s.selection.size) },
  icon: lengths(s.icon),
  dimension: { width: lengths(s.dimension.width), height: lengths(s.dimension.height) },
  measure: lengths(s.measure),
  anatomy: {
    badge: { height: lengths(s.anatomy.badge.height), inset: lengths(s.anatomy.badge.inset) },
    checkbox: { markShift: { x: String(s.anatomy.checkbox.markShift.x), y: String(s.anatomy.checkbox.markShift.y) } },
    radio: { dot: String(s.anatomy.radio.dot) },
    switch: { length: String(s.anatomy.switch.length) },
    spinner: { tail: `${s.anatomy.spinner.tail}%` },
    inline: lengths(s.anatomy.inline, em),
    marker: { height: `${s.anatomy.marker.height}%`, position: `${s.anatomy.marker.position}%`, overrun: em(s.anatomy.marker.overrun) },
  },
} as const;

const source = buildVarTree(SHAPE_VALUES, ["shape"]);

export const SPACE = source.space;
export const ANATOMY = source.anatomy;

export const CONTROL_BUTTON_INSET = source.control.buttonInset;

export const SHAPE = {
  inset: SPACE,
  radius: source.radius,
  stroke: source.stroke,
  focus: source.focus,
  target: source.target,
  control: {
    height: source.control.height,
    gap: SPACE.sm,
    icon: controlSizes((size) => source.icon[CONTROL_ICON[size]]),
  },
  selection: source.selection,
  icon: { size: source.icon },
  dimension: source.dimension,
  measure: source.measure,
} as const;
