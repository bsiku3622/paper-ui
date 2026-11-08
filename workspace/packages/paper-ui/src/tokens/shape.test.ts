import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { STRUCTURAL, isStructural } from "../../../../eslint-rules/structural.js";
import { emittedDeclarations, resolveDp } from "./resolve-dp";
import { CONTROL } from "./control-recipes";
import { CONTROL_SIZES, type ControlSize } from "./control-sizes";
import { castShadow } from "./elevation-recipes";
import { CONTROL_ICON, CONTROL_LINE_PROPERTY, SOURCE_VARIABLES, nestedRadius, strokeRing, tokens } from "./index";
import { walkValues } from "./helpers";
import { COLOR_MODES } from "./color-modes";
import { DEPTHS } from "./colors";
import { LAYOUT_MODE_VALUES, LAYOUT_SOURCE } from "./layout";
import { ANATOMY, SHAPE_SOURCE, SHAPE_VALUES, SPACES } from "./shape";
import { SHAPE_RECIPES, markParts, targetReach } from "./shape-recipes";
import { PRESET_SPEC, TYPOGRAPHY_SOURCE } from "./typography";
import { themeVariables } from "./variables";

const { source, invariant, modes } = themeVariables();
const declarations = new Map(Object.entries(source));

const resolvable = emittedDeclarations();

const dp = (expression: string) => resolveDp(expression, resolvable);
const bySize = (role: Record<string, string>) => CONTROL_SIZES.map((size) => dp(role[size]!));

const source_ = SHAPE_SOURCE;
const lineOf = (leading: keyof typeof TYPOGRAPHY_SOURCE.leading) => TYPOGRAPHY_SOURCE.leading[leading];
const expected = {
  height: (size: ControlSize) => source_.control.height[size],
  inputInset: (size: ControlSize) => (source_.control.height[size] - lineOf(PRESET_SPEC.field[size].leading)) / 2,
  buttonInset: (size: ControlSize) => source_.control.buttonInset[size],
  icon: (size: ControlSize) => source_.icon[CONTROL_ICON[size]],
  selection: (size: ControlSize) => source_.selection.size[size],
  thumb: (size: ControlSize) => expected.selection(size) - source_.stroke.emphasis,
  trackHeight: (size: ControlSize) => expected.selection(size) + source_.stroke.emphasis,
  textareaPadding: (size: ControlSize) => (source_.control.height[size] - lineOf(PRESET_SPEC.textarea[size].leading)) / 2,
  reach: (visual: number) => (Math.min(visual, source_.target.min) - source_.target.min) / 2,
};
const each = (read: (size: ControlSize) => number) => CONTROL_SIZES.map(read);

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
    expect([...declarations.keys()].some((name) => /^--pui-shape-inset-/.test(name))).toBe(false);
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
    for (const size of CONTROL_SIZES) {
      expect(expected.buttonInset(size), size).toBeGreaterThan(expected.inputInset(size));
      expect(Number.isInteger(expected.buttonInset(size)), size).toBe(true);
    }
    expect(dp(tokens.shape.control.gap)).toBe(source_.space.sm);
    for (const size of CONTROL_SIZES) expect(lineOf(PRESET_SPEC.field[size].inputLeading)).toBeGreaterThan(lineOf(PRESET_SPEC.field[size].leading));
  });

  it("[foundations.shape.recipe-geometry] derives selection marks and the switch from the mark's own ladder", () => {
    expect(bySize(tokens.shape.selection.size)).toEqual(each(expected.selection));
    expect(bySize(SHAPE_RECIPES.checkbox.mark)).toEqual(each((size) => expected.selection(size) / 2));
    expect(bySize(SHAPE_RECIPES.checkbox.short)).toEqual(each((size) => expected.selection(size) / 4));
    expect(bySize(SHAPE_RECIPES.radio.dot)).toEqual(each((size) => expected.selection(size) * SHAPE_SOURCE.anatomy.radio.dot));
    expect(bySize(SHAPE_RECIPES.switch.width)).toEqual(each((size) => expected.trackHeight(size) * SHAPE_SOURCE.anatomy.switch.length));
    expect(bySize(SHAPE_RECIPES.switch.height)).toEqual(each(expected.trackHeight));
    expect(bySize(SHAPE_RECIPES.switch.thumb)).toEqual(each(expected.thumb));
  });

  it("[foundations.shape.recipe-geometry] makes one textarea row exactly one control tall, whether its frame keeps room for a line or not", () => {
    expect(bySize(CONTROL.area.paddingBlock)).toEqual(each(expected.textareaPadding));
    for (const room of [0, SHAPE_SOURCE.stroke.border]) {
      const at = new Map([...resolvable, [CONTROL_LINE_PROPERTY, `${room}px`]]);
      const padding = CONTROL_SIZES.map((size) => resolveDp(CONTROL.area.paddingBlock[size]!, at));
      expect(padding, `room ${room}`).toEqual(each((size) => expected.textareaPadding(size) - room));
      CONTROL_SIZES.forEach((size, i) => expect(lineOf(PRESET_SPEC.textarea[size].leading) + padding[i]! * 2 + room * 2, `room ${room}`).toBe(SHAPE_SOURCE.control.height[size]));
    }
  });

  it("[foundations.shape.recipe-geometry] gives a control the icon its size names, and a Spinner the same ring", () => {
    expect(bySize(tokens.shape.control.icon)).toEqual(each(expected.icon));
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
    expect([x, y].map((ratio) => ratio * SHAPE_SOURCE.stroke.emphasis)).toEqual([SHAPE_SOURCE.stroke.emphasis / 4, SHAPE_SOURCE.stroke.emphasis / -2]);
  });

  it("[foundations.shape.target-reach] [foundations.shape.target-table] sets the minimum target in CSS px and reaches only as far as a mark falls short", () => {
    expect(SHAPE_VALUES.target.min).toBe(`${SHAPE_SOURCE.target.min}px`);
    expect(declarations.get("--pui-shape-target-min")).toBe(`${SHAPE_SOURCE.target.min}px`);
    expect(tokens.shape.target.min).toBe("var(--pui-shape-target-min)");
    expect(bySize(SHAPE_RECIPES.target.selection)).toEqual(each((size) => expected.reach(expected.selection(size))));
    expect(bySize(SHAPE_RECIPES.target.switchBlock)).toEqual(each((size) => expected.reach(expected.trackHeight(size))));
    expect(CONTROL_SIZES.map((size) => dp(targetReach(tokens.shape.control.icon[size])))).toEqual(each((size) => expected.reach(expected.icon(size))));
    expect(dp(targetReach("30px"))).toBe(0);
    expect(dp(targetReach(tokens.shape.target.min))).toBe(0);
    expect(dp(targetReach("100px"))).toBe(0);
    for (const reach of Object.values(SHAPE_RECIPES.target).flatMap((role) => bySize(role))) expect(reach).toBeLessThanOrEqual(0);
  });
});

describe("what the Shape page says", () => {
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

  it("[foundations.override.worked-example] says what one source override derives to: 36 tall and input inset 10, while the button inset (17) and the marks keep their own sources", () => {
    const overridden = new Map([...resolvable, ["--pui-shape-control-height-md", "36px"]]);
    const at = (role: string) => resolveDp(role, overridden);
    expect(at(tokens.shape.control.height.md)).toBe(36);
    expect(at(tokens.shape.control.inset.input.md)).toBe(10);
    expect(at(tokens.shape.control.inset.button.md)).toBe(17);
    expect(at(tokens.shape.selection.size.md)).toBe(SHAPE_SOURCE.selection.size.md);
    expect(at(SHAPE_RECIPES.switch.width.md)).toBe((SHAPE_SOURCE.selection.size.md + SHAPE_SOURCE.stroke.emphasis) * SHAPE_SOURCE.anatomy.switch.length);
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
    expect(cells(docRow("`target.selection`").replace(/\| targetReach\([^|]*\) /, "")).slice(0, 5)).toEqual(bySize(SHAPE_RECIPES.target.selection));
    expect(cells(docRow("`target.switchBlock`").replace(/\| targetReach\([^|]*\) /, "")).slice(0, 5)).toEqual(bySize(SHAPE_RECIPES.target.switchBlock));
    expect(cells(docRow("`target.action`").replace(/\| targetReach\([^|]*\) /, "")).slice(0, 5)).toEqual(CONTROL_SIZES.map((size) => dp(targetReach(tokens.shape.control.icon[size]))));
  });

  it("[foundations.shape.radius-separate] keeps the surface family and the control corner apart, whatever their values", () => {
    expect(tokens.shape.radius.surface.sm).not.toBe(tokens.shape.radius.control.sm);
    expect(declarations.has("--pui-shape-radius-surface-sm")).toBe(true);
    expect(declarations.has("--pui-shape-radius-control-sm")).toBe(true);
  });
});

describe("a selection box derives its parts by one set of formulas", () => {
  it("[foundations.shape.geometry-entry] reads the same over a size and over the variable an element holds", () => {
    expect(markParts("BOX").half).toBe("calc(BOX / 2)");
    expect(markParts("BOX").short).toBe("calc(calc(BOX / 2) / 2)");
    expect(markParts("BOX").trackWidth).toBe(`calc(${markParts("BOX").trackHeight} * ${ANATOMY.switch.length})`);
    expect(markParts("BOX").thumbWidth).toBe(markParts("BOX").thumb);
    for (const size of CONTROL_SIZES) {
      const parts = markParts(tokens.shape.selection.size[size]);
      expect(SHAPE_RECIPES.checkbox.mark[size], size).toBe(parts.half);
      expect(SHAPE_RECIPES.checkbox.short[size], size).toBe(parts.short);
      expect(SHAPE_RECIPES.checkbox.dash.width[size], size).toBe(parts.half);
      expect(SHAPE_RECIPES.radio.dot[size], size).toBe(parts.dot);
      expect(SHAPE_RECIPES.switch.width[size], size).toBe(parts.trackWidth);
      expect(SHAPE_RECIPES.switch.height[size], size).toBe(parts.trackHeight);
      expect(SHAPE_RECIPES.switch.thumb[size], size).toBe(parts.thumb);
      expect(SHAPE_RECIPES.target.selection[size], size).toBe(parts.reach);
      expect(SHAPE_RECIPES.target.switchBlock[size], size).toBe(parts.trackReach);
    }
  });

  it("[foundations.shape.recipe-geometry] sizes what is drawn inside the selection box", () => {
    const half = each((size) => expected.selection(size) / 2);
    expect(bySize(SHAPE_RECIPES.checkbox.mark)).toEqual(half);
    expect(bySize(SHAPE_RECIPES.checkbox.short)).toEqual(each((size) => expected.selection(size) / 4));
    expect(bySize(SHAPE_RECIPES.checkbox.dash.width)).toEqual(half);
    expect(bySize(SHAPE_RECIPES.radio.dot)).toEqual(each((size) => expected.selection(size) * SHAPE_SOURCE.anatomy.radio.dot));
  });

  it("[foundations.shape.recipe-geometry] sizes the switch track, its thumb at the rim, and how far the thumb travels", () => {
    const rim = SHAPE_SOURCE.stroke.emphasis;
    const width = (size: ControlSize) => expected.trackHeight(size) * SHAPE_SOURCE.anatomy.switch.length;
    expect(bySize(SHAPE_RECIPES.switch.width)).toEqual(each(width));
    expect(bySize(SHAPE_RECIPES.switch.height)).toEqual(each(expected.trackHeight));
    expect(bySize(SHAPE_RECIPES.switch.thumb)).toEqual(each(expected.thumb));
    expect(bySize(SHAPE_RECIPES.switch.thumbWidth)).toEqual(each(expected.thumb));
    expect(dp(SHAPE_RECIPES.switch.inset)).toBe(rim);
    expect(bySize(SHAPE_RECIPES.switch.travel)).toEqual(each((size) => width(size) - expected.thumb(size) - rim - rim));
  });

  it("[foundations.shape.recipe-geometry] sizes the badge and the spinner", () => {
    expect(bySize(SHAPE_RECIPES.badge.height)).toEqual(each((size) => SHAPE_SOURCE.anatomy.badge.height[size]));
    expect(bySize(SHAPE_RECIPES.badge.inset)).toEqual(each((size) => SHAPE_SOURCE.anatomy.badge.inset[size]));
    expect(bySize(SHAPE_RECIPES.spinner.size)).toEqual(each(expected.icon));
    expect(SHAPE_RECIPES.spinner.inline).toBe("var(--pui-shape-anatomy-inline-spinner)");
    expect(resolvable.get("--pui-shape-anatomy-inline-spinner")).toBe("1em");
  });
});

describe("CONTROL ties a size across Shape and Typography", () => {
  it("[foundations.control.formulas] gives every size the insets and the textarea padding the sources work out to", () => {
    expect(bySize(CONTROL.inset.input)).toEqual(each(expected.inputInset));
    expect(bySize(CONTROL.inset.button)).toEqual(each(expected.buttonInset));
    expect(bySize(CONTROL.area.paddingBlock)).toEqual(each(expected.textareaPadding));
    expect(bySize(CONTROL.select.paddingEnd)).toEqual(each((size) => expected.inputInset(size) + expected.icon(size) + source_.space.sm));
    expect(bySize(CONTROL.inputLine)).toEqual(each((size) => lineOf(PRESET_SPEC.field[size].inputLeading)));
  });

  it("[foundations.control.formulas] is what the public control insets point at", () => {
    expect(tokens.shape.control.inset).toBe(CONTROL.inset);
  });

  it("[foundations.control.formulas] records the numbers in its golden file", async () => {
    await expect(`${JSON.stringify(resolvedTree(CONTROL), null, 2)}\n`).toMatchFileSnapshot("./__golden__/control-resolved.json");
  });
});

describe("nestedRadius keeps two curves parallel", () => {
  it("[foundations.shape.nested-radius] is the outer corner less the distance, and never below a square corner", () => {
    expect(dp(nestedRadius(tokens.shape.radius.surface.sm, tokens.shape.inset.sm).replace(/^max\(0px, (.*)\)$/, "$1"))).toBe(source_.radius.surface.sm - source_.space.sm);
    expect(nestedRadius("A", "B")).toBe("max(0px, calc(A - B))");
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
    for (const mode of COLOR_MODES) {
      for (const depth of DEPTHS) {
        expect(Object.values(LAYOUT_MODE_VALUES[mode].shadow[depth]), `${mode} ${depth}`).toEqual(LAYOUT_SOURCE.shadow[mode][depth].map((layer) => layer.map((value) => `${value}px`).join(" ")));
      }
    }
  });

  it("[foundations.layout.shadow-geometry] has four depths, draws dark no wider than light layer by layer, and spreads dark's floating depth inward", () => {
    expect([...DEPTHS].sort()).toEqual(["floating", "inset", "lifted", "resting"]);
    const reach = (layer: readonly number[]) => layer[2]! + layer[3]!;
    for (const depth of DEPTHS) {
      LAYOUT_SOURCE.shadow.dark[depth].forEach((layer, index) => expect(reach(layer), `${depth} ${index}`).toBeLessThanOrEqual(reach(LAYOUT_SOURCE.shadow.light[depth][index]!)));
    }
    for (const layer of LAYOUT_SOURCE.shadow.dark.floating) expect(layer[3]).toBeLessThan(0);
  });

  it("[foundations.layout.emission] [foundations.layout.shadow-geometry] emits the geometry as ground variables of each mode and nothing else of Layout per mode", () => {
    for (const mode of COLOR_MODES) {
      const layoutNames = Object.keys(modes[mode].ground).filter((name) => name.startsWith("--pui-layout-"));
      expect(layoutNames, mode).toEqual(["--pui-layout-shadow-resting-0", "--pui-layout-shadow-lifted-0", "--pui-layout-shadow-floating-0", "--pui-layout-shadow-floating-1", "--pui-layout-shadow-inset-0"]);
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
