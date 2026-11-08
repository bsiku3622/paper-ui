// layered is a function vanilla-extract cannot serialize into a runtime module, so only .css.ts files import this one;
// a .ts, .tsx or test that imports it fails with "Invalid exports".
import {
  globalLayer,
  globalStyle as globalRule,
  style as styleRule,
  styleVariants as styleVariantRules,
  type ComplexStyleRule,
  type GlobalStyleRule,
  type StyleRule,
} from "@vanilla-extract/css";

const pui = globalLayer("pui");

export const layer = {
  reset: globalLayer({ parent: pui }, "reset"),
  theme: globalLayer({ parent: pui }, "theme"),
  base: globalLayer({ parent: pui }, "base"),
  utilities: globalLayer({ parent: pui }, "utilities"),
  components: globalLayer({ parent: pui }, "components"),
} as const;

type LayerName = keyof typeof layer;

type LayeredRule = Omit<StyleRule, "@layer">;
type LayeredGlobalRule = Omit<GlobalStyleRule, "@layer">;
type ClassList = string | ClassList[];
type LayeredComplexRule = LayeredRule | Array<LayeredRule | ClassList>;

interface LayeredStyles {
  style(rule: LayeredComplexRule, debugId?: string): string;
  styleVariants<Map extends Record<string | number, LayeredComplexRule>>(map: Map, debugId?: string): Record<keyof Map, string>;
  styleVariants<Data extends Record<string | number, unknown>, Key extends keyof Data>(
    data: Data,
    mapData: (value: Data[Key], key: Key) => LayeredComplexRule,
    debugId?: string,
  ): Record<keyof Data, string>;
  globalStyle(selector: string, rule: LayeredGlobalRule): void;
}

export const layered = (name: LayerName): LayeredStyles => {
  const into = layer[name];
  const wrap = (rule: LayeredComplexRule): ComplexStyleRule =>
    Array.isArray(rule)
      ? rule.map((part) => (typeof part === "object" && !Array.isArray(part) ? { "@layer": { [into]: part } } : part))
      : { "@layer": { [into]: rule } };
  return {
    style: (rule, debugId) => styleRule(wrap(rule), debugId),
    styleVariants: (data: Record<string | number, unknown>, mapData?: unknown, debugId?: string) =>
      typeof mapData === "function"
        ? styleVariantRules(data, (value, key) => wrap((mapData as (v: unknown, k: string | number) => LayeredComplexRule)(value, key)), debugId)
        : styleVariantRules(
            Object.fromEntries(Object.entries(data).map(([key, rule]) => [key, wrap(rule as LayeredComplexRule)])),
            mapData as string | undefined,
          ),
    globalStyle: (selector, rule) => globalRule(selector, { "@layer": { [into]: rule } }),
  } as LayeredStyles;
};
