import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, stateTransition, TEXT_VARIANTS, type TextVariant } from "../tokens";
import { outlinedControlProfile, outlinedControlHover } from "../styles/color-profile";
import { controlGeometry, geometry } from "../internal/shape";

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
  transition: stateTransition("border-color", "background-color"),
  selectors: {
    '&:has(option[value=""]:checked)': { color: tokens.color.ink.tertiary },
    "&:hover:has(select:enabled)": outlinedControlHover,
    "&:has(select:focus-visible:not([data-pui-pointer-focus]))": {
      outline: `${tokens.shape.focus.width} solid ${tokens.color.interaction.focus}`,
      outlineOffset: tokens.shape.focus.offset,
    },
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
export const selectFontSize = styleVariants(
  Object.fromEntries(TEXT_VARIANTS.map((variant) => [variant, { fontSize: tokens.text.style[variant].size }])) as Record<TextVariant, { fontSize: string }>,
);
export const selectPill = style({ borderRadius: tokens.shape.radius.full });

// SVG backgrounds cannot inherit semantic vars; this non-interactive decoration can.
export const selectArrow = style({
  position: "absolute",
  top: "50%",
  insetInlineEnd: geometry.select.arrowInset,
  transform: "translateY(-50%)",
  width: geometry.select.arrowSize,
  height: geometry.select.arrowSize,
  pointerEvents: "none",
  color: tokens.color.ink.secondary,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: geometry.select.arrowStroke,
  strokeLinecap: "round",
  selectors: {
    [`${selectWrap}:has(option[value=""]:checked) &`]: { color: tokens.color.ink.tertiary },
    [`${selectRoot}[multiple] + &`]: { display: "none" },
  },
});
