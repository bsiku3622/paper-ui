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
// re-derives every role built on it. Shape may read Typography (control text sets the insets);
// Layout builds on the space scale here, and Shape never reads Layout.

import { buildVarTree, lengths, pathToVarRef, px, rem } from "./helpers";
import { CONTROL_SPEC } from "./text";

export const SPACE_KEYS = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
export type Space = (typeof SPACE_KEYS)[number];
// Named element sizes (Box width·height·measure) have their own five steps.
export const DIMENSION_KEYS = ["xs", "sm", "md", "lg", "xl"] as const;
export type Dimension = (typeof DIMENSION_KEYS)[number];
export const CONTROL_SIZES = ["sm", "md", "lg"] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];
// Icon artboards are named after the Text role they stand beside.
export const ICON_SIZES = ["label", "caption", "body", "subheading"] as const;
export type IconSize = (typeof ICON_SIZES)[number];
// The artboard an icon takes inside a control of each size.
export const CONTROL_ICON = { sm: "caption", md: "body", lg: "subheading" } as const satisfies Record<ControlSize, IconSize>;

// One typed size map; recipes choose a role instead of patching arbitrary CSS keys.
export const controlSizes = <T>(recipe: (size: ControlSize) => T): Record<ControlSize, T> =>
  Object.fromEntries(CONTROL_SIZES.map((size) => [size, recipe(size)])) as Record<ControlSize, T>;

export const SHAPE_SOURCE = {
  // The one length scale. Shape insets (inside an element) and Layout gaps (between elements)
  // both select from it. Steps run on the 4dp grid to xl, then on 8dp through page-level
  // distances (2xl · 3xl).
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 },
  // Radius only takes the edge off, so each family keeps one corner across its sizes.
  radius: { control: 4, selection: 3, surface: { sm: 4, md: 6, lg: 8 }, full: 999 },
  // border · emphasis are CSS px; icon is SVG user units on the 24-unit artboard.
  stroke: { border: 1, emphasis: 2, icon: 1.75 },
  focus: { width: 2, offset: 2 },
  control: {
    height: { sm: 30, md: 32, lg: 36 },
    // A button's label defines its box, so it sits wider than a typed value.
    buttonInsetRatio: 1.4,
  },
  icon: { label: 14, caption: 16, body: 18, subheading: 20 },
  dimension: {
    width: { xs: 72, sm: 108, md: 160, lg: 240, xl: 360 },
    height: { xs: 64, sm: 96, md: 144, lg: 216, xl: 320 },
  },
  // Reading widths of a text block.
  measure: { xs: 448, sm: 512, md: 608, lg: 672, xl: 736 },
  // Component anatomy that no rule derives. Emitted, but reachable only through shape recipes.
  anatomy: {
    badge: { height: { sm: 20, md: 22, lg: 24 }, inset: { sm: 6, md: 8, lg: 10 } },
    // Marks sized against the text they sit in (em).
    inline: { dot: 0.5, spinner: 1 },
  },
} as const;

const s = SHAPE_SOURCE;
const em = (ratio: number) => `${ratio}em`;

// Lengths scale with the root font; strokes, the focus ring and the pill corner stay in px.
export const SHAPE_VALUES = {
  space: lengths(s.space),
  radius: { control: rem(s.radius.control), selection: rem(s.radius.selection), surface: lengths(s.radius.surface), full: px(s.radius.full) },
  stroke: { border: px(s.stroke.border), emphasis: px(s.stroke.emphasis), icon: String(s.stroke.icon) },
  focus: lengths(s.focus, px),
  control: { height: lengths(s.control.height), buttonInsetRatio: String(s.control.buttonInsetRatio) },
  icon: lengths(s.icon),
  dimension: { width: lengths(s.dimension.width), height: lengths(s.dimension.height) },
  measure: lengths(s.measure),
  anatomy: {
    badge: { height: lengths(s.anatomy.badge.height), inset: lengths(s.anatomy.badge.inset) },
    inline: lengths(s.anatomy.inline, em),
  },
} as const;

const source = buildVarTree(SHAPE_VALUES, ["shape"]);

// The scale and the anatomy stay inside the token layer: consumers pick a role — inset here,
// gap in Layout — never a raw step.
export const SPACE = source.space;
export const ANATOMY = source.anatomy;

const leading = (key: string) => pathToVarRef(["text", "palette", "leading", key]);
const height = source.control.height;

// A typed value gets the same room on every side of its line box.
const inputInset = controlSizes((size) => `calc((${height[size]} - ${leading(CONTROL_SPEC.field[size].leading)}) / 2)`);
const buttonInset = controlSizes((size) =>
  `round(nearest, calc((${height[size]} - ${leading(CONTROL_SPEC.button.regular[size].leading)}) / 2 * ${source.control.buttonInsetRatio}), 1px)`);
// Selection marks are half a control tall, so a switch track spans one control height.
const selection = controlSizes((size) => `calc(${height[size]} / 2)`);

export const SHAPE = {
  inset: SPACE,
  radius: source.radius,
  stroke: source.stroke,
  focus: source.focus,
  control: {
    height,
    inset: { input: inputInset, button: buttonInset },
    gap: SPACE.sm,
    icon: controlSizes((size) => source.icon[CONTROL_ICON[size]]),
  },
  selection: { size: selection },
  icon: { size: source.icon },
  dimension: source.dimension,
  measure: source.measure,
} as const;
