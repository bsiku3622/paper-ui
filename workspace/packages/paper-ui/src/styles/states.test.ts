import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { STATE_TINT_PROPERTY } from "../tokens";

const src = dirname(dirname(fileURLToPath(import.meta.url)));
const stylesheets = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? stylesheets(join(dir, entry.name)) : entry.name.endsWith(".css.ts") ? [join(dir, entry.name)] : []));
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
