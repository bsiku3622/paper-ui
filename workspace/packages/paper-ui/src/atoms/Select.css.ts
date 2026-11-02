import { controlGeometry } from "../internal/shape";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// The wrapper is the frame: inputFrame draws its border, corner and ring, fieldPaint its colour, the Surface fill its face.
// The native select owns the form and the focus behaviour, and fills the frame from inside it: in a place with no width of
// its own, the widest option is what gives the frame one.
export const selectWrap = style({
  display: "inline-grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateRows: "minmax(0, 1fr)",
  position: "relative",
  width: "100%",
  minWidth: 0,
  verticalAlign: "middle",
  cursor: "pointer",
});

export const selectRoot = style({
  appearance: "none",
  minWidth: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  letterSpacing: "inherit",
  cursor: "inherit",
});

export const selectSize = styleVariants(controlGeometry.select);
export const selectValueSize = styleVariants(controlGeometry.selectValue);

// The arrow is a trailing Icon: SVG backgrounds cannot inherit semantic vars; this
// non-interactive decoration can. Its artboard and stroke come from Icon, its place from size, its colour from selectArrowPaint.
export const selectArrow = style({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
});

export const selectArrowSize = styleVariants(controlGeometry.selectArrow);
