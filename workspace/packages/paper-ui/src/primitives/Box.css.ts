import type { StyleRule } from "@vanilla-extract/css";

import { tokens, ELEVATIONS, type BoxRadius, type Elevation } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

const RADII: Record<BoxRadius, string> = { ...tokens.shape.radius.surface, full: tokens.shape.radius.full };
export const boxRadius = styleVariants(RADII, (borderRadius) => ({ borderRadius }));

// Box `elevation` prop → 층 하나가 z와 그림자를 함께 정한다(Layout elevation). 붙은 면은 prop 생략.
const LIFTED = ELEVATIONS.filter((level): level is Exclude<Elevation, "base"> => level !== "base");
export const boxElevation = styleVariants(Object.fromEntries(LIFTED.map((level) => [level, {
  zIndex: tokens.layout.elevation[level].z,
  boxShadow: tokens.layout.elevation[level].shadow,
}])) as Record<Exclude<Elevation, "base">, { zIndex: string; boxShadow: string }>);

// Box `border` prop → 카드 헤어라인. 면(surface) 위에 얇은 뉴트럴 선.
// 불리언이라 CSS 값 주입과 헷갈리지 않는다 — 선이 필요하면 켜고, 색은 border.base 로 고정.
export const boxBorder = style({
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
});

// 이름 있는 크기와 overflow 키워드는 모두 class 다. 가족(dimension · measure · container · keyword)마다 단계
// 하나가 class 하나이고, 이름이 아닌 CSS 길이만 Box 가 inline 으로 보낸다. 생성기는 이 하나다.
type BoxProperty = "width" | "minWidth" | "maxWidth" | "height" | "minHeight" | "maxHeight" | "overflow" | "overflowX" | "overflowY";
const classesOf = <Steps extends Record<string, string>>(property: BoxProperty, steps: Steps): Record<keyof Steps, string> =>
  styleVariants(steps, (value) => ({ [property]: value }) as Pick<StyleRule, BoxProperty>);

const KEYWORD = { full: "100%", fit: "fit-content", "min-content": "min-content", "max-content": "max-content" } as const;
export type BoxKeyword = keyof typeof KEYWORD;

const widthClasses = (property: "width" | "minWidth" | "maxWidth") => ({
  dimension: classesOf(property, tokens.shape.dimension.width),
  measure: classesOf(property, tokens.shape.measure),
  container: classesOf(property, tokens.layout.container),
  keyword: classesOf(property, KEYWORD),
});
const heightClasses = (property: "height" | "minHeight" | "maxHeight") => ({
  dimension: classesOf(property, tokens.shape.dimension.height),
  keyword: classesOf(property, KEYWORD),
});

export const boxSize = {
  width: widthClasses("width"),
  minWidth: widthClasses("minWidth"),
  maxWidth: widthClasses("maxWidth"),
  height: heightClasses("height"),
  minHeight: heightClasses("minHeight"),
  maxHeight: heightClasses("maxHeight"),
};

// overflow 의 키워드 집합은 닫혀 있어 길이 escape 가 없다. 단축 속성이 먼저라 방향별 속성이 이긴다.
const OVERFLOW = { visible: "visible", hidden: "hidden", clip: "clip", scroll: "scroll", auto: "auto" } as const;
export type BoxOverflow = keyof typeof OVERFLOW;

export const boxOverflow = {
  overflow: classesOf("overflow", OVERFLOW),
  overflowX: classesOf("overflowX", OVERFLOW),
  overflowY: classesOf("overflowY", OVERFLOW),
};
