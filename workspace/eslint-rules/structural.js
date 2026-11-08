export const STRUCTURAL = {
  zero: true,
  percentages: [100, 50, -50],
  fraction: [1],
  unitless: { properties: ["opacity", "flex", "flexGrow", "flexShrink", "scale", "animationIterationCount", "gridTemplateColumns", "gridTemplateRows"], values: [0, 1] },
  aspectRatio: [1],
  rotationDegrees: 45,
  calcFactors: { divisor: [2], multiplier: [-1] },
  keyframeSelectors: ["0%", "50%", "100%", "from", "to"],
};

export const STYLE_CATEGORIES = {
  spacing: ["padding*", "margin*", "gap", "rowGap", "columnGap", "inset*", "top", "right", "bottom", "left", "scrollMargin*", "scrollPadding*", "translate", "transform"],
  form: ["border", "borderTop", "borderRight", "borderBottom", "borderLeft", "borderBlock*", "borderInline*", "border*Radius", "border*Width", "outline*", "strokeWidth"],
  depth: ["zIndex", "boxShadow", "filter"],
  typography: ["font", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "wordSpacing", "fontFamily", "textUnderlineOffset", "textDecorationThickness"],
  opacity: ["opacity"],
  motion: ["transition*", "animation*"],
  dimension: ["width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "inlineSize", "blockSize", "minInlineSize", "maxInlineSize", "minBlockSize", "maxBlockSize", "flexBasis", "gridTemplate*", "gridAuto*", "aspectRatio", "columns", "grid", "gridArea", "gridColumn*", "gridRow*", "tabSize"],
};

const OTHER_STYLE_PROPERTIES = ["flex", "flexGrow", "flexShrink", "order", "scale", "rotate", "perspective*", "transformOrigin", "zoom", "textIndent", "textShadow", "verticalAlign", "orphans", "widows", "lineClamp", "columnCount", "columnWidth", "columnRule*", "borderSpacing", "borderImage*", "background", "backgroundImage", "backgroundPosition*", "backgroundSize", "mask", "maskImage", "maskPosition", "maskSize", "maskBorder*", "clipPath", "shapeMargin", "shapeImageThreshold", "objectPosition", "strokeDash*", "strokeMiterlimit", "strokeOpacity", "fillOpacity", "stopOpacity", "floodOpacity", "fontVariationSettings", "fontFeatureSettings", "fontSizeAdjust", "fontStretch", "containIntrinsic*", "counter*"];

const UNITS = /^(?:px|r?em|ex|r?ch|r?lh|cap|r?ic|[sdl]?v[hwib]|[sdl]?vmin|[sdl]?vmax|cq[hwib]|cqmin|cqmax|cm|mm|q|in|pt|pc|m?s|deg|grad|rad|turn|fr|dpi|dpcm|dppx|x|k?hz)$/i;

const camel = (property) => property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const pattern = (entry) => new RegExp(`^${entry.replace(/\*/g, "[A-Za-z]*")}$`);
const MATCHERS = Object.entries(STYLE_CATEGORIES).map(([category, entries]) => [category, entries.map(pattern)]);
const OTHER_MATCHERS = OTHER_STYLE_PROPERTIES.map(pattern);
const STYLE_SHAPE = /^(?:vars|selectors|@(?:media|container|supports|layer)|--.*|(?:Webkit|Moz|ms)[A-Z].*)$/;

export const categoryOf = (property) => {
  const name = camel(property);
  return MATCHERS.find(([, patterns]) => patterns.some((entry) => entry.test(name)))?.[0];
};

export const isStyleProperty = (key) => STYLE_SHAPE.test(key) || categoryOf(key) !== undefined || OTHER_MATCHERS.some((entry) => entry.test(camel(key)));

export const isUnit = (unit) => unit === "%" || UNITS.test(unit);

const unitless = (property) => STRUCTURAL.unitless.properties.includes(camel(property));

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

export const isKeyframeSelector = (selector) => STRUCTURAL.keyframeSelectors.includes(selector);
