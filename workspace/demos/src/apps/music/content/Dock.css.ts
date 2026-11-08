import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

import { ASIDE_WIDTH, SIDEBAR_WIDTH } from "./frame";

const md = `screen and (min-width: ${tokens.layout.breakpoint.md})`;
const lg = `screen and (min-width: ${tokens.layout.breakpoint.lg})`;

const beforePage = `calc(${tokens.layout.gap.lg} + ${SIDEBAR_WIDTH} + ${tokens.layout.gap.xl})`;
const afterPage = `calc(${tokens.layout.gap.lg} + ${ASIDE_WIDTH} + ${tokens.layout.gap.xl})`;

export const dock = style({
  position: "fixed",
  insetInline: 0,
  bottom: tokens.layout.gap.lg,
  display: "flex",
  justifyContent: "center",
  paddingInline: tokens.layout.gap.lg,
  pointerEvents: "none",
  "@media": { [md]: { insetInlineStart: beforePage } },
});

export const withAside = style({
  "@media": { [lg]: { insetInlineEnd: afterPage } },
});

export const bar = style({
  width: "100%",
  maxWidth: tokens.shape.measure.lg,
  pointerEvents: "auto",
});
