import { describe, expect, it } from "vitest";

import { CONTROL_FONT_SIZES, CONTROL_SIZES, TEXT_VARIANTS, presetRule, tokens } from "../tokens";
import { controlFontSizeClass, presetClass, textMonoClass, textNumericClass, textRoleClass } from "./typography.css";

const distinct = (classes: readonly string[]) => new Set(classes).size === classes.length && classes.every(Boolean);

const leaves = (tree: object, path: string[] = []): [string, string][] =>
  Object.entries(tree).flatMap(([key, node]) => (typeof node === "string" ? [[[...path, key].join("."), node] as [string, string]] : leaves(node, [...path, key])));

describe("the typography class maps", () => {
  it("[foundations.class-maps.follow-vocabulary] name every Text role once, in the vocabulary's order, with a role class and a mono class", () => {
    expect(Object.keys(textRoleClass)).toEqual([...TEXT_VARIANTS]);
    expect(Object.keys(textMonoClass)).toEqual([...TEXT_VARIANTS]);
    expect(distinct([...Object.values(textRoleClass), ...Object.values(textMonoClass)])).toBe(true);
    expect(textNumericClass).toBeTruthy();
  });

  it("[foundations.class-maps.follow-vocabulary] mirror tokens.typography.preset: a class at every preset leaf", () => {
    const names = (tree: object, path: string[] = []): string[] =>
      Object.entries(tree).flatMap(([key, node]) => ("size" in node ? [[...path, key].join(".")] : names(node, [...path, key])));
    expect(leaves(presetClass).map(([path]) => path)).toEqual(names(tokens.typography.preset));
    for (const [path, className] of leaves(presetClass)) expect(className, path).toBeTruthy();
  });

  it("[foundations.typography.control-preset] share one class exactly when two presets declare the same thing", () => {
    const sized = (["button", "field", "textarea"] as const).flatMap((preset) => CONTROL_SIZES.map((size) => ({ name: `${preset}.${size}`, rule: presetRule(preset, size), className: presetClass[preset][size] })));
    const all = [...sized, { name: "badge", rule: presetRule("badge"), className: presetClass.badge }];
    let shared = 0;
    for (const [i, a] of all.entries()) {
      for (const b of all.slice(i + 1)) {
        const same = JSON.stringify(a.rule) === JSON.stringify(b.rule);
        if (same) shared += 1;
        expect(a.className === b.className, `${a.name} · ${b.name}`).toBe(same);
      }
    }
    expect(shared).toBeGreaterThan(0);
  });

  it("[foundations.typography.control-preset] keep presets that differ apart", () => {
    expect(presetClass.button.xl).not.toBe(presetClass.button.md);
    expect(presetClass.field.md).not.toBe(presetClass.textarea.md);
    expect(presetClass.badge).not.toBe(presetClass.button.md);
  });

  it("[foundations.typography.font-size-escape] give every control font size a class of its own", () => {
    expect(Object.keys(controlFontSizeClass)).toEqual([...CONTROL_FONT_SIZES]);
    expect(distinct(Object.values(controlFontSizeClass))).toBe(true);
  });
});
