import type { ComponentType, ElementType, ReactElement } from "react";

import * as vocabulary from "@studio-baeks/paper-ui/tokens";

import { pick as inLocale, type Bilingual, type SiteLocale } from "../../site/locale";

export type State = Record<string, string | boolean | undefined>;

export type VocabularyName = { [K in keyof typeof vocabulary]: (typeof vocabulary)[K] extends readonly string[] ? K : never }[keyof typeof vocabulary];

export type Source =
  | { kind: "vocabulary"; name: VocabularyName }
  | { kind: "subset"; name: VocabularyName; reason: string; plus?: readonly string[] }
  | { kind: "local"; reason: string }
  | { kind: "sample"; reason: string };

export type OptionSet<T extends string = string> = { options: readonly T[]; source: Source };

export const vocab = <N extends VocabularyName>(name: N): OptionSet<(typeof vocabulary)[N][number]> => ({
  options: vocabulary[name],
  source: { kind: "vocabulary", name },
});
export const subset = <N extends VocabularyName, const T extends readonly (typeof vocabulary)[N][number][], const E extends string = never>(
  name: N,
  options: T,
  reason: string,
  plus: readonly E[] = [],
): OptionSet<T[number] | E> => ({
  options: [...plus, ...options],
  source: { kind: "subset", name, reason, ...(plus.length > 0 ? { plus } : {}) },
});
type Missing<U extends string, T extends string> = string extends U ? never : Exclude<U, T>;
export const local =
  <P, K extends keyof P & string>() =>
  <const T extends readonly Extract<NonNullable<P[K]>, string>[]>(
    options: [Missing<Extract<NonNullable<P[K]>, string>, T[number]>] extends [never] ? T : never,
    reason: string,
  ): OptionSet<T[number]> => ({ options, source: { kind: "local", reason } });
export const sample = <const T extends readonly string[]>(options: T, reason: string): OptionSet<T[number]> => ({ options, source: { kind: "sample", reason } });

type ControlBase = {
  key: string;
  prop: string;
  label: string;
  example?: Bilingual<string>;
  target?: string;
  behaviorOnly?: string;
  derived?: string;
  rootDefault?: string;
  omitted?: string;
  type?: string;
};

export type Control = ControlBase &
  (
    | { kind: "bool"; initial: boolean }
    | { kind: "enum"; options: readonly string[]; source: Source; initial?: string; labels?: Readonly<Record<string, string>>; required?: true }
    | { kind: "text"; initial: Bilingual<string>; bind: "children" | "attribute" }
  );

type Extra = { key?: string; label?: string; example?: Bilingual<string>; target?: string; behaviorOnly?: string; derived?: string; rootDefault?: string; omitted?: string; type?: string };

const base = (prop: string, extra: Extra): ControlBase => ({
  key: extra.key ?? prop,
  prop,
  label: extra.label ?? extra.key ?? prop,
  ...(extra.example ? { example: extra.example } : {}),
  ...(extra.target ? { target: extra.target } : {}),
  ...(extra.behaviorOnly ? { behaviorOnly: extra.behaviorOnly } : {}),
  ...(extra.derived ? { derived: extra.derived } : {}),
  ...(extra.rootDefault ? { rootDefault: extra.rootDefault } : {}),
  ...(extra.omitted ? { omitted: extra.omitted } : {}),
  ...(extra.type ? { type: extra.type } : {}),
});

export const enumControl = <P, K extends keyof P & string>(
  prop: K,
  set: OptionSet<Extract<NonNullable<P[K]>, string>>,
  extra: Extra & { initial?: Extract<NonNullable<P[K]>, string>; rootDefault?: Extract<NonNullable<P[K]>, string>; labels?: Partial<Record<Extract<NonNullable<P[K]>, string>, string>>; required?: true } = {},
): Control => ({
  ...base(prop, extra),
  kind: "enum",
  options: set.options,
  source: set.source,
  ...(extra.initial === undefined ? {} : { initial: extra.initial }),
  ...(extra.labels ? { labels: extra.labels as Record<string, string> } : {}),
  ...(extra.required ? { required: true as const } : {}),
});

export const boolControl = <P, K extends keyof P & string>(prop: K, initial = false, extra: Extra = {}): Control => ({
  ...base(prop, extra),
  kind: "bool",
  initial,
});

export const textControl = <P, K extends keyof P & string>(prop: K, initial: string | Bilingual<string>, extra: Extra & { bind?: "children" | "attribute" } = {}): Control => ({
  ...base(prop, extra),
  kind: "text",
  initial: typeof initial === "string" ? { ko: initial, en: initial } : initial,
  bind: extra.bind ?? (prop === "children" ? "children" : "attribute"),
});

export const pick = <T extends string>(state: State, key: string): T | undefined => (typeof state[key] === "string" && state[key] !== "" ? (state[key] as T) : undefined);
export const flag = (state: State, key: string): boolean => state[key] === true;
export const answer = (state: State, key: string): boolean | undefined => (pick(state, key) === undefined ? undefined : pick(state, key) === "true");
export const answerControl = (prop: string, reason: string, extra: Pick<Extra, "derived"> = {}): Control => enumControl<Record<string, "true" | "false">, string>(prop, sample(["true", "false"] as const, reason), extra);

export const faceProps = (state: State) => ({ fill: pick(state, "fill"), shadow: flag(state, "shadow") }) as { fill?: undefined; shadow?: false };
export const labelOf = (control: Control, locale: SiteLocale): string => (control.example ? `${control.label}(${inLocale(control.example, locale)})` : control.label);
export const words = (state: State, key: string): string => (typeof state[key] === "string" ? state[key] : "");

export type StageProps<H> = { subject: ReactElement; state: State; harness: H };

export type SheetAxis = { key: string; with?: State };
export type Sheet = { matrix?: { rows: string; columns: string }; strips?: readonly SheetAxis[] };

type SpecOf<H> = {
  name: string;
  blurb: Bilingual<string>;
  controls: readonly Control[];
  defaults: Readonly<Record<string, unknown>>;
  useHarness?: () => H;
  subject: (state: State, harness: H, locale: SiteLocale) => ReactElement;
  Stage?: ComponentType<StageProps<H>>;
  preview?: "stage" | "flush";
  gated?: string;
  parts?: Readonly<Record<string, ElementType>>;
  sheet?: Sheet;
};

export type Spec = Required<Pick<SpecOf<unknown>, "useHarness">> & Omit<SpecOf<unknown>, "useHarness">;

export const defineSpec = <H = undefined>(spec: SpecOf<H>): Spec => ({ useHarness: () => undefined, ...spec }) as unknown as Spec;

export const initialState = (spec: Spec, locale: SiteLocale = "ko"): State => {
  const state: State = {};
  for (const control of spec.controls) {
    if (control.kind === "enum") {
      if (control.initial !== undefined) state[control.key] = control.initial;
    } else state[control.key] = control.kind === "text" ? inLocale(control.initial, locale) : control.initial;
  }
  return state;
};

export const normalized = (spec: Spec, state: State): State => {
  const next: State = { ...state };
  for (const control of spec.controls) {
    const own = spec.defaults[control.prop];
    if (control.kind === "enum" && own !== undefined && next[control.key] === String(own)) next[control.key] = undefined;
  }
  return next;
};
