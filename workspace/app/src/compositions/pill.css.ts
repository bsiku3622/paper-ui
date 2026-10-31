import { style } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// The box of a short mark that stands in a line of text — a person's initial, a date: the 14px pill a Badge made of
// it, which is how the Demo has always drawn them. The height is this composition's own; the colours are a Paint's.
export const pill = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 22,
  paddingInline: tokens.shape.inset.sm,
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  borderRadius: tokens.shape.radius.full,
});
export const square = style({ borderRadius: tokens.shape.radius.control });
