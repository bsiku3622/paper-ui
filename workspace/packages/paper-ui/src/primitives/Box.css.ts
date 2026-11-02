import type { StyleRule } from "@vanilla-extract/css";

import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("components");

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
// 높이에만 있는 키워드 — 창의 높이. 사이드바처럼 내용과 상관없이 창만큼 서는 면과, 화면을 채우는 틀의 최소 높이.
const heightClasses = (property: "height" | "minHeight" | "maxHeight") => ({
  dimension: classesOf(property, tokens.shape.dimension.height),
  keyword: classesOf(property, { ...KEYWORD, viewport: tokens.layout.viewport }),
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

// 분기점 아래에서 빠지는 칸. Stack · Inline · Grid 의 root 도 display 를 정하므로 중요 선언으로 쓴다 — 숨김은 배치를 이겨야 하고,
// `not all and` 는 Grid 의 min-width 와 정확히 맞물려 한 폭에서 둘 다 틀리는 틈이 없다.
export const boxHideBelow = styleVariants(tokens.layout.breakpoint, (breakpoint) => ({
  "@media": { [`not all and (min-width: ${breakpoint})`]: { display: "none !important" } },
}));
