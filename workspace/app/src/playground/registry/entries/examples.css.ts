import { globalStyle, style } from "@vanilla-extract/css";
import { tokens } from "@studio-baeks/paper-ui/tokens";

export const control = style({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: tokens.layout.gap.sm, padding: tokens.shape.inset.sm, minHeight: tokens.shape.control.height.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.control, background: tokens.color.bg.raised, color: tokens.color.ink.primary, cursor: "pointer" });
globalStyle(`${control}[data-hovered], ${control}[data-selected]`, { background: tokens.color.bg.sunken });
globalStyle(`${control}:disabled`, { opacity: 0.5, cursor: "not-allowed" });
export const stage = style({ position: "relative", width: "100%", minWidth: 320, height: 240, overflow: "hidden", border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.canvas });
export const moving = style({ position: "absolute", insetInlineStart: tokens.layout.gap.lg, top: tokens.layout.gap.lg, width: 240, padding: tokens.shape.inset.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised });
export const handle = style({ display: "inline-flex", padding: tokens.shape.inset.xs, borderRadius: tokens.shape.radius.control });
export const transfer = style({ padding: tokens.shape.inset.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.sm, background: tokens.color.bg.raised });
export const dropTarget = style({ minHeight: 100, padding: tokens.shape.inset.md, border: `${tokens.shape.stroke.border} dashed ${tokens.color.border.strong}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised });
globalStyle(`${dropTarget}[data-drop-target]`, { borderColor: tokens.color.interaction.focus });
export const roving = style({ display: "flex", flexWrap: "wrap", gap: tokens.layout.gap.sm });
globalStyle(`${roving}[data-orientation="vertical"]`, { flexDirection: "column", alignItems: "flex-start" });
export const overlayContent = style({ width: 340, maxWidth: "100%", padding: tokens.shape.inset.lg, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised, color: tokens.color.ink.primary, boxShadow: tokens.layout.elevation.overlay.shadow });
export const formField = style({ display: "grid", gap: tokens.layout.gap.sm });
// Width of a control's stage: the field-like controls need a column to fill.
export const narrow = style({ width: "12rem" });
export const wide = style({ width: "18rem" });
