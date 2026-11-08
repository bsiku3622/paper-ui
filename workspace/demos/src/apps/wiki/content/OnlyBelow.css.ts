import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const onlyBelowMd = style({
  "@media": { [`screen and (min-width: ${tokens.layout.breakpoint.md})`]: { display: "none" } },
});
