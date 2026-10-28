import { expect, test, type Page } from "@playwright/test";

import { openHarness } from "../support/harness";

// The computed colour of one ink role, read where the variables are declared.
const ink = (page: Page, role: string) => page.evaluate((role) => {
  const sample = document.createElement("span");
  sample.style.color = `var(--pui-color-ink-${role})`;
  document.body.append(sample);
  const color = getComputedStyle(sample).color;
  sample.remove();
  return color;
}, role);

test("[primitives.text.ink-beats-variant] ink overrides the variant's own ink by layer, not by stylesheet order", async ({ page }) => {
  await openHarness(page, "layers");
  const primary = await ink(page, "primary");
  const secondary = await ink(page, "secondary");
  expect(primary).not.toBe(secondary);
  // caption's own ink is secondary; ink="primary" asks for primary.
  await expect(page.getByText("Caption with its own ink", { exact: true })).toHaveCSS("color", secondary);
  await expect(page.getByText("Caption with primary ink", { exact: true })).toHaveCSS("color", primary);
});
