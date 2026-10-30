import { tokens, transition, CONTROL_SIZES, type ControlSize } from "../tokens";
import { outlinedControlProfile, outlinedControlHover } from "../tokens/color-recipes";
import { controlGeometry, focusRing, geometry } from "../internal/shape";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// The wrapper owns appearance and layout; native select owns form and focus behavior.
export const selectWrap = style({
  ...outlinedControlProfile,
  display: "inline-grid",
  position: "relative",
  width: "100%",
  minWidth: 0,
  verticalAlign: "middle",
  borderRadius: tokens.shape.radius.control,
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  cursor: "pointer",
  transition: transition("state", "border-color", "background-color"),
  selectors: {
    '&:has(option[value=""]:checked)': { color: tokens.color.ink.tertiary },
    "&:hover:has(select:enabled)": outlinedControlHover,
    "&:has(select:focus-visible:not([data-pui-pointer-focus]))": focusRing,
    "&:has(select:disabled)": { opacity: 0.5, cursor: "not-allowed" },
  },
});

export const selectRoot = style({
  appearance: "none",
  position: "absolute",
  inset: 0,
  minWidth: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  padding: "inherit",
  border: "none",
  borderRadius: "inherit",
  outline: "none",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  letterSpacing: "inherit",
  cursor: "inherit",
  selectors: {
    "&:focus-visible": { outline: "none", borderRadius: "inherit" },
  },
});

export const selectSize = styleVariants(controlGeometry.select);
export const selectPill = style({ borderRadius: tokens.shape.radius.full });

// The arrow is a trailing Icon: SVG backgrounds cannot inherit semantic vars; this
// non-interactive decoration can. Its artboard and stroke come from Icon, its place from size.
export const selectArrow = style({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  color: tokens.color.ink.secondary,
  selectors: {
    [`${selectWrap}:has(option[value=""]:checked) &`]: { color: tokens.color.ink.tertiary },
    [`${selectRoot}[multiple] + &`]: { display: "none" },
  },
});

export const selectArrowSize = styleVariants(Object.fromEntries(CONTROL_SIZES.map((size) => [size, {
  insetInlineEnd: geometry.select.arrowInset[size],
}])) as Record<ControlSize, { insetInlineEnd: string }>);
