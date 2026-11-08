import { LINE_SIDES, lineRule, tokens, insetCast, restingCast, stateStyle, transition, STATE_TINT_PROPERTY, type LineSide, type SurfaceRadius } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

const RADII: Record<SurfaceRadius, string> = { ...tokens.shape.radius.surface, full: tokens.shape.radius.full };
export const surfaceRadius = styleVariants(RADII, (borderRadius) => ({ borderRadius }));

export const surfaceItem = style([stateStyle.item, { transition: transition("hover", STATE_TINT_PROPERTY) }]);

export const restingShadow = style(restingCast);

export const trackInset = style({ ...insetCast, "@media": { "(forced-colors: active)": { boxShadow: "none" } } });

export const surfaceBorder = styleVariants({
  all: lineRule(),
  ...(Object.fromEntries(LINE_SIDES.map((side) => [side, lineRule({ side })])) as Record<LineSide, ReturnType<typeof lineRule>>),
});
