import { controlVars } from "../primitives/control/Control.css";
import { STATE_TINT_PROPERTY, stateStyle, tokens, transition } from "../tokens";
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
  borderSpacing: `0 ${tokens.shape.inset.xs}`,
  marginBlock: `calc(${tokens.shape.inset.xs} * -1)`,
});

export const calendarWeekday = style({ padding: 0, textAlign: "center" });

export const calendarCell = style({ position: "relative", padding: 0, textAlign: "center" });

export const calendarRange = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
});
export const calendarRangeStart = style({ borderStartStartRadius: controlVars.corner, borderEndStartRadius: controlVars.corner });
export const calendarRangeEnd = style({ borderStartEndRadius: controlVars.corner, borderEndEndRadius: controlVars.corner });

export const calendarDayStart = style({ borderStartEndRadius: 0, borderEndEndRadius: 0 });
export const calendarDayEnd = style({ borderStartStartRadius: 0, borderEndStartRadius: 0 });

export const calendarDay = style([stateStyle.focusVisible, stateStyle.disabled, {
  position: "relative",
  cursor: "pointer",
  userSelect: "none",
  transition: [transition("hover", STATE_TINT_PROPERTY, "border-color"), transition("state", "background-color", "color")].join(", "),
}]);

export const calendarMark = style({
  position: "absolute",
  insetBlockEnd: tokens.shape.stroke.emphasis,
  insetInline: 0,
  marginInline: "auto",
  width: tokens.shape.inset.xs,
  height: tokens.shape.inset.xs,
  borderRadius: tokens.shape.radius.full,
  pointerEvents: "none",
});
