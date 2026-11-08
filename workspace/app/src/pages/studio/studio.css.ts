// What the studio's page needs that Paper's props do not say: the window-high frame whose preview and editor scroll on their own, the
// app bar that takes the top bar's free width, the preview iframes, and the two lines the picker draws over a page inside a frame.
// Everything is a token.

import { style, styleVariants } from "@vanilla-extract/css";

import { codeRule, lineRule, tokens, typographyRule } from "@studio-baeks/paper-ui/tokens";

// From lg up the studio is the height of the window and each column scrolls inside it; below that it is a page that scrolls: the
// preview, then the editor under it, and the list of apps as a select.
const wide = `screen and (min-width: ${tokens.layout.breakpoint.lg})`;

export const page = style({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  "@media": { [wide]: { height: tokens.layout.viewport, overflow: "hidden" } },
});

export const body = styleVariants({
  open: { "@media": { [wide]: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 22rem", minHeight: 0 } } },
  folded: { "@media": { [wide]: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", minHeight: 0 } } },
});

// A column that scrolls inside the window's height from lg up.
export const column = style({ minHeight: 0, "@media": { [wide]: { overflowY: "auto" } } });

// The apps in the top bar take the width the name and the site's links leave, and go on to a second line when there are more than
// one line holds: every app stays in sight, none behind a scroll.
export const appBar = style({ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 });

// What is for the page that has no bar for it: below lg the list of apps is a select in the toolbar.
export const onlyNarrow = style({ "@media": { [wide]: { display: "none" } } });

// A colour as one small face. The colour itself is the face's background, set where it is drawn.
export const chip = style({ display: "inline-block", flexShrink: 0, width: "1.25rem", height: "1.25rem" });

// A palette step to choose: a small square with the line every face has; the chosen one stands in a ring of ink.
export const swatch = style({
  ...lineRule(),
  appearance: "none",
  flexShrink: 0,
  width: "1.25rem",
  height: "1.25rem",
  padding: 0,
  borderRadius: tokens.shape.radius.text,
  cursor: "pointer",
  selectors: {
    '&[aria-pressed="true"]': {
      outlineStyle: "solid",
      outlineWidth: tokens.shape.focus.width,
      outlineOffset: tokens.shape.focus.offset,
      outlineColor: tokens.color.ink.primary,
    },
  },
});

// Code to copy: set in the code face, in a field that takes the focus and selects it all.
export const codeField = style({ ...codeRule("block") });

// The middle: the toolbar over the stage, the stage taking what is left.
export const middle = style({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  minWidth: 0,
  minHeight: 0,
  "@media": { [wide]: { overflow: "hidden" } },
});

// Where the frames stand. Its height below md is a share of the window, so the frames have a size to fill.
export const stage = style({
  position: "relative",
  minHeight: 0,
  height: "70dvh",
  "@media": { [wide]: { height: "auto" } },
});

// The part of the stage the frames may fill; its size is what the frames are fitted to.
export const measure = style({ position: "absolute", inset: 0, boxSizing: "border-box", padding: tokens.shape.inset.lg, overflow: "hidden" });

// A frame at its own width, drawn smaller by one scale shared by the frames of the stage: a 1440 page fits a 900 stage and a media
// query still sees 1440. The wrapper takes the size it has on screen; the iframe takes the size it has in its own world.
export const scaled = style({ position: "relative", flexShrink: 0, overflow: "hidden" });
export const frame = style({ position: "absolute", insetBlockStart: 0, insetInlineStart: 0, transformOrigin: "0 0", border: 0, display: "block" });
// While a frame is dragged over or held, the page under it is not asked for pointer events.
export const unaware = style({ pointerEvents: "none" });

// The picker, over a page in a frame (pick.ts).
const line = {
  position: "fixed",
  boxSizing: "border-box",
  pointerEvents: "none",
  display: "none",
  outlineStyle: "solid",
  outlineWidth: tokens.shape.focus.width,
  outlineColor: tokens.color.interaction.focus,
  borderRadius: tokens.shape.radius.text,
} as const;

export const hoverBox = style({ ...line, backgroundColor: tokens.color.interaction.selected });
export const pickedBox = style({ ...line });

export const label = style({
  ...typographyRule("label"),
  position: "absolute",
  insetInlineStart: 0,
  insetBlockEnd: "100%",
  marginBlockEnd: tokens.layout.gap.xs,
  paddingBlock: tokens.shape.inset.xs,
  paddingInline: tokens.shape.inset.sm,
  borderRadius: tokens.shape.radius.text,
  whiteSpace: "nowrap",
  backgroundColor: tokens.color.accent.primary.solid,
  color: tokens.color.accent.primary.wash,
});

// A part at the top edge of the window has no room for its name above it, and one at the right edge has none to the right of its start.
export const labelInside = style({ insetBlockEnd: "auto", insetBlockStart: 0, marginBlockEnd: 0, marginBlockStart: tokens.layout.gap.xs, marginInlineStart: tokens.layout.gap.xs });
export const labelEnd = style({ insetInlineStart: "auto", insetInlineEnd: 0 });

export const crosshair = style({ cursor: "crosshair" });
