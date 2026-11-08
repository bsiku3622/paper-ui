// The webcam scene: a bed in perspective, a part, a gantry. Every colour reads a Paper token; the lengths of the drawing are in
// the SVG's own units and are written on the shapes.

import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const feed = style({
  position: "relative",
  width: "100%",
  overflow: "hidden",
  backgroundColor: tokens.color.bg.sunken,
  lineHeight: 0,
});

// The camera may be mirrored (the outer box) and turned (the picture inside it), in that order.
export const mirror = styleVariants({
  none: {},
  x: { transform: "rotateY(180deg)" },
  y: { transform: "rotateX(180deg)" },
  both: { transform: "rotateY(180deg) rotateX(180deg)" },
});
export const turn = styleVariants({
  0: {},
  90: { transform: "rotate(90deg)" },
  180: { transform: "rotate(180deg)" },
  270: { transform: "rotate(270deg)" },
});
export const picture = style({ display: "block" });
export const fill = style({ height: "100%" });

export const bedPlate = style({ fill: tokens.color.bg.raised, stroke: tokens.color.border.strong });
export const bedLine = style({ stroke: tokens.color.border.base });
export const partTop = style({ fill: tokens.color.bg.sunken });
export const partFront = style({ fill: tokens.color.border.strong });
export const partSide = style({ fill: tokens.color.border.base });
export const gantry = style({ fill: tokens.color.ink.secondary });
export const post = style({ fill: tokens.color.border.strong });
export const carriage = style({ fill: tokens.color.ink.primary });
export const hotTip = style({ fill: tokens.color.accent.warning.solid });

const badge = {
  position: "absolute",
  padding: `${tokens.layout.gap.xs} ${tokens.layout.gap.md}`,
  borderRadius: tokens.shape.radius.full,
  backgroundColor: tokens.color.bg.raised,
  color: tokens.color.ink.secondary,
  fontSize: tokens.typography.role.label.size,
  lineHeight: tokens.typography.role.label.leading,
} as const;
export const live = style({ ...badge, top: tokens.layout.gap.md, left: tokens.layout.gap.md, display: "flex", alignItems: "center", gap: tokens.layout.gap.sm });
export const liveDot = style({ width: tokens.shape.inset.sm, height: tokens.shape.inset.sm, borderRadius: tokens.shape.radius.full, backgroundColor: tokens.color.accent.error.solid });
export const rate = style({ ...badge, right: tokens.layout.gap.md, bottom: tokens.layout.gap.md, fontVariantNumeric: "tabular-nums" });
