// The registry's schema — how one component is described for its Playground page.
//
// A Spec holds what the page needs and nothing it can derive: the controls (with the demo's first
// view), the component's own defaults, and `subject`, the element tree that is both rendered and
// printed. The code panel is printed from that tree, so the preview and the code cannot disagree.

import type { ComponentType, ElementType, ReactElement } from "react";

import * as vocabulary from "@studio-baeks/paper-ui/tokens";

import { pick as inLocale, type Bilingual, type SiteLocale } from "../../site/locale";

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
  // What a switch puts in a slot ("badge" with the example "count"): the panel names it "badge(count)".
  example?: Bilingual<string>;
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
  // omission with it, as "inherit (default)", and it is neither a stated default nor an option.
  omitted?: string;
  // The type the Props table names, when the control stands in for a prop of another type: a switch that puts an example node
  // in a ReactNode slot. registry.test holds a switch whose label is not its prop to naming it.
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

// The words a text control starts with: one string for both languages, or a pair.
export const textControl = <P, K extends keyof P & string>(prop: K, initial: string | Bilingual<string>, extra: Extra & { bind?: "children" | "attribute" } = {}): Control => ({
  ...base(prop, extra),
  kind: "text",
  initial: typeof initial === "string" ? { ko: initial, en: initial } : initial,
  bind: extra.bind ?? (prop === "children" ? "children" : "attribute"),
});

// Reading the state back as the types the subject needs.
export const pick = <T extends string>(state: State, key: string): T | undefined => (typeof state[key] === "string" && state[key] !== "" ? (state[key] as T) : undefined);
export const flag = (state: State, key: string): boolean => state[key] === true;
// A boolean prop with three answers: omitted is neither of the two values.
export const answer = (state: State, key: string): boolean | undefined => (pick(state, key) === undefined ? undefined : pick(state, key) === "true");
// The select for one: it offers both values, and its first entry is the omission. Omitted, the component decides.
export const answerControl = (prop: string, reason: string, extra: Pick<Extra, "derived"> = {}): Control => enumControl<Record<string, "true" | "false">, string>(prop, sample(["true", "false"] as const, reason), extra);

// A face a control may be given. Only a variant with no face of its own takes a fill, and only a face casts a shadow: the
// knob always sets the prop so the code panel reads back what it printed, and on the others that code is a type error and
// nothing shows, which the controls' notes say.
export const faceProps = (state: State) => ({ fill: pick(state, "fill"), shadow: flag(state, "shadow") }) as { fill?: undefined; shadow?: false };
// What the panel calls a control: its prop, and for a switch that holds an example, the example in the visitor's language.
export const labelOf = (control: Control, locale: SiteLocale): string => (control.example ? `${control.label}(${inLocale(control.example, locale)})` : control.label);
export const words = (state: State, key: string): string => (typeof state[key] === "string" ? state[key] : "");

export type StageProps<H> = { subject: ReactElement; state: State; harness: H };

// The sheet under an Atom's code: every value of one axis against every value of another (`matrix`), and rows that move one more
// axis at a time from the first view (`strips`). Each names a control by its key, a select or a switch. `with` is the state a strip
// needs to show anything: a fill shows only on a variant with no face of its own.
export type SheetAxis = { key: string; with?: State };
export type Sheet = { matrix?: { rows: string; columns: string }; strips?: readonly SheetAxis[] };

type SpecOf<H> = {
  name: string;
  // Says what the component is for, in both languages. No digits: a number belongs to its source, not to a sentence.
  blurb: Bilingual<string>;
  controls: readonly Control[];
  // The component's own defaults, by prop. registry.test renders with and without each one.
  defaults: Readonly<Record<string, unknown>>;
  // Demo state that lives outside the subject (a counter, an open flag, a hook's result).
  useHarness?: () => H;
  // The exact tree that is rendered and printed.
  // The words an example shows come from `locale`; the printed code and the preview are drawn from the same words.
  subject: (state: State, harness: H, locale: SiteLocale) => ReactElement;
  // A preview-only frame around the subject: sizing, counters, openers.
  Stage?: ComponentType<StageProps<H>>;
  preview?: "stage" | "flush";
  // Set when the stage shows the subject only after a user action; says which.
  gated?: string;
  // App components the subject uses that the printer may name. A part wrapped in named() also has
  // its source printed above the tree.
  parts?: Readonly<Record<string, ElementType>>;
  sheet?: Sheet;
};

export type Spec = Required<Pick<SpecOf<unknown>, "useHarness">> & Omit<SpecOf<unknown>, "useHarness">;

export const defineSpec = <H = undefined>(spec: SpecOf<H>): Spec => ({ useHarness: () => undefined, ...spec }) as unknown as Spec;

// What the page keeps for a control that has not been touched.
export const initialState = (spec: Spec, locale: SiteLocale = "ko"): State => {
  const state: State = {};
  for (const control of spec.controls) {
    if (control.kind === "enum") {
      if (control.initial !== undefined) state[control.key] = control.initial;
    } else state[control.key] = control.kind === "text" ? inLocale(control.initial, locale) : control.initial;
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
