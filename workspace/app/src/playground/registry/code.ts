// The code panel and its editor: the code is printed from the rendered subject, and an edit is read
// back through the same grammar (jsx.ts), so every control survives a round trip.

import { ParseError, componentNames, parseChildrenText, parseOpeningTag, printJsx, sourceOf } from "./jsx";
import { pick as inLocale, type SiteLocale } from "../../site/locale";
import { normalized, type Control, type Spec, type State } from "./schema";
import * as demoStyles from "./entries/examples.css";

// The examples stylesheet styles the demo, not the component: its classes are left out of the code.
const DEMO_CLASSES: ReadonlySet<string> = new Set(
  Object.values(demoStyles).flatMap((value) => (typeof value === "string" ? value.split(" ") : [])),
);

export const codeOf = (spec: Spec, state: State, harness: unknown, locale: SiteLocale = "ko"): string => {
  const tree = printJsx(spec.subject(state, harness, locale), {
    defaults: spec.defaults,
    scope: [spec.name, ...spec.controls.flatMap((control) => (control.target ? [control.target] : []))],
    names: componentNames(spec.parts),
    ignoreClasses: DEMO_CLASSES,
  });
  // A part with a named source is written above the tree, so the code shows what the part does.
  const declarations = Object.values(spec.parts ?? {}).flatMap((part) => sourceOf(part) ?? []);
  return [...declarations, tree].join("\n\n");
};

const read = (spec: Spec, control: Control, code: string): string | boolean | undefined => {
  const name = control.target ?? spec.name;
  const tag = parseOpeningTag(code, name);
  if (!tag) throw new ParseError({ ko: `${name} JSX를 읽을 수 없습니다.`, en: `${name} JSX cannot be read.` });
  const value = tag.attrs[control.prop];
  if (control.kind === "bool") {
    if (value === undefined) return spec.defaults[control.prop] === true;
    // A prop that takes an element or an expression is on when it is there.
    return typeof value === "boolean" ? value : true;
  } else if (control.kind === "enum") {
    if (value === undefined) {
      if (control.required) throw new ParseError({ ko: `${name}의 ${control.prop}은 필수입니다.`, en: `${control.prop} of ${name} is required.` });
      return undefined;
    }
    const option = typeof value === "number" || typeof value === "boolean" ? String(value) : value;
    if (typeof option === "string") {
      if (!control.options.includes(option)) throw new ParseError({ ko: `${control.prop}: "${option}"은 ${control.options.join(", ")} 중 하나여야 합니다.`, en: `${control.prop}: "${option}" must be one of ${control.options.join(", ")}.` });
      return option;
    }
  } else if (control.bind === "children") {
    const text = parseChildrenText(code, name);
    if (text === undefined) throw new ParseError({ ko: `${name}의 children을 글자로 읽을 수 없습니다.`, en: `The children of ${name} cannot be read as text.` });
    return text;
  } else {
    if (value === undefined) return "";
    if (typeof value === "string") return value;
  }
  throw new ParseError({ ko: `${name}의 ${control.prop} 값을 읽을 수 없습니다.`, en: `The value of ${control.prop} on ${name} cannot be read.` });
};

export const stateFromCode = (spec: Spec, code: string, previous: State, locale: SiteLocale = "ko"): { state: State } | { error: string } => {
  const next: State = { ...previous };
  try {
    for (const control of spec.controls) next[control.key] = read(spec, control, code);
  } catch (error) {
    if (error instanceof ParseError) return { error: inLocale(error.words, locale) };
    throw error;
  }
  return { state: normalized(spec, next) };
};
