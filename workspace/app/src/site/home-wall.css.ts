// The landing page's wall of real components: cards of Atoms in columns that drift against each other as the page scrolls, the
// wall fading out at its foot. Lengths here are the wall's own dimensions; spacing, faces and motion are roles.

import { keyframes, style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";
const VIEW_TIMELINE = "(animation-timeline: view())";
const drift = tokens.layout.gap["3xl"];

// The section: as wide as a wide screen allows, a gutter in from the window.
export const wallSection = style({
  paddingInline: tokens.layout.gutter,
  paddingBlockEnd: tokens.layout.section.end,
});

// Four columns, two on a tablet and one on a phone. The wall stops at its height and fades out into the canvas, so it reads as a
// glimpse of the system rather than a list to finish.
export const wall = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: tokens.layout.gap.lg,
  alignItems: "start",
  maxWidth: "88rem",
  maxHeight: "56rem",
  marginInline: "auto",
  // Room for a column to drift into: without it, the wall's own edge would cut a card a column has carried past it.
  paddingBlock: drift,
  overflow: "hidden",
  maskImage: `linear-gradient(to bottom, ${tokens.color.ink.primary} 50%, transparent)`,
  "@media": {
    [`screen and (max-width: ${BP.lg})`]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    [`screen and (max-width: ${BP.sm})`]: { gridTemplateColumns: "minmax(0, 1fr)", maxHeight: "40rem" },
  },
});

// A column drifts the length of a large gap each way while the wall crosses the screen; every other one drifts against it, so the
// columns part and close like layers at different depths. It moves only where motion is wanted and the browser has view timelines.
const across = keyframes({
  from: { transform: `translateY(${drift})` },
  to: { transform: `translateY(calc(${drift} * -1))` },
});
const drifting = { animationName: across, animationFillMode: "both", animationTimeline: "view()", animationRange: "cover 0% cover 100%" } as const;
export const column = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.layout.gap.lg,
  minWidth: 0,
  "@media": { [NO_PREFERENCE]: { "@supports": { [VIEW_TIMELINE]: drifting } } },
});
export const columnAgainst = style({
  "@media": { [NO_PREFERENCE]: { "@supports": { [VIEW_TIMELINE]: { animationDirection: "reverse" } } } },
});

// A card's head: its title and a quiet line under it.
export const cardHead = style({ marginBlockEnd: tokens.layout.gap.md });

// A row of a settings card: words on the start, the control on the end.
export const settingRow = style({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: tokens.layout.gap.md });

// The week's bars: a row of thin pillars standing on one baseline.
export const bars = style({ display: "flex", alignItems: "flex-end", gap: tokens.layout.gap.xs, height: "4.5rem" });
export const bar = style({ flex: 1, minWidth: 0, borderRadius: tokens.shape.radius.text });

// A swatch of a face role, with its name under it.
export const swatches = style({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: tokens.layout.gap.sm });
export const swatch = style({ height: "2.75rem" });

// A search result: an icon, the words and a status at the end.
export const result = style({ display: "flex", alignItems: "center", gap: tokens.layout.gap.sm, paddingBlock: tokens.shape.inset.xs, minWidth: 0 });
export const resultWords = style({ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
