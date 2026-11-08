import { createGlobalVar, createVar } from "@vanilla-extract/css";

import { CONTROL, CONTROL_LINE_PROPERTY, CONTROL_LINE_ROOM, CONTROL_SIZES, ICON_SIZES, SHAPE_RECIPES, controlLineWidth, insideLine, markParts, tokens, type Align, type ControlAnatomy, type ControlSize, type IconSize, type Justify } from "../../tokens";
import { layered } from "../../tokens/layers.css";
import { iconSizeVar } from "../Icon.css";

const { style, styleVariants } = layered("components");

const height = createVar();
const corner = createVar();
const buttonInset = createVar();
const areaBlock = createVar();
const badgeHeight = createVar();
const badgeInset = createVar();

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
    [iconSizeVar]: tokens.shape.control.icon[size],
  },
}])) as Record<ControlSize, { vars: Record<string, string> }>);

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

export const controlAnatomy = styleVariants({
  label: { ...centred, height, paddingInline: insideLine(buttonInset), borderRadius: corner },
  icon: { ...centred, height, width: height, paddingInline: 0, flexShrink: 0, borderRadius: corner },
  input: { height, paddingInline: insideLine(controlVars.inputInset), gap: tokens.shape.control.gap, borderRadius: corner },
  frame: { height, borderRadius: corner },
  area: { paddingInline: insideLine(controlVars.inputInset), paddingBlock: areaBlock, borderRadius: corner },
  mark: { width: controlVars.mark, height: controlVars.mark },
  track: { width: track.trackWidth, height: track.trackHeight },
  badge: { display: "inline-flex", alignItems: "center", gap: SHAPE_RECIPES.badge.gap, height: badgeHeight, paddingInline: insideLine(badgeInset), borderRadius: corner },
  spinner: { width: iconSizeVar, height: iconSizeVar },
  segment: { display: "inline-flex", alignItems: "stretch", height, padding: SHAPE_RECIPES.segment.inset, borderRadius: corner },
  slider: { width: "100%", height: track.trackHeight },
} satisfies Record<ControlAnatomy, object>);

createGlobalVar(CONTROL_LINE_PROPERTY, { syntax: "<length>", inherits: true, initialValue: "0px" });

// Forced colours draw every edge, so there a control with no line gets its room back.
export const controlLineRoom = styleVariants({
  line: { vars: CONTROL_LINE_ROOM.line, selectors: { "&&": controlLineWidth } },
  none: { vars: CONTROL_LINE_ROOM.none, selectors: { "&&": controlLineWidth }, "@media": { "(forced-colors: active)": { vars: CONTROL_LINE_ROOM.line } } },
});

export const controlPill = style({
  vars: {
    [corner]: tokens.shape.radius.pill,
    [controlVars.inputInset]: buttonInset,
    [controlVars.valueEnd]: `calc(${buttonInset} + ${iconSizeVar} + ${tokens.shape.control.gap})`,
  },
  borderRadius: tokens.shape.radius.pill,
});

export const controlGap = styleVariants(tokens.layout.gap, (gap) => ({ gap }));
const ALIGN_ITEMS = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" } as const satisfies Record<Align, string>;
export const controlAlign = styleVariants(ALIGN_ITEMS, (alignItems) => ({ alignItems }));

const JUSTIFY_CONTENT = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" } as const satisfies Record<Justify, string>;
export const controlJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));
