// The paints other primitives and Atoms borrow. Colour lives in the paint tier and nowhere else, so a
// part that needs a colour takes the class from here instead of reading tokens.color itself.

import { stateStyle, tokens } from "../../tokens";
import { layered } from "../../tokens/layers.css";
import { markProfile, outlinedControlProfile } from "../../tokens/color-recipes";

const { style } = layered("components");

// The modal backdrop of a Floating panel.
export const scrimPaint = style({ background: tokens.color.overlay.scrim });

// The colour of an input frame: the outlined control's ink and border, a status drawing its own border, and the
// border rising under a pointer. The face is the frame's Surface fill, so it is not set here.
export const fieldPaint = style([stateStyle.field, { color: outlinedControlProfile.ink, borderColor: outlinedControlProfile.border }]);

// The face and ring of a selection mark at rest. What a mark draws once checked is its own anatomy.
export const markPaint = style({ backgroundColor: outlinedControlProfile.face, borderColor: markProfile.rest.ring });
