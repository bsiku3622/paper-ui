import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const graphSvg = style({ display: "block", maxWidth: "none" });

export const lane = style({ fill: tokens.color.bg.sunken });
export const laneLabel = style({ fill: tokens.color.ink.tertiary, fontSize: tokens.typography.role.label.size, fontWeight: tokens.typography.role.label.weight });

export const edge = style({ fill: "none", stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.emphasis });
export const edgeActive = style({ stroke: tokens.color.ink.primary });

export const nodeGroup = style({ cursor: "pointer", outline: "none" });
export const nodeBox = style({ fill: tokens.color.bg.raised, stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border });
export const nodeBoxSelected = style({ stroke: tokens.color.ink.primary, strokeWidth: tokens.shape.stroke.emphasis });
