// Resolves a CSS length — var() references, calc(), round(nearest, …), rem and px — to dp at the default
// 16px root, the way the browser would. `declarations` maps each variable to its declared value, and every
// var() must be declared there. The vitest token tests and the Playwright specs share it.
export const dp = (expression: string, declarations: ReadonlyMap<string, string>): number => {
  const substituted = expression.replace(/var\((--pui-[\w-]+)\)/g, (_match, name: string) => {
    const declared = declarations.get(name);
    if (declared === undefined) throw new Error(`missing ${name}`);
    return `(${dp(declared, declarations)})`;
  });
  const js = substituted
    .replace(/round\(nearest,/g, "Math.round(")
    .replace(/calc\(/g, "(")
    .replace(/(-?\d*\.?\d+)rem\b/g, (_match, n: string) => String(Number(n) * 16))
    .replace(/(-?\d*\.?\d+)px\b/g, "$1");
  return Number(Function(`return ${js}`)());
};
