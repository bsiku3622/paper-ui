import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// 머리글 — 아래 강한 괘선 하나로 본문과 갈린다. 그림자 없음.
export const navbarRoot = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.shape.z.sticky,
  height: tokens.shape.height.row,
  borderBottomWidth: tokens.shape.ruleWidth.base,
  borderBottomStyle: "solid",
  borderBottomColor: tokens.color.rule.strong,
});

export const navItem = style({
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  fontFamily: tokens.font.sans,
  fontSize: "0.875rem",
  color: tokens.color.ink.soft,
  selectors: { "&:hover": { color: tokens.color.ink.base } },
});

export const navItemActive = style({
  color: tokens.color.ink.base,
  fontWeight: "600",
});
