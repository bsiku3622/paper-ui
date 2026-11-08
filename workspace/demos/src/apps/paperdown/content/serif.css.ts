import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

import { SERIF_STACK, WORDMARK_STACK } from "./fonts.css";

export const serif = style({ fontFamily: SERIF_STACK });

export const wordmark = style({
  fontFamily: WORDMARK_STACK,
  letterSpacing: tokens.typography.role.display.tracking,
  whiteSpace: "nowrap",
});

export const clamp = style({
  maxHeight: `calc(${tokens.typography.role.lead.leading} + ${tokens.typography.role.lead.leading} + ${tokens.typography.role.lead.leading})`,
  overflow: "hidden",
  overflowWrap: "anywhere",
});
