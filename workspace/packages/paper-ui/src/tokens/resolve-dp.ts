import { CONTROL_LINE_PROPERTY } from "./shape-recipes";
import { themeVariables } from "./variables";

export const resolveDp = (expression: string, declarations: ReadonlyMap<string, string>): number => {
  const substituted = expression.replace(/var\((--pui-[\w-]+)\)/g, (_match, name: string) => {
    const declared = declarations.get(name);
    if (declared === undefined) throw new Error(`missing ${name}`);
    return `(${resolveDp(declared, declarations)})`;
  });
  const js = substituted
    .replace(/round\(nearest,/g, "Math.round(")
    .replace(/calc\(/g, "(")
    .replace(/(?<![\w.])min\(/g, "Math.min(")
    .replace(/(-?\d*\.?\d+)rem\b/g, (_match, n: string) => String(Number(n) * 16))
    .replace(/(-?\d*\.?\d+)px\b/g, "$1");
  return Number(Function(`return ${js}`)());
};

export const emittedDeclarations = (): ReadonlyMap<string, string> => {
  const { source, invariant, modes } = themeVariables();
  return new Map([...Object.entries(source), ...Object.entries(invariant), ...Object.entries(modes.light.own), ...Object.entries(modes.light.ground), [CONTROL_LINE_PROPERTY, "0px"]]);
};

export const resolveRole = (role: string): number => resolveDp(role, emittedDeclarations());
