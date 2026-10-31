import { tokens, type Orientation } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 선은 border 로 긋는다(색은 linePaint). 높이가 0 인 hr 가 border 한 줄만큼 서고, 색을 OS 가 정하는 모드에서도 CanvasText 로 남는다.
export const dividerRoot = style({
  borderWidth: 0,
  borderStyle: "none",
  margin: 0,
  flexShrink: 0,
});

export const dividerOrientation = styleVariants({
  horizontal: { height: 0, width: "100%", borderBlockStartWidth: tokens.shape.stroke.border, borderBlockStartStyle: "solid" },
  vertical: { width: 0, alignSelf: "stretch", borderInlineStartWidth: tokens.shape.stroke.border, borderInlineStartStyle: "solid" },
} as const satisfies Record<Orientation, object>);
