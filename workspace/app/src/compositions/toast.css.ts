import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// Fixed at the bottom centre of the screen; its face is the Surface's.
export const toast = style({
  position: "fixed",
  left: "50%",
  bottom: tokens.layout.gap.xl,
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
});
