import { themeVariables } from "./variables";

// Resolves a CSS length — var() references, calc(), min(), round(nearest, …), rem and px — to dp at the default
// 16px root, the way the browser would. `declarations` maps each variable to its declared value, and every
// var() must be declared there. The token tests and the docs generators share it; it is not part of the public API.
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

// Every variable the stylesheet emits at the light mode: the sources, the invariants and the mode's own and ground roles.
export const emittedDeclarations = (): ReadonlyMap<string, string> => {
  const { source, invariant, modes } = themeVariables();
  return new Map([...Object.entries(source), ...Object.entries(invariant), ...Object.entries(modes.light.own), ...Object.entries(modes.light.ground)]);
};

// A role (the expression a token holds) in dp, resolved over what the stylesheet emits.
export const resolveRole = (role: string): number => resolveDp(role, emittedDeclarations());
