// Paper has no way to pin a part to the window (no position: fixed), so the bottom-right corner is held here.

import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const corner = style({
  position: "fixed",
  insetInlineEnd: tokens.layout.gap.lg,
  insetBlockEnd: tokens.layout.gap.lg,
});
