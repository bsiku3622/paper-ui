import { globalStyle, style } from "@vanilla-extract/css";
import { tokens } from "@studio-baeks/paper-ui";

export const control = style({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: tokens.shape.space.sm, padding: tokens.shape.space.sm, minHeight: tokens.shape.control.height.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.control, background: tokens.color.bg.raised, color: tokens.color.ink.primary, cursor: "pointer" });
globalStyle(`${control}[data-hovered], ${control}[data-selected]`, { background: tokens.color.bg.sunken });
globalStyle(`${control}:disabled`, { opacity: 0.5, cursor: "not-allowed" });
export const stage = style({ position: "relative", width: "100%", minWidth: 320, height: 240, overflow: "hidden", border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.canvas });
export const moving = style({ position: "absolute", insetInlineStart: 20, top: 20, width: 240, padding: tokens.shape.space.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised });
export const handle = style({ display: "inline-flex", padding: tokens.shape.space.xs, borderRadius: tokens.shape.radius.control });
export const transfer = style({ padding: tokens.shape.space.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.sm, background: tokens.color.bg.raised });
export const dropTarget = style({ minHeight: 100, padding: tokens.shape.space.md, border: `${tokens.shape.stroke.border} dashed ${tokens.color.border.strong}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised });
globalStyle(`${dropTarget}[data-drop-target]`, { borderColor: tokens.color.interaction.focus });
export const roving = style({ display: "flex", flexWrap: "wrap", gap: tokens.shape.space.sm });
globalStyle(`${roving}[data-orientation="vertical"]`, { flexDirection: "column", alignItems: "flex-start" });
export const overlayContent = style({ width: 340, maxWidth: "100%", padding: tokens.shape.space.lg, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised, color: tokens.color.ink.primary, boxShadow: tokens.shape.shadow.overlay });
export const formField = style({ display: "grid", gap: tokens.shape.space.sm });
