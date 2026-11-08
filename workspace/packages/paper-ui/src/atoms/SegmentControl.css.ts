import { lineFrame, stateSelector, stateStyle, tokens, transition, elevationCast, nestedRadius, SHAPE_RECIPES } from "../tokens";
import { controlVars } from "../primitives/control/Control.css";
import { layered } from "../tokens/layers.css";

const { style, globalStyle } = layered("components");

const inset = SHAPE_RECIPES.segment.inset;

// The track: the row of chips gives it a width, or it takes all it is given. The thumb is placed from its own edge, so it has to
// stand inside it. Its shadow would spill past the track at the row's ends, so the track clips it.
export const segmentRoot = style([stateStyle.disabled, { position: "relative", overflow: "hidden", minWidth: 0, verticalAlign: "middle" }]);
export const segmentFull = style({ display: "flex", width: "100%" });

// Set once the thumb has its first place: from then on it slides, and until then the selected chip draws its own face.
export const segmentSettled = style({});

// The chip that slides. Where it is and how wide comes from the selected item, measured; only its height and corner are its own.
export const segmentThumb = style({
  position: "absolute",
  top: inset,
  bottom: inset,
  left: 0,
  borderRadius: nestedRadius(controlVars.corner, inset),
  ...elevationCast("lifted"),
  selectors: { [`${segmentSettled} &`]: { transition: transition("state", "transform", "width") } },
});

// A choice. It holds a step more room in a track that fits its words than in a track that shares a row out, where every choice takes
// an equal part — but never less than its words and, chosen in an outlined group, its check: a choice that needs more keeps it, and
// the others share what is left. It stands after the thumb, so the words are painted over it.
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

// The outlined group: the frame an input has (its one line, nothing in from it), the choices side by side with the same line between
// them, and the chosen one's face reaching the frame. No chip slides; the end choices take the frame's corner less its line, so the
// chosen face fills the curve and a focus ring still has room outside it.
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
// The check leads the chosen choice. A choice that brings its own icon gives that place up to the check while it is chosen.
export const segmentCheck = style({ display: "none", flexShrink: 0 });
globalStyle(`${segmentOutlineItem}${SELECTED} > ${segmentCheck}`, { display: "block" });
globalStyle(`${segmentOutlineItem}${SELECTED} > svg:not(${segmentCheck})`, { display: "none" });
