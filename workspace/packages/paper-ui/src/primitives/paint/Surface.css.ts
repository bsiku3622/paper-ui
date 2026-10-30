import { tokens, type SurfaceRadius } from "../../tokens";
import { layered } from "../../tokens/layers.css";

const { style, styleVariants } = layered("components");

const RADII: Record<SurfaceRadius, string> = { ...tokens.shape.radius.surface, full: tokens.shape.radius.full };
export const surfaceRadius = styleVariants(RADII, (borderRadius) => ({ borderRadius }));

// Surface `border` prop → 카드 헤어라인. 면(fill) 위에 얇은 뉴트럴 선.
// 불리언이라 CSS 값 주입과 헷갈리지 않는다 — 선이 필요하면 켜고, 색은 border.base 로 고정.
export const surfaceBorder = style({
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
});
