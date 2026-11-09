import { style, styleVariants } from "@vanilla-extract/css";

import { lineRule, tokens, transition } from "@studio-baeks/paper-ui/tokens";

const edge = tokens.layout.gap.xs;

export const layers = style({ position: "relative", width: "100%" });

const over = { position: "absolute", pointerEvents: "none" } as const;

export const place = styleVariants({
  topStart: { ...over, top: edge, insetInlineStart: edge },
  topEnd: { ...over, top: edge, insetInlineEnd: edge },
  bottomStart: { ...over, bottom: edge, insetInlineStart: edge },
  bottomEnd: { ...over, bottom: edge, insetInlineEnd: edge },
  bottom: { ...over, bottom: edge, insetInline: edge },
  center: { ...over, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: tokens.layout.gap.lg },
});

const TALLEST = `calc(${tokens.layout.viewport} - ${tokens.layout.gap["3xl"]} * 6)`;

export const capped = style({ width: `min(100%, calc(${TALLEST} * var(--gp-aspect)))`, marginInline: "auto" });

export const frame = style({
  position: "relative",
  width: "100%",
  aspectRatio: "var(--gp-aspect)",
  overflow: "hidden",
  isolation: "isolate",
  borderRadius: tokens.shape.radius.surface.sm,
  transition: transition("state", "opacity"),
});

export const stale = style({ opacity: tokens.color.opacity.subdued });

export const view = style({ position: "absolute", left: 0, top: 0 });
export const dim = style({ opacity: tokens.color.opacity.disabled });

export const flat = style({ position: "absolute", left: 0, top: 0, transformOrigin: "0 0" });

export const lines = style({ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" });
export const lineWeight = styleVariants({
  normal: { strokeWidth: tokens.shape.stroke.border },
  strong: { strokeWidth: tokens.shape.stroke.emphasis },
});
export const cross = style({ position: "absolute", inset: 0, width: "100%", height: "100%" });

export const editorFrame = style({ position: "relative", touchAction: "none" });

const loupeBase = { position: "absolute", top: tokens.layout.gap.md, overflow: "hidden", pointerEvents: "none" } as const;
export const loupe = styleVariants({
  start: { ...loupeBase, insetInlineStart: tokens.layout.gap.md },
  end: { ...loupeBase, insetInlineEnd: tokens.layout.gap.md },
});

const reach = tokens.shape.control.height.lg;
export const handle = style({
  position: "absolute",
  left: "calc(var(--gp-x) * 100%)",
  top: "calc(var(--gp-y) * 100%)",
  width: reach,
  height: reach,
  translate: "-50% -50%",
  padding: 0,
  border: 0,
  background: "none",
  display: "grid",
  placeItems: "center",
  cursor: "grab",
  touchAction: "none",
  selectors: { "&[data-active='true']": { cursor: "grabbing" } },
});

export const knob = styleVariants({
  rest: { width: tokens.shape.selection.size.md },
  active: { width: tokens.shape.selection.size.lg },
});
export const knobBase = style({
  aspectRatio: "1",
  borderRadius: tokens.shape.radius.full,
  backgroundColor: "transparent",
  ...lineRule({ weight: "emphasis" }),
  borderColor: tokens.color.bg.raised,
  outline: `${tokens.shape.stroke.border} solid ${tokens.color.ink.primary}`,
  outlineOffset: tokens.shape.stroke.emphasis,
});

export const diagram = style({ width: "100%", maxWidth: tokens.shape.dimension.width.lg, display: "block" });
export const drawn = styleVariants({
  skewed: { fill: "none", stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round" },
  skewedText: { fill: "none", stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round", opacity: tokens.color.opacity.subdued },
  arrow: { fill: "none", stroke: tokens.color.ink.tertiary, strokeWidth: tokens.shape.stroke.emphasis, strokeLinecap: "round", strokeLinejoin: "round" },
  straight: { fill: "none", stroke: tokens.color.ink.primary, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round" },
  straightText: { fill: "none", stroke: tokens.color.ink.primary, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round", opacity: tokens.color.opacity.disabled },
});
