import { describe, expect, it } from "vitest";

import { tokens } from "./index";
import { walkValues, pathToCssVar } from "./helpers";
import { SHAPE_SOURCE, SHAPE_VALUES, CONTROL_SIZES } from "./shape";
import { SHAPE_RECIPES } from "./shape-recipes";
import { ELEVATIONS, LAYOUT_VALUES, elevationShadow } from "./layout";
import { TEXT_VALUES } from "./text";

// Everything theme.css.ts emits as a theme-invariant variable.
const declarations = new Map<string, string>();
walkValues(SHAPE_VALUES, ["shape"], (path, value) => declarations.set(pathToCssVar(path), value));
walkValues(LAYOUT_VALUES, ["layout"], (path, value) => declarations.set(pathToCssVar(path), value));
walkValues(TEXT_VALUES, [], (path, value) => declarations.set(pathToCssVar(path), value));

// Resolves a role or recipe to dp at the default 16px root, the way the browser would.
const dp = (expression: string): number => {
  const substituted = expression.replace(/var\((--pui-[\w-]+)\)/g, (_match, name: string) => {
    const declared = declarations.get(name);
    if (declared === undefined) throw new Error(`missing ${name}`);
    return `(${dp(declared)})`;
  });
  const js = substituted
    .replace(/round\(nearest,/g, "Math.round(")
    .replace(/calc\(/g, "(")
    .replace(/(-?\d*\.?\d+)rem\b/g, (_match, n: string) => String(Number(n) * 16))
    .replace(/(-?\d*\.?\d+)px\b/g, "$1");
  return Number(Function(`return ${js}`)());
};
const bySize = (role: Record<string, string>) => CONTROL_SIZES.map((size) => dp(role[size]!));

describe("Shape is source → role → recipe", () => {
  it("emits only source values; every role and recipe resolves to them without a cycle", () => {
    for (const name of declarations.keys()) expect(name, name).toMatch(/^--pui-(shape|layout|text)-/);
    const resolve = (value: string, ancestors: string[] = []) => {
      for (const [, name] of value.matchAll(/var\((--pui-[\w-]+)\)/g)) {
        expect(declarations.has(name!), `missing ${name}`).toBe(true);
        expect(ancestors, `cycle at ${name}`).not.toContain(name);
        resolve(declarations.get(name!)!, [...ancestors, name!]);
      }
    };
    walkValues(tokens.shape, [], (_path, value) => resolve(value));
    walkValues(SHAPE_RECIPES, [], (_path, value) => resolve(value));
    // Roles have no variables of their own.
    expect([...declarations.keys()].some((name) => /^--pui-shape-(inset|selection)-/.test(name))).toBe(false);
  });

  it("writes no number into a recipe", () => {
    walkValues(SHAPE_RECIPES, [], (path, value) => expect(value, path.join(".")).not.toMatch(/\d(?:px|rem|em|%)\b/));
  });

  it("derives control insets from the control text line", () => {
    expect(bySize(tokens.shape.control.height)).toEqual([30, 32, 36]);
    expect(bySize(tokens.shape.control.inset.input)).toEqual([7, 8, 10]);
    expect(bySize(tokens.shape.control.inset.button)).toEqual([10, 11, 14]);
    expect(dp(tokens.shape.control.gap)).toBe(8);
  });

  it("derives selection marks and the switch from the control height", () => {
    expect(bySize(tokens.shape.selection.size)).toEqual([15, 16, 18]);
    expect(bySize(SHAPE_RECIPES.checkbox.mark)).toEqual([7.5, 8, 9]);
    expect(bySize(SHAPE_RECIPES.radio.dot)).toEqual([7.5, 8, 9]);
    expect(SHAPE_RECIPES.switch.width).toBe(tokens.shape.control.height);
    expect(bySize(SHAPE_RECIPES.switch.height)).toEqual([17, 18, 20]);
    expect(bySize(SHAPE_RECIPES.switch.thumb)).toEqual([13, 14, 16]);
    expect(SHAPE_RECIPES.switch.travel).toBe(SHAPE_RECIPES.switch.thumb);
  });

  it("makes one textarea row exactly one control tall", () => {
    const padding = bySize(SHAPE_RECIPES.textarea.paddingBlock);
    expect(padding).toEqual([4, 5, 7]);
    CONTROL_SIZES.forEach((size, i) => expect(20 + padding[i]! * 2 + SHAPE_SOURCE.stroke.border * 2).toBe(SHAPE_SOURCE.control.height[size]));
  });

  it("places the Select arrow as a trailing control icon", () => {
    expect(bySize(SHAPE_RECIPES.select.arrow)).toEqual([16, 18, 20]);
    expect(SHAPE_RECIPES.select.arrowInset).toBe(tokens.shape.control.inset.input);
    expect(bySize(SHAPE_RECIPES.select.paddingEnd)).toEqual([31, 34, 38]);
    expect(SHAPE_RECIPES.spinner.size).toBe(tokens.shape.control.icon);
  });
});

describe("Layout builds on Shape", () => {
  it("shares one length scale between inset and gap", () => {
    expect(tokens.shape.inset).toEqual(tokens.layout.gap);
    expect(tokens.layout.gutter).toBe(tokens.shape.inset.lg);
  });

  it("lets one elevation decide both stacking and shadow", () => {
    for (const level of ELEVATIONS) {
      expect(tokens.layout.elevation[level].z).toMatch(/^var\(--pui-layout-elevation-/);
      expect(tokens.layout.elevation[level].shadow).toMatch(/^var\(--pui-layout-elevation-/);
    }
    const tint = (name: string) => `tint(${name})`;
    for (const theme of ["light", "dark"] as const) {
      expect(elevationShadow("base", theme, tint)).toBe("none");
      expect(elevationShadow("sticky", theme, tint)).toBe("none");
      expect(elevationShadow("raised", theme, tint)).toContain("tint(overlayMinimal)");
      expect(elevationShadow("modal", theme, tint)).toBe(elevationShadow("overlay", theme, tint));
    }
  });
});
