import { keyframes, style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

const BP = tokens.layout.breakpoint;
const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";
const VIEW_TIMELINE = "(animation-timeline: view())";
const drift = tokens.layout.gap["3xl"];

export const wallSection = style({
  paddingInline: tokens.layout.gutter,
  paddingBlockEnd: tokens.layout.section.end,
});

export const wall = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: tokens.layout.gap.lg,
  alignItems: "start",
  maxWidth: "88rem",
  maxHeight: "56rem",
  marginInline: "auto",
  paddingBlock: drift,
  overflow: "hidden",
  maskImage: `linear-gradient(to bottom, ${tokens.color.ink.primary} 50%, transparent)`,
  "@media": {
    [`screen and (max-width: ${BP.lg})`]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    [`screen and (max-width: ${BP.sm})`]: { gridTemplateColumns: "minmax(0, 1fr)", maxHeight: "40rem" },
  },
});

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

export const cardHead = style({ marginBlockEnd: tokens.layout.gap.md });

export const settingRow = style({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: tokens.layout.gap.md });

export const bars = style({ display: "flex", alignItems: "flex-end", gap: tokens.layout.gap.xs, height: "4.5rem" });
export const bar = style({ flex: 1, minWidth: 0, borderRadius: tokens.shape.radius.text });

export const swatches = style({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: tokens.layout.gap.sm });
export const swatch = style({ height: "2.75rem" });

export const result = style({ display: "flex", alignItems: "center", gap: tokens.layout.gap.sm, paddingBlock: tokens.shape.inset.xs, minWidth: 0 });
export const resultWords = style({ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
