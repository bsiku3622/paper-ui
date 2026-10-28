import { expect, test } from "@playwright/test";

test("former palette and tokens routes land on the Color foundation", async ({ page }) => {
  for (const route of ["/playground/palette", "/playground/tokens", "/playground/foundations"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/playground\/foundations\/color$/);
  }
});
