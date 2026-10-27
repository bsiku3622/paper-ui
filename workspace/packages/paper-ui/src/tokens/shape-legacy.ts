// Compatibility only. New components must use semantic Shape / Layout / private recipes.
import { buildVarTree } from "./helpers";
import { LAYOUT_VALUES } from "./layout";
import { SHAPE_VALUES, SPACE_KEYS, controlSizes } from "./shape";
import { SHAPE_PALETTE as p } from "./shape-palette";
import { SHAPE_RECIPES } from "./shape-recipes";

const shape = buildVarTree(SHAPE_VALUES, ["shape"]);
const layout = buildVarTree(LAYOUT_VALUES, ["layout"]);
const geometry = SHAPE_RECIPES;
const spaceMap = <T>(select: (size: (typeof SPACE_KEYS)[number]) => T) =>
  Object.fromEntries(SPACE_KEYS.map((size) => [size, select(size)])) as Record<(typeof SPACE_KEYS)[number], T>;
const height = { xs: p.size[24], ...shape.control.height, xl: p.size[44] };

export const SHAPE_LEGACY_VALUES = {
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  height: spaceMap((size) => ({ interaction: height[size], layout: layout.height[size] })),
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  width: spaceMap((size) => ({ layout: layout.width[size] })),
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  padding: spaceMap((size) => ({ interaction: shape.space[size], layout: layout.padding[size] })),
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  gap: shape.space,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  radius: { interaction: shape.radius.control, layout: shape.radius.surface },
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  controlPaddingX: shape.control.inset.button,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  inputPaddingX: shape.control.inset.input,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  textareaPaddingY: geometry.textarea.paddingBlock,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  icon: geometry.spinner.size,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  iconTextSize: shape.icon.size,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  badge: geometry.badge.height,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  badgePaddingX: geometry.badge.paddingInline,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  checkbox: controlSizes((size) => ({ box: shape.selection.size[size], mark: geometry.checkbox.mark[size], short: geometry.checkbox.short[size], radius: geometry.checkbox.radius[size] })),
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  switch: controlSizes((size) => ({ w: geometry.switch.width[size], h: geometry.switch.height[size], thumb: geometry.switch.thumb[size] })),
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  measure: layout.measure,
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  constants: {
    borderWidth: shape.stroke.border,
    focusRingWidth: shape.focus.width,
    focusRingOffset: shape.focus.offset,
    activeIndicatorWidth: shape.stroke.emphasis,
    checkMarkStrokeWidth: geometry.checkbox.markStroke,
    spinnerStrokeWidth: geometry.spinner.stroke,
    iconStrokeWidth: shape.stroke.icon,
  },
  /** @deprecated Use canonical Shape / Layout roles; component anatomy is private. */
  atom: { selectArrow: geometry.select.arrowSize },
} as const;
