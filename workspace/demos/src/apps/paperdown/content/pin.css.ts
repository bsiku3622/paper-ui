// Content: where a face stands that Paper cannot place. Surface can stick to the top of the window (elevation="sticky" with
// `top`); it has no face that stays fixed at the bottom or at a side. The z comes from Paper's tiers; what stands in a pin is
// a Surface in a screen file.

import { style } from "@vanilla-extract/css";

export const bar = style({ position: "fixed", insetInline: 0, bottom: 0 });

// A side sheet over the page, from the top of the window to its bottom.
export const rail = style({ position: "fixed", insetBlock: 0, insetInlineStart: 0 });
