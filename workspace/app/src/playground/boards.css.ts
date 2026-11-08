// The Overview's boards: on the start, every value of one of an Atom's axes against every size; on the end, the controls that move
// the rest. Tracks and widths are the board's own; spacing, lines and faces are roles.

import { style } from "@vanilla-extract/css";

import { CONTROL_SIZES, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const narrow = `screen and (max-width: ${BP.lg})`;
const wide = `screen and (width > ${BP.lg})`;

// The sheet and its controls side by side, a line between them. On a narrow screen the controls go under the sheet.
export const board = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 22rem",
  "@media": { [narrow]: { gridTemplateColumns: "minmax(0, 1fr)" } },
});

export const sheet = style({
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.lg,
  padding: tokens.shape.inset.xl,
});

export const panel = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.md,
  padding: tokens.shape.inset.xl,
  "@media": { [wide]: lineRule({ side: "start" }), [narrow]: lineRule({ side: "top" }) },
});

// The crossing scrolls inside the sheet when it is wider than the sheet, so the page never does. It keeps room around the drawings, so
// a ring or a shadow at its edge is not cut, and gives that room back outside so the crossing stays where it stood. With every state
// laid out, the crossings stand one under another, each under its state's name.
export const scroller = style({
  minWidth: 0,
  overflowX: "auto",
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.md,
  padding: tokens.shape.inset.md,
  margin: `calc(${tokens.shape.inset.md} * -1)`,
});

// The values of the axis and the sizes crossed, a drawing where they meet. Every drawing of a column sits on one centre line.
export const matrix = style({
  display: "grid",
  columnGap: tokens.layout.gap.lg,
  rowGap: tokens.layout.gap.lg,
  alignItems: "center",
  justifyItems: "center",
  width: "max-content",
});
// A row's value, and under it whether it is the default: the name stays short, so the drawings start close to it.
// The values down the start and the sizes along the top: a column for the heads, then one for each size, filled row by row.
export const sizesAcross = style({ gridTemplateColumns: `max-content repeat(${CONTROL_SIZES.length}, max-content)` });
// The sizes down the start and the values along the top: a row for the heads, then one for each size, filled column by column, so a
// value takes as many columns as the axis has without the sheet being told.
export const sizesDown = style({
  gridTemplateRows: `repeat(${CONTROL_SIZES.length + 1}, auto)`,
  gridAutoFlow: "column",
  gridAutoColumns: "max-content",
});
export const rowHead = style({ justifySelf: "start", display: "flex", flexDirection: "column" });
export const columnHead = style({ display: "flex", flexDirection: "column", alignItems: "center" });
// With every state laid out, a state's name over its crossing, on a line that runs the width of the sheet.
export const groupHead = style({
  paddingBlockStart: tokens.layout.gap.sm,
  paddingBlockEnd: tokens.shape.inset.xs,
  ...lineRule({ side: "bottom" }),
});
export const cell = style({ display: "flex", justifyContent: "center" });
