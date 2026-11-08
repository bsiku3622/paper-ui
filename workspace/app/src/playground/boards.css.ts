import { style } from "@vanilla-extract/css";

import { CONTROL_SIZES, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const narrow = `screen and (max-width: ${BP.lg})`;
const wide = `screen and (width > ${BP.lg})`;

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

export const scroller = style({
  minWidth: 0,
  overflowX: "auto",
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.md,
  padding: tokens.shape.inset.md,
  margin: `calc(${tokens.shape.inset.md} * -1)`,
});

export const matrix = style({
  display: "grid",
  columnGap: tokens.layout.gap.lg,
  rowGap: tokens.layout.gap.lg,
  alignItems: "center",
  justifyItems: "center",
  width: "max-content",
});
export const sizesAcross = style({ gridTemplateColumns: `max-content repeat(${CONTROL_SIZES.length}, max-content)` });
export const sizesDown = style({
  gridTemplateRows: `repeat(${CONTROL_SIZES.length + 1}, auto)`,
  gridAutoFlow: "column",
  gridAutoColumns: "max-content",
});
export const rowHead = style({ justifySelf: "start", display: "flex", flexDirection: "column" });
export const columnHead = style({ display: "flex", flexDirection: "column", alignItems: "center" });
export const groupHead = style({
  paddingBlockStart: tokens.layout.gap.sm,
  paddingBlockEnd: tokens.shape.inset.xs,
  ...lineRule({ side: "bottom" }),
});
export const cell = style({ display: "flex", justifyContent: "center" });
