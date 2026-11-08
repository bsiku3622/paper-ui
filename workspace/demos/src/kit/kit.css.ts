// What the kit draws that Paper has no part for. Every rule reads Paper's tokens; nothing here names a colour or a length of
// its own.
//
// The file is outside Paper's cascade layers, so a rule here wins over the package's by being unlayered.

import { style } from "@vanilla-extract/css";

import { lineRule, STATE_TINT_PROPERTY, tokens } from "@studio-baeks/paper-ui/tokens";

// The ink of "where you are" (the chosen tab): the primary accent's ink.
const SIGNATURE_INK = tokens.color.accent.primary.ink;

// Box can hide below a breakpoint but not above one. The phone's menu button needs the other half.
export const onlyBelowMd = style({
  "@media": { [`screen and (min-width: ${tokens.layout.breakpoint.md})`]: { display: "none" } },
});

// A face that is a link. Paper's base styles give every <a> the link's ink and underline, which a whole card or
// row should not wear; its words keep their own inks.
// It is a block, too: an <a> is inline, and outside a flex or grid parent an inline face leaves a line box under it.
export const plainLink = style({ display: "block", color: "inherit", textDecoration: "none" });

// Rules between items that wrap. A divider drawn "before every item but the first" stands at the head of the second
// row once the strip wraps. Instead every item carries the rule on its start side, and the strip is pulled out by one gap
// and one stroke inside a clipping box, so the rules of the first column fall outside it, whichever items those are.
export const ruleClip = style({ overflow: "hidden" });
export const ruleGrid = style({ marginInlineStart: `calc((${tokens.layout.gap.lg} + ${tokens.shape.stroke.border}) * -1)` });
export const ruleCell = style({
  ...lineRule({ side: "start" }),
  paddingInlineStart: tokens.layout.gap.lg,
});

// Underline tabs. The list stands on one hairline; the chosen tab is ink with an emphasis stroke under it.
export const underlineList = style({ ...lineRule({ side: "bottom" }) });

// The chosen face of a selectable variant is a background colour, the pointer's a tint; an underline tab wears neither.
export const underlineTab = style({
  vars: { [STATE_TINT_PROPERTY]: "transparent" },
  position: "relative",
  borderRadius: 0,
  paddingInline: 0,
  backgroundColor: "transparent",
  backgroundImage: "none",
  color: tokens.color.ink.tertiary,
  selectors: {
    "&:hover": { color: tokens.color.ink.primary },
    // The primary accent's ink: the page's ink while the primary accent is ink, the accent's hue once it is a colour.
    "&[aria-selected='true']": { color: SIGNATURE_INK },
    "&[aria-selected='true']::after": {
      content: '""',
      position: "absolute",
      insetInline: 0,
      bottom: `calc(${tokens.shape.stroke.border} * -1)`,
      ...lineRule({ side: "bottom", weight: "emphasis" }),
      borderBlockEndColor: SIGNATURE_INK,
    },
  },
});


// The toasts' dock: along the bottom of the window, over the page. The elevation class gives it the toast tier's z; the dock
// makes it fixed (this file is unlayered, so its position wins) and lets the pointer through the gaps between toasts.
export const toastDock = style({
  position: "fixed",
  insetInline: 0,
  bottom: tokens.layout.gap.xl,
  display: "flex",
  justifyContent: "center",
  pointerEvents: "none",
});
export const toastItem = style({ pointerEvents: "auto" });
