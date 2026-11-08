// Content: Paper's Text with a serif face. Only the family is changed; size, weight and tracking stay the role's.

import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

import { SERIF_STACK, WORDMARK_STACK } from "./fonts.css";

export const serif = style({ fontFamily: SERIF_STACK });

// The name of the app: Latin letters in Noto Serif KR, set a little tighter than a title.
export const wordmark = style({
  fontFamily: WORDMARK_STACK,
  letterSpacing: tokens.typography.role.display.tracking,
  whiteSpace: "nowrap",
});

// A cover's title: at most three lines of the lead role it is set in.
export const clamp = style({
  maxHeight: `calc(${tokens.typography.role.lead.leading} + ${tokens.typography.role.lead.leading} + ${tokens.typography.role.lead.leading})`,
  overflow: "hidden",
  overflowWrap: "anywhere",
});
