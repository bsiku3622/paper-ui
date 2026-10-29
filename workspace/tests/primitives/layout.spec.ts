import { expect, test, type Page } from "@playwright/test";

import { openHarness, openPlayground } from "../support/harness";

const control = (page: Page, name: string) => page.getByRole("combobox", { name, exact: true });

test("Grid responds to its track count without losing token gaps", async ({ page }) => {
  await openPlayground(page, "grid", "Grid");
  const grid = page.getByTestId("grid-example");
  expect(await grid.evaluate((node) => getComputedStyle(node).columnGap)).toBe("8px");
  expect(await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(3);
  await page.getByRole("combobox", { name: "columns", exact: true }).selectOption("2");
  expect(await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(2);
  expect(await grid.evaluate((node) => getComputedStyle(node).columnGap)).toBe("8px");
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

test("[primitives.layout.root-min-width] a bare layout container holds min-width 0, and any minWidth beats it", async ({ page }) => {
  await openHarness(page, "layout");
  for (const id of ["stack-bare", "inline-bare", "grid-bare"]) await expect(page.getByTestId(id), id).toHaveCSS("min-width", "0px");

  await expect(page.getByTestId("stack-named")).toHaveCSS("min-width", "160px");
  await expect(page.getByTestId("inline-named")).toHaveCSS("min-width", "100%");
  await expect(page.getByTestId("grid-named")).toHaveCSS("min-width", "1152px");
  await expect(page.getByTestId("grid-keyword")).toHaveCSS("min-width", "max-content");
  await expect(page.getByTestId("stack-length")).toHaveCSS("min-width", "48px");
});
