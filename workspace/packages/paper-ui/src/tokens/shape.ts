// Shape — the form of one element: radius, stroke, focus ring, sizing and inset.
//
// Every Shape number is written once, in SHAPE_SOURCE, as dp. From there one direction only:
//
//   SHAPE_SOURCE   authored numbers
//   SHAPE_VALUES   the source as CSS values, emitted once as --pui-shape-* (styles/theme.css.ts)
//   SHAPE          public roles: an alias of a source variable, or a calc() over them
//
// Roles never get variables of their own. An alias is the source variable itself and a formula
// is evaluated on the element that uses it, so overriding one source variable in a subtree
// re-derives every role built on it. Shape reads no other system: what a control's text does to its inset is the
// second-order Control (control-recipes.ts). Layout builds on the space scale here, and Shape never reads Layout.

import { controlSizes, type ControlSize } from "./control-sizes";
import { buildVarTree, em, keys, lengths, px, rem } from "./helpers";
import type { TextVariant } from "./typography";

export const CONTROL_SHAPES = ["rounded", "pill"] as const;
export type ControlShape = (typeof CONTROL_SHAPES)[number];

// Named element sizes (Box width·height) have their own five steps; the width map names them.
const DIMENSION_WIDTH = { xs: 72, sm: 108, md: 160, lg: 240, xl: 360 } as const;
export const DIMENSIONS = keys(DIMENSION_WIDTH);
export type Dimension = keyof typeof DIMENSION_WIDTH;

export const SHAPE_SOURCE = {
  // The one length scale. Shape insets (inside an element) and Layout gaps (between elements)
  // both select from it. Steps run on the 4dp grid to xl, then on 8dp through page-level
  // distances (2xl · 3xl).
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 },
  // A control's corner follows its size: one curve reads far rounder on a small box than on a large one, so a Shape can
  // set them apart. text hugs a line of text. pill is the label's form and a Shape may pull it down; full is a circle's
  // geometry, and a Radio that read a lower value would stop being round.
  radius: {
    control: { xs: 8, sm: 12, md: 12, lg: 12, xl: 12 } satisfies Record<ControlSize, number>,
    selection: 4,
    surface: { sm: 12, md: 16, lg: 20 },
    text: 4,
    pill: 999,
    full: 999,
  },
  // border · emphasis are CSS px; icon is SVG user units on the 24-unit artboard.
  stroke: { border: 1, emphasis: 2, icon: 1.75 },
  focus: { width: 2, offset: 2 },
  // The smallest area a press may land on (WCAG 2.5.8). CSS px: a hit area does not follow the root font.
  target: { min: 24 },
  control: {
    height: { xs: 32, sm: 36, md: 40, lg: 44, xl: 48 } satisfies Record<ControlSize, number>,
    // A button's label defines its box, so it sits wider than a typed value. Set by hand for each size: a ratio of the input
    // inset could not move one size alone, and a value picked in a design file lands here as it is. It does not follow the
    // height, so a change to the height ladder changes this one too.
    buttonInset: { xs: 11, sm: 14, md: 17, lg: 20, xl: 23 } satisfies Record<ControlSize, number>,
  },
  // A selection mark stands beside a line of text, so its size doesn't follow how much room a control takes: sizes that hold the
  // same text hold the same mark.
  selection: { size: { xs: 16, sm: 18, md: 18, lg: 20, xl: 20 } satisfies Record<ControlSize, number> },
  // Icon artboards are named after the Text role they stand beside.
  icon: { label: 14, caption: 16, body: 18, subheading: 20 } satisfies Partial<Record<TextVariant, number>>,
  dimension: {
    width: DIMENSION_WIDTH,
    height: { xs: 64, sm: 96, md: 144, lg: 216, xl: 320 } satisfies Record<Dimension, number>,
  },
  // Reading widths of a text block.
  measure: { xs: 448, sm: 512, md: 608, lg: 672, xl: 736 },
  // Component anatomy that no rule derives. Emitted, but reachable only through shape recipes.
  anatomy: {
    badge: {
      height: { xs: 20, sm: 22, md: 22, lg: 24, xl: 26 } satisfies Record<ControlSize, number>,
      inset: { xs: 6, sm: 8, md: 8, lg: 10, xl: 12 } satisfies Record<ControlSize, number>,
    },
    // Turned onto its diagonal, the check keeps its visual mass low and left, so it shifts by these ratios of the
    // emphasis stroke (x to the right, y down).
    checkbox: { markShift: { x: 0.25, y: -0.5 } },
    // A Radio's dot, as a share of its box: white on black reads larger than black on white, so it stays under half.
    radio: { dot: 0.4 },
    // A Switch's track, as long as this many of its heights: short and stout, so its round knob fills most of it.
    switch: { length: 1.5 },
    // How much of its turn a Spinner leaves empty before the tail starts (%).
    spinner: { tail: 8 },
    // Marks sized against the text they sit in (em).
    inline: { dot: 0.5, spinner: 1 },
    // The highlighter's band: its height and where it sits in the line box (%), and how far past the glyphs it runs (em).
    marker: { height: 84, position: 50, overrun: 0.08 },
  },
} as const;

export const SPACES = keys(SHAPE_SOURCE.space);
export type Space = keyof typeof SHAPE_SOURCE.space;
// The corners a Surface takes: the surface family, and the pill.
export const SURFACE_RADII = [...keys(SHAPE_SOURCE.radius.surface), "full"] as const;
export type SurfaceRadius = (typeof SURFACE_RADII)[number];
export const MEASURES = keys(SHAPE_SOURCE.measure);
export type Measure = keyof typeof SHAPE_SOURCE.measure;
export const ICON_SIZES = keys(SHAPE_SOURCE.icon);
export type IconSize = keyof typeof SHAPE_SOURCE.icon;
// Control icons follow the control height (32 and 36 → 16, 40 → 18, 44 and 48 → 20), not the text beside them:
// control text is a preset (13 · 14 · 14 · 15 · 16) whose steps are not all Text roles.
export const CONTROL_ICON = { xs: "caption", sm: "caption", md: "body", lg: "subheading", xl: "subheading" } as const satisfies Record<ControlSize, IconSize>;

const s = SHAPE_SOURCE;

// Lengths scale with the root font; strokes, the focus ring and the pill corner stay in px.
export const SHAPE_VALUES = {
  space: lengths(s.space),
  radius: {
    control: lengths(s.radius.control),
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

// The scale and the anatomy stay inside the token layer: consumers pick a role — inset here,
// gap in Layout — never a raw step.
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
