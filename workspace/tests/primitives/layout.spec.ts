import { expect, test } from "@playwright/test";

import { openPlayground } from "../support/harness";

test("Grid responds to its track count without losing token gaps", async ({ page }) => {
  await openPlayground(page, "grid", "Grid");
  const grid = page.locator(".pui-gap-sm").filter({ has: page.getByText("6", { exact: true }) }).last();
  expect(await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(3);
  await page.getByRole("combobox", { name: "columns", exact: true }).selectOption("2");
  expect(await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(2);
});
