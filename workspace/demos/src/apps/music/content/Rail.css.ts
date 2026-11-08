// The lyrics pane's place: a column fixed to the right edge of the window, as wide as the column AppShell reserves for it.

import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

import { ASIDE_WIDTH } from "./frame";

export const rail = style({
  position: "fixed",
  top: tokens.layout.gap.lg,
  bottom: tokens.layout.gap.lg,
  insetInlineEnd: tokens.layout.gap.lg,
  width: ASIDE_WIDTH,
});
