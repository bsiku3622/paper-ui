import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { STRUCTURAL } from "../../../../eslint-rules/structural.js";
import * as barrel from "./index";
import * as vocabulary from "./vocabulary";

const FUNCTIONS = [
  "elevationStack", "elevationCast", "elevationStyle", "accentProfile", "controlSizes", "strokeRing", "nestedRadius", "markParts", "targetReach", "lineFrame", "lineRule", "insideLine", "typographyRule", "monoRule", "codeRule", "presetRule", "emphasisRule",
  "stateSelector", "stateAttributes", "previewSelector", "previewAttributes", "transition", "isStylesheetLoaded", "unknownSourceVariables", "overridesRule",
];

const NAMES = [
  "THEME_ATTRIBUTE", "THEME_SWAP_ATTRIBUTE", "COLOR_MODE_QUERY", "SOURCE_VARIABLES", "STATE_ATTRIBUTE", "VALUE_ATTRIBUTE", "MARKER_ATTRIBUTE", "PREVIEW_ATTRIBUTE",
  "SELECTED_SELECTOR", "ENABLED_SELECTOR", "STATE_TINT_PROPERTY", "CONTROL_LINE_PROPERTY", "VARIANT_LINE", "SYSTEM_COLORS", "TEXT_INK", "CONTROL_ICON", "CONTROL_ANATOMY_PRESET", "MOTION_CONSUMERS",
];

const COMPOSITION = [
  "ELEVATION", "restingCast", "insetCast", "SHAPE_RECIPES", "CONTROL", "markProfile", "markForcedProfile", "outlinedControlProfile", "itemProfile", "focusRing", "stateStyle", "linkStyle", "STATE_TINT", "CONTROL_LINE", "CONTROL_LINE_ROOM", "controlLineWidth",
];

const VALUE_ROLES: Record<string, string> = {
  "tokens.layout.breakpoint": "a media query cannot read a variable, so a breakpoint is its value, in em",
  "tokens.layout.section": "the declared fluid exception: a distance that follows the viewport height",
  "tokens.layout.viewport": "the whole height of the window: an extent the browser measures, with no source value behind it",
  "tokens.motion": "a role holds its time and curve as values; only its displacement points at Shape and Layout variables",
  MOTION: "the motion roles themselves, read by styles/motion.css.ts",
  MOTION_LOOPS: "the loops' frames, time and curve, read by styles/motion.css.ts",
  MOTION_REDUCED: "the reduced-motion duration, read by styles/motion.css.ts",
  REVEAL_AFTER: "the delays a reveal's siblings wait, whole steps of the duration scale, read by styles/motion.css.ts",
  ELEVATION_NEST_LIMIT: "a count derived from the elevation source",
};

const exportsOf = (module: object) => Object.entries(module) as [string, unknown][];
const isVariable = (value: string) => /^var\(--pui-[\w-]+\)$/.test(value);
const strip = (value: string) => value.replace(/var\(--[\w-]+\)/g, "var()");

type Leaf = { path: string; value: unknown };
const leaves = (value: unknown, path: string, found: Leaf[] = []): Leaf[] => {
  if (typeof value === "function") return found;
  if (Array.isArray(value)) value.forEach((item, index) => leaves(item, `${path}[${index}]`, found));
  else if (value !== null && typeof value === "object") for (const [key, child] of Object.entries(value)) leaves(child, `${path}.${key}`, found);
  else found.push({ path, value });
  return found;
};

const underValueRole = (path: string) => Object.keys(VALUE_ROLES).some((role) => path === role || path.startsWith(`${role}.`));

describe("the tokens barrel", () => {
  it("[foundations.barrel.roles-only] classifies every export: a composition function, a vocabulary pair, a spelled name, composition or a documented value role", () => {
    const vocabularyNames = new Set(Object.keys(vocabulary));
    const placed = new Set([...vocabularyNames, ...FUNCTIONS, ...NAMES, ...COMPOSITION, ...Object.keys(VALUE_ROLES).filter((role) => !role.includes(".")), "tokens"]);
    for (const [name] of exportsOf(barrel)) expect(placed.has(name), `${name} is not a role, function, vocabulary, name, composition or value role`).toBe(true);
    for (const name of [...FUNCTIONS, ...NAMES, ...COMPOSITION]) expect(name in barrel, `${name} left the barrel`).toBe(true);
    for (const name of FUNCTIONS) expect(typeof (barrel as Record<string, unknown>)[name], name).toBe("function");
    for (const role of Object.keys(VALUE_ROLES)) {
      const [head, ...rest] = role.split(".");
      const root = head === "tokens" ? barrel.tokens : (barrel as Record<string, unknown>)[head!];
      expect(rest.reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], root), role).toBeDefined();
    }
  });

  it("[foundations.barrel.roles-only] drops the source trees, the VALUES trees and the helpers", () => {
    for (const name of [
      "STATUS_PALETTE", "COLOR_VALUES", "PALETTE_TOKENS", "SHAPE_SOURCE", "SHAPE_VALUES", "LAYOUT_SOURCE", "LAYOUT_VALUES", "TYPOGRAPHY_SOURCE", "TYPOGRAPHY_VALUES", "ROLE_SPEC", "PRESET_SPEC",
      "DURATION", "EASING", "LOOP", "kebab", "pathToCssVar", "pathToVarRef", "walkValues", "buildVarTree", "keys", "lengths",
    ]) expect(name in barrel, name).toBe(false);
  });

  it("[foundations.barrel.roles-only] gives the roles tree only variable references, formulas over them and the documented value roles", () => {
    for (const { path, value } of leaves(barrel.tokens, "tokens")) {
      if (underValueRole(path)) continue;
      expect(typeof value, path).toBe("string");
      const text = value as string;
      expect(isVariable(text) || (/^(?:calc|round|min|max|clamp)\(/.test(text) && strip(text).includes("var()")), `${path} = ${text}`).toBe(true);
    }
  });

  it("[foundations.barrel.roles-only] gives composition leaves that refer to roles, or are keywords", () => {
    for (const name of COMPOSITION) {
      for (const { path, value } of leaves((barrel as Record<string, unknown>)[name], name)) {
        if (value === null) continue;
        if (typeof value === "number") {
          expect(STRUCTURAL.unitless.values, `${path} = ${value}`).toContain(value);
          continue;
        }
        expect(typeof value, path).toBe("string");
        const bare = strip(value as string);
        expect(bare.includes("var()") || !/\d|#/.test(bare), `${path} = ${value}`).toBe(true);
      }
    }
  });

  it("[foundations.barrel.roles-only] gives the spelled names no length, colour or time", () => {
    for (const name of NAMES) {
      for (const { path, value } of leaves((barrel as Record<string, unknown>)[name], name)) {
        expect(typeof value, path).toBe("string");
        expect(value as string, path).not.toMatch(/\d(?:\.\d+)?(?:px|rem|em|ms|vh|vw|%)|#[\da-f]{3,8}\b|(?:rgb|hsl|oklch)\(/i);
      }
    }
  });
});

describe("the Foundations have two orders", () => {
  const FIRST = [
    { name: "Color", files: ["palette", "color-ladder", "colors", "color-recipes"] },
    { name: "Typography", files: ["typography", "typography-recipes"] },
    { name: "Shape", files: ["shape", "shape-recipes"] },
    { name: "Layout", files: ["layout"] },
    { name: "Motion", files: ["motion"] },
  ];
  const SECOND = ["line-recipes", "control-recipes", "elevation-recipes", "motion-recipes", "state", "state-recipes"];
  const SHARED = ["helpers", "color-modes", "control-sizes"];
  const FIRST_ORDER_EDGES: Record<string, string[]> = { layout: ["shape"] };
  const SECOND_ORDER_EDGES: Record<string, string[]> = { "state-recipes": ["state", "motion-recipes"] };
  const here = dirname(fileURLToPath(import.meta.url));
  const importsOf = (file: string) => [...readFileSync(join(here, `${file}.ts`), "utf8").matchAll(/^(?:import|export)\s(?!type\s)[^;'"]*?from\s*["']\.\/([^"']+)["']/gm)].map(([, from]) => from!);

  it("[foundations.orders.first] a first-order system reads no other system, but for the one edge the table names", () => {
    const crossing = FIRST.flatMap(({ files }) => files.flatMap((file) =>
      importsOf(file).filter((from) => !SHARED.includes(from) && !files.includes(from) && !(FIRST_ORDER_EDGES[file] ?? []).includes(from)).map((from) => `${file} reads ${from}`),
    ));
    expect(crossing).toEqual([]);
  });

  it("[foundations.orders.second] a second-order file reads the first order and no other second-order file, but for the one edge the table names", () => {
    const crossing = SECOND.flatMap((file) =>
      importsOf(file).filter((from) => SECOND.includes(from) && !(SECOND_ORDER_EDGES[file] ?? []).includes(from)).map((from) => `${file} reads ${from}`),
    );
    expect(crossing).toEqual([]);
    const upward = FIRST.flatMap(({ files }) => files.flatMap((file) => importsOf(file).filter((from) => SECOND.includes(from)).map((from) => `${file} reads ${from}`)));
    expect(upward).toEqual([]);
  });

  it("[foundations.systems.sources] writes each system's source in the file its row names, and each tie between systems in its second-order file", () => {
    for (const [variant, ink] of Object.entries(barrel.TEXT_INK)) expect(barrel.INK_LEVELS, variant).toContain(ink);
    for (const [file, source] of [["palette", "OKLCH_PALETTE"], ["typography", "TYPOGRAPHY_SOURCE"], ["shape", "SHAPE_SOURCE"], ["layout", "LAYOUT_SOURCE"], ["motion", "DURATION"]] as const) {
      expect(readFileSync(join(here, `${file}.ts`), "utf8"), file).toContain(`export const ${source}`);
    }
    expect(importsOf("line-recipes")).toEqual(expect.arrayContaining(["colors", "shape"]));
    expect(importsOf("control-recipes")).toEqual(expect.arrayContaining(["shape", "typography"]));
    expect(importsOf("elevation-recipes")).toEqual(expect.arrayContaining(["colors", "layout"]));
    expect(importsOf("motion-recipes")).toEqual(expect.arrayContaining(["motion", "shape", "layout"]));
  });

  it("[foundations.systems.differences] differs from the others only where the table says", () => {
    const text = (file: string) => readFileSync(join(here, `${file}.ts`), "utf8");
    expect(text("palette")).toContain("export const OKLCH_PALETTE");
    expect(text("colors")).toMatch(/export const COLOR_VALUES = mapLeaves\(COLOR_SELECTION\.light/);
    expect(text("motion")).not.toMatch(/\bMOTION_VALUES\b/);
    expect(barrel.tokens.motion).toEqual({ role: barrel.MOTION });
    for (const name of ["DURATION", "EASING", "LOOP"]) expect(text("motion"), name).toMatch(new RegExp(`const ${name}\\b`));
    expect(text("layout")).toMatch(/export const LAYOUT_VALUES = \{\n  container:[^\n]*\n  elevation:/);
    expect(text("layout")).toContain("gutter: SPACE.lg");
    for (const name of ["typographyRule", "presetRule", "transition", "stateStyle"]) expect(text("public"), name).toContain(name);
    for (const name of ["SHAPE_RECIPES", "accentProfile", "markProfile"]) expect(text("public"), name).not.toContain(name);
  });
});
