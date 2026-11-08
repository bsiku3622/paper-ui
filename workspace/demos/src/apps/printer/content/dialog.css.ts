// The width of a dialog. Floating's modal backdrop is a grid whose one track takes the size of what is in it, and the panel's
// own `max-width: 100%` is a percentage of that track, so it never caps anything: a dialog set to a measure of 448px or 672px
// simply runs off a 390px phone. Paper has no way to say "this wide, but never wider than the window", so a dialog's width is
// the measure Paper names, or the window less a gutter on each side, whichever is less.

import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

const capped = (width: string) => ({ width: `min(${width}, calc(100vw - 2 * ${tokens.layout.gutter}))` });

export const dialogWidth = styleVariants({
  sm: capped(tokens.shape.measure.xs),
  md: capped(tokens.shape.measure.sm),
  lg: capped(tokens.shape.measure.lg),
  xl: capped(tokens.shape.measure.xl),
  full: capped(tokens.layout.container.content),
});

// One height for a dialog whose content changes under the reader's hand. A dialog that takes its content's height is centred
// again each time the content changes, so on the settings tabs the list the reader just clicked slides away under the pointer.
// Paper's modal cannot be told to keep one height; this one is as tall as the window allows and no taller than the widest dialog,
// and what does not fit scrolls inside it.
export const dialogSteady = style({
  height: `min(${tokens.layout.container.content}, calc(${tokens.layout.viewport} - 2 * ${tokens.layout.gutter}))`,
});
