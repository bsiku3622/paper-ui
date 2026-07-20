import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const tooltipWrap = style({ position: "relative", display: "inline-flex" });

export const tooltipBubble = style({
  position: "absolute",
  bottom: "calc(100% + 6px)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: tokens.shape.z.overlay,
  whiteSpace: "nowrap",
  padding: `${tokens.shape.space.xs} ${tokens.shape.space.sm}`,
  borderRadius: tokens.shape.radius.sm,
  background: tokens.color.ink.base,
  color: tokens.color.surface.base,
  fontFamily: tokens.font.sans,
  fontSize: "0.75rem",
  fontWeight: "450",
  boxShadow: tokens.shape.shadow.overlay,
  pointerEvents: "none",
});
