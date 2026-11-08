import { controlVars } from "../primitives/control/Control.css";
import { iconSizeVar } from "../primitives/Icon.css";
import { insideLine, stateStyle, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

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

// It stands at the frame's lower edge, where a browser that points at a missing value points.
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

export const selectArrow = style({
  position: "absolute",
  top: "50%",
  insetInlineEnd: insideLine(controlVars.inputInset),
  transform: "translateY(-50%)",
  pointerEvents: "none",
});

export const selectListbox = style({
  display: "flex",
  flexDirection: "column",
  padding: tokens.shape.inset.xs,
  borderRadius: `calc(${controlVars.corner} + ${tokens.shape.inset.xs})`,
  outline: "none",
});

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
export const selectCheck = style({ flexShrink: 0, width: iconSizeVar, height: iconSizeVar });

export const selectGroupLabel = style({
  paddingInline: controlVars.inputInset,
  paddingBlockStart: tokens.shape.inset.sm,
  paddingBlockEnd: tokens.shape.inset.xs,
});
