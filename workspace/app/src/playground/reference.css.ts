// The two references under an Atom's code: its props, and every combination of its axes drawn on the preview's ground.

import { globalStyle, style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// The sheet scrolls inside itself when a crossing is wider than the column, so the page never does.
export const sheet = style({
  minWidth: 0,
  maxWidth: "100%",
  overflowX: "auto",
  padding: tokens.shape.inset.xl,
  borderRadius: tokens.shape.radius.surface.lg,
});

// One crossing: the row values down the start, the column values along the top, a drawing where they meet.
export const matrix = style({
  display: "grid",
  columnGap: tokens.layout.gap.lg,
  rowGap: tokens.layout.gap.md,
  alignItems: "center",
  justifyItems: "center",
  width: "max-content",
});
export const rowHead = style({ justifySelf: "start" });

// One axis moved on its own: its values side by side, each over its name, the names on one line.
export const strip = style({ display: "flex", flexWrap: "wrap", alignItems: "flex-end", columnGap: tokens.layout.gap.lg, rowGap: tokens.layout.gap.md });
export const stripCell = style({ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.layout.gap.sm });

// One drawing. It stands in the preview's stage, which may be narrower than a control that hugs its content (a row of segments):
// the stage grows to hold it, so no drawing spills over its neighbour.
export const drawing = style({ display: "flex", justifyContent: "center" });
globalStyle(`${drawing} > *`, { minWidth: "max-content" });
