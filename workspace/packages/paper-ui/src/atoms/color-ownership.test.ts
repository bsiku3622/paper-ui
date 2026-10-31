// 색의 주인은 하나다 — accent 색을 입는 Atom 의 stylesheet 는 색 토큰을 가리키지 않는다.
// 색은 accent × variant 지도(styles/color.css.ts)가 붙이는 class 로만 온다.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { controlReset, selectionBox } from "./recipes/selection-control.css";

const stylesheet = (name: string) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), `${name}.css.ts`), "utf8");

describe("the Atom recipes", () => {
  it("never reference tokens.color: their colour is the paint tier's", () => {
    const recipes = join(dirname(fileURLToPath(import.meta.url)), "recipes");
    const files = readdirSync(recipes).filter((file) => file.endsWith(".css.ts"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(readFileSync(join(recipes, file), "utf8"), file).not.toMatch(/tokens\.color\b/);
  });

  it("let a selection box compose its reset instead of repeating it", () => {
    expect(selectionBox.split(" ")).toContain(controlReset);
  });
});

describe("accent-coloured Atoms", () => {
  it("never reference tokens.color in their stylesheet", () => {
    for (const atom of ["Button", "Badge"]) expect(stylesheet(atom), atom).not.toMatch(/tokens\.color\b/);
  });
});
