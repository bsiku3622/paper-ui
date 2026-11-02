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

test("[primitives.grid.steps] a Grid's tracks follow the width: the base below its first step, each step from its breakpoint on", async ({ page }) => {
  const { sm, md, lg } = LAYOUT_SOURCE.breakpoint;
  const tracks = (id: string, axis: "gridTemplateColumns" | "gridTemplateRows" = "gridTemplateColumns") =>
    page.getByTestId(id).evaluate((node, axis) => getComputedStyle(node)[axis].split(" ").length, axis);
  await page.setViewportSize({ width: md - 1, height: 800 });
  await openHarness(page, "layout");
  expect(await tracks("grid-steps")).toBe(1);
  expect(await tracks("grid-no-base")).toBe(1);
  // Rows with no base are the implicit one the content makes.
  expect(await page.getByTestId("grid-steps").evaluate((node) => getComputedStyle(node).gridTemplateRows)).not.toContain("32px");
  await page.setViewportSize({ width: md, height: 800 });
  expect(await tracks("grid-steps")).toBe(2);
  expect(await tracks("grid-no-base")).toBe(3);
  await expect(page.getByTestId("grid-steps")).toHaveCSS("grid-template-rows", "32px 48px");
  // A step that names no value keeps the one before it.
  await page.setViewportSize({ width: lg - 1, height: 800 });
  expect(await tracks("grid-steps")).toBe(2);
  await page.setViewportSize({ width: lg, height: 800 });
  expect(await tracks("grid-steps")).toBe(3);
  expect(await tracks("grid-no-base")).toBe(3);
  // An inner Grid reads only the steps it was given, not the outer one's variables.
  await page.setViewportSize({ width: md, height: 800 });
  expect(await tracks("grid-outer")).toBe(2);
  expect(await tracks("grid-inner")).toBe(1);
  await page.setViewportSize({ width: lg, height: 800 });
  expect(await tracks("grid-inner")).toBe(3);
  await page.setViewportSize({ width: sm, height: 800 });
  expect(await tracks("grid-steps")).toBe(1);
});

test("[primitives.box.hide-below] a box is gone below its breakpoint and there from it on, over a layout root's own display", async ({ page }) => {
  const { md, lg } = LAYOUT_SOURCE.breakpoint;
  await page.setViewportSize({ width: md - 1, height: 800 });
  await openHarness(page, "layout");
  for (const id of ["hide-box", "hide-stack", "hide-grid"]) await expect(page.getByTestId(id), id).toBeHidden();
  await page.setViewportSize({ width: md, height: 800 });
  await expect(page.getByTestId("hide-box")).toBeVisible();
  await expect(page.getByTestId("hide-stack")).toHaveCSS("display", "flex");
  await expect(page.getByTestId("hide-grid")).toBeHidden();
  await page.setViewportSize({ width: lg, height: 800 });
  await expect(page.getByTestId("hide-grid")).toHaveCSS("display", "grid");
});

test("[primitives.box.prop-table] height=viewport is the height of the window", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 640 });
  await openHarness(page, "layout");
  await expect(page.getByTestId("height-viewport")).toHaveCSS("height", "640px");
  await expect(page.getByTestId("min-height-viewport")).toHaveCSS("min-height", "640px");
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
