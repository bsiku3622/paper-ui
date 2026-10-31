import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// The bar is 0.375rem thick: this composition's own length, which no token names.
export const track = style({ height: "0.375rem", overflow: "hidden", borderRadius: tokens.shape.radius.full, background: tokens.color.control.track });
export const fill = style({ display: "block", height: "100%", borderRadius: tokens.shape.radius.full });
