import { describe, expect, it } from "vitest";

import { dp as resolveDp } from "../../../../tests/support/dp";
import { SOURCE_VARIABLES, tokens } from "./index";
import { walkValues } from "./helpers";
import { COLOR_MODES } from "./color-modes";
import { DEPTHS } from "./colors";
import { LAYOUT_MODE_VALUES, LAYOUT_SOURCE, castShadow } from "./layout";
import { SHAPE_SOURCE, SHAPE_VALUES } from "./shape";
import { SHAPE_RECIPES, targetReach } from "./shape-recipes";
import { CONTROL_SIZES } from "./typography";
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
