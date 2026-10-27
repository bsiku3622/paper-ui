import { describe, expect, it } from "vitest";

import { tokens } from "./index";
import { walkValues, pathToCssVar } from "./helpers";
import { SHAPE_VALUES, SHADOW_NAMES } from "./shape";
import { SHAPE_LEGACY_VALUES } from "./shape-legacy";
import { SHAPE_RECIPE_VALUES, SHAPE_RECIPES } from "./shape-recipes";
import { LAYOUT_VALUES } from "./layout";
import { TEXT_VALUES } from "./text";

describe("shape token contracts", () => {
  it("every public, legacy and recipe reference resolves without a dependency cycle", () => {
    const declarations = new Map<string, string>();
    const emit = (path: readonly string[], value: string) => declarations.set(pathToCssVar(path), value);
    walkValues(SHAPE_VALUES, ["shape"], emit);
    walkValues(SHAPE_LEGACY_VALUES, ["shape"], emit);
    walkValues(SHAPE_RECIPE_VALUES, ["geometry"], emit);
    walkValues(LAYOUT_VALUES, ["layout"], emit);
    walkValues(TEXT_VALUES, [], emit);
    for (const name of SHADOW_NAMES) declarations.set(pathToCssVar(["shape", "shadow", name]), "shadow assembled by theme");

    const resolve = (value: string, ancestors: string[] = []) => {
      for (const [, name] of value.matchAll(/var\((--pui-[\w-]+)\)/g)) {
        if (!name) throw new Error("Missing variable name");
        expect(declarations.has(name), `missing ${name}`).toBe(true);
        expect(ancestors, `cycle at ${name}`).not.toContain(name);
        resolve(declarations.get(name)!, [...ancestors, name]);
      }
    };
    walkValues(tokens.shape, [], (_path, value) => resolve(value));
    walkValues(SHAPE_RECIPES, [], (_path, value) => resolve(value));
  });

  it("Box surface corners and selection marks have independent owners", () => {
    expect(tokens.shape.radius.surface.sm).not.toBe(tokens.shape.radius.control);
    expect(SHAPE_RECIPES.radio.dot.sm).not.toContain("checkbox");
    expect(SHAPE_RECIPES.textarea.minHeight).not.toContain("layout-height");
    expect(SHAPE_RECIPES.select.paddingEnd).not.toContain("shape-space");
  });
});
