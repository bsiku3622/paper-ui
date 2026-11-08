import { controlVars } from "../primitives/control/Control.css";
import { iconSizeVar } from "../primitives/Icon.css";
import { insideLine, stateStyle, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

// The wrapper is the frame: inputFrame draws its border, corner and ring, fieldPaint its colour, the Surface fill its face.
// The button inside fills it and shows the chosen option; in a place with no width of its own, the widest option is what gives the
// frame one, as a native select's is.
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

// The button that stands for the select: the value sits where an input's text does and stops before the arrow.
export const selectTrigger = style({
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

// Every option's words stand in one cell and only the chosen one is seen, so the widest gives the value its width and changing the
// value does not move the frame. Words wider than a frame that has a width are cut with an ellipsis.
export const selectValue = style({
  display: "grid",
  gridTemplateAreas: '"value"',
  flexGrow: 1,
  minWidth: 0,
  justifyItems: "start",
});
export const selectLabel = style({
  gridArea: "value",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
export const selectSizer = style({ visibility: "hidden", selectors: { "&::before": { content: "attr(data-label)" } } });

// The native select the form reads, and the ref holds. It is there for the form and for code, not for the eye or a screen reader,
// so it takes no room; it stands at the frame's lower edge, where a browser that points at a missing value points.
export const selectNative = style({
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

// The arrow is a trailing Icon: SVG backgrounds cannot inherit semantic vars; this
// non-interactive decoration can. Its artboard and stroke come from Icon, its colour from selectArrowPaint.
export const selectArrow = style({
  position: "absolute",
  top: "50%",
  insetInlineEnd: insideLine(controlVars.inputInset),
  transform: "translateY(-50%)",
  pointerEvents: "none",
});

// The list. Its options are rows of the Select's own size, set a step of the scale in from the panel's edge, and the panel's corner
// is theirs and that step, so the two curves run side by side.
export const selectListbox = style({
  display: "flex",
  flexDirection: "column",
  padding: tokens.shape.inset.xs,
  borderRadius: `calc(${controlVars.corner} + ${tokens.shape.inset.xs})`,
  outline: "none",
});

// A disabled option is dimmed and shows the not-allowed cursor, as a disabled control does.
export const selectOption = style([stateStyle.disabled, {
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  cursor: "pointer",
  userSelect: "none",
}]);
export const selectOptionLabel = style({
  flexGrow: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
// The check's room, the size a control's icon takes: the chosen option draws its check there, the others leave it empty.
export const selectCheck = style({ flexShrink: 0, width: iconSizeVar, height: iconSizeVar });

// A group's name sits where its options' words start, a step above them.
export const selectGroupLabel = style({
  paddingInline: controlVars.inputInset,
  paddingBlockStart: tokens.shape.inset.sm,
  paddingBlockEnd: tokens.shape.inset.xs,
});
