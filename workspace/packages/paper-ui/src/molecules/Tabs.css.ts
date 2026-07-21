import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const tabsList = style({
  display: "inline-flex",
  gap: "2px",
  padding: "3px",
  background: tokens.color.paper.muted,
  borderRadius: tokens.shape.radius.md,
});

export const tabItem = style({
  appearance: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  height: "1.75rem",
  paddingInline: tokens.shape.space.md,
  borderRadius: tokens.shape.radius.sm,
  fontFamily: tokens.font.sans,
  fontSize: "0.8125rem",
  fontWeight: "500",
  color: tokens.color.ink.soft,
  transition: "background 130ms ease, color 130ms ease",
  selectors: { "&:hover": { color: tokens.color.ink.base } },
});

// 선택 = 흰 pill. muted 트랙 위 흰색 대비만으로 또렷하다 — 그림자 없음.
// (탭은 overlay 가 아니므로 뜨지 않는다. 원칙 3.)
export const tabItemActive = style({
  background: tokens.color.paper.base,
  color: tokens.color.ink.base,
});
