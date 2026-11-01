import { style } from "@vanilla-extract/css";

import { SYSTEM_COLORS, tokens } from "@studio-baeks/paper-ui/tokens";

// A forced palette paints a face away and the bar is only faces, so it keeps two system colours there, as a Spinner does.
const FORCED = "(forced-colors: active)";

// The bar is 0.375rem thick: this composition's own length, which no token names.
export const track = style({
  height: "0.375rem",
  overflow: "hidden",
  borderRadius: tokens.shape.radius.full,
  background: tokens.color.control.track,
  "@media": { [FORCED]: { forcedColorAdjust: "none", background: SYSTEM_COLORS.grayText } },
});
export const fill = style({
  display: "block",
  height: "100%",
  borderRadius: tokens.shape.radius.full,
  "@media": { [FORCED]: { forcedColorAdjust: "none", background: SYSTEM_COLORS.canvasText } },
});
