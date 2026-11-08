// What the charts share: axis text, hairline grid, the floating readout, legends and the range slider. Paper has no chart
// parts and no slider, so these are drawn here; every colour and length reads a Paper token.

import { style, styleVariants } from "@vanilla-extract/css";

import { focusRing, lineRule, tokens } from "@studio-baeks/paper-ui/tokens";

export const frame = style({ position: "relative", width: "100%", minWidth: 0 });

export const axisText = style({
  fill: tokens.color.ink.tertiary,
  fontSize: tokens.typography.role.label.size,
  fontFamily: "inherit",
  fontVariantNumeric: "tabular-nums",
});

export const valueText = style({
  fill: tokens.color.ink.secondary,
  fontSize: tokens.typography.role.label.size,
  fontFamily: "inherit",
  fontVariantNumeric: "tabular-nums",
});

export const gridLine = style({ stroke: tokens.color.border.base, strokeWidth: tokens.shape.stroke.border });

export const guide = style({ stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border });

// The readout that follows the pointer over a chart: values lead, names follow.
export const tooltip = style({
  position: "absolute",
  top: 0,
  left: 0,
  pointerEvents: "none",
  minWidth: tokens.shape.dimension.width.sm,
  padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`,
  borderRadius: tokens.shape.radius.surface.sm,
  backgroundColor: tokens.color.bg.raised,
  color: tokens.color.ink.primary,
  ...lineRule(),
  fontSize: tokens.typography.role.caption.size,
  lineHeight: tokens.typography.role.caption.leading,
  whiteSpace: "nowrap",
});

export const tipTitle = style({ color: tokens.color.ink.tertiary, fontSize: tokens.typography.role.label.size, marginBottom: tokens.layout.gap.xs });

export const tipRow = style({ display: "flex", alignItems: "center", gap: tokens.layout.gap.sm, justifyContent: "space-between" });

export const tipValue = style({ fontWeight: tokens.typography.role.body.strong, fontVariantNumeric: "tabular-nums" });

export const tipName = style({ color: tokens.color.ink.secondary });

export const legend = style({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: tokens.layout.gap.md, marginBottom: tokens.layout.gap.sm });

export const legendItem = style({
  display: "inline-flex",
  alignItems: "center",
  gap: tokens.layout.gap.sm,
  padding: `${tokens.layout.gap.xs} ${tokens.layout.gap.sm}`,
  borderRadius: tokens.shape.radius.text,
  background: "none",
  border: 0,
  font: "inherit",
  fontSize: tokens.typography.role.caption.size,
  color: tokens.color.ink.secondary,
  cursor: "pointer",
  selectors: {
    "&:focus-visible": focusRing,
    "&[aria-pressed='false']": { opacity: tokens.color.opacity.subdued },
  },
});

export const lineKey = style({ display: "inline-block", width: tokens.shape.inset.lg, height: tokens.shape.stroke.emphasis, borderRadius: tokens.shape.stroke.emphasis });

export const dotKey = style({ display: "inline-block", width: tokens.shape.inset.md, height: tokens.shape.inset.md, borderRadius: tokens.shape.radius.full });

// A native range input in Paper's colours: the thumb and the filled part take the primary accent.
export const range = style({
  width: "100%",
  margin: 0,
  accentColor: tokens.color.accent.primary.solid,
  cursor: "pointer",
  selectors: {
    "&:focus-visible": focusRing,
    "&:disabled": { cursor: "not-allowed", opacity: tokens.color.opacity.disabled },
  },
});

export const hit = style({ cursor: "crosshair", touchAction: "none" });

export const cell = style({
  outline: "none",
  selectors: {
    "&:hover, &:focus-visible": { outlineWidth: tokens.shape.stroke.emphasis, outlineStyle: "solid", outlineColor: tokens.color.ink.primary, outlineOffset: `calc(${tokens.shape.stroke.emphasis} * -1)` },
  },
});

// ── What a chart draws in a tone ──

export type Tone = "primary" | "info" | "success" | "warning" | "error" | "neutral";

const SOLID: Record<Tone, string> = {
  primary: tokens.color.accent.primary.solid,
  info: tokens.color.accent.info.solid,
  success: tokens.color.accent.success.solid,
  warning: tokens.color.accent.warning.solid,
  error: tokens.color.accent.error.solid,
  neutral: tokens.color.ink.tertiary,
};
const SOFT: Record<Tone, string> = {
  primary: tokens.color.accent.primary.soft,
  info: tokens.color.accent.info.soft,
  success: tokens.color.accent.success.soft,
  warning: tokens.color.accent.warning.soft,
  error: tokens.color.accent.error.soft,
  neutral: tokens.color.bg.sunken,
};

// A column or a part of a bar.
export const barOf = styleVariants(SOLID, (color) => ({ fill: color, backgroundColor: color }));
// A column the pointer is not on, while another is.
export const dim = style({ opacity: tokens.color.opacity.disabled });
// A line's colour, its swatch in a legend, and the dot on it that a readout stands on.
export const lineOf = styleVariants(SOLID, (color) => ({ fill: "none", stroke: color, strokeWidth: tokens.shape.stroke.emphasis, strokeLinejoin: "round", strokeLinecap: "round" }));
export const targetOf = styleVariants(SOLID, (color) => ({ fill: "none", stroke: color, strokeWidth: tokens.shape.stroke.border, opacity: tokens.color.opacity.disabled }));
export const areaOf = styleVariants(SOFT, (color) => ({ fill: color }));
export const keyOf = styleVariants(SOLID, (color) => ({ backgroundColor: color }));
export const dotOf = styleVariants(SOLID, (color) => ({ fill: color, stroke: tokens.color.bg.raised, strokeWidth: tokens.shape.stroke.emphasis }));
export const keyBeside = style({ marginRight: tokens.layout.gap.sm, verticalAlign: "middle" });

export const relative = style({ position: "relative" });
export const plot = style({ display: "block", overflow: "visible" });

// The readout stands at --tip-x and --tip-y inside its chart, on one side of that point or the other.
export const tipAt = style({ left: "var(--tip-x)", top: "var(--tip-y)" });
export const tipAfter = style({ transform: `translateX(${tokens.layout.gap.md})` });
export const tipBefore = style({ transform: `translateX(calc((100% + ${tokens.layout.gap.md}) * -1))` });

// A row of parts in proportion, with a gap of the surface between them. Each part's share is its flex-grow.
export const bar = style({ display: "flex", gap: tokens.shape.stroke.emphasis, height: tokens.shape.inset.sm, width: "100%" });
export const part = style({ flexBasis: 0, minWidth: tokens.shape.inset.xs, borderRadius: tokens.shape.radius.full });

// Drawn marks on a plot.
export const ink = style({ fill: tokens.color.ink.primary });
export const inkRing = style({ fill: "none", stroke: tokens.color.ink.primary, strokeWidth: tokens.shape.stroke.emphasis });
export const probe = style({ fill: tokens.color.ink.primary, stroke: tokens.color.bg.raised, strokeWidth: tokens.shape.stroke.emphasis });
export const edge = style({ stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border });
export const calloutText = style({ fontWeight: tokens.typography.role.label.weight });

// The ring of a round gauge.
export const ringRoot = style({ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" });
export const ringSize = styleVariants({
  sm: { width: tokens.shape.control.height.xs, height: tokens.shape.control.height.xs },
  md: { width: tokens.shape.control.height.lg, height: tokens.shape.control.height.lg },
  lg: { width: tokens.shape.dimension.height.xs, height: tokens.shape.dimension.height.xs },
});
export const ringSvg = style({ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" });
export const ringTrack = style({ fill: "none", stroke: tokens.color.control.track });
export const ringArc = styleVariants(SOLID, (color) => ({ fill: "none", stroke: color, strokeLinecap: "round" }));
export const ringLabel = style({ position: "relative", fontSize: tokens.typography.role.label.size, fontWeight: tokens.typography.role.label.weight, fontVariantNumeric: "tabular-nums", color: tokens.color.ink.secondary });

// The bed map: the plot and the scale beside it.
export const heatRow = style({ display: "flex", gap: tokens.layout.gap.md, alignItems: "flex-start" });
export const heatPlot = style({ position: "relative", flex: "none" });
export const heatTip = style({ transform: `translate(${tokens.layout.gap.md}, -50%)` });
export const scale = style({ display: "flex", gap: tokens.layout.gap.sm, alignItems: "stretch", marginTop: tokens.layout.gap.sm, flex: "none" });
export const scaleBar = style({
  width: tokens.shape.inset.md,
  borderRadius: tokens.shape.radius.full,
  backgroundImage: `linear-gradient(in oklab to top, ${tokens.color.accent.info.solid}, ${tokens.color.bg.sunken}, ${tokens.color.accent.warning.solid})`,
});
export const scaleLabels = style({ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: tokens.typography.role.label.size, color: tokens.color.ink.tertiary, fontVariantNumeric: "tabular-nums" });

// A cell of the bed map: amber where the bed is high, blue where it is low, as strong as it is far from level. The cell is the colour
// laid over the sunken well at --heat (how far from level, as a share of the scale).
export const well = style({ fill: tokens.color.bg.sunken });
export const heat = styleVariants({
  high: { fill: tokens.color.accent.warning.solid, opacity: "min(var(--heat), 1)" },
  low: { fill: tokens.color.accent.info.solid, opacity: "min(var(--heat), 1)" },
});

// The layer viewer. Its strokes are widths in millimetres of the bed (set on the paths), so only their colour is here.
export const strokeOf = styleVariants(SOLID, (color) => ({ stroke: color }));
export const clip = style({ overflow: "hidden" });
export const bed = style({ fill: tokens.color.bg.raised, stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border, vectorEffect: "non-scaling-stroke" });
export const gridMajor = style({ stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border, vectorEffect: "non-scaling-stroke" });
export const gridMinor = style({ stroke: tokens.color.border.base, strokeWidth: tokens.shape.stroke.border, vectorEffect: "non-scaling-stroke" });
export const faint = style({ opacity: tokens.color.opacity.disabled });
export const halo = style({ fill: tokens.color.accent.warning.soft });
export const nozzleDot = style({ fill: tokens.color.ink.primary, stroke: tokens.color.bg.raised });
