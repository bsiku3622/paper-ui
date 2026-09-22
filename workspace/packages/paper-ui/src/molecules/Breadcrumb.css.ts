import { globalStyle, style } from "@vanilla-extract/css";

import { tokens, stateTransition } from "../tokens";

export const breadcrumbList = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: tokens.shape.gap.sm,
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const breadcrumbItem = style({ display: "inline-flex", alignItems: "center", gap: tokens.shape.gap.sm });

export const breadcrumbLink = style({
  color: tokens.color.content.tertiary,
  textDecoration: "none",
  transition: stateTransition("color"),
  selectors: { "&:hover": { color: tokens.color.content.primary } },
});

export const breadcrumbCurrent = style({ color: tokens.color.content.secondary });
export const breadcrumbSeparator = style({ color: tokens.color.content.tertiary, userSelect: "none" });
globalStyle(`${breadcrumbItem}:last-child ${breadcrumbSeparator}`, { display: "none" });
