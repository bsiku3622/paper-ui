import { lineFrame, type Orientation } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

export const dividerRoot = style({
  borderWidth: 0,
  borderStyle: "none",
  margin: 0,
  flexShrink: 0,
});

export const dividerOrientation = styleVariants({
  horizontal: { height: 0, width: "100%", ...lineFrame({ side: "top" }) },
  vertical: { width: 0, alignSelf: "stretch", ...lineFrame({ side: "start" }) },
} as const satisfies Record<Orientation, object>);
