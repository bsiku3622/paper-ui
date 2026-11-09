import { expect, test } from "@playwright/test";

import { openPlayground } from "../support/harness";

test("[components.range-calendar.band] draws one continuous band across two week rows, with the end days solid and their inner corners square", async ({ page }) => {
  await openPlayground(page, "range-calendar", "RangeCalendar");
  const bands = page.locator("[data-preview-background] [data-part=range]");
  await expect(bands).toHaveCount(8);
  const boxes = await bands.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect()).map(({ x, y, width, height }) => ({ x, y, width, height })));
  const firstRow = boxes.filter((box) => box.y === boxes[0]!.y);
  const secondRow = boxes.filter((box) => box.y !== boxes[0]!.y);
  expect(firstRow.length).toBeGreaterThan(0);
  expect(secondRow.length).toBeGreaterThan(0);
  for (const row of [firstRow, secondRow]) {
    for (let index = 1; index < row.length; index += 1) expect(Math.abs(row[index]!.x - (row[index - 1]!.x + row[index - 1]!.width))).toBeLessThan(0.5);
  }
  const start = page.getByRole("button", { name: /5일|November 5,/ }).first();
  const radius = (name: string) => start.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property), name);
  expect(await radius("border-start-end-radius")).toBe("0px");
  expect(await radius("border-start-start-radius")).not.toBe("0px");
});

test("[components.range-calendar.preview] previews the band up to the hovered day while the end is pending", async ({ page }) => {
  await openPlayground(page, "range-calendar", "RangeCalendar");
  await page.getByRole("switch", { name: /^defaultValue/ }).click();
  await expect(page.locator("[data-preview-background] [data-part=range]")).toHaveCount(0);
  await page.getByRole("button", { name: /11월 12일|November 12,/ }).click();
  await page.getByRole("button", { name: /11월 16일|November 16,/ }).hover();
  await expect(page.locator("[data-preview-background] [data-part=range]")).toHaveCount(5);
  await page.getByRole("button", { name: /11월 18일|November 18,/ }).hover();
  await expect(page.locator("[data-preview-background] [data-part=range]")).toHaveCount(7);
});

test("[components.date-range-picker.pick] stays open for the start, then closes on the end with the period in the trigger and focus back on it", async ({ page }) => {
  await openPlayground(page, "date-range-picker", "DateRangePicker");
  await page.getByRole("switch", { name: /^defaultValue/ }).click();
  const trigger = page.getByRole("button", { name: "Dates" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Dates" });
  await dialog.getByRole("button", { name: /11월 12일|November 12,/ }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /11월 18일|November 18,/ }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText(/12/);
  await expect(trigger).toContainText(/18/);
});
