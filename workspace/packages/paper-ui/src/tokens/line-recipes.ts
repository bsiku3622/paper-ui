// Line — the second-order Foundation of a drawn line: its thickness from Shape, its colour from Color, its side and dash here.
// A shadow is assembled in one place (elevation-recipes.ts), and so is a line: no stylesheet writes a border's width and style
// by hand, which paper/source-numbers keeps true.
//
// A line adds no colour of its own. The ground has one grey line, and a level names what Color already has.

import { COLOR, type BorderLevel } from "./colors";
import { SHAPE } from "./shape";
import { CONTROL_LINE } from "./shape-recipes";

export const LINE_SIDES = ["top", "bottom", "start", "end"] as const;
export type LineSide = (typeof LINE_SIDES)[number];
export const LINE_STYLES = ["solid", "dashed"] as const;
export type LineStyle = (typeof LINE_STYLES)[number];
export const LINE_WEIGHTS = ["border", "emphasis"] as const;
export type LineWeight = (typeof LINE_WEIGHTS)[number];

const PROPERTIES = {
  all: { width: "borderWidth", style: "borderStyle", color: "borderColor" },
  top: { width: "borderBlockStartWidth", style: "borderBlockStartStyle", color: "borderBlockStartColor" },
  bottom: { width: "borderBlockEndWidth", style: "borderBlockEndStyle", color: "borderBlockEndColor" },
  start: { width: "borderInlineStartWidth", style: "borderInlineStartStyle", color: "borderInlineStartColor" },
  end: { width: "borderInlineEndWidth", style: "borderInlineEndStyle", color: "borderInlineEndColor" },
} as const satisfies Record<LineSide | "all", { width: string; style: string; color: string }>;

type Side = (typeof PROPERTIES)[LineSide | "all"];
export type LineDeclarations = { [Property in Side["width"] | Side["color"]]?: string } & { [Property in Side["style"]]?: LineStyle };
export type LineOptions = { side?: LineSide; style?: LineStyle; weight?: LineWeight; control?: boolean };

// Only the width of a control's line, for a control whose paint already gave its line a dash: as thick as the room it keeps.
export const controlLineWidth = { borderWidth: CONTROL_LINE } as const;

// The thickness and the dash, for a place whose colour the paint tier gives. Without a side it goes all the way round. A control's
// line is as thick as the room its paint gives it.
export const lineFrame = ({ side, style = "solid", weight = "border", control = false }: LineOptions = {}): LineDeclarations => {
  const property = PROPERTIES[side ?? "all"];
  return { [property.width]: control ? CONTROL_LINE : SHAPE.stroke[weight], [property.style]: style } as LineDeclarations;
};

// The whole line, in a level of the one grey.
export const lineRule = ({ level = "base", ...options }: LineOptions & { level?: BorderLevel } = {}): LineDeclarations => ({
  ...lineFrame(options),
  [PROPERTIES[options.side ?? "all"].color]: COLOR.border[level],
} as LineDeclarations);
