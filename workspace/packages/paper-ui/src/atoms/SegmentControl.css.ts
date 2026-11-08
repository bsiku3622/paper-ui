import { lineFrame, stateSelector, stateStyle, tokens, transition, elevationCast, nestedRadius, SHAPE_RECIPES } from "../tokens";
import { controlVars } from "../primitives/control/Control.css";
import { layered } from "../tokens/layers.css";

const { style, globalStyle } = layered("components");

const inset = SHAPE_RECIPES.segment.inset;

export const segmentRoot = style([stateStyle.disabled, { position: "relative", overflow: "hidden", minWidth: 0, verticalAlign: "middle" }]);
export const segmentFull = style({ display: "flex", width: "100%" });

export const segmentSettled = style({});

export const segmentThumb = style({
  position: "absolute",
  top: inset,
  bottom: inset,
  left: 0,
  borderRadius: nestedRadius(controlVars.corner, inset),
  ...elevationCast("lifted"),
  selectors: { [`${segmentSettled} &`]: { transition: transition("state", "transform", "width") } },
});

export const segmentItem = style([stateStyle.focusVisible, stateStyle.disabled, {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.control.gap,
  flex: "none",
  minWidth: 0,
  paddingInline: tokens.shape.inset.lg,
  borderRadius: nestedRadius(controlVars.corner, inset),
  whiteSpace: "nowrap",
  userSelect: "none",
  transition: transition("state", "color"),
  selectors: {
    [`${segmentFull} &`]: { flex: "1 1 0", minWidth: "auto", paddingInline: tokens.shape.inset.md },
  },
}]);

const SELECTED = stateSelector("selected");
const endCorner = nestedRadius(controlVars.corner, tokens.shape.stroke.border);
export const segmentOutline = style({ ...lineFrame(), padding: 0, overflow: "visible" });
export const segmentOutlineItem = style({
  transition: transition("state", "color", "background-color"),
  selectors: {
    [`${segmentOutline} &`]: { borderRadius: 0 },
    [`${segmentOutline} & + &`]: lineFrame({ side: "start" }),
    [`${segmentOutline} &:first-of-type`]: { borderStartStartRadius: endCorner, borderEndStartRadius: endCorner },
    [`${segmentOutline} &:last-of-type`]: { borderStartEndRadius: endCorner, borderEndEndRadius: endCorner },
  },
});
export const segmentCheck = style({ display: "none", flexShrink: 0 });
globalStyle(`${segmentOutlineItem}${SELECTED} > ${segmentCheck}`, { display: "block" });
globalStyle(`${segmentOutlineItem}${SELECTED} > svg:not(${segmentCheck})`, { display: "none" });
