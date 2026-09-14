import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const dropdownRoot = style({ position: "relative", display: "inline-flex" });
export const dropdownPanel = style({
  position: "absolute",
  top: `calc(100% + ${tokens.shape.gap.xs})`,
  zIndex: tokens.layout.z.overlay,
});
export const dropdownAlign = styleVariants({ start: { left: 0 }, end: { right: 0 } });
