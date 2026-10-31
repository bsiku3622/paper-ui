// 색의 주인은 하나다 — Atom 의 stylesheet 는 색 토큰을 가리키지 않는다.
// 색은 paint 층(primitives/paint/)이 주는 class 로만 온다: accent × variant 지도(styles/color.css.ts)가 붙이는 class 와,
// Atom 이 빌려 쓰는 recipes.css.ts 의 paint(fieldPaint · markPaint · linePaint …).

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { controlReset, selectionBox } from "./recipes/selection-control.css";

const atoms = dirname(fileURLToPath(import.meta.url));
const stylesheets = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? stylesheets(join(dir, entry.name)) : entry.name.endsWith(".css.ts") ? [join(dir, entry.name)] : []));
const read = (path: string) => readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("the Atom stylesheets", () => {
  it("never reference tokens.color: their colour is the paint tier's", () => {
    const files = stylesheets(atoms);
    // Button, IconButton, Link, Field, Textarea, Select, Checkbox, Radio, Switch, Badge, Spinner, Divider and the two recipes.
    expect(files.length).toBeGreaterThanOrEqual(13);
    expect(files.some((file) => relative(atoms, file).startsWith("recipes"))).toBe(true);
    for (const file of files) expect(read(file), relative(atoms, file)).not.toMatch(/tokens\.color\b/);
  });

  it("let a selection box compose its reset instead of repeating it", () => {
    expect(selectionBox.split(" ")).toContain(controlReset);
  });
});
