// The paints other primitives and Atoms borrow. Colour lives in the paint tier and nowhere else, so a
// part that needs a colour takes the class from here instead of reading tokens.color itself.

import { SYSTEM_COLORS, stateStyle, tokens } from "../../tokens";
import { layered } from "../../tokens/layers.css";
import { markProfile, outlinedControlProfile } from "../../tokens/color-recipes";

const { style, styleVariants } = layered("components");

// The modal backdrop of a Floating panel.
export const scrimPaint = style({ background: tokens.color.overlay.scrim });

// The colour of an input frame: the outlined control's ink and border, a status drawing its own border, and the
// border rising under a pointer. The face is the frame's Surface fill, so it is not set here.
export const fieldPaint = style([stateStyle.field, { color: outlinedControlProfile.ink, borderColor: outlinedControlProfile.border }]);

// The face and ring of a selection mark at rest. What a mark draws once checked is its own anatomy.
export const markPaint = style({ backgroundColor: outlinedControlProfile.face, borderColor: markProfile.rest.ring });

// A link's ink. Where it is underlined is the Link's own anatomy.
export const linkPaint = style({ color: tokens.color.interaction.link });

// The ring a Spinner turns: a quiet track with an ink arc, or (ink "inherit") the ink of the text it sits in, an arc on
// nothing. Under forced colours the author's colours stay, or the four sides of the ring would turn into one.
export const spinnerPaint = styleVariants({
  ink: {
    borderColor: tokens.color.border.base,
    borderTopColor: tokens.color.ink.primary,
    "@media": { "(forced-colors: active)": { forcedColorAdjust: "none", borderColor: SYSTEM_COLORS.grayText, borderTopColor: SYSTEM_COLORS.canvasText } },
  },
  inherit: {
    borderColor: "currentColor",
    borderTopColor: "transparent",
    "@media": { "(forced-colors: active)": { forcedColorAdjust: "none" } },
  },
});
