// structural.js — what a number may be when it is not a source value, and which style properties carry the
// numbers paper/source-numbers watches. The lint rule, the recipe tests and the docs sentence all quote this
// file, so the list is written once.

// Values that are structure, not measurement: allowed in any style position.
export const STRUCTURAL = {
  // 0 in any unit.
  zero: true,
  // A whole or half extent, from either edge.
  percentages: [100, 50, -50],
  // One flexible track.
  fraction: [1],
  // Unitless 0 or 1 where a property reads a ratio or a count, not a length.
  unitless: { properties: ["opacity", "flex", "flexGrow", "flexShrink", "scale", "animationIterationCount"], values: [0, 1] },
  aspectRatio: [1],
  // A rotation is a multiple of this many degrees.
  rotationDegrees: 45,
  // The factors a calc() may carry: halving, and negating.
  calcFactors: { divisor: [2], multiplier: [-1] },
  // The selectors of a keyframes block.
  keyframeSelectors: ["0%", "50%", "100%", "from", "to"],
};

// The style properties paper/source-numbers watches, by what they measure. A name ending in * covers every
// property that starts with it; the border shorthands and the dimension forms are listed in full.
export const STYLE_CATEGORIES = {
  spacing: ["padding*", "margin*", "gap", "rowGap", "columnGap", "inset*", "top", "right", "bottom", "left", "scrollMargin*", "scrollPadding*", "translate", "transform"],
  form: ["border", "borderTop", "borderRight", "borderBottom", "borderLeft", "borderBlock*", "borderInline*", "border*Radius", "border*Width", "outline*", "strokeWidth"],
  depth: ["zIndex", "boxShadow", "filter"],
  typography: ["font", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "wordSpacing", "fontFamily", "textUnderlineOffset", "textDecorationThickness"],
  opacity: ["opacity"],
  motion: ["transition*", "animation*"],
  dimension: ["width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "inlineSize", "blockSize", "minInlineSize", "maxInlineSize", "minBlockSize", "maxBlockSize", "flexBasis", "gridTemplate*", "gridAuto*", "aspectRatio", "columns"],
};

const camel = (property) => property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const pattern = (entry) => new RegExp(`^${entry.replace(/\*/g, "[A-Za-z]*")}$`);
const MATCHERS = Object.entries(STYLE_CATEGORIES).map(([category, entries]) => [category, entries.map(pattern)]);

// The category of a style property, or undefined for a property the rule does not read.
export const categoryOf = (property) => {
  const name = camel(property);
  return MATCHERS.find(([, patterns]) => patterns.some((entry) => entry.test(name)))?.[0];
};

const unitless = (property) => STRUCTURAL.unitless.properties.includes(camel(property));

// Is one number, with its unit and the operator in front of it, structural for this property? `operator` is
// the "/" or "*" that sits between it and the previous term inside a calc(), if any.
export const isStructural = ({ property, value, unit = "", operator }) => {
  if (value === 0) return true;
  if (operator === "/" && unit === "" && STRUCTURAL.calcFactors.divisor.includes(value)) return true;
  if (operator === "*" && unit === "" && STRUCTURAL.calcFactors.multiplier.includes(value)) return true;
  if (unit === "%") return STRUCTURAL.percentages.includes(value);
  if (unit === "fr") return STRUCTURAL.fraction.includes(value);
  if (unit === "deg") return Math.abs(value) % STRUCTURAL.rotationDegrees === 0;
  if (unit === "") {
    if (camel(property ?? "") === "aspectRatio") return STRUCTURAL.aspectRatio.includes(value);
    return property !== undefined && unitless(property) && STRUCTURAL.unitless.values.includes(value);
  }
  return false;
};

// Is a keyframes selector structural?
export const isKeyframeSelector = (selector) => STRUCTURAL.keyframeSelectors.includes(selector);
