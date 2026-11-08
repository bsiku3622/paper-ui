import { style } from "@vanilla-extract/css";

import { lineRule, STATE_TINT_PROPERTY, tokens } from "@studio-baeks/paper-ui/tokens";

const SIGNATURE_INK = tokens.color.accent.primary.ink;

export const onlyBelowMd = style({
  "@media": { [`screen and (min-width: ${tokens.layout.breakpoint.md})`]: { display: "none" } },
});

export const plainLink = style({ display: "block", color: "inherit", textDecoration: "none" });

export const ruleClip = style({ overflow: "hidden" });
export const ruleGrid = style({ marginInlineStart: `calc((${tokens.layout.gap.lg} + ${tokens.shape.stroke.border}) * -1)` });
export const ruleCell = style({
  ...lineRule({ side: "start" }),
  paddingInlineStart: tokens.layout.gap.lg,
});

export const underlineList = style({ ...lineRule({ side: "bottom" }) });

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


export const toastDock = style({
  position: "fixed",
  insetInline: 0,
  bottom: tokens.layout.gap.xl,
  display: "flex",
  justifyContent: "center",
  pointerEvents: "none",
});
export const toastItem = style({ pointerEvents: "auto" });
