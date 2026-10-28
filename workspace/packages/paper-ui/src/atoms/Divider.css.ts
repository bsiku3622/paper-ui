import { tokens, type DividerLevel, type Orientation } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

export const dividerRoot = style({
  border: "none",
  margin: 0,
  flexShrink: 0,
});

export const dividerLevel = styleVariants({
  base: { background: tokens.color.border.base },
  strong: { background: tokens.color.border.strong },
} satisfies Record<DividerLevel, object>);

export const dividerOrientation = styleVariants({
  horizontal: { height: tokens.shape.stroke.border, width: "100%" },
  vertical: { width: tokens.shape.stroke.border, alignSelf: "stretch" },
} satisfies Record<Orientation, object>);
