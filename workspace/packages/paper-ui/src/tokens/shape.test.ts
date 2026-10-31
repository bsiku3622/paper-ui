import { describe, expect, it } from "vitest";

import { dp as resolveDp } from "../../../../tests/support/dp";
import { controlGeometry } from "../internal/shape";
import { SOURCE_VARIABLES, strokeRing, tokens } from "./index";
import { walkValues } from "./helpers";
import { COLOR_MODES } from "./color-modes";
import { DEPTHS } from "./colors";
import { LAYOUT_MODE_VALUES, LAYOUT_SOURCE, castShadow } from "./layout";
import { SHAPE_SOURCE, SHAPE_VALUES } from "./shape";
import { SHAPE_RECIPES, targetReach } from "./shape-recipes";
import { CONTROL_SIZES, type ControlSize } from "./typography";
import { themeVariables } from "./variables";

// Everything the stylesheet emits as a source variable: the same in every mode.
const { source, invariant, modes } = themeVariables();
const declarations = new Map(Object.entries(source));

// Roles read colours and shadow geometry as well; the light mode stands for the names every mode has.
const resolvable = new Map([...declarations, ...Object.entries(invariant), ...Object.entries(modes.light.own), ...Object.entries(modes.light.ground)]);

// Resolves a role or recipe to dp at the default 16px root, the way the browser would.
const dp = (expression: string) => resolveDp(expression, resolvable);
const bySize = (role: Record<string, string>) => CONTROL_SIZES.map((size) => dp(role[size]!));

describe("Shape is source → role → recipe", () => {
  it("emits only source values; every role and recipe resolves to them without a cycle", () => {
    for (const name of declarations.keys()) expect(name, name).toMatch(/^--pui-(shape|layout|typography)-/);
    const resolve = (value: string, ancestors: string[] = []) => {
      for (const [, name] of value.matchAll(/var\((--pui-[\w-]+)\)/g)) {
        expect(resolvable.has(name!), `missing ${name}`).toBe(true);
        expect(ancestors, `cycle at ${name}`).not.toContain(name);
        resolve(resolvable.get(name!)!, [...ancestors, name!]);
      }
    };
    walkValues(tokens.shape, [], (_path, value) => resolve(value));
    walkValues(tokens.typography, [], (_path, value) => resolve(value));
    walkValues(tokens.layout, [], (_path, value) => resolve(value));
    walkValues(SHAPE_RECIPES, [], (_path, value) => resolve(value));
    // Roles have no variables of their own.
    expect([...declarations.keys()].some((name) => /^--pui-shape-(inset|selection)-/.test(name))).toBe(false);
  });

  it("lists the source variables once, and no mode changes any of them", () => {
    expect(new Set(SOURCE_VARIABLES).size).toBe(SOURCE_VARIABLES.length);
    expect(SOURCE_VARIABLES).toContain("--pui-shape-target-min");
    const perMode = new Set(COLOR_MODES.flatMap((mode) => [...Object.keys(modes[mode].own), ...Object.keys(modes[mode].ground)]));
    expect(SOURCE_VARIABLES.filter((name) => perMode.has(name))).toEqual([]);
  });

  it("writes no number into a recipe", () => {
    walkValues(SHAPE_RECIPES, [], (path, value) => expect(value, path.join(".")).not.toMatch(/\d(?:px|rem|em|%)\b/));
  });

  it("[foundations.shape.control-geometry] derives control insets from the control text line", () => {
    expect(bySize(tokens.shape.control.height)).toEqual([30, 32, 36]);
    expect(bySize(tokens.shape.control.inset.input)).toEqual([7, 8, 10]);
    expect(bySize(tokens.shape.control.inset.button)).toEqual([10, 11, 14]);
    expect(dp(tokens.shape.control.gap)).toBe(8);
  });

  it("[foundations.shape.recipe-geometry] derives selection marks and the switch from the control height", () => {
    expect(bySize(tokens.shape.selection.size)).toEqual([15, 16, 18]);
    expect(bySize(SHAPE_RECIPES.checkbox.mark)).toEqual([7.5, 8, 9]);
    expect(bySize(SHAPE_RECIPES.radio.dot)).toEqual([7.5, 8, 9]);
    expect(SHAPE_RECIPES.switch.width).toBe(tokens.shape.control.height);
    expect(bySize(SHAPE_RECIPES.switch.height)).toEqual([17, 18, 20]);
    expect(bySize(SHAPE_RECIPES.switch.thumb)).toEqual([13, 14, 16]);
    expect(SHAPE_RECIPES.switch.travel).toBe(SHAPE_RECIPES.switch.thumb);
  });

  it("[foundations.shape.recipe-geometry] makes one textarea row exactly one control tall", () => {
    const padding = bySize(SHAPE_RECIPES.textarea.paddingBlock);
    expect(padding).toEqual([4, 5, 7]);
    CONTROL_SIZES.forEach((size, i) => expect(20 + padding[i]! * 2 + SHAPE_SOURCE.stroke.border * 2).toBe(SHAPE_SOURCE.control.height[size]));
  });

  it("[foundations.shape.recipe-geometry] places the Select arrow as a trailing control icon", () => {
    expect(bySize(SHAPE_RECIPES.select.arrow)).toEqual([16, 18, 20]);
    expect(SHAPE_RECIPES.select.arrowInset).toBe(tokens.shape.control.inset.input);
    expect(bySize(SHAPE_RECIPES.select.paddingEnd)).toEqual([31, 34, 38]);
    expect(SHAPE_RECIPES.spinner.size).toBe(tokens.shape.control.icon);
  });

  it("[foundations.shape.target-reach] sets the minimum target in CSS px and reaches only as far as a mark falls short", () => {
    expect(SHAPE_VALUES.target.min).toBe("24px");
    expect(declarations.get("--pui-shape-target-min")).toBe("24px");
    expect(tokens.shape.target.min).toBe("var(--pui-shape-target-min)");
    expect(bySize(SHAPE_RECIPES.target.selection)).toEqual([-4.5, -4, -3]);
    expect(bySize(SHAPE_RECIPES.target.switchBlock)).toEqual([-3.5, -3, -2]);
    expect(bySize(SHAPE_RECIPES.target.action)).toEqual([-4, -3, -2]);
    // A mark that already is a minimum target, or larger, reaches nowhere.
    expect(dp(targetReach("30px"))).toBe(0);
    expect(dp(targetReach(tokens.shape.target.min))).toBe(0);
    expect(dp(targetReach("100px"))).toBe(0);
    for (const reach of Object.values(SHAPE_RECIPES.target).flatMap((role) => bySize(role))) expect(reach).toBeLessThanOrEqual(0);
  });
});

describe("controlGeometry is the one size entry of every sized Atom", () => {
  type Rule = { [key: string]: unknown };
  const rules = (entry: Record<ControlSize, Rule>, read: (rule: Rule) => unknown) => CONTROL_SIZES.map((size) => dp(read(entry[size]) as string));
  const prop = (name: string) => (rule: Rule) => rule[name];
  const nested = (selector: string, name: string) => (rule: Rule) => ((rule.selectors as Record<string, Rule>)[selector] as Rule)[name];

  it("[foundations.shape.control-geometry] names a rule for every control size in each entry", () => {
    expect(Object.keys(controlGeometry)).toEqual([
      "button", "iconButton", "field", "select", "selectArrow", "textarea", "selection", "checkbox", "radio", "switch", "badge", "spinner", "spinnerInline",
    ]);
    for (const [name, entry] of Object.entries(controlGeometry)) {
      if (name !== "spinnerInline") expect(Object.keys(entry), name).toEqual([...CONTROL_SIZES]);
    }
  });

  it("[foundations.shape.control-geometry] sizes the icon button as a square a control tall, with no inset", () => {
    expect(rules(controlGeometry.iconButton, prop("height"))).toEqual([30, 32, 36]);
    expect(rules(controlGeometry.iconButton, prop("width"))).toEqual([30, 32, 36]);
    for (const size of CONTROL_SIZES) expect(controlGeometry.iconButton[size].paddingInline, size).toBe(0);
  });

  it("[foundations.shape.recipe-geometry] sizes the selection box and the marks drawn inside it", () => {
    expect(rules(controlGeometry.selection, prop("width"))).toEqual([15, 16, 18]);
    expect(rules(controlGeometry.selection, prop("height"))).toEqual([15, 16, 18]);
    expect(rules(controlGeometry.checkbox, nested("&:checked::after", "width"))).toEqual([7.5, 8, 9]);
    expect(rules(controlGeometry.checkbox, nested("&:checked::after", "height"))).toEqual([3.75, 4, 4.5]);
    expect(rules(controlGeometry.checkbox, nested("&:indeterminate::after", "width"))).toEqual([7.5, 8, 9]);
    expect(rules(controlGeometry.radio, nested("&:checked::after", "width"))).toEqual([7.5, 8, 9]);
    expect(rules(controlGeometry.radio, nested("&:checked::after", "height"))).toEqual([7.5, 8, 9]);
  });

  it("[foundations.shape.recipe-geometry] sizes the switch track, its thumb at the rim, and the thumb's place once checked", () => {
    expect(rules(controlGeometry.switch, prop("width"))).toEqual([30, 32, 36]);
    expect(rules(controlGeometry.switch, prop("height"))).toEqual([17, 18, 20]);
    expect(rules(controlGeometry.switch, nested("&::after", "width"))).toEqual([13, 14, 16]);
    expect(rules(controlGeometry.switch, nested("&::after", "height"))).toEqual([13, 14, 16]);
    expect(rules(controlGeometry.switch, nested("&::after", "insetInlineStart"))).toEqual([2, 2, 2]);
    // Checked, the thumb sits a rim plus its own width from the start.
    expect(rules(controlGeometry.switch, nested("&:checked::after", "insetInlineStart"))).toEqual([15, 16, 18]);
  });

  it("[foundations.shape.recipe-geometry] sizes the badge, the spinner and the select arrow", () => {
    expect(rules(controlGeometry.badge, prop("height"))).toEqual([20, 22, 24]);
    expect(rules(controlGeometry.badge, prop("paddingInline"))).toEqual([6, 8, 10]);
    expect(rules(controlGeometry.spinner, prop("width"))).toEqual([16, 18, 20]);
    expect(rules(controlGeometry.spinner, prop("height"))).toEqual([16, 18, 20]);
    expect(rules(controlGeometry.selectArrow, prop("insetInlineEnd"))).toEqual([7, 8, 10]);
    // Inside a line of text the ring is as tall as the text.
    const inline = controlGeometry.spinnerInline;
    expect(SHAPE_RECIPES.spinner.inline).toBe("var(--pui-shape-anatomy-inline-spinner)");
    expect(inline).toEqual({ width: SHAPE_RECIPES.spinner.inline, height: SHAPE_RECIPES.spinner.inline });
    expect(resolvable.get("--pui-shape-anatomy-inline-spinner")).toBe("1em");
  });

  it("[foundations.shape.recipe-geometry] keeps the controls that already had a ladder on the same values", () => {
    expect(rules(controlGeometry.button, prop("height"))).toEqual([30, 32, 36]);
    expect(rules(controlGeometry.button, prop("paddingInline"))).toEqual([10, 11, 14]);
    expect(rules(controlGeometry.field, prop("paddingInline"))).toEqual([7, 8, 10]);
    expect(rules(controlGeometry.select, prop("paddingInlineEnd"))).toEqual([31, 34, 38]);
    expect(rules(controlGeometry.textarea, prop("paddingBlock"))).toEqual([4, 5, 7]);
  });
});

describe("strokeRing draws an inset hairline inside a box", () => {
  it("[foundations.shape.stroke-px] is an inset shadow as wide as the border stroke, in the colour it is given", () => {
    expect(strokeRing("red")).toBe("inset 0 0 0 var(--pui-shape-stroke-border) red");
    expect(strokeRing(tokens.color.ink.tertiary)).toBe("inset 0 0 0 var(--pui-shape-stroke-border) var(--pui-color-ink-tertiary)");
  });
});

describe("Layout shadow is geometry per mode, assembled where it is cast", () => {
  it("keeps one geometry set per mode, with the same layers in every mode", () => {
    expect(Object.keys(LAYOUT_MODE_VALUES)).toEqual([...COLOR_MODES]);
    expect(Object.keys(LAYOUT_SOURCE.shadow)).toEqual([...COLOR_MODES]);
    for (const depth of DEPTHS) {
      const counts = COLOR_MODES.map((mode) => Object.keys(LAYOUT_MODE_VALUES[mode].shadow[depth]).length);
      expect(new Set(counts).size, depth).toBe(1);
      expect(counts[0], depth).toBe(LAYOUT_SOURCE.shadow.light[depth].length);
    }
    expect(LAYOUT_MODE_VALUES.light.shadow.floating["0"]).toBe("0px 8px 24px 0px");
    expect(LAYOUT_MODE_VALUES.dark.shadow.floating["0"]).toBe("0px 8px 22px -5px");
  });

  it("emits the geometry as ground variables of each mode and nothing else of Layout per mode", () => {
    for (const mode of COLOR_MODES) {
      const layoutNames = Object.keys(modes[mode].ground).filter((name) => name.startsWith("--pui-layout-"));
      expect(layoutNames, mode).toEqual(["--pui-layout-shadow-lifted-0", "--pui-layout-shadow-floating-0", "--pui-layout-shadow-floating-1"]);
      expect(Object.keys(modes[mode].own).some((name) => name.startsWith("--pui-layout-")), mode).toBe(false);
    }
  });

  it("assembles a cast from the geometry variables and the shadow colour of its depth, with no role variable", () => {
    const floating = castShadow("floating");
    expect([...floating.matchAll(/var\((--pui-[\w-]+)\)/g)].map(([, name]) => name)).toEqual([
      "--pui-layout-shadow-floating-0", "--pui-color-shadow-floating", "--pui-layout-shadow-floating-1", "--pui-color-shadow-floating",
    ]);
    expect(castShadow("lifted")).toBe("var(--pui-layout-shadow-lifted-0) var(--pui-color-shadow-lifted)");
    expect([...declarations.keys(), ...Object.keys(invariant)].some((name) => /elevation-[\w-]*shadow/.test(name))).toBe(false);
  });
});
