// The one board every Foundations page is drawn with: a raised table whose header, groups and
// rows share the board's column tracks through subgrid. The board adds an empty zero-width track
// at each edge, so the column gap insets the content and rules still run edge to edge — padding
// on a subgrid row would instead shrink its first and last columns.
import { globalStyle, style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui";

const line = `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`;
const spanAll = { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "subgrid", alignItems: "center", minWidth: 0 } as const;

export const page = style({ width: "100%", maxWidth: tokens.layout.container.content, marginInline: "auto", minWidth: 0 });
export const section = style({ minWidth: 0 });
export const aside = style({ flexShrink: 0, whiteSpace: "nowrap" });
export const board = style({ minWidth: 0, maxWidth: "100%", overflowX: "auto" });
export const grid = style({ display: "grid", columnGap: tokens.layout.gap.md, alignItems: "center" });
export const header = style({ ...spanAll, paddingBlock: tokens.shape.inset.sm, borderBottom: line });
export const group = style({
  ...spanAll,
  paddingBlock: tokens.shape.inset.sm,
  borderBottom: line,
  selectors: { "&:last-child": { borderBottom: 0, paddingBottom: 0 } },
});
export const groupLabel = style({ gridColumn: "2 / -2", paddingBlock: tokens.shape.inset.sm });

const bordered = { borderBottom: line, selectors: { "&:last-child": { borderBottom: 0, paddingBottom: tokens.shape.inset.sm } } };
export const row = styleVariants({
  // Rows inside a group: the group draws the rule.
  sm: { ...spanAll, paddingBlock: tokens.shape.inset.sm },
  md: { ...spanAll, paddingBlock: tokens.shape.inset.md, ...bordered },
  lg: { ...spanAll, paddingBlock: tokens.shape.inset.lg, ...bordered },
});

// Cells start after the empty edge track; the rest auto-place, leaving the far edge track empty.
globalStyle([header, row.sm, row.md, row.lg].map((name) => `${name} > :first-child`).join(", "), { gridColumnStart: 2 });

export const align = styleVariants({
  start: { textAlign: "start", justifySelf: "start" },
  center: { textAlign: "center", justifySelf: "center" },
  end: { textAlign: "end", justifySelf: "end" },
});

export const cell = style({ minWidth: 0, overflowWrap: "anywhere" });
export const value = style({ minWidth: 0, textAlign: "end", justifySelf: "end", overflowWrap: "anywhere" });
export const matrixCell = style({ minWidth: 0, padding: tokens.shape.inset.sm, borderRadius: tokens.shape.radius.surface.sm, background: tokens.color.bg.canvas });
