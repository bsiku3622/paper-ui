import { expect, test } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { roleDp } from "../support/geometry";
import { openPlayground } from "../support/harness";

test.beforeEach(async ({ page }) => {
  await openPlayground(page, "date-picker", "DatePicker");
});

test("[components.date-picker.pick] opens a calendar under the frame, picks a day by mouse, closes and returns focus to the trigger", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Date" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Date" });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(dialog).not.toHaveAttribute("data-presence", /.*/);
  const box = (await trigger.locator("..").boundingBox())!;
  const panel = (await dialog.boundingBox())!;
  expect(Math.abs(panel.y - (box.y + box.height) - roleDp(tokens.layout.gap.xs))).toBeLessThan(1);
  expect(Math.abs(panel.x - box.x)).toBeLessThan(1);
  await dialog.getByRole("button", { name: /11월 3일|November 3,/ }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText(/2026\. 11\. 3\.|Nov 3, 2026/);
});

test("[components.calendar.keyboard] moves by the arrow keys, pages with PageDown and picks with Enter, then Escape leaves the value alone", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Date" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Date" });
  await expect(dialog.getByRole("button", { name: /20일|November 20/ })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect(dialog.getByRole("button", { name: /28일|November 28/ })).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect(dialog.getByRole("button", { name: /12월 28일|December 28/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText(/2026\. 11\. 20\.|Nov 20, 2026/);
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText(/2026\. 11\. 19\.|Nov 19, 2026/);
});
