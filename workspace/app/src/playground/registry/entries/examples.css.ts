import { globalStyle, style } from "@vanilla-extract/css";
import { STATE_TINT_PROPERTY, stateStyle, tokens, transition } from "@studio-baeks/paper-ui/tokens";

// An item of a control group: the pointer, the press and the selection tint its face, and the keyboard ring is the baseline's.
export const control = style([stateStyle.item, stateStyle.disabled, stateStyle.focusVisible, { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: tokens.layout.gap.sm, minHeight: tokens.shape.control.height.md, paddingBlock: `calc((${tokens.shape.control.height.md} - ${tokens.typography.role.body.leading}) / 2 - ${tokens.shape.stroke.border})`, paddingInline: tokens.shape.control.inset.button.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.control, backgroundColor: tokens.color.bg.raised, color: tokens.color.ink.primary, cursor: "pointer", transition: transition("hover", STATE_TINT_PROPERTY) }]);
// A Box paints nothing, so its sample draws its own edge to be seen.
export const boxSample = style({ outline: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` });
// A Paint sample gives the accent classes a line to colour: the width and style, never the colour.
export const paintSample = style({ borderWidth: tokens.shape.stroke.border, borderStyle: "solid", borderRadius: tokens.shape.radius.control });
export const stage = style({ position: "relative", width: "100%", minWidth: 320, height: 240, overflow: "hidden", border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.canvas });
export const moving = style({ position: "absolute", insetInlineStart: tokens.layout.gap.lg, top: tokens.layout.gap.lg, width: 240, padding: tokens.shape.inset.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised });
export const handle = style({ display: "inline-flex", padding: tokens.shape.inset.xs, borderRadius: tokens.shape.radius.control });
export const transfer = style({ padding: tokens.shape.inset.md, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`, borderRadius: tokens.shape.radius.surface.sm, background: tokens.color.bg.raised });
export const dropTarget = style([stateStyle.dropTarget, { minHeight: 100, padding: tokens.shape.inset.md, border: `${tokens.shape.stroke.border} dashed ${tokens.color.border.strong}`, borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised }]);
export const roving = style({ display: "flex", flexWrap: "wrap", gap: tokens.layout.gap.sm });
globalStyle(`${roving}[data-orientation="vertical"]`, { flexDirection: "column", alignItems: "flex-start" });
export const floatingContent = style({ width: 340, maxWidth: "100%", padding: tokens.shape.inset.lg, color: tokens.color.ink.primary });
// What a Portal carries to the body is placed in the corner of the viewport, where it can be seen.
export const portalNote = style({ position: "fixed", insetInlineEnd: tokens.layout.gap.lg, insetBlockEnd: tokens.layout.gap.lg });
export const formField = style({ display: "grid", gap: tokens.layout.gap.sm });
// Width of a control's stage: the field-like controls need a column to fill.
export const narrow = style({ width: "12rem" });
export const wide = style({ width: "18rem" });
