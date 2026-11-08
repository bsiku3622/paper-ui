import { globalStyle, style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const sheet = style({
  minWidth: 0,
  maxWidth: "100%",
  overflowX: "auto",
  padding: tokens.shape.inset.xl,
  borderRadius: tokens.shape.radius.surface.lg,
});

export const matrix = style({
  display: "grid",
  columnGap: tokens.layout.gap.lg,
  rowGap: tokens.layout.gap.md,
  alignItems: "center",
  justifyItems: "center",
  width: "max-content",
});
export const rowHead = style({ justifySelf: "start" });

export const strip = style({ display: "flex", flexWrap: "wrap", alignItems: "flex-end", columnGap: tokens.layout.gap.lg, rowGap: tokens.layout.gap.md });
export const stripCell = style({ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.layout.gap.sm });

export const drawing = style({ display: "flex", justifyContent: "center" });
globalStyle(`${drawing} > *`, { minWidth: "max-content" });
