// overrides.ts — the typed path to overriding a source variable. An app names a source value by its path
// in the authoring tree, `{ shape: { control: { height: { md: "40px" } } } }`, and sourceVars() answers
// with the variable that value is emitted under. A role is never overridden: it is an alias of a source
// variable or a formula over one, so it follows the source on its own (docs/foundations/shape.md).

import { pathToCssVar, type VarTree } from "./helpers";
import { LAYOUT_VALUES } from "./layout";
import { SHAPE_VALUES } from "./shape";
import { TYPOGRAPHY_VALUES } from "./typography";
import { SOURCE_VARIABLES } from "./variables";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

// The source trees an element can carry a different value of: the ones themeVariables() emits in every mode.
export type SourceOverrides = DeepPartial<{
  shape: VarTree<typeof SHAPE_VALUES>;
  layout: VarTree<typeof LAYOUT_VALUES>;
  typography: VarTree<typeof TYPOGRAPHY_VALUES>;
}>;

type Declaration = `--pui-${string}`;

const known = new Set<string>(SOURCE_VARIABLES);

export const sourceVars = (overrides: SourceOverrides): Record<Declaration, string> => {
  const vars: Record<Declaration, string> = {};
  const walk = (tree: object, path: readonly string[]) => {
    for (const [key, value] of Object.entries(tree)) {
      const next = [...path, key];
      if (typeof value === "object" && value !== null) walk(value, next);
      else {
        const name = pathToCssVar(next);
        if (typeof value !== "string" || !known.has(name)) throw new Error(`[paper-ui] ${next.join(".")} is not a source path; override a shape, layout or typography source value.`);
        vars[name as Declaration] = value;
      }
    }
  };
  walk(overrides, []);
  return vars;
};
