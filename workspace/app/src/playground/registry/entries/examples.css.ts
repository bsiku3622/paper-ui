import { globalStyle, style, styleVariants, type StyleRule } from "@vanilla-extract/css";
import { BREAKPOINTS, STATE_TINT_PROPERTY, lineRule, stateStyle, tokens, transition, type Breakpoint } from "@studio-baeks/paper-ui/tokens";

export const control = style([stateStyle.item, stateStyle.disabled, stateStyle.focusVisible, { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: tokens.layout.gap.sm, minHeight: tokens.shape.control.height.md, paddingBlock: `calc((${tokens.shape.control.height.md} - ${tokens.typography.role.body.leading}) / 2 - ${tokens.shape.stroke.border})`, paddingInline: tokens.shape.control.inset.button.md, ...lineRule(), borderRadius: tokens.shape.radius.control.md, backgroundColor: tokens.color.bg.raised, color: tokens.color.ink.primary, cursor: "pointer", transition: transition("hover", STATE_TINT_PROPERTY) }]);
export const boxSample = style({ outline: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` });
export const paintSample = style({ borderRadius: tokens.shape.radius.control.md });
export const controlSample = style({ background: tokens.color.bg.sunken, borderStyle: "none", color: "inherit" });
export const stage = style({ position: "relative", width: "100%", minWidth: 320, height: 240, overflow: "hidden", ...lineRule(), borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.canvas });
export const moving = style({ position: "absolute", insetInlineStart: tokens.layout.gap.lg, top: tokens.layout.gap.lg, width: 240, padding: tokens.shape.inset.md, ...lineRule(), borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised });
export const handle = style({ display: "inline-flex", padding: tokens.shape.inset.xs, borderRadius: tokens.shape.radius.control.xs });
export const transfer = style({ padding: tokens.shape.inset.md, ...lineRule(), borderRadius: tokens.shape.radius.surface.sm, background: tokens.color.bg.raised });
export const dropTarget = style([stateStyle.dropTarget, { minHeight: 100, padding: tokens.shape.inset.md, ...lineRule({ style: "dashed", level: "strong" }), borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.raised }]);
export const roving = style({ display: "flex", flexWrap: "wrap", gap: tokens.layout.gap.sm });
globalStyle(`${roving}[data-orientation="vertical"]`, { flexDirection: "column", alignItems: "flex-start" });
export const portalNote = style({ position: "fixed", insetInlineEnd: tokens.layout.gap.lg, insetBlockEnd: tokens.layout.gap.lg });
export const narrow = style({ width: "12rem" });
export const wide = style({ width: "18rem" });
export const sidebarShell = style({ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gridTemplateRows: "3.5rem minmax(0, 1fr)", width: "100%", minWidth: 320, height: "22rem", overflow: "hidden", contain: "layout", ...lineRule(), borderRadius: tokens.shape.radius.surface.md, background: tokens.color.bg.canvas });
export const sidebarBar = style({ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: tokens.layout.gap.sm, paddingInline: tokens.layout.gap.md, ...lineRule({ side: "bottom" }) });
export const sidebarFit = style({ maxBlockSize: "100%" });
export const sidebarMenu = styleVariants({
  never: { display: "none" },
  always: {},
  ...(Object.fromEntries(BREAKPOINTS.map((breakpoint) => [breakpoint, { "@media": { [`(min-width: ${tokens.layout.breakpoint[breakpoint]})`]: { display: "none" } } }])) as Record<Breakpoint, StyleRule>),
});
export const sidebarPage = style({ padding: tokens.layout.gap.lg, overflow: "auto" });
