// Token tree walker — VALUES 트리를 한 번 걷고 두 곳이 그 결과를 나눠 쓴다.
//   (1) styles/theme.css.ts — CSS var 이름 + 값 record 생성 (빌드 타임 emit)
//   (2) tokens/index.ts     — var() 문자열 leaf 의 reference tree 생성 (런타임 참조)
//
// 두 자리가 같은 트리 · 같은 변환 규칙을 쓰므로 이름이 어긋날 수 없다.

// camelCase → kebab-case
export const kebab = (s: string): string =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^-/, "");

// path 배열 → CSS var 이름
export const pathToCssVar = (path: readonly string[]): string =>
  `--paper-${path.map(kebab).join("-")}`;

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
// leaf 의 값만 "var(--paper-...)" 로 바뀐다.
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
