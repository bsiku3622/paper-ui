import { expect, test } from "@playwright/test";

import { BREAKPOINTS, LAYOUT_SOURCE } from "../../packages/paper-ui/src/tokens/layout";

// CDP runs in chromium only, so this spec is not part of the cross-engine set.

test("the Layout page reads each breakpoint in em beside its px at the default root font", async ({ page }) => {
  await page.goto("/playground/foundations/layout");
  for (const name of BREAKPOINTS) {
    const dp = LAYOUT_SOURCE.breakpoint[name];
    await expect(page.getByText(`${dp / 16}em · ${dp}px`, { exact: true }), name).toBeVisible();
  }
});

test("[foundations.layout.breakpoint-em] a breakpoint follows the browser's default font size, and so does the container", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  const sidebar = page.locator(".home-mockup-side");
  const column = page.getByTestId("home-column");

  await page.goto("/");
  await expect(column).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(column).toHaveCSS("max-width", "1152px");

  // At a 20px default font md (48em) is 960px, so a 900px window is already narrower than it.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: 20 } });
  await page.reload();
  await expect(column).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("font-size", "20px");
  await expect(sidebar).toBeHidden();
  await expect(column).toHaveCSS("max-width", "1440px");
});
