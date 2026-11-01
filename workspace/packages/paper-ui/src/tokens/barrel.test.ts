import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { STRUCTURAL } from "../../../../eslint-rules/structural.js";
import * as barrel from "./index";
import * as vocabulary from "./vocabulary";

// The barrel is what the rest of the package reads: roles, vocabulary and composition, never a source tree, a
// VALUES tree or a helper. Every export is classified here, so a new one fails until it has a place; the
// source modules and helpers sit behind src/tokens and are reached only through the inspector (tokens/inspect).

// Composition functions: they take a name or a role and return a declaration, a class-free style fragment or a string.
const FUNCTIONS = [
  "elevationStack", "elevationCast", "elevationStyle", "accentProfile", "controlSizes", "strokeRing", "typographyRule", "monoRule", "codeRule", "presetRule", "emphasisRule",
  "stateSelector", "stateAttributes", "transition", "isStylesheetLoaded",
];

// Names the package spells: attributes, selectors, queries, the system colours a component may ask for.
const NAMES = [
  "THEME_ATTRIBUTE", "THEME_SWAP_ATTRIBUTE", "COLOR_MODE_QUERY", "SOURCE_VARIABLES", "STATE_ATTRIBUTE", "VALUE_ATTRIBUTE", "MARKER_ATTRIBUTE",
  "SELECTED_SELECTOR", "ENABLED_SELECTOR", "STATE_TINT_PROPERTY", "SYSTEM_COLORS", "TEXT_INK", "CONTROL_ICON", "MOTION_CONSUMERS",
];

// Composition: plain objects whose leaves refer to roles. A leaf is a variable reference, a formula or style
// function over references, or a keyword (none, underline, a system colour) with no number in it.
const COMPOSITION = [
  "ELEVATION", "SHAPE_RECIPES", "markProfile", "markForcedProfile", "outlinedControlProfile", "itemProfile", "focusRing", "stateStyle", "linkStyle", "STATE_TINT",
];

// Value roles: the few places a number is the role itself, with the reason.
const VALUE_ROLES: Record<string, string> = {
  "tokens.layout.breakpoint": "a media query cannot read a variable, so a breakpoint is its value, in em",
  "tokens.layout.section": "the declared fluid exception: a distance that follows the viewport height",
  "tokens.motion": "a role holds its time and curve as values; only its displacement points at Shape and Layout variables",
  MOTION: "the motion roles themselves, read by styles/motion.css.ts",
  MOTION_LOOPS: "the loops' frames, time and curve, read by styles/motion.css.ts",
  MOTION_REDUCED: "the reduced-motion duration, read by styles/motion.css.ts",
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
        // A reference, a function over references, or a keyword: nothing with a number and no reference.
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

describe("the five systems stack in one direction", () => {
  const SYSTEMS = [
    { name: "Color", files: ["palette", "color-ladder", "color-modes", "colors", "color-recipes"] },
    { name: "Typography", files: ["typography", "typography-recipes"] },
    { name: "Shape", files: ["shape", "shape-recipes"] },
    { name: "Layout", files: ["layout", "elevation-recipes"] },
    { name: "Motion", files: ["motion"] },
  ];
  const here = dirname(fileURLToPath(import.meta.url));
  const importsOf = (file: string) => [...readFileSync(join(here, `${file}.ts`), "utf8").matchAll(/^(?:import|export)\s[^;'"]*?from\s*["']\.\/([^"']+)["']/gm)].map(([, from]) => from!);
  const systemOf = (file: string) => SYSTEMS.findIndex(({ files }) => files.includes(file));

  it("[foundations.systems.one-way] reads only the systems before it", () => {
    const backward = SYSTEMS.flatMap(({ name, files }, position) => files.flatMap((file) =>
      importsOf(file).filter((from) => from !== "helpers" && systemOf(from) > position).map((from) => `${name}: ${file} reads ${from}`),
    ));
    expect(backward).toEqual([]);
  });

  it("[foundations.systems.sources] takes from the systems before it what its row names, and writes its source in the file its row names", () => {
    expect(importsOf("shape")).toContain("typography");
    expect(importsOf("layout")).toEqual(expect.arrayContaining(["shape", "colors"]));
    expect(importsOf("motion")).toEqual(expect.arrayContaining(["shape", "layout"]));
    // A Typography role names its default ink, which Color defines.
    for (const [variant, ink] of Object.entries(barrel.TEXT_INK)) expect(barrel.INK_LEVELS, variant).toContain(ink);
    for (const [file, source] of [["palette", "OKLCH_PALETTE"], ["typography", "TYPOGRAPHY_SOURCE"], ["shape", "SHAPE_SOURCE"], ["layout", "LAYOUT_SOURCE"], ["motion", "DURATION"]] as const) {
      expect(readFileSync(join(here, `${file}.ts`), "utf8"), file).toContain(`export const ${source}`);
    }
  });

  it("[foundations.systems.differences] differs from the others only where the table says", () => {
    const text = (file: string) => readFileSync(join(here, `${file}.ts`), "utf8");
    // Colour: the coordinates are the source, and COLOR_VALUES is what the selection table picks from them.
    expect(text("palette")).toContain("export const OKLCH_PALETTE");
    expect(text("colors")).toMatch(/export const COLOR_VALUES = mapLeaves\(COLOR_SELECTION\.light/);
    // Motion: strings for a source, no tree of values, nothing emitted.
    expect(text("motion")).not.toMatch(/\bMOTION_VALUES\b/);
    expect(barrel.tokens.motion).toEqual({ role: barrel.MOTION });
    for (const name of ["DURATION", "EASING", "LOOP"]) expect(text("motion"), name).toMatch(new RegExp(`const ${name}\\b`));
    // Layout: what it emits as a tree is the containers and the stacking order; the rest points at Shape.
    expect(text("layout")).toMatch(/export const LAYOUT_VALUES = \{\n  container:[^\n]*\n  elevation:/);
    expect(text("layout")).toContain("gutter: SPACE.lg");
  });
});
