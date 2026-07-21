import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const tooltipWrap = style({ position: "relative", display: "inline-flex" });

export const tooltipBubble = style({
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: tokens.shape.z.overlay,
  whiteSpace: "nowrap",
  padding: `${tokens.shape.space.xs} ${tokens.shape.space.sm}`,
  borderRadius: tokens.shape.radius.sm,
  background: tokens.color.ink.base,
  color: tokens.color.paper.base,
  fontFamily: tokens.font.sans,
  fontSize: "0.75rem",
  fontWeight: "450",
  boxShadow: tokens.shape.shadow.overlay,
  pointerEvents: "none",
});

// 위/아래 — trigger 주변 공간에 따라 시스템이 고른다 (auto-flip).
export const tooltipPlacement = styleVariants({
  top: { bottom: "calc(100% + 6px)" },
  bottom: { top: "calc(100% + 6px)" },
});
