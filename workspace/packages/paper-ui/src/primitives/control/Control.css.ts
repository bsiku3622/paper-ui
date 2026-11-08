import { createGlobalVar, createVar } from "@vanilla-extract/css";

import { CONTROL, CONTROL_LINE_PROPERTY, CONTROL_LINE_ROOM, CONTROL_SIZES, ICON_SIZES, SHAPE_RECIPES, controlLineWidth, insideLine, markParts, tokens, type Align, type ControlAnatomy, type ControlSize, type IconSize, type Justify } from "../../tokens";
import { layered } from "../../tokens/layers.css";
import { iconSizeVar } from "../Icon.css";

const { style, styleVariants } = layered("components");

// A size only sets these, and an anatomy only reads them. The values are formulas, so unlike Paint's accent × variant they
// fold: four sizes and a few anatomies, not one class per pair. Each is declared on the control itself, so overriding a source
// variable anywhere above it still re-derives what it reads.
const height = createVar();
const corner = createVar();
const buttonInset = createVar();
const areaBlock = createVar();
const badgeHeight = createVar();
const badgeInset = createVar();

// What an Atom reads in the parts it draws inside its control: a Select's arrow and value, a Field's input, a mark's check, dot and
// thumb, and the corner a segment's chip nests in.
export const controlVars = { inputInset: createVar(), inputLine: createVar(), valueEnd: createVar(), mark: createVar(), corner };

export const controlSize = styleVariants(Object.fromEntries(CONTROL_SIZES.map((size) => [size, {
  vars: {
    [height]: tokens.shape.control.height[size],
    [corner]: tokens.shape.radius.control[size],
    [buttonInset]: CONTROL.inset.button[size],
    [areaBlock]: CONTROL.area.paddingBlock[size],
    [controlVars.inputInset]: CONTROL.inset.input[size],
    [controlVars.inputLine]: CONTROL.inputLine[size],
    [controlVars.valueEnd]: CONTROL.select.paddingEnd[size],
    [controlVars.mark]: tokens.shape.selection.size[size],
    [badgeHeight]: SHAPE_RECIPES.badge.height[size],
    [badgeInset]: SHAPE_RECIPES.badge.inset[size],
    // A control's icons follow the control, not the text beside them.
    [iconSizeVar]: tokens.shape.control.icon[size],
  },
}])) as Record<ControlSize, { vars: Record<string, string> }>);

// After the sizes, so it wins by order.
export const controlIconSize = styleVariants(Object.fromEntries(ICON_SIZES.map((size) => [size, {
  vars: { [iconSizeVar]: tokens.shape.icon.size[size] },
}])) as Record<IconSize, { vars: Record<string, string> }>);

const centred = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.control.gap,
} as const;

const track = markParts(controlVars.mark);

// A box's corner follows its size: one curve reads far rounder on a small box than on a large one. The marks and the ring are not
// boxes: an Atom's own stylesheet says how round each one is.
export const controlAnatomy = styleVariants({
  label: { ...centred, height, paddingInline: insideLine(buttonInset), borderRadius: corner },
  // A square: the label is an icon. A crowded row does not get to squeeze it.
  icon: { ...centred, height, width: height, paddingInline: 0, flexShrink: 0, borderRadius: corner },
  input: { height, paddingInline: insideLine(controlVars.inputInset), gap: tokens.shape.control.gap, borderRadius: corner },
  frame: { height, borderRadius: corner },
  area: { paddingInline: insideLine(controlVars.inputInset), paddingBlock: areaBlock, borderRadius: corner },
  mark: { width: controlVars.mark, height: controlVars.mark },
  track: { width: track.trackWidth, height: track.trackHeight },
  // The text stays at one size: a Badge's height and its legibility are two axes, so the smallest does not fall below the floor
  // and the largest does not read as a button's label. The inset moves at the height's pace, so the sizes read as one silhouette
  // scaled, which the Box inset ladder would not: it spreads twice as fast.
  badge: { display: "inline-flex", alignItems: "center", gap: SHAPE_RECIPES.badge.gap, height: badgeHeight, paddingInline: insideLine(badgeInset), borderRadius: corner },
  spinner: { width: iconSizeVar, height: iconSizeVar },
  // The track holds its chips a step of the scale in from its edge, and the row of them is what gives it a width.
  segment: { display: "inline-flex", alignItems: "stretch", height, padding: SHAPE_RECIPES.segment.inset, borderRadius: corner },
  slider: { width: "100%", height: track.trackHeight },
} satisfies Record<ControlAnatomy, object>);

// The room a control keeps for its line is a length that inherits, and none until a paint gives it one (tokens/shape-recipes.ts).
createGlobalVar(CONTROL_LINE_PROPERTY, { syntax: "<length>", inherits: true, initialValue: "0px" });

// The room a Button's or a Badge's line takes, which its variant decides. The paint gave every variant the same frame, so the width
// is taken back here, on the control alone: a box painted the same way keeps its frame. Forced colours draw every edge, so there
// a control with no line gets its room back. The insets above read the room, so the label stays where it was.
export const controlLineRoom = styleVariants({
  line: { vars: CONTROL_LINE_ROOM.line, selectors: { "&&": controlLineWidth } },
  none: { vars: CONTROL_LINE_ROOM.none, selectors: { "&&": controlLineWidth }, "@media": { "(forced-colors: active)": { vars: CONTROL_LINE_ROOM.line } } },
});

// A pill follows the anatomies, so the same specificity is won by order. It is the control's corner, so what nests in it (a segment's
// chip) is a pill too. Its round ends eat into the room beside a typed value, so a pill input holds the value, a Select's arrow and
// the value's end at a button's inset: a pill Field or Select keeps the wider room a pill Button keeps around its label.
export const controlPill = style({
  vars: {
    [corner]: tokens.shape.radius.pill,
    [controlVars.inputInset]: buttonInset,
    [controlVars.valueEnd]: `calc(${buttonInset} + ${iconSizeVar} + ${tokens.shape.control.gap})`,
  },
  borderRadius: tokens.shape.radius.pill,
});

// How the content is laid out, picked apart from the size. Each comes after the anatomies and wins by order over what they hold by
// default. The vocabulary is the one the layout primitives use.
export const controlGap = styleVariants(tokens.layout.gap, (gap) => ({ gap }));
const ALIGN_ITEMS = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" } as const satisfies Record<Align, string>;
export const controlAlign = styleVariants(ALIGN_ITEMS, (alignItems) => ({ alignItems }));

// A box wider than its content: a row of a sidebar, a row with a number at its end.
const JUSTIFY_CONTENT = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" } as const satisfies Record<Justify, string>;
export const controlJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));
