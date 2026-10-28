// The Color page's own layout. Surface, ink, border, radius and spacing come from Paper UI.
import { globalStyle, style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// One value per row now that the page shows the current theme only.
const ROW = "minmax(0, 1fr) minmax(14rem, 18rem)";
const ROW_NARROW = "minmax(0, 1fr) minmax(10rem, 1fr)";
const TONES = "minmax(7rem, 0.9fr) repeat(5, minmax(6.5rem, 1fr))";
const line = `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`;
const narrow = "screen and (max-width: 760px)";
// Very narrow: the token stacks over its value instead of sharing the row.
const stacked = `screen and (max-width: ${tokens.layout.breakpoint.sm})`;

export const paletteScroll = style({ maxWidth: "100%", overflowX: "auto" });
// The first row of the matrix is its step labels; the first column is its ramp names.
export const headCell = style({ textAlign: "center", paddingBottom: tokens.shape.inset.xs });
export const rowLabel = style({ textAlign: "start" });

const track = { display: "grid", gridTemplateColumns: ROW, gap: tokens.layout.gap.md, alignItems: "center" } as const;
export const columns = style({
  ...track,
  paddingInline: tokens.shape.inset.md,
  "@media": { [narrow]: { gridTemplateColumns: ROW_NARROW }, [stacked]: { gridTemplateColumns: "minmax(0, 1fr)" } },
});
export const row = style({
  ...track,
  padding: tokens.shape.inset.lg,
  borderBottom: line,
  "@media": {
    [narrow]: { gridTemplateColumns: ROW_NARROW, gap: tokens.layout.gap.sm, padding: tokens.shape.inset.md },
    [stacked]: { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

export const copy = style({ minWidth: 0 });
export const token = style({ width: "fit-content", maxWidth: "100%", overflowWrap: "anywhere" });
export const value = style({ minWidth: 0 });
// Palette Token and HEX both stay visible; a compact card stacks them.
export const valueCompact = style({});
export const meta = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: tokens.layout.gap.sm,
  minWidth: 0,
  selectors: { [`${valueCompact} &`]: { flexDirection: "column", gap: 0 } },
});
globalStyle(`${meta} > *`, { minWidth: 0, overflowWrap: "anywhere" });
export const section = style({ minWidth: 0 });

// Accent: one row per accent, a column per tone. The accent × variant table reuses the grid.
export const toneScroll = style({ maxWidth: "100%", overflowX: "auto" });
const toneTrack = { display: "grid", gridTemplateColumns: TONES, gap: tokens.layout.gap.md, alignItems: "center", minWidth: "44rem" } as const;
export const toneColumns = style({ ...toneTrack, paddingInline: tokens.shape.inset.md, paddingBottom: tokens.shape.inset.sm });
export const toneRow = style({ ...toneTrack, padding: tokens.shape.inset.lg, borderBottom: line });
