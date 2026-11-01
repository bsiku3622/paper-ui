import { expect, test, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { LAYOUT_SOURCE } from "../../packages/paper-ui/src/tokens/layout";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { px, roleDp } from "../support/geometry";
import { openHarness, openPlayground } from "../support/harness";

const control = (page: Page, name: string) => page.getByRole("combobox", { name, exact: true });

test("[primitives.grid.token-gap] Grid's computed column and row gap are the gap step it names, whatever its track count, and an axis named on its own wins for that axis", async ({ page }) => {
  await openPlayground(page, "grid", "Grid");
  const grid = page.getByTestId("grid-example");
  const gaps = () => grid.evaluate((node) => ({ column: getComputedStyle(node).columnGap, row: getComputedStyle(node).rowGap, tracks: getComputedStyle(node).gridTemplateColumns.split(" ").length }));
  // The example's gap is sm, as the Playground prints it.
  const sm = `${roleDp(tokens.layout.gap.sm)}px`;
  expect(await gaps()).toEqual({ column: sm, row: sm, tracks: 3 });
  await page.getByRole("combobox", { name: "columns", exact: true }).selectOption("2");
  expect(await gaps()).toEqual({ column: sm, row: sm, tracks: 2 });
  // A step named for one axis moves that axis alone; the other keeps the step `gap` names.
  await page.getByRole("combobox", { name: "rowGap", exact: true }).selectOption("lg");
  expect(await gaps()).toEqual({ column: sm, row: `${roleDp(tokens.layout.gap.lg)}px`, tracks: 2 });
});

test("[primitives.layout.axis-classes] Grid's justifyItems places each item in its cell, and justify distributes the tracks", async ({ page }) => {
  await openPlayground(page, "grid", "Grid");
  const grid = page.getByTestId("grid-example");
  const cell = grid.locator(":scope > *").first();
  const widths = () => cell.evaluate((node) => [node.getBoundingClientRect().width, node.parentElement!.getBoundingClientRect().width]);
  const [stretched, container] = await widths();
  expect(stretched).toBeLessThan(container!);

  await control(page, "justifyItems").selectOption("start");
  await expect(grid).toHaveCSS("justify-items", "start");
  const [shrunk] = await widths();
  expect(shrunk).toBeLessThan(stretched!);
  await expect(grid).toHaveCSS("justify-content", "normal");

  await control(page, "justifyItems").selectOption("stretch");
  await control(page, "justify").selectOption("between");
  await expect(grid).toHaveCSS("justify-content", "space-between");
  await expect(grid).toHaveCSS("justify-items", "stretch");
  expect((await widths())[0]).toBe(stretched);
});

test("[primitives.layout.defaults] a bare Stack is a column that lets its items stretch, a bare Inline a row that centres them and does not wrap, and a bare Grid one column", async ({ page }) => {
  await openHarness(page, "layout");
  const stack = page.getByTestId("stack-bare");
  await expect(stack).toHaveCSS("display", "flex");
  await expect(stack).toHaveCSS("flex-direction", "column");
  await expect(stack).toHaveCSS("align-items", "normal");
  const inline = page.getByTestId("inline-bare");
  await expect(inline).toHaveCSS("display", "flex");
  await expect(inline).toHaveCSS("flex-direction", "row");
  await expect(inline).toHaveCSS("align-items", "center");
  await expect(inline).toHaveCSS("flex-wrap", "nowrap");
  const grid = page.getByTestId("grid-bare");
  await expect(grid).toHaveCSS("display", "grid");
  expect((await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns)).split(" ")).toHaveLength(1);
  await expect(grid).toHaveCSS("align-items", "normal");
  await expect(grid).toHaveCSS("justify-content", "normal");
  await expect(grid).toHaveCSS("justify-items", "normal");
});

test("[primitives.layout.stack-inline] Stack's justify distributes down the column, and Inline lines up a row of numbers on their baseline when asked", async ({ page }) => {
  await openHarness(page, "layout");
  await expect(page.getByTestId("stack-between")).toHaveCSS("flex-direction", "column");
  await expect(page.getByTestId("stack-between")).toHaveCSS("justify-content", "space-between");
  await expect(page.getByTestId("inline-baseline")).toHaveCSS("align-items", "baseline");
});

test("[primitives.layout.root-min-width] a bare layout container holds min-width 0, and any minWidth beats it", async ({ page }) => {
  await openHarness(page, "layout");
  for (const id of ["stack-bare", "inline-bare", "grid-bare"]) await expect(page.getByTestId(id), id).toHaveCSS("min-width", "0px");

  await expect(page.getByTestId("stack-named")).toHaveCSS("min-width", px(SHAPE_SOURCE.dimension.width.md));
  await expect(page.getByTestId("inline-named")).toHaveCSS("min-width", "100%");
  await expect(page.getByTestId("grid-named")).toHaveCSS("min-width", px(LAYOUT_SOURCE.container.content));
  await expect(page.getByTestId("grid-keyword")).toHaveCSS("min-width", "max-content");
  await expect(page.getByTestId("stack-length")).toHaveCSS("min-width", "48px");
});
