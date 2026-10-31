export type StyleCategory = "spacing" | "form" | "depth" | "typography" | "opacity" | "motion" | "dimension";

export const STRUCTURAL: {
  readonly zero: true;
  readonly percentages: readonly number[];
  readonly fraction: readonly number[];
  readonly unitless: { readonly properties: readonly string[]; readonly values: readonly number[] };
  readonly aspectRatio: readonly number[];
  readonly rotationDegrees: number;
  readonly calcFactors: { readonly divisor: readonly number[]; readonly multiplier: readonly number[] };
  readonly keyframeSelectors: readonly string[];
};

export const STYLE_CATEGORIES: Readonly<Record<StyleCategory, readonly string[]>>;

export function categoryOf(property: string): StyleCategory | undefined;

export function isStructural(number: { property?: string; value: number; unit?: string; operator?: "/" | "*" }): boolean;

export function isKeyframeSelector(selector: string): boolean;
