// What a chart needs from CSS: Paper's tokens as classes, so the SVG and its frame carry no style attribute. The frame has a
// keyboard focus ring (a style attribute cannot say what a focused chart looks like) drawn by Paper's own focus state.

import { style, styleVariants } from "@vanilla-extract/css";

import { stateStyle, tokens } from "@studio-baeks/paper-ui/tokens";

export type Tone = "ink" | "info" | "success" | "warning" | "error";

const COLOR: Record<Tone, string> = {
  ink: tokens.color.ink.primary,
  info: tokens.color.accent.info.solid,
  success: tokens.color.accent.success.solid,
  warning: tokens.color.accent.warning.solid,
  error: tokens.color.accent.error.solid,
};

export const frame = style([stateStyle.focusVisible, { position: "relative", width: "100%", borderRadius: tokens.shape.radius.surface.sm }]);

export const frameHeight = styleVariants({
  md: { height: tokens.shape.dimension.height.md },
  lg: { height: tokens.shape.dimension.height.lg },
  xl: { height: tokens.shape.dimension.height.xl },
});

export const svgRoot = style({ display: "block", overflow: "visible" });

// A hidden probe: five boxes whose widths are Paper's stroke, corner, bar cap, marker and offset, read back in pixels.
export const probeBox = style({ position: "absolute", visibility: "hidden", pointerEvents: "none", fontSize: tokens.typography.role.label.size });
export const probeStroke = style({ width: tokens.shape.stroke.emphasis });
export const probeRound = style({ width: tokens.shape.inset.xs });
export const probeCap = style({ width: tokens.shape.inset.xl });
export const probeDot = style({ width: tokens.shape.inset.sm });
export const probePad = style({ width: tokens.shape.inset.md });

// A short stroke of a series colour, in the legend and the tooltip.
export const key = style({ display: "inline-block", flex: "none", width: tokens.shape.inset.md, height: tokens.shape.stroke.emphasis, borderRadius: tokens.shape.radius.full });
export const keyTone = styleVariants(COLOR, (color) => ({ background: color }));

export const axisText = style({ fill: tokens.color.ink.tertiary, fontSize: tokens.typography.role.label.size });
export const endText = style({ fill: tokens.color.ink.secondary, fontSize: tokens.typography.role.label.size });
export const gridLine = style({ stroke: tokens.color.border.base, strokeWidth: tokens.shape.stroke.border });
export const crosshair = style({ stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border });
export const linePath = styleVariants(COLOR, (color) => ({ stroke: color, strokeWidth: tokens.shape.stroke.emphasis }));
export const dotRing = style({ fill: tokens.color.bg.raised });
export const fillTone = styleVariants(COLOR, (color) => ({ fill: color }));
export const hitArea = style({ touchAction: "pan-y" });

// The tooltip stands inside the SVG, in a foreignObject that lets it overflow; it takes no pointer.
export const tipBox = style({ overflow: "visible", pointerEvents: "none" });
export const tipStart = style({ display: "flex", justifyContent: "flex-start" });
export const tipEnd = style({ display: "flex", justifyContent: "flex-end" });
