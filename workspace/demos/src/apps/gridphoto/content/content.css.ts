// The pictures of a page, drawn from Paper's roles. A length that is a moment's (a handle's place, a window onto the photo, the
// aspect of a frame) comes in through a custom property the rule below reads; nothing here names a colour or a length of its own.

import { style, styleVariants } from "@vanilla-extract/css";

import { lineRule, tokens, transition } from "@studio-baeks/paper-ui/tokens";

// ── Layers: things laid over a picture ──

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

// ── The frame of a picture ──

// The tallest a picture may stand in the well: what the window leaves after the bar, the well's own padding and the strip.
// A tall page gets narrower rather than pushing the pages below the fold.
const TALLEST = `calc(${tokens.layout.viewport} - ${tokens.layout.gap["3xl"]} * 6)`;

// For the frame of anything shown large: as wide as it can be, and no taller than that. Reads --gp-aspect.
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

// A window onto the kit's drawing. The drawing is laid out larger than the frame, by the inverse of the window's width (set as a
// width), and slid back by the window's own offset (a translate of the drawing's own size), so the window is the frame.
export const view = style({ position: "absolute", left: 0, top: 0 });
export const dim = style({ opacity: tokens.color.opacity.disabled });

// The page pulled straight: width and transform come from the measured frame.
export const flat = style({ position: "absolute", left: 0, top: 0, transformOrigin: "0 0" });

// The filters are blends laid over the drawing: a pale layer lifts the paper, and a neutral one in saturation mode takes the
// colour out. (A CSS filter is a depth in Paper's rules, so the effect is built from blends.)
const blend = { position: "absolute", inset: 0, pointerEvents: "none" } as const;
export const lift = style({ ...blend, mixBlendMode: "soft-light", backgroundColor: tokens.color.accent.warning.wash, opacity: tokens.color.opacity.disabled });
export const grey = style({ ...blend, mixBlendMode: "saturation", backgroundColor: tokens.color.marker.ink });

// ── Lines laid over a picture ──

export const lines = style({ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" });
export const lineWeight = styleVariants({
  normal: { strokeWidth: tokens.shape.stroke.border },
  strong: { strokeWidth: tokens.shape.stroke.emphasis },
});
export const cross = style({ position: "absolute", inset: 0, width: "100%", height: "100%" });

// ── The corner editor ──

export const editorFrame = style({ position: "relative", touchAction: "none" });

// The magnifier takes the side away from the handle.
const loupeBase = { position: "absolute", top: tokens.layout.gap.md, overflow: "hidden", pointerEvents: "none" } as const;
export const loupe = styleVariants({
  start: { ...loupeBase, insetInlineStart: tokens.layout.gap.md },
  end: { ...loupeBase, insetInlineEnd: tokens.layout.gap.md },
});

// A handle is a button the size of a fingertip, centred on --gp-x and --gp-y (the share of the frame).
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

// A ring of the page's ink outside a ring of the raised face reads on any photo; the middle stays clear for the crossing.
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

// ── The diagram on the start screen ──

export const diagram = style({ width: "100%", maxWidth: tokens.shape.dimension.width.lg, display: "block" });
export const drawn = styleVariants({
  skewed: { fill: "none", stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round" },
  skewedText: { fill: "none", stroke: tokens.color.border.strong, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round", opacity: tokens.color.opacity.subdued },
  arrow: { fill: "none", stroke: tokens.color.ink.tertiary, strokeWidth: tokens.shape.stroke.emphasis, strokeLinecap: "round", strokeLinejoin: "round" },
  straight: { fill: "none", stroke: tokens.color.ink.primary, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round" },
  straightText: { fill: "none", stroke: tokens.color.ink.primary, strokeWidth: tokens.shape.stroke.border, strokeLinecap: "round", strokeLinejoin: "round", opacity: tokens.color.opacity.disabled },
});
