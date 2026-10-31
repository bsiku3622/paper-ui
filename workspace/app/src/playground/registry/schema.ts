// The registry's schema — how one component is described for its Playground page.
//
// A Spec holds what the page needs and nothing it can derive: the controls (with the demo's first
// view), the component's own defaults, and `subject`, the element tree that is both rendered and
// printed. The code panel is printed from that tree, so the preview and the code cannot disagree.

import type { ComponentType, ElementType, ReactElement } from "react";

import * as vocabulary from "@studio-baeks/paper-ui/tokens";

export type State = Record<string, string | boolean | undefined>;

// The /tokens exports that are vocabulary constants (a readonly list of strings).
export type VocabularyName = { [K in keyof typeof vocabulary]: (typeof vocabulary)[K] extends readonly string[] ? K : never }[keyof typeof vocabulary];

// Where a select's options come from (D54). registry.test holds each kind to its claim.
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
// `plus` names the values of the prop that the vocabulary does not hold (a prop that takes a step or "none"); they come first.
export const subset = <N extends VocabularyName, const T extends readonly (typeof vocabulary)[N][number][], const E extends string = never>(
  name: N,
  options: T,
  reason: string,
  plus: readonly E[] = [],
): OptionSet<T[number] | E> => ({
  options: [...plus, ...options],
  source: { kind: "subset", name, reason, ...(plus.length > 0 ? { plus } : {}) },
});
// A union that belongs to one component, not to the shared vocabulary. The call names the prop and
// fails typecheck while the list leaves a value of that prop's union out, so it is exhaustive.
type Missing<U extends string, T extends string> = string extends U ? never : Exclude<U, T>;
export const local =
  <P, K extends keyof P & string>() =>
  <const T extends readonly Extract<NonNullable<P[K]>, string>[]>(
    options: [Missing<Extract<NonNullable<P[K]>, string>, T[number]>] extends [never] ? T : never,
    reason: string,
  ): OptionSet<T[number]> => ({ options, source: { kind: "local", reason } });
// Some values of a prop whose type is open-ended (a track list, any tag, any input type).
export const sample = <const T extends readonly string[]>(options: T, reason: string): OptionSet<T[number]> => ({ options, source: { kind: "sample", reason } });

type ControlBase = {
  // The key in the page's state. It is the prop name unless a control binds something else.
  key: string;
  // The prop on the target element that the control sets.
  prop: string;
  label: string;
  // The element in the subject that carries the prop, named as the code prints it. The root when absent.
  target?: string;
  // Set when the prop changes behaviour that a closed, static render does not show; says why.
  behaviorOnly?: string;
  // Set when the omitted prop takes its value from another prop, so naming that value changes nothing; says why.
  derived?: string;
  // The value the component's root already holds when the prop is omitted. The select names it as the default,
  // but it is not a `defaults` entry: stating it would add a class the root has no need of.
  rootDefault?: string;
  // What omitting the prop means when no value of it says so: the prop inherits from the page. The select names the
  // omission with it, as "default (inherit)", and it is neither a stated default nor an option.
  omitted?: string;
};

export type Control = ControlBase &
  (
    | { kind: "bool"; initial: boolean }
    | { kind: "enum"; options: readonly string[]; source: Source; initial?: string; labels?: Readonly<Record<string, string>>; required?: true }
    | { kind: "text"; initial: string; bind: "children" | "attribute" }
  );

type Extra = { key?: string; label?: string; target?: string; behaviorOnly?: string; derived?: string; rootDefault?: string; omitted?: string };

const base = (prop: string, extra: Extra): ControlBase => ({
  key: extra.key ?? prop,
  prop,
  label: extra.label ?? extra.key ?? prop,
  ...(extra.target ? { target: extra.target } : {}),
  ...(extra.behaviorOnly ? { behaviorOnly: extra.behaviorOnly } : {}),
  ...(extra.derived ? { derived: extra.derived } : {}),
  ...(extra.rootDefault ? { rootDefault: extra.rootDefault } : {}),
  ...(extra.omitted ? { omitted: extra.omitted } : {}),
});

// Types the options against the prop: a value the prop does not accept fails typecheck.
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

export const textControl = <P, K extends keyof P & string>(prop: K, initial: string, extra: Extra & { bind?: "children" | "attribute" } = {}): Control => ({
  ...base(prop, extra),
  kind: "text",
  initial,
  bind: extra.bind ?? (prop === "children" ? "children" : "attribute"),
});

// Reading the state back as the types the subject needs.
export const pick = <T extends string>(state: State, key: string): T | undefined => (typeof state[key] === "string" && state[key] !== "" ? (state[key] as T) : undefined);
export const flag = (state: State, key: string): boolean => state[key] === true;
export const words = (state: State, key: string): string => (typeof state[key] === "string" ? state[key] : "");

export type StageProps<H> = { subject: ReactElement; state: State; harness: H };

type SpecOf<H> = {
  name: string;
  // Says what the component is for. No digits: a number belongs to its source, not to a sentence.
  blurb: string;
  controls: readonly Control[];
  // The component's own defaults, by prop. registry.test renders with and without each one.
  defaults: Readonly<Record<string, unknown>>;
  // Demo state that lives outside the subject (a counter, an open flag, a hook's result).
  useHarness?: () => H;
  // The exact tree that is rendered and printed.
  subject: (state: State, harness: H) => ReactElement;
  // A preview-only frame around the subject: sizing, counters, openers.
  Stage?: ComponentType<StageProps<H>>;
  preview?: "stage" | "flush";
  // Set when the stage shows the subject only after a user action; says which.
  gated?: string;
  // App components the subject uses that the printer may name. A part wrapped in named() also has
  // its source printed above the tree.
  parts?: Readonly<Record<string, ElementType>>;
};

export type Spec = Required<Pick<SpecOf<unknown>, "useHarness">> & Omit<SpecOf<unknown>, "useHarness">;

export const defineSpec = <H = undefined>(spec: SpecOf<H>): Spec => ({ useHarness: () => undefined, ...spec }) as unknown as Spec;

// What the page keeps for a control that has not been touched.
export const initialState = (spec: Spec): State => {
  const state: State = {};
  for (const control of spec.controls) {
    if (control.kind === "enum") {
      if (control.initial !== undefined) state[control.key] = control.initial;
    } else state[control.key] = control.initial;
  }
  return state;
};

// A select value equal to the component's own default is the same as no prop at all.
export const normalized = (spec: Spec, state: State): State => {
  const next: State = { ...state };
  for (const control of spec.controls) {
    const own = spec.defaults[control.prop];
    if (control.kind === "enum" && own !== undefined && next[control.key] === String(own)) next[control.key] = undefined;
  }
  return next;
};
