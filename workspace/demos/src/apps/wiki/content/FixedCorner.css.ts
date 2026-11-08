import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const corner = style({
  position: "fixed",
  insetInlineEnd: tokens.layout.gap.lg,
  insetBlockEnd: tokens.layout.gap.lg,
});
