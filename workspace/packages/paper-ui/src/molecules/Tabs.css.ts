import { style } from "@vanilla-extract/css";

import { tokens } from "../tokens";

export const tabsList = style({
  display: "inline-flex",
  gap: "2px",
  padding: "3px",
  background: tokens.color.surface.muted,
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

// 선택 = 흰 pill 이 떠오름. SwiftUI segmented control 의 그 감각.
export const tabItemActive = style({
  background: tokens.color.surface.base,
  color: tokens.color.ink.base,
  boxShadow: tokens.shape.shadow.raised,
});
