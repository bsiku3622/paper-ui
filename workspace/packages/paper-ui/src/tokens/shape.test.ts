import { describe, expect, it } from "vitest";

import { dp as resolveDp } from "../../../../tests/support/dp";
import { tokens } from "./index";
import { walkValues, pathToCssVar } from "./helpers";
import { SHAPE_SOURCE, SHAPE_VALUES } from "./shape";
import { SHAPE_RECIPES } from "./shape-recipes";
import { COLOR_VALUES } from "./colors";
import { ELEVATIONS, LAYOUT_VALUES, elevationShadow, elevationShadowPath } from "./layout";
import { CONTROL_SIZES, TYPOGRAPHY_VALUES } from "./typography";

// Everything theme.css.ts emits as a theme-invariant variable.
const declarations = new Map<string, string>();
walkValues(SHAPE_VALUES, ["shape"], (path, value) => declarations.set(pathToCssVar(path), value));
walkValues(LAYOUT_VALUES, ["layout"], (path, value) => declarations.set(pathToCssVar(path), value));
walkValues(TYPOGRAPHY_VALUES, ["typography"], (path, value) => declarations.set(pathToCssVar(path), value));

// Layout's elevation shadows are built from the light colours, so those names resolve as well.
const resolvable = new Map(declarations);
walkValues(COLOR_VALUES, ["color"], (path, value) => resolvable.set(pathToCssVar(path), value));
for (const level of ELEVATIONS) {
  resolvable.set(pathToCssVar(elevationShadowPath(level)), elevationShadow(level, "light", (tint) => tokens.color.shadow[tint]));
}

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
});
