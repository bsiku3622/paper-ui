// The paints other primitives and Atoms borrow. Colour lives in the paint tier and nowhere else, so a
// part that needs a colour takes the class from here instead of reading tokens.color itself.

import { tokens } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style } = layered("components");

// The modal backdrop of a Floating panel.
export const scrimPaint = style({ background: tokens.color.overlay.scrim });
