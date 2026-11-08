import { LINE_SIDES, lineRule, tokens, insetCast, restingCast, stateStyle, transition, STATE_TINT_PROPERTY, type LineSide, type SurfaceRadius } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

const RADII: Record<SurfaceRadius, string> = { ...tokens.shape.radius.surface, full: tokens.shape.radius.full };
export const surfaceRadius = styleVariants(RADII, (borderRadius) => ({ borderRadius }));

// Surface `hoverable` prop → a neutral item: the pointer, the press and the selection lay a tint over the fill.
export const surfaceItem = style([stateStyle.item, { transition: transition("hover", STATE_TINT_PROPERTY) }]);

// `shadow` prop → 제자리에 있는 면의 그림자. position 도 z 도 없으니 아무것도 덮지 않는다. Paint 와 입력 틀도 이 class 를 쓴다.
export const restingShadow = style(restingCast);

// 트랙(Switch · SegmentControl · Slider)은 어디에 놓이든 파인 홈이다. 고리를 그리는 상태(켜짐 · 오류 · 대비 · 강제 색)는 Paint가 더 강한 selector로 이긴다.
export const trackInset = style({ ...insetCast, "@media": { "(forced-colors: active)": { boxShadow: "none" } } });

// Surface `border` prop → 뉴트럴 선 한 줄. 켜면 둘레 전체, 면 이름을 주면 그 면만. 색은 border.base 로 고정 — 지면의 선은 하나다.
export const surfaceBorder = styleVariants({
  all: lineRule(),
  ...(Object.fromEntries(LINE_SIDES.map((side) => [side, lineRule({ side })])) as Record<LineSide, ReturnType<typeof lineRule>>),
});
