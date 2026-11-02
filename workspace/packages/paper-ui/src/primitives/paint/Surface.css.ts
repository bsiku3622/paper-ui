import { tokens, restingCast, stateStyle, transition, STATE_TINT_PROPERTY, type SurfaceRadius } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

const RADII: Record<SurfaceRadius, string> = { ...tokens.shape.radius.surface, full: tokens.shape.radius.full };
export const surfaceRadius = styleVariants(RADII, (borderRadius) => ({ borderRadius }));

// Surface `hoverable` prop → a neutral item: the pointer, the press and the selection lay a tint over the fill.
export const surfaceItem = style([stateStyle.item, { transition: transition("hover", STATE_TINT_PROPERTY) }]);

// `shadow` prop → 제자리에 있는 면의 그림자. position 도 z 도 없으니 아무것도 덮지 않는다. Paint 와 입력 틀도 이 class 를 쓴다.
export const restingShadow = style(restingCast);

// Surface `border` prop → 카드 헤어라인. 면(fill) 위에 얇은 뉴트럴 선.
// 불리언이라 CSS 값 주입과 헷갈리지 않는다 — 선이 필요하면 켜고, 색은 border.base 로 고정.
export const surfaceBorder = style({
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
});
