import type { StyleRule } from "@vanilla-extract/css";

import { tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { styleVariants } = layered("components");

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

const OVERFLOW = { visible: "visible", hidden: "hidden", clip: "clip", scroll: "scroll", auto: "auto" } as const;
export type BoxOverflow = keyof typeof OVERFLOW;

export const boxOverflow = {
  overflow: classesOf("overflow", OVERFLOW),
  overflowX: classesOf("overflowX", OVERFLOW),
  overflowY: classesOf("overflowY", OVERFLOW),
};

// `not all and` meshes with Grid's min-width, so there is no width at which both are wrong.
export const boxHideBelow = styleVariants(tokens.layout.breakpoint, (breakpoint) => ({
  "@media": { [`not all and (min-width: ${breakpoint})`]: { display: "none !important" } },
}));
