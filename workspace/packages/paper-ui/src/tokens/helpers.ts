export const rem = (dp: number): string => `${dp / 16}rem`;
export const px = (dp: number): string => `${dp}px`;
export const em = (ratio: number): string => (ratio === 0 ? "0" : `${ratio}em`);
// Media queries cannot read variables, so breakpoints are em of the default root.
export const mediaEm = (dp: number): string => `${dp / 16}em`;

export const lengths = <T extends Record<string, number>>(scale: T, unit: (dp: number) => string = rem): { [K in keyof T]: string } =>
  Object.fromEntries(Object.entries(scale).map(([key, dp]) => [key, unit(dp)])) as { [K in keyof T]: string };

export const keys = <T extends object>(obj: T): readonly (keyof T & string)[] => Object.keys(obj) as (keyof T & string)[];

export const mapValues = <T extends object, R>(obj: T, fn: (value: T[keyof T]) => R): { [K in keyof T]: R } =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value as T[keyof T])])) as { [K in keyof T]: R };

export const kebab = (s: string): string =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^-/, "");

export const pathToCssVar = (path: readonly string[]): string =>
  `--pui-${path.map(kebab).join("-")}`;

export const pathToVarRef = (path: readonly string[]): string =>
  `var(${pathToCssVar(path)})`;

type ValueTree = { readonly [k: string]: string | ValueTree };

export const walkValues = (
  values: ValueTree,
  prefix: readonly string[],
  visit: (path: readonly string[], value: string) => void,
): void => {
  for (const [key, v] of Object.entries(values)) {
    const path = [...prefix, key];
    if (typeof v === "string") visit(path, v);
    else walkValues(v, path, visit);
  }
};

export const buildVarTree = <T extends ValueTree>(
  values: T,
  prefix: readonly string[],
): VarTree<T> => {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(values)) {
    const path = [...prefix, key];
    out[key] = typeof v === "string" ? pathToVarRef(path) : buildVarTree(v as ValueTree, path);
  }
  return out as VarTree<T>;
};

export type VarTree<T> = {
  [K in keyof T]: T[K] extends string ? string : VarTree<T[K]>;
};
