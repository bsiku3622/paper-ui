import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { markBox, markReset } from "./recipes/mark.css";

const atoms = dirname(fileURLToPath(import.meta.url));
const stylesheets = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? stylesheets(join(dir, entry.name)) : entry.name.endsWith(".css.ts") ? [join(dir, entry.name)] : []));
const read = (path: string) => readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("the Atom stylesheets", () => {
  it("[primitives.orders.colour] never reference tokens.color: their colour is the paint tier's", () => {
    const files = stylesheets(atoms);
    expect(files.length).toBeGreaterThanOrEqual(13);
    expect(files.some((file) => relative(atoms, file).startsWith("recipes"))).toBe(true);
    for (const file of files) expect(read(file), relative(atoms, file)).not.toMatch(/tokens\.color\b/);
  });

  it("let a selection box compose its reset instead of repeating it", () => {
    expect(markBox.split(" ")).toContain(markReset);
  });
});
