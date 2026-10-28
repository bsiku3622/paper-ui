// Token tree walker — VALUES 트리를 한 번 걷고 두 곳이 그 결과를 나눠 쓴다.
//   (1) styles/theme.css.ts — CSS var 이름 + 값 record 생성 (빌드 타임 emit)
//   (2) tokens/index.ts     — var() 문자열 leaf 의 reference tree 생성 (런타임 참조)
//
// 두 자리가 같은 트리 · 같은 변환 규칙을 쓰므로 이름이 어긋날 수 없다.

// Length units — Shape·Layout·Typography author dp numbers (1dp = 1px at the default 16px root) and
// turn them into CSS only here. Lengths scale with the root font (rem); edges stay in CSS px.
export const rem = (dp: number): string => `${dp / 16}rem`;
export const px = (dp: number): string => `${dp}px`;
// A ratio of the element's own font size. Zero stays a bare 0.
export const em = (ratio: number): string => (ratio === 0 ? "0" : `${ratio}em`);
// Media queries cannot read variables, so breakpoints are em of the default root.
export const mediaEm = (dp: number): string => `${dp / 16}em`;

// Converts every number of a flat scale with one unit.
export const lengths = <T extends Record<string, number>>(scale: T, unit: (dp: number) => string = rem): { [K in keyof T]: string } =>
  Object.fromEntries(Object.entries(scale).map(([key, dp]) => [key, unit(dp)])) as { [K in keyof T]: string };

// Object.keys with the key type kept.
export const keys = <T extends object>(obj: T): (keyof T & string)[] => Object.keys(obj) as (keyof T & string)[];

// The same keys, each value mapped.
export const mapValues = <T extends object, R>(obj: T, fn: (value: T[keyof T]) => R): { [K in keyof T]: R } =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value as T[keyof T])])) as { [K in keyof T]: R };

// camelCase → kebab-case
export const kebab = (s: string): string =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^-/, "");

// path 배열 → CSS var 이름
export const pathToCssVar = (path: readonly string[]): string =>
  `--pui-${path.map(kebab).join("-")}`;

// path 배열 → var() 참조 문자열
export const pathToVarRef = (path: readonly string[]): string =>
  `var(${pathToCssVar(path)})`;

type ValueTree = { readonly [k: string]: string | ValueTree };

// Values 트리를 walk. 각 string leaf 에서 visit(path, value) 호출.
//
//   walkValues({ height: { row: "2.75rem" } }, ["shape"], visit)
//   → visit(["shape", "height", "row"], "2.75rem")
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

// Values 트리와 *같은 모양* 의 var() 참조 트리를 만든다.
// leaf 의 값만 "var(--pui-...)" 로 바뀐다.
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

// 트리 모양은 보존하고 leaf 타입만 string 으로 — tokens.color.ink 같은 경로가 타입으로 산다.
export type VarTree<T> = {
  [K in keyof T]: T[K] extends string ? string : VarTree<T[K]>;
};
