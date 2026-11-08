// The stage's own rules. Every length and colour is a Paper token; what is written out here is only where things stand.
// (The canvas fills what is under the top bar; chrome stands in slots at its edges.) The camera arrives as three custom
// properties on the viewport (--stage-x, --stage-y, --stage-zoom), and the dot grid and the world follow them.
//
// Stacking: the world is its own stacking context, in which the sheets lie lowest, then the ink, then the boxes (a chosen box
// above the rest; Placed gives them their tier). The slots come after the world, so the chrome lies over all of it, and the
// viewport is isolated so that Paper's popovers, which stand in the page, lie over the chrome.

import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

const gap = tokens.layout.gap;
const BELOW_MD = `not all and (min-width: ${tokens.layout.breakpoint.md})`;

// The prototype's right panel is 286px wide and stands 24px in from the window's edge.
const PANEL = "17.875rem";

// The canvas fills what is under the top bar. The dot grid is drawn by the stage itself so it can move with the camera.
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

// While the pen or the hand is in use, what is under it is not text to select.
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
    // A chosen box is marked as the prototype did: one thin ink line a little off its edge.
    "&[data-selected='true']": {
      outline: `${tokens.shape.stroke.border} solid ${tokens.color.ink.primary}`,
      outlineOffset: tokens.shape.focus.offset,
      borderRadius: tokens.shape.radius.surface.sm,
    },
    "&[data-movable='true']": { cursor: "move" },
    "&[data-dragging='true']": { cursor: "grabbing" },
  },
});

// The ink lies over the sheets (it comes after them) and under the boxes (they have a tier), and lets the pointer through.
export const strokes = style({
  position: "absolute",
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  overflow: "visible",
  pointerEvents: "none",
});

// Slots for the chrome Paper draws over the canvas. A slot lets the pointer through; the chrome inside catches it.
const slot = { position: "absolute", display: "flex", pointerEvents: "none" } as const;

export const slotRail = style({
  ...slot,
  left: gap.xl,
  top: gap.xl,
  flexDirection: "column",
  "@media": { [BELOW_MD]: { left: gap.md, top: gap.md } },
});

// Centred on the window, not on what the panel leaves free, as the prototype had it.
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

// Centred over what is left of the window beside the panel (the panel and its margin take 310px).
export const slotZoom = style({
  ...slot,
  left: 0,
  bottom: gap.xl,
  width: `calc(100% - ${PANEL} - ${gap.xl})`,
  justifyContent: "center",
  "@media": { [BELOW_MD]: { width: "100%", bottom: gap.md } },
});

// The panel scrolls, and a scroller clips what overflows it, so the floating cards' shadows need room inside it: the slot is padded
// by the margin it used to keep from the window, and the cards stand where they stood.
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

// What stands in a slot catches the pointer, and is only as big as itself.
export const chrome = style({ pointerEvents: "auto", maxWidth: "100%" });
