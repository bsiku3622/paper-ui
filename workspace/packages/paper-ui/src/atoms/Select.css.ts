import { controlGeometry } from "../internal/shape";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// The wrapper is the frame: inputFrame draws its border, corner and ring, fieldPaint its colour, the Surface fill its face.
// The native select owns the form and the focus behaviour.
export const selectWrap = style({
  display: "inline-grid",
  position: "relative",
  width: "100%",
  minWidth: 0,
  verticalAlign: "middle",
  cursor: "pointer",
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
  outline: "none",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  letterSpacing: "inherit",
  cursor: "inherit",
});

export const selectSize = styleVariants(controlGeometry.select);

// The arrow is a trailing Icon: SVG backgrounds cannot inherit semantic vars; this
// non-interactive decoration can. Its artboard and stroke come from Icon, its place from size, its colour from selectArrowPaint.
export const selectArrow = style({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
});

export const selectArrowSize = styleVariants(controlGeometry.selectArrow);
