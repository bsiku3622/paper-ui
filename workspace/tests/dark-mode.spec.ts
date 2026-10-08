import { expect, test } from "@playwright/test";

test("theme toggle persists and native controls follow nested scopes", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "다크 테마로 전환" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("base-select")).toHaveCSS("color-scheme", "dark");
  const inverse = page.getByText("inverse", { exact: true }).locator("..");
  await expect(inverse).toHaveAttribute("data-theme", "light");
  await expect(inverse).toHaveCSS("color-scheme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("base-select")).toHaveCSS("color-scheme", "dark");
  await page.getByRole("button", { name: "라이트 테마로 전환" }).click();
  await expect(page.getByTestId("base-select")).toHaveCSS("color-scheme", "light");
  await expect(inverse).toHaveCSS("color-scheme", "dark");
});

test("system dark theme uses restored surfaces in the demo and live inspector", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/demo");
  await page.getByRole("button", { name: "새 작업" }).waitFor();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const surfaces = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return ["raised", "canvas", "sunken"].map((role) =>
      style.getPropertyValue(`--pui-color-bg-${role}`).trim());
  });
  expect(surfaces).toEqual(["#1d1d1e", "#111113", "#111113"]);
  await page.goto("/playground/foundations/color");
  await expect(page.getByText("bg.canvas", { exact: true })).toBeVisible();
  for (const surface of surfaces) {
    expect(await page.getByText(surface.toUpperCase(), { exact: true }).count()).toBeGreaterThan(0);
  }
});
