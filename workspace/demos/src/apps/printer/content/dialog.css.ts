import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "@studio-baeks/paper-ui/tokens";

// The modal backdrop's one grid track fits its content, so the panel's max-width: 100% never caps anything;
// cap the width against the window here.
const capped = (width: string) => ({ width: `min(${width}, calc(100vw - 2 * ${tokens.layout.gutter}))` });

export const dialogWidth = styleVariants({
  sm: capped(tokens.shape.measure.xs),
  md: capped(tokens.shape.measure.sm),
  lg: capped(tokens.shape.measure.lg),
  xl: capped(tokens.shape.measure.xl),
  full: capped(tokens.layout.container.content),
});

export const dialogSteady = style({
  height: `min(${tokens.layout.container.content}, calc(${tokens.layout.viewport} - 2 * ${tokens.layout.gutter}))`,
});
