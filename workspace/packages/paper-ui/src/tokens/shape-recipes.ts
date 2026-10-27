// Private authored anatomy. No component-specific leaves enter the public token tree.
import { buildVarTree, pathToVarRef } from "./helpers";
import { SHAPE_VALUES, controlSizes } from "./shape";
import { SHAPE_PALETTE as p } from "./shape-palette";
import { CONTROL_SPEC } from "./text";

export const SHAPE_RECIPE_VALUES = {
  button: { spinnerSize: "0.95em" },
  textarea: { minHeight: p.size[96] },
  select: { arrowSize: p.size[10], arrowInset: p.space[12], arrowGap: "0.125rem", arrowStroke: "1.5" },
  badge: {
    height: { sm: p.size[20], md: p.size[22], lg: p.size[24] },
    paddingInline: { sm: p.space[6], md: p.space[8], lg: p.space[10] },
    dotSize: "0.5em",
  },
  checkbox: {
    radius: { sm: p.radius[2.5], md: p.radius[3], lg: p.radius[3.5] },
    smallMarkCorrection: "0.03125rem",
    markTransform: "rotate(-45deg) translate(0.5px, -1px)",
    dashWidth: "58%",
    dashRadius: "1px",
  },
  // Dot geometry is independent of the checkbox's optical mark correction.
  radio: { smallDotCorrection: "0.03125rem" },
  switch: { clearance: "0.125rem" },
  spinner: { size: { sm: p.size[16], md: p.size[18], lg: p.size[20] } },
  link: { underlineOffset: "0.2em" },
} as const;

const shape = buildVarTree(SHAPE_VALUES, ["shape"]);
const recipe = buildVarTree(SHAPE_RECIPE_VALUES, ["geometry"]);
const mark = (size: "sm" | "md" | "lg") =>
  `calc(${shape.selection.size[size]} / 2${size === "sm" ? ` - ${recipe.checkbox.smallMarkCorrection}` : ""})`;
const thumb = controlSizes((size) => `calc(${shape.selection.size[size]} - ${recipe.switch.clearance})`);
const trackHeight = controlSizes((size) => `calc(${shape.selection.size[size]} + ${recipe.switch.clearance})`);
const trackWidth = controlSizes((size) => `calc(${thumb[size]} * 2 + ${recipe.switch.clearance} * 2)`);

// Derived expressions are applied by classes on the consuming element. Emitting them
// on :root would resolve their dependencies there and break nested token overrides.
export const SHAPE_RECIPES = {
  ...recipe,
  textarea: {
    ...recipe.textarea,
    paddingBlock: controlSizes((size) => {
      const spec = CONTROL_SPEC.textarea[size];
      const leading = pathToVarRef(["text", "palette", "leading", spec.leading]);
      const fontSize = pathToVarRef(["text", "palette", "fontSize", spec.size]);
      return `calc(${shape.control.inset.input[size]} - (${leading} - ${fontSize}) / 2)`;
    }),
  },
  select: {
    ...recipe.select,
    paddingEnd: `calc(${recipe.select.arrowSize} + ${recipe.select.arrowInset} + ${recipe.select.arrowGap})`,
  },
  checkbox: {
    ...recipe.checkbox,
    mark: controlSizes(mark),
    short: controlSizes((size) => `calc(${mark(size)} / 2)`),
    markStroke: shape.stroke.emphasis,
  },
  radio: { ...recipe.radio, dot: controlSizes((size) => `calc(${shape.selection.size[size]} / 2${size === "sm" ? ` - ${recipe.radio.smallDotCorrection}` : ""})`) },
  switch: {
    ...recipe.switch,
    thumb,
    height: trackHeight,
    width: trackWidth,
    inset: controlSizes((size) => `calc((${trackHeight[size]} - ${thumb[size]}) / 2)`),
    travel: controlSizes((size) => `calc(${trackWidth[size]} - ${trackHeight[size]})`),
  },
  spinner: { ...recipe.spinner, stroke: shape.stroke.emphasis },
} as const;
