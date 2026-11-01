// source-check.ts — a development check of the plain CSS form of a source override.
//
// `.dense { --pui-shape-control-height-md: 40px }` passes through neither the types nor sourceVars(), and a name the
// stylesheet does not emit does nothing, silently. So the declarations of the document's stylesheets are read once and
// the names that mean nothing are told. A sheet the browser will not let a script read (another origin) is skipped;
// an inline style is not a stylesheet, and a sheet that arrives later is not there yet (docs/foundations/shape.md).

import { paperError } from "../internal/errors";
import { unknownSourceVariables } from "../tokens";

type AnyRule = CSSRule & { style?: CSSStyleDeclaration; cssRules?: CSSRuleList; styleSheet?: CSSStyleSheet | null };

const readRules = (rules: CSSRuleList, names: Set<string>): void => {
  for (const rule of Array.from(rules) as AnyRule[]) {
    if (rule.style) for (const name of Array.from(rule.style)) names.add(name);
    if (rule.cssRules) readRules(rule.cssRules, names);
    if (rule.styleSheet) readSheet(rule.styleSheet, names);
  }
};

const readSheet = (sheet: CSSStyleSheet, names: Set<string>): void => {
  let rules: CSSRuleList;
  try {
    rules = sheet.cssRules;
  } catch {
    return;
  }
  readRules(rules, names);
};

export const warnUnknownSourceVariables = (doc: Document): void => {
  const names = new Set<string>();
  for (const sheet of [...Array.from(doc.styleSheets), ...(doc.adoptedStyleSheets ?? [])]) readSheet(sheet, names);
  const unknown = unknownSourceVariables(names);
  if (unknown.length === 0) return;
  console.warn(paperError(`A stylesheet declares ${unknown.join(", ")}, which the package does not emit, so it does nothing. Check the spelling, or name the source with sourceVars(): a role has no variable to override.`).message);
};
