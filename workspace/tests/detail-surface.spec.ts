import { expect, test } from "@playwright/test";

test("component preview surface follows navigation and reload", async ({ page }) => {
  await page.goto("/playground/switch");

  const controls = page.getByRole("group", { name: "미리보기 배경" });
  await expect(controls.getByRole("button")).toHaveCount(4);
  await expect(controls.getByRole("button", { name: "raised background" })).toHaveAttribute("aria-pressed", "true");

  const track = controls.getByRole("button", { name: "track background" });
  await track.click();
  await expect(track).toHaveAttribute("aria-pressed", "true");
  await expect(track.locator("svg")).toHaveCount(1);
  await expect(controls.getByRole("button", { name: "raised background" }).locator("svg")).toHaveCount(0);
  await expect(page.locator(".preview-stage")).toHaveAttribute("data-preview-background", "track");
  expect(await page.locator(".preview-stage").evaluate((stage) => getComputedStyle(stage).backgroundColor))
    .toBe(await track.evaluate((button) => getComputedStyle(button).backgroundColor));

  await page.goto("/playground/segmentedcontrol");
  await expect(page.getByRole("button", { name: "track background" })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator(".preview-stage")).toHaveAttribute("data-preview-background", "track");
});
