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

export const controlLineWidth = { borderWidth: CONTROL_LINE } as const;

export const lineFrame = ({ side, style = "solid", weight = "border", control = false }: LineOptions = {}): LineDeclarations => {
  const property = PROPERTIES[side ?? "all"];
  return { [property.width]: control ? CONTROL_LINE : SHAPE.stroke[weight], [property.style]: style } as LineDeclarations;
};

export const lineRule = ({ level = "base", ...options }: LineOptions & { level?: BorderLevel } = {}): LineDeclarations => ({
  ...lineFrame(options),
  [PROPERTIES[options.side ?? "all"].color]: COLOR.border[level],
} as LineDeclarations);
