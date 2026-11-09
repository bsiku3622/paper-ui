import { SHAPE_RECIPES, STATE_TINT_PROPERTY, stateStyle, tokens, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

export const calendar = style({
  display: "inline-flex",
  flexDirection: "column",
  gap: tokens.shape.inset.sm,
  maxWidth: "100%",
});

export const calendarHeader = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.inset.xs,
});

export const calendarTitle = style({
  flexGrow: 1,
  minWidth: 0,
  paddingInlineStart: tokens.shape.inset.xs,
});

export const calendarGrid = style({
  borderCollapse: "separate",
  borderSpacing: tokens.shape.inset.xs,
  margin: `calc(${tokens.shape.inset.xs} * -1)`,
});

export const calendarWeekday = style({ padding: 0, textAlign: "center" });

export const calendarCell = style({ padding: 0, textAlign: "center" });

export const calendarDay = style([stateStyle.focusVisible, stateStyle.disabled, {
  position: "relative",
  cursor: "pointer",
  userSelect: "none",
  transition: [transition("hover", STATE_TINT_PROPERTY, "border-color"), transition("state", "background-color", "color")].join(", "),
}]);

export const calendarMark = style({
  position: "absolute",
  insetBlockEnd: tokens.shape.inset.xs,
  insetInline: 0,
  marginInline: "auto",
  width: SHAPE_RECIPES.badge.dot,
  height: SHAPE_RECIPES.badge.dot,
  borderRadius: tokens.shape.radius.full,
  pointerEvents: "none",
});
