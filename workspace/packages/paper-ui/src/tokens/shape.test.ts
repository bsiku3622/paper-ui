import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { STRUCTURAL, isStructural } from "../../../../eslint-rules/structural.js";
import { emittedDeclarations, resolveDp } from "./resolve-dp";
import { controlGeometry } from "../internal/shape";
import { CONTROL_ICON, SOURCE_VARIABLES, strokeRing, tokens } from "./index";
import { walkValues } from "./helpers";
import { COLOR_MODES } from "./color-modes";
import { DEPTHS } from "./colors";
import { LAYOUT_MODE_VALUES, LAYOUT_SOURCE, castShadow } from "./layout";
import { SHAPE_SOURCE, SHAPE_VALUES, SPACES } from "./shape";
import { SHAPE_RECIPES, targetReach } from "./shape-recipes";
import { CONTROL_SIZES, PRESET_SPEC, TYPOGRAPHY_SOURCE, type ControlSize } from "./typography";
import { themeVariables } from "./variables";

// Everything the stylesheet emits as a source variable: the same in every mode.
const { source, invariant, modes } = themeVariables();
const declarations = new Map(Object.entries(source));

// Roles read colours and shadow geometry as well; the light mode stands for the names every mode has.
const resolvable = emittedDeclarations();

// Resolves a role or recipe to dp at the default 16px root, the way the browser would.
const dp = (expression: string) => resolveDp(expression, resolvable);
const bySize = (role: Record<string, string>) => CONTROL_SIZES.map((size) => dp(role[size]!));

// What each role has to come to, worked out from the authored numbers alone: the source and the leading of the control
// text. The same formulas the docs state; the golden file then records the numbers they give.
const source_ = SHAPE_SOURCE;
const lineOf = (leading: keyof typeof TYPOGRAPHY_SOURCE.leading) => TYPOGRAPHY_SOURCE.leading[leading];
const expected = {
  height: (size: ControlSize) => source_.control.height[size],
  // A typed value gets the same room on every side of its glyph line.
  inputInset: (size: ControlSize) => (source_.control.height[size] - lineOf(PRESET_SPEC.field[size].leading)) / 2,
  // A button's label defines its box, so its inset is the input inset widened by the ratio and snapped to a pixel.
  buttonInset: (size: ControlSize) => Math.round(((source_.control.height[size] - lineOf(PRESET_SPEC.button.medium[size].leading)) / 2) * source_.control.buttonInsetRatio),
  icon: (size: ControlSize) => source_.icon[CONTROL_ICON[size]],
  selection: (size: ControlSize) => source_.control.height[size] / 2,
  thumb: (size: ControlSize) => expected.selection(size) - source_.stroke.emphasis,
  trackHeight: (size: ControlSize) => expected.selection(size) + source_.stroke.emphasis,
  // One row of a textarea is a control tall: the padding is what the control height leaves around its line and border.
  textareaPadding: (size: ControlSize) => (source_.control.height[size] - lineOf(PRESET_SPEC.textarea[size].leading)) / 2 - source_.stroke.border,
  // The value stops a control gap before the trailing icon.
  selectEnd: (size: ControlSize) => expected.inputInset(size) + expected.icon(size) + source_.space.sm,
  // Half the shortfall of a mark under the minimum target, never positive.
  reach: (visual: number) => (Math.min(visual, source_.target.min) - source_.target.min) / 2,
};
const each = (read: (size: ControlSize) => number) => CONTROL_SIZES.map(read);

// Every role and recipe in dp at the default root: what the golden file holds. A value that is not a length (a ratio, an
// em) is kept as the stylesheet declares it.
const resolveLeaf = (expression: string): number | string => {
  try {
    return dp(expression);
  } catch {
    return resolvable.get(/^var\((--[\w-]+)\)$/.exec(expression)?.[1] ?? "") ?? expression;
  }
};
const resolvedTree = (tree: object): unknown =>
  Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, typeof value === "string" ? resolveLeaf(value) : resolvedTree(value as object)]));

describe("Shape is source → role → recipe", () => {
  it("[foundations.override.rederives-roles] emits only source values; every role and recipe resolves to them without a cycle", () => {
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

  it("[foundations.override.source-paths-only] lists the source variables once, and no mode changes any of them", () => {
    expect(new Set(SOURCE_VARIABLES).size).toBe(SOURCE_VARIABLES.length);
    expect(SOURCE_VARIABLES).toContain("--pui-shape-target-min");
    const perMode = new Set(COLOR_MODES.flatMap((mode) => [...Object.keys(modes[mode].own), ...Object.keys(modes[mode].ground)]));
    expect(SOURCE_VARIABLES.filter((name) => perMode.has(name))).toEqual([]);
  });

  it("[foundations.shape.recipe-structural-numbers] writes no length into a recipe", () => {
    walkValues(SHAPE_RECIPES, [], (path, value) => expect(value, path.join(".")).not.toMatch(/\d(?:px|rem|em|%)\b/));
  });

  it("[foundations.shape.recipe-structural-numbers] leaves, once its var() names are gone, only structural numbers in every recipe string", () => {
    const literal = /([*/])?\s*(-?\d*\.?\d+)([a-z%]*)/g;
    const found: string[] = [];
    walkValues(SHAPE_RECIPES, [], (path, value) => {
      for (const [, operator, number, unit] of value.replace(/var\(--[\w-]+\)/g, "V").matchAll(literal)) {
        if (!isStructural({ value: Number(number), unit, operator: operator as "/" | "*" | undefined })) found.push(`${path.join(".")}: ${operator ?? ""}${number}${unit}`);
      }
    });
    expect(found).toEqual([]);
    // The check can see a number: a ratio written into a recipe is not structural.
    expect(isStructural({ value: 4, unit: "", operator: "/" })).toBe(false);
    expect(isStructural({ value: -45, unit: "deg" })).toBe(true);
    expect(STRUCTURAL.calcFactors.divisor).toEqual([2]);
  });

  it("[foundations.shape.radius-table] [foundations.shape.control-table] [foundations.shape.sizing-table] records the resolved value of every role and recipe in shape-resolved.json", async () => {
    await expect(`${JSON.stringify({ roles: resolvedTree(tokens.shape), recipes: resolvedTree(SHAPE_RECIPES) }, null, 2)}\n`).toMatchFileSnapshot("./__golden__/shape-resolved.json");
  });

  it("[foundations.shape.control-geometry] [foundations.typography.control-line] derives control insets from the control text line", () => {
    expect(bySize(tokens.shape.control.height)).toEqual(each(expected.height));
    expect(bySize(tokens.shape.control.inset.input)).toEqual(each(expected.inputInset));
    expect(bySize(tokens.shape.control.inset.button)).toEqual(each(expected.buttonInset));
    expect(dp(tokens.shape.control.gap)).toBe(source_.space.sm);
    // The input inset subtracts the field's glyph line, not the taller line box the value sits in.
    for (const size of CONTROL_SIZES) expect(lineOf(PRESET_SPEC.field[size].inputLeading)).toBeGreaterThan(lineOf(PRESET_SPEC.field[size].leading));
  });

  it("[foundations.shape.recipe-geometry] derives selection marks and the switch from the control height", () => {
    expect(bySize(tokens.shape.selection.size)).toEqual(each(expected.selection));
    expect(bySize(SHAPE_RECIPES.checkbox.mark)).toEqual(each((size) => expected.selection(size) / 2));
    expect(bySize(SHAPE_RECIPES.checkbox.short)).toEqual(each((size) => expected.selection(size) / 4));
    expect(bySize(SHAPE_RECIPES.radio.dot)).toEqual(each((size) => expected.selection(size) / 2));
    expect(SHAPE_RECIPES.switch.width).toBe(tokens.shape.control.height);
    expect(bySize(SHAPE_RECIPES.switch.height)).toEqual(each(expected.trackHeight));
    expect(bySize(SHAPE_RECIPES.switch.thumb)).toEqual(each(expected.thumb));
    expect(SHAPE_RECIPES.switch.travel).toBe(SHAPE_RECIPES.switch.thumb);
  });

  it("[foundations.shape.recipe-geometry] makes one textarea row exactly one control tall", () => {
    const padding = bySize(SHAPE_RECIPES.textarea.paddingBlock);
    expect(padding).toEqual(each(expected.textareaPadding));
    CONTROL_SIZES.forEach((size, i) => expect(lineOf(PRESET_SPEC.textarea[size].leading) + padding[i]! * 2 + SHAPE_SOURCE.stroke.border * 2).toBe(SHAPE_SOURCE.control.height[size]));
  });

  it("[foundations.shape.recipe-geometry] places the Select arrow as a trailing control icon", () => {
    expect(bySize(tokens.shape.control.icon)).toEqual(each(expected.icon));
    expect("arrow" in SHAPE_RECIPES.select).toBe(false);
    expect("minHeight" in SHAPE_RECIPES.textarea).toBe(false);
    expect(SHAPE_RECIPES.select.arrowInset).toBe(tokens.shape.control.inset.input);
    expect(bySize(SHAPE_RECIPES.select.paddingEnd)).toEqual(each(expected.selectEnd));
    expect(SHAPE_RECIPES.spinner.size).toBe(tokens.shape.control.icon);
  });

  it("[foundations.shape.recipe-geometry] shifts the check by the source's ratios of the emphasis stroke, with no ratio of its own in the recipe", () => {
    const { x, y } = SHAPE_SOURCE.anatomy.checkbox.markShift;
    expect(SHAPE_VALUES.anatomy.checkbox.markShift).toEqual({ x: String(x), y: String(y) });
    expect(declarations.get("--pui-shape-anatomy-checkbox-mark-shift-x")).toBe(String(x));
    expect(declarations.get("--pui-shape-anatomy-checkbox-mark-shift-y")).toBe(String(y));
    const emphasis = tokens.shape.stroke.emphasis;
    expect(SHAPE_RECIPES.checkbox.markTransform).toBe(
      `rotate(-45deg) translate(calc(${emphasis} * var(--pui-shape-anatomy-checkbox-mark-shift-x)), calc(${emphasis} * var(--pui-shape-anatomy-checkbox-mark-shift-y)))`,
    );
    // In pixels the shift is a quarter and minus a half of the check's stroke.
    expect([x, y].map((ratio) => ratio * SHAPE_SOURCE.stroke.emphasis)).toEqual([SHAPE_SOURCE.stroke.emphasis / 4, SHAPE_SOURCE.stroke.emphasis / -2]);
  });

  it("[foundations.shape.target-reach] [foundations.shape.target-table] sets the minimum target in CSS px and reaches only as far as a mark falls short", () => {
    expect(SHAPE_VALUES.target.min).toBe(`${SHAPE_SOURCE.target.min}px`);
    expect(declarations.get("--pui-shape-target-min")).toBe(`${SHAPE_SOURCE.target.min}px`);
    expect(tokens.shape.target.min).toBe("var(--pui-shape-target-min)");
    expect(bySize(SHAPE_RECIPES.target.selection)).toEqual(each((size) => expected.reach(expected.selection(size))));
    expect(bySize(SHAPE_RECIPES.target.switchBlock)).toEqual(each((size) => expected.reach(expected.trackHeight(size))));
    expect(bySize(SHAPE_RECIPES.target.action)).toEqual(each((size) => expected.reach(expected.icon(size))));
    // A mark that already is a minimum target, or larger, reaches nowhere.
    expect(dp(targetReach("30px"))).toBe(0);
    expect(dp(targetReach(tokens.shape.target.min))).toBe(0);
    expect(dp(targetReach("100px"))).toBe(0);
    for (const reach of Object.values(SHAPE_RECIPES.target).flatMap((role) => bySize(role))) expect(reach).toBeLessThanOrEqual(0);
  });
});

describe("what the Shape page says", () => {
  // A table of docs/foundations/shape.md, by the first cell of its row, as numbers. The docs write a negative with its own minus.
  const shapeDoc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../../docs/foundations/shape.md"), "utf8");
  const cells = (row: string) => row.split("|").slice(2, -1).map((cell) => Number(cell.trim().replace("−", "-")));
  const docRow = (first: string) => {
    const row = shapeDoc.split("\n").find((line) => line.startsWith(`| ${first} `));
    expect(row, first).toBeDefined();
    return row!;
  };

  it("[foundations.shape.source-dp] writes a length as the rem of its dp, so one dp is one px at the default root", () => {
    for (const [name, step] of Object.entries(SHAPE_SOURCE.space)) {
      expect(SHAPE_VALUES.space[name as keyof typeof SHAPE_VALUES.space], name).toBe(`${step / 16}rem`);
      expect(dp(tokens.shape.inset[name as keyof typeof tokens.shape.inset]), name).toBe(step);
    }
    for (const size of CONTROL_SIZES) {
      expect(SHAPE_VALUES.control.height[size], size).toBe(`${SHAPE_SOURCE.control.height[size] / 16}rem`);
      expect(dp(tokens.shape.control.height[size]), size).toBe(SHAPE_SOURCE.control.height[size]);
    }
  });

  it("[foundations.override.worked-example] says what one source override derives to: 40 tall, inset 12 and 17, a 20 box and a 40 by 22 track", () => {
    const overridden = new Map([...resolvable, ["--pui-shape-control-height-md", "40px"]]);
    const at = (role: string) => resolveDp(role, overridden);
    expect(at(tokens.shape.control.height.md)).toBe(40);
    expect(at(tokens.shape.control.inset.input.md)).toBe(12);
    expect(at(tokens.shape.control.inset.button.md)).toBe(17);
    expect(at(tokens.shape.selection.size.md)).toBe(20);
    expect(at(SHAPE_RECIPES.switch.width.md)).toBe(40);
    expect(at(SHAPE_RECIPES.switch.height.md)).toBe(22);
  });

  it("[foundations.shape.inset-scale] climbs the 4dp grid to xl and an 8dp flow past it", () => {
    const steps = SPACES.map((name) => [name, SHAPE_SOURCE.space[name]] as const);
    const xl = SPACES.indexOf("xl");
    steps.forEach(([name, step], index) => {
      expect(step % (index <= xl ? 4 : 8), name).toBe(0);
      if (index > 0) expect(step, name).toBeGreaterThan(steps[index - 1]![1]);
    });
  });

  it("[foundations.shape.inset-values] draws the table of inset steps from the source", () => {
    expect(docRow("단계").split("|").slice(2, -1).map((cell) => cell.trim())).toEqual([...SPACES]);
    expect(cells(docRow("dp"))).toEqual(SPACES.map((name) => SHAPE_SOURCE.space[name]));
  });

  it("[foundations.shape.target-table] draws the table of hit areas from the roles it names", () => {
    expect(cells(docRow("`target.selection`").replace(/\| targetReach\([^|]*\) /, "")).slice(0, 3)).toEqual(bySize(SHAPE_RECIPES.target.selection));
    expect(cells(docRow("`target.switchBlock`").replace(/\| targetReach\([^|]*\) /, "")).slice(0, 3)).toEqual(bySize(SHAPE_RECIPES.target.switchBlock));
    expect(cells(docRow("`target.action`").replace(/\| targetReach\([^|]*\) /, "")).slice(0, 3)).toEqual(bySize(SHAPE_RECIPES.target.action));
  });

  it("[foundations.shape.radius-separate] keeps the surface family and the control corner apart, whatever their values", () => {
    expect(tokens.shape.radius.surface.sm).not.toBe(tokens.shape.radius.control);
    expect(declarations.has("--pui-shape-radius-surface-sm")).toBe(true);
    expect(declarations.has("--pui-shape-radius-control")).toBe(true);
  });
});

describe("controlGeometry is the one size entry of every sized Atom", () => {
  type Rule = { [key: string]: unknown };
  const rules = (entry: Record<ControlSize, Rule>, read: (rule: Rule) => unknown) => CONTROL_SIZES.map((size) => dp(read(entry[size]) as string));
  const prop = (name: string) => (rule: Rule) => rule[name];
  const nested = (selector: string, name: string) => (rule: Rule) => ((rule.selectors as Record<string, Rule>)[selector] as Rule)[name];

  it("[foundations.shape.control-geometry] [foundations.shape.geometry-entry] names a rule for every control size in each entry", () => {
    expect(Object.keys(controlGeometry)).toEqual([
      "button", "iconButton", "field", "select", "selectArrow", "textarea", "selection", "checkbox", "radio", "switch", "badge", "spinner", "spinnerInline",
    ]);
    for (const [name, entry] of Object.entries(controlGeometry)) {
      if (name !== "spinnerInline") expect(Object.keys(entry), name).toEqual([...CONTROL_SIZES]);
    }
  });

  it("[foundations.shape.control-geometry] sizes the icon button as a square a control tall, with no inset", () => {
    expect(rules(controlGeometry.iconButton, prop("height"))).toEqual(each(expected.height));
    expect(rules(controlGeometry.iconButton, prop("width"))).toEqual(each(expected.height));
    for (const size of CONTROL_SIZES) expect(controlGeometry.iconButton[size].paddingInline, size).toBe(0);
  });

  it("[foundations.shape.recipe-geometry] sizes the selection box and the marks drawn inside it", () => {
    const half = each((size) => expected.selection(size) / 2);
    expect(rules(controlGeometry.selection, prop("width"))).toEqual(each(expected.selection));
    expect(rules(controlGeometry.selection, prop("height"))).toEqual(each(expected.selection));
    expect(rules(controlGeometry.checkbox, nested("&:checked::after", "width"))).toEqual(half);
    expect(rules(controlGeometry.checkbox, nested("&:checked::after", "height"))).toEqual(each((size) => expected.selection(size) / 4));
    expect(rules(controlGeometry.checkbox, nested("&:indeterminate::after", "width"))).toEqual(half);
    expect(rules(controlGeometry.radio, nested("&:checked::after", "width"))).toEqual(half);
    expect(rules(controlGeometry.radio, nested("&:checked::after", "height"))).toEqual(half);
  });

  it("[foundations.shape.recipe-geometry] sizes the switch track, its thumb at the rim, and the thumb's place once checked", () => {
    expect(rules(controlGeometry.switch, prop("width"))).toEqual(each(expected.height));
    expect(rules(controlGeometry.switch, prop("height"))).toEqual(each(expected.trackHeight));
    expect(rules(controlGeometry.switch, nested("&::after", "width"))).toEqual(each(expected.thumb));
    expect(rules(controlGeometry.switch, nested("&::after", "height"))).toEqual(each(expected.thumb));
    expect(rules(controlGeometry.switch, nested("&::after", "insetInlineStart"))).toEqual(each(() => SHAPE_SOURCE.stroke.emphasis));
    // Checked, the thumb sits a rim plus its own width from the start.
    expect(rules(controlGeometry.switch, nested("&:checked::after", "insetInlineStart"))).toEqual(each((size) => SHAPE_SOURCE.stroke.emphasis + expected.thumb(size)));
  });

  it("[foundations.shape.recipe-geometry] sizes the badge, the spinner and the select arrow", () => {
    expect(rules(controlGeometry.badge, prop("height"))).toEqual(each((size) => SHAPE_SOURCE.anatomy.badge.height[size]));
    expect(rules(controlGeometry.badge, prop("paddingInline"))).toEqual(each((size) => SHAPE_SOURCE.anatomy.badge.inset[size]));
    expect(rules(controlGeometry.spinner, prop("width"))).toEqual(each(expected.icon));
    expect(rules(controlGeometry.spinner, prop("height"))).toEqual(each(expected.icon));
    expect(rules(controlGeometry.selectArrow, prop("insetInlineEnd"))).toEqual(each(expected.inputInset));
    // Inside a line of text the ring is as tall as the text.
    const inline = controlGeometry.spinnerInline;
    expect(SHAPE_RECIPES.spinner.inline).toBe("var(--pui-shape-anatomy-inline-spinner)");
    expect(inline).toEqual({ width: SHAPE_RECIPES.spinner.inline, height: SHAPE_RECIPES.spinner.inline });
    expect(resolvable.get("--pui-shape-anatomy-inline-spinner")).toBe("1em");
  });

  it("[foundations.shape.recipe-geometry] gives the controls that already had a ladder the values their roles derive", () => {
    expect(rules(controlGeometry.button, prop("height"))).toEqual(each(expected.height));
    expect(rules(controlGeometry.button, prop("paddingInline"))).toEqual(each(expected.buttonInset));
    expect(rules(controlGeometry.field, prop("paddingInline"))).toEqual(each(expected.inputInset));
    expect(rules(controlGeometry.select, prop("paddingInlineEnd"))).toEqual(each(expected.selectEnd));
    expect(rules(controlGeometry.textarea, prop("paddingBlock"))).toEqual(each(expected.textareaPadding));
  });
});

describe("strokeRing draws an inset hairline inside a box", () => {
  it("[foundations.shape.stroke-px] is an inset shadow as wide as the border stroke, in the colour it is given", () => {
    expect(strokeRing("red")).toBe("inset 0 0 0 var(--pui-shape-stroke-border) red");
    expect(strokeRing(tokens.color.ink.tertiary)).toBe("inset 0 0 0 var(--pui-shape-stroke-border) var(--pui-color-ink-tertiary)");
  });
});

describe("Layout shadow is geometry per mode, assembled where it is cast", () => {
  it("[foundations.layout.shadow-geometry] keeps one geometry set per mode, with the same layers in every mode", () => {
    expect(Object.keys(LAYOUT_MODE_VALUES)).toEqual([...COLOR_MODES]);
    expect(Object.keys(LAYOUT_SOURCE.shadow)).toEqual([...COLOR_MODES]);
    for (const depth of DEPTHS) {
      const counts = COLOR_MODES.map((mode) => Object.keys(LAYOUT_MODE_VALUES[mode].shadow[depth]).length);
      expect(new Set(counts).size, depth).toBe(1);
      expect(counts[0], depth).toBe(LAYOUT_SOURCE.shadow.light[depth].length);
    }
    // Each layer is written as CSS from the source's numbers; layout-resolved.json records the strings.
    for (const mode of COLOR_MODES) {
      for (const depth of DEPTHS) {
        expect(Object.values(LAYOUT_MODE_VALUES[mode].shadow[depth]), `${mode} ${depth}`).toEqual(LAYOUT_SOURCE.shadow[mode][depth].map((layer) => layer.map((value) => `${value}px`).join(" ")));
      }
    }
  });

  it("[foundations.layout.shadow-geometry] has two depths, draws dark tighter than light layer by layer, and spreads dark's floating depth inward", () => {
    expect([...DEPTHS].sort()).toEqual(["floating", "lifted"]);
    // How far a layer reaches past the box: its blur and its spread together.
    const reach = (layer: readonly number[]) => layer[2]! + layer[3]!;
    for (const depth of DEPTHS) {
      LAYOUT_SOURCE.shadow.dark[depth].forEach((layer, index) => expect(reach(layer), `${depth} ${index}`).toBeLessThan(reach(LAYOUT_SOURCE.shadow.light[depth][index]!)));
    }
    for (const layer of LAYOUT_SOURCE.shadow.dark.floating) expect(layer[3]).toBeLessThan(0);
  });

  it("[foundations.layout.emission] [foundations.layout.shadow-geometry] emits the geometry as ground variables of each mode and nothing else of Layout per mode", () => {
    for (const mode of COLOR_MODES) {
      const layoutNames = Object.keys(modes[mode].ground).filter((name) => name.startsWith("--pui-layout-"));
      expect(layoutNames, mode).toEqual(["--pui-layout-shadow-lifted-0", "--pui-layout-shadow-floating-0", "--pui-layout-shadow-floating-1"]);
      expect(Object.keys(modes[mode].own).some((name) => name.startsWith("--pui-layout-")), mode).toBe(false);
    }
  });

  it("[foundations.layout.emission] [foundations.layout.shadow-geometry] assembles a cast from the geometry variables and the shadow colour of its depth, with no role variable", () => {
    const floating = castShadow("floating");
    expect([...floating.matchAll(/var\((--pui-[\w-]+)\)/g)].map(([, name]) => name)).toEqual([
      "--pui-layout-shadow-floating-0", "--pui-color-shadow-floating", "--pui-layout-shadow-floating-1", "--pui-color-shadow-floating",
    ]);
    expect(castShadow("lifted")).toBe("var(--pui-layout-shadow-lifted-0) var(--pui-color-shadow-lifted)");
    expect([...declarations.keys(), ...Object.keys(invariant)].some((name) => /elevation-[\w-]*shadow/.test(name))).toBe(false);
  });
});
