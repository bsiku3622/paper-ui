// Box can hide something below a breakpoint (`hideBelow`) but not above one, and a screen file may not carry a class.
// This is the other half — a thing that only a phone sees — as a rule on Paper's own breakpoint token.

import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const belowMd = style({
  "@media": { [`screen and (min-width: ${tokens.layout.breakpoint.md})`]: { display: "none" } },
});
