import { controlVars } from "../primitives/control/Control.css";
import { insideLine, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

export const datePickerWrap = style({
  display: "inline-grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateRows: "minmax(0, 1fr)",
  position: "relative",
  width: "100%",
  minWidth: 0,
  verticalAlign: "middle",
  cursor: "pointer",
});

export const datePickerTrigger = style({
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  width: "100%",
  height: "100%",
  paddingInline: insideLine(controlVars.inputInset),
  paddingInlineEnd: insideLine(controlVars.valueEnd),
  outline: "none",
  textAlign: "start",
  cursor: "inherit",
});

export const datePickerValue = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const datePickerIcon = style({
  position: "absolute",
  top: "50%",
  insetInlineEnd: insideLine(controlVars.inputInset),
  transform: "translateY(-50%)",
  pointerEvents: "none",
});

// It stands at the frame's lower edge, where a browser that points at a missing value points.
export const datePickerNative = style({
  position: "absolute",
  insetInlineStart: 0,
  bottom: 0,
  width: 0,
  height: 0,
  margin: 0,
  padding: 0,
  border: "none",
  overflow: "hidden",
  pointerEvents: "none",
  appearance: "none",
});

export const datePickerPanel = style({
  padding: tokens.shape.inset.md,
  outline: "none",
});
