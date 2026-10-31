import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { STATE_TINT_PROPERTY } from "../tokens";
import { MARKER_ATTRIBUTE, STATE_ATTRIBUTE, VALUE_ATTRIBUTE } from "../tokens/state";

const src = dirname(dirname(fileURLToPath(import.meta.url)));
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
const stylesheets = (dir: string): string[] => walk(dir).filter((file) => file.endsWith(".css.ts"));
const read = (path: string) => readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("states.css", () => {
  const source = read(join(src, "styles", "states.css.ts"));

  it("[foundations.state.tint-property] registers the tint as a transparent colour that no child inherits, under the name the recipes use", () => {
    expect(STATE_TINT_PROPERTY).toBe("--pui-state-tint");
    expect(source).toMatch(/createGlobalVar\(\s*STATE_TINT_PROPERTY,\s*\{\s*syntax:\s*"<color>",\s*inherits:\s*false,\s*initialValue:\s*"transparent"\s*\}\s*\)/);
    expect(source).not.toContain("pui-state-tint");
  });

  it("[foundations.shape.focus-ring] draws the keyboard ring on :where(:focus-visible) from the ring recipe, and touches no corner", () => {
    expect(source).toMatch(/base\.globalStyle\(":where\(:focus-visible\)", focusRing\)/);
    expect(source).not.toMatch(/borderRadius|border-radius/);
  });

  it("[foundations.shape.focus-ring] is the only global rule on :focus-visible in the package", () => {
    const rules = stylesheets(src).flatMap((file) =>
      [...read(file).matchAll(/globalStyle\(\s*([`"'])((?:(?!\1).)*)\1/g)].filter(([, , selector]) => /focus-visible/.test(selector!)).map(([, , selector]) => `${relative(src, file)}: ${selector}`),
    );
    expect(rules).toEqual([`${join("styles", "states.css.ts")}: :where(:focus-visible)`]);
  });
});

// The whole package source, tests aside: where a state is spelled is where it can drift.
describe("the package source", () => {
  const sources = walk(src).filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file));
  const inside = (file: string, ...homes: string[]) => homes.some((home) => relative(src, file) === home || relative(src, file).startsWith(`${home}${sep}`));

  // The state recipes, the ring baseline and the Paint primitives (the accent × variant map and what the paint tier lends) are where a pointer,
  // a press and the keyboard are selected. Everything else asks for a recipe.
  const STATE_SELECTOR_HOMES = [join("styles", "states.css.ts"), join("tokens", "state-recipes.ts"), join("styles", "color.css.ts"), join("primitives", "paint")];

  it("[foundations.state.source-scan] selects :hover, :active and :focus-visible only in the state recipes, the ring baseline and the paint tier", () => {
    expect(sources.length).toBeGreaterThan(0);
    const offenders = sources
      .filter((file) => !inside(file, ...STATE_SELECTOR_HOMES) && /:(?:hover|active|focus-visible)(?![\w-])/.test(read(file)))
      .map((file) => relative(src, file));
    expect(offenders).toEqual([]);
  });

  it("[foundations.state.source-scan] spells no state, value or marker attribute outside tokens/state.ts", () => {
    const attributes = [...Object.values(STATE_ATTRIBUTE), ...Object.values(VALUE_ATTRIBUTE), ...Object.values(MARKER_ATTRIBUTE)];
    const offenders = sources
      .filter((file) => relative(src, file) !== join("tokens", "state.ts"))
      .flatMap((file) => {
        const code = read(file);
        return attributes.filter((attribute) => new RegExp(`(?<![\\w-])${attribute}(?![\\w-])`).test(code)).map((attribute) => `${relative(src, file)}: ${attribute}`);
      });
    expect(offenders).toEqual([]);
  });

  it("[foundations.state.source-scan] finds the spelling it looks for", () => {
    const spelled = readFileSync(join(src, "tokens", "state.ts"), "utf8");
    for (const attribute of Object.values(STATE_ATTRIBUTE)) expect(spelled).toContain(attribute);
    expect(read(join(src, "tokens", "state-recipes.ts"))).toMatch(/:hover/);
  });
});
