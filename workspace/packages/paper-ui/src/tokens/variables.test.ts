import { describe, expect, it } from "vitest";

import { COLOR_MODES } from "./color-modes";
import { pathToCssVar } from "./helpers";
import { tokens } from "./index";
import { LAYOUT_VALUES } from "./layout";
import { SHAPE_VALUES } from "./shape";
import { TYPOGRAPHY_VALUES } from "./typography";
import { themeVariables } from "./variables";

// The leaves of a tree as paths, found here with a walk of its own so that the emitter is held to the trees, not to itself.
const walk = (tree: object, path: string[] = []): { path: string[]; value: unknown }[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    value !== null && typeof value === "object" && !Array.isArray(value) ? walk(value, [...path, key]) : [{ path: [...path, key], value }],
  );
const leafStrings = (tree: object, prefix: string[]) => walk(tree).flatMap(({ path, value }) => (typeof value === "string" ? [{ path: [...prefix, ...path], value }] : []));

const { source, invariant, modes, contrastMore } = themeVariables();
const names = (declarations: Record<string, string>) => Object.keys(declarations).sort();

describe("the stylesheet emits sources and nothing else", () => {
  it("[foundations.emission.source-only] emits, as the mode-independent source, exactly the leaves of the Shape, Layout and Typography value trees", () => {
    const expected = [
      ...walk(SHAPE_VALUES).map(({ path }) => pathToCssVar(["shape", ...path])),
      ...walk(LAYOUT_VALUES).map(({ path }) => pathToCssVar(["layout", ...path])),
      ...walk(TYPOGRAPHY_VALUES).map(({ path }) => pathToCssVar(["typography", ...path])),
    ].sort();
    expect(names(source)).toEqual(expected);
    expect(new Set(expected).size, "no two leaves share a variable").toBe(expected.length);
  });

  it("[foundations.emission.per-system] bakes Color per mode and opacity once, the sources of Shape, Layout and Typography, and nothing of Motion", () => {
    const prefixes = (declarations: Record<string, string>) => [...new Set(Object.keys(declarations).map((name) => /^--pui-([a-z]+)-/.exec(name)![1]))].sort();
    expect(prefixes(source)).toEqual(["layout", "shape", "typography"]);
    expect(Object.keys(source).filter((name) => name.startsWith("--pui-typography-")).every((name) => name.startsWith("--pui-typography-palette-"))).toBe(true);
    expect(names(invariant).every((name) => name.startsWith("--pui-color-opacity-"))).toBe(true);
    expect(names(invariant).length).toBeGreaterThan(0);
    for (const mode of COLOR_MODES) {
      expect(prefixes(modes[mode].own), mode).toEqual(["color"]);
      // A ground role: the shadow colour and the focus ring, and the shadow geometry that goes with them.
      expect(prefixes(modes[mode].ground), mode).toEqual(["color", "layout"]);
      expect(Object.keys(modes[mode].ground).filter((name) => name.startsWith("--pui-layout-")).every((name) => name.startsWith("--pui-layout-shadow-")), mode).toBe(true);
    }
    const all = [...Object.keys(source), ...Object.keys(invariant), ...COLOR_MODES.flatMap((mode) => [...Object.keys(modes[mode].own), ...Object.keys(modes[mode].ground)])];
    expect(all.filter((name) => name.startsWith("--pui-motion-"))).toEqual([]);
  });

  it("[foundations.emission.source-only] gives light and dark the same variables, own and ground, and the same contrast-more lift", () => {
    const [light, dark] = COLOR_MODES.map((mode) => modes[mode]);
    expect(names(dark!.own)).toEqual(names(light!.own));
    expect(names(dark!.ground)).toEqual(names(light!.ground));
    expect(names(contrastMore.dark)).toEqual(names(contrastMore.light));
    // What a mode lifts under prefers-contrast: more is something that mode already declares.
    for (const mode of COLOR_MODES) for (const name of Object.keys(contrastMore[mode])) expect(modes[mode].own, name).toHaveProperty([name]);
  });

  it("[foundations.emission.source-only] declares each variable once across the source, the invariants and a mode", () => {
    for (const mode of COLOR_MODES) {
      const all = [...Object.keys(source), ...Object.keys(invariant), ...Object.keys(modes[mode].own), ...Object.keys(modes[mode].ground)];
      expect(all.filter((name, index) => all.indexOf(name) !== index), mode).toEqual([]);
    }
  });

  const emitted = new Set([...Object.keys(source), ...Object.keys(invariant), ...COLOR_MODES.flatMap((mode) => [...Object.keys(modes[mode].own), ...Object.keys(modes[mode].ground)])]);
  const roles = leafStrings(tokens, []);

  it("[foundations.emission.source-only] names an emitted variable in every var() the tokens hold", () => {
    expect(roles.length).toBeGreaterThan(100);
    const missing = roles.flatMap(({ path, value }) => [...value.matchAll(/var\((--pui-[\w-]+)\)/g)].filter(([, name]) => !emitted.has(name!)).map(([, name]) => `${path.join(".")} → ${name}`));
    expect(missing).toEqual([]);
  });

  it("[foundations.emission.source-only] gives a role no variable of its own: only a token that is its own variable is emitted", () => {
    // tokens.shape.control.height.md is the variable --pui-shape-control-height-md, a source; tokens.shape.inset.xs is an
    // alias of another variable and tokens.shape.control.inset.input a formula, so neither is a name the stylesheet emits.
    const own = roles.filter(({ path, value }) => value === `var(${pathToCssVar(path)})`);
    const roleNames = roles.filter(({ path, value }) => value !== `var(${pathToCssVar(path)})`).map(({ path }) => pathToCssVar(path));
    expect(own.length).toBeGreaterThan(0);
    for (const { path } of own) expect(emitted.has(pathToCssVar(path)), path.join(".")).toBe(true);
    expect(roleNames.length).toBeGreaterThan(0);
    expect(roleNames.filter((name) => emitted.has(name))).toEqual([]);
  });
});
