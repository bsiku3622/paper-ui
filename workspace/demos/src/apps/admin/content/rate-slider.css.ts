// Paper has no slider; this styles the native range input from Paper's tokens, as the original hub did.

import { globalStyle, style } from "@vanilla-extract/css";

import { stateStyle, tokens } from "@studio-baeks/paper-ui/tokens";

export const rateSlider = style([stateStyle.focusVisible, {
  display: "block",
  width: "100%",
  margin: 0,
  height: tokens.shape.control.height.sm,
  appearance: "none",
  background: "transparent",
  cursor: "pointer",
  selectors: { "&:disabled": { opacity: tokens.color.opacity.disabled, cursor: "default" } },
}]);

const track = { height: tokens.shape.stroke.emphasis, borderRadius: tokens.shape.radius.full, background: tokens.color.border.strong };
const thumb = { width: tokens.shape.inset.md, height: tokens.shape.inset.md, borderRadius: tokens.shape.radius.full, background: tokens.color.accent.primary.solid };
globalStyle(`${rateSlider}::-webkit-slider-runnable-track`, track);
globalStyle(`${rateSlider}::-webkit-slider-thumb`, { ...thumb, appearance: "none", marginTop: `calc((${tokens.shape.stroke.emphasis} - ${tokens.shape.inset.md}) / 2)` });
globalStyle(`${rateSlider}::-moz-range-track`, track);
globalStyle(`${rateSlider}::-moz-range-thumb`, { ...thumb, border: 0 });
