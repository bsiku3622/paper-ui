import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const tooltipWrap = style({ position: "relative", display: "inline-flex" });

// 떠 있는 것 — 그래서 그림자를 갖는다. 이 시스템에서 그림자는 overlay 의 표식.
export const tooltipBubble = style({
  position: "absolute",
  bottom: "calc(100% + 6px)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: tokens.shape.z.overlay,
  whiteSpace: "nowrap",
  padding: `${tokens.shape.space.xs} ${tokens.shape.space.sm}`,
  borderRadius: tokens.shape.radius.base,
  background: tokens.color.ink.base,
  color: tokens.color.paper.base,
  fontFamily: tokens.font.sans,
  fontSize: "0.75rem",
  boxShadow: tokens.shape.shadow.overlay,
  pointerEvents: "none",
});
