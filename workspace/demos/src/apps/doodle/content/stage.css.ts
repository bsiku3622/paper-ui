import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

const gap = tokens.layout.gap;
const BELOW_MD = `not all and (min-width: ${tokens.layout.breakpoint.md})`;

const PANEL = "17.875rem";

const DOT = `calc(${tokens.shape.stroke.border} / 2)`;
const CELL = `calc(${gap.xl} * var(--stage-zoom))`;

export const viewport = style({
  position: "relative",
  isolation: "isolate",
  backgroundImage: `radial-gradient(${tokens.color.border.strong} ${DOT}, transparent ${DOT})`,
  backgroundSize: `${CELL} ${CELL}`,
  backgroundPosition: "var(--stage-x) var(--stage-y)",
  minHeight: 0,
  overflow: "hidden",
  touchAction: "none",
  backgroundColor: tokens.color.bg.canvas,
  cursor: "grab",
  outline: "none",
  selectors: {
    "&[data-tool='pen']": { cursor: "crosshair" },
    "&[data-tool='text'], &[data-tool='image'], &[data-tool='video']": { cursor: "copy" },
    "&[data-panning='true']": { cursor: "grabbing" },
  },
});

export const world = style({
  position: "absolute",
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  transformOrigin: "0 0",
  willChange: "transform",
  transform: "translate(var(--stage-x), var(--stage-y)) scale(var(--stage-zoom))",
  selectors: {
    "[data-tool='pen'] > &, [data-tool='hand'] > &, [data-panning='true'] > &": { userSelect: "none" },
  },
});

export const item = style({
  position: "absolute",
  display: "grid",
  selectors: {
    "&[data-selected='true']": {
      outline: `${tokens.shape.stroke.border} solid ${tokens.color.ink.primary}`,
      outlineOffset: tokens.shape.focus.offset,
      borderRadius: tokens.shape.radius.surface.sm,
    },
    "&[data-movable='true']": { cursor: "move" },
    "&[data-dragging='true']": { cursor: "grabbing" },
  },
});

export const strokes = style({
  position: "absolute",
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  overflow: "visible",
  pointerEvents: "none",
});

const slot = { position: "absolute", display: "flex", pointerEvents: "none" } as const;

export const slotRail = style({
  ...slot,
  left: gap.xl,
  top: gap.xl,
  flexDirection: "column",
  "@media": { [BELOW_MD]: { left: gap.md, top: gap.md } },
});

export const slotHint = style({
  ...slot,
  left: 0,
  right: 0,
  top: gap.lg,
  justifyContent: "center",
  "@media": { [BELOW_MD]: { justifyContent: "flex-end", paddingInlineEnd: gap.lg, top: gap.md, left: `calc(${gap["3xl"]} + ${gap.lg})` } },
});

export const slotMenu = style({
  ...slot,
  left: gap.xl,
  bottom: gap.xl,
  "@media": { [BELOW_MD]: { left: gap.md, bottom: gap.md } },
});

export const slotZoom = style({
  ...slot,
  left: 0,
  bottom: gap.xl,
  width: `calc(100% - ${PANEL} - ${gap.xl})`,
  justifyContent: "center",
  "@media": { [BELOW_MD]: { width: "100%", bottom: gap.md } },
});

export const slotPanel = style({
  ...slot,
  flexDirection: "column",
  right: 0,
  top: 0,
  bottom: 0,
  padding: gap.xl,
  width: `calc(${PANEL} + ${gap.xl} + ${gap.xl})`,
  overflowY: "auto",
  overscrollBehavior: "contain",
  scrollbarWidth: "none",
  touchAction: "pan-y",
  selectors: { "&::-webkit-scrollbar": { display: "none" } },
  "@media": { [BELOW_MD]: { padding: gap.md, width: `min(calc(${PANEL} + ${gap.md} + ${gap.md}), 100%)` } },
});

export const chrome = style({ pointerEvents: "auto", maxWidth: "100%" });
