import { describe, expect, it } from "vitest";

import { CONTROL_FONT_SIZES, TEXT_VARIANTS, tokens } from "../tokens";
import { controlFontSizeClass, presetClass, textMonoClass, textNumericClass, textRoleClass } from "./typography.css";

const distinct = (classes: readonly string[]) => new Set(classes).size === classes.length && classes.every(Boolean);

// Every leaf of a class tree, with the path that reaches it.
const leaves = (tree: object, path: string[] = []): [string, string][] =>
  Object.entries(tree).flatMap(([key, node]) => (typeof node === "string" ? [[[...path, key].join("."), node] as [string, string]] : leaves(node, [...path, key])));

describe("the typography class maps", () => {
  it("name every Text role once, in the vocabulary's order, with a role class and a mono class", () => {
    expect(Object.keys(textRoleClass)).toEqual([...TEXT_VARIANTS]);
    expect(Object.keys(textMonoClass)).toEqual([...TEXT_VARIANTS]);
    expect(distinct([...Object.values(textRoleClass), ...Object.values(textMonoClass)])).toBe(true);
    expect(textNumericClass).toBeTruthy();
  });

  it("mirror tokens.typography.preset: a class at every preset leaf", () => {
    const names = (tree: object, path: string[] = []): string[] =>
      Object.entries(tree).flatMap(([key, node]) => ("size" in node ? [[...path, key].join(".")] : names(node, [...path, key])));
    expect(leaves(presetClass).map(([path]) => path)).toEqual(names(tokens.typography.preset));
    for (const [path, className] of leaves(presetClass)) expect(className, path).toBeTruthy();
  });

  it("share one class between presets that declare the same thing", () => {
    for (const weight of ["medium", "strong"] as const) expect(presetClass.button[weight].sm, weight).toBe(presetClass.button[weight].md);
    expect(presetClass.field.sm).toBe(presetClass.field.md);
    expect(presetClass.textarea.sm).toBe(presetClass.textarea.md);
  });

  it("keep presets that differ apart", () => {
    expect(presetClass.button.medium.lg).not.toBe(presetClass.button.medium.md);
    expect(presetClass.button.strong.md).not.toBe(presetClass.button.medium.md);
    expect(presetClass.field.md).not.toBe(presetClass.textarea.md);
    expect(presetClass.badge).not.toBe(presetClass.button.medium.md);
  });

  it("give every control font size a class of its own", () => {
    expect(Object.keys(controlFontSizeClass)).toEqual([...CONTROL_FONT_SIZES]);
    expect(distinct(Object.values(controlFontSizeClass))).toBe(true);
  });
});
