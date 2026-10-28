// layers.css.ts — 패키지 CSS 가 들어가는 cascade layer 의 유일한 정의.
//
// 모든 패키지 규칙은 전역 layer `pui` 안의 하위 layer 에 들어간다. 선언 순서가 곧 cascade
// 순서라 뒤의 layer 가 특정도와 무관하게 앞의 layer 를 이기고, layer 밖에 있는 앱 CSS 는
// 로드 순서와 무관하게 패키지 전체를 이긴다. 값은 없고 이름과 wrapper 만 둔다.
// keyframes · createVar · fallbackVar · createGlobalVar 는 직접 부른다 — @keyframes 와
// @property 는 layer 밖(top level)에 선다.
//
// layered 는 함수라 vanilla-extract 가 런타임 모듈로 직렬화하지 못한다. 그래서 이 파일은 .css.ts 만
// import 한다 — .ts · .tsx · 테스트가 import 하면 그 모듈 변환이 "Invalid exports" 로 실패한다.

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

// 규칙(배열이면 그 안의 객체 원소 하나하나)을 `{ "@layer": { [layer]: 규칙 } }` 로 감싼다.
// 배열 안의 문자열은 합성할 class 라 그대로 둔다.
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
