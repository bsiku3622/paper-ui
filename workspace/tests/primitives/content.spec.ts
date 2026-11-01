import { expect, test, type Page } from "@playwright/test";

import { CONTROL_ICON } from "../../packages/paper-ui/src/tokens";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { px } from "../support/geometry";
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

test("[primitives.icon.artboard] [primitives.icon.ink] an Icon draws its line at the icon stroke, sized by the artboard of its name, and in the colour around it", async ({ page }) => {
  await openHarness(page, "geometry");
  const icon = page.locator("[data-testid=icon-md] svg");
  await expect(icon).toHaveCSS("stroke-width", px(SHAPE_SOURCE.stroke.icon));
  await expect(icon).toHaveCSS("width", px(SHAPE_SOURCE.icon[CONTROL_ICON.md]));
  await expect(icon).toHaveCSS("fill", "none");
  const { color, stroke } = await icon.evaluate((element) => ({ color: getComputedStyle(element).color, stroke: getComputedStyle(element).stroke }));
  expect(stroke).toBe(color);
  expect(color).toBe(await page.getByTestId("icon-md").evaluate((element) => getComputedStyle(element).color));
});

test("[primitives.text.ink-table] ink=inherit sets no colour of its own, so the letters take the face around them", async ({ page }) => {
  await openHarness(page, "layers");
  const face = await page.getByTestId("ink-face").evaluate((element) => getComputedStyle(element).color);
  expect(face).not.toBe(await ink(page, "secondary"));
  await expect(page.getByText("Caption on a face", { exact: true })).toHaveCSS("color", face);
});

test("[primitives.text.ink-beats-variant] ink overrides the variant's own ink by layer, not by stylesheet order", async ({ page }) => {
  await openHarness(page, "layers");
  const primary = await ink(page, "primary");
  const secondary = await ink(page, "secondary");
  expect(primary).not.toBe(secondary);
  // caption's own ink is secondary; ink="primary" asks for primary.
  await expect(page.getByText("Caption with its own ink", { exact: true })).toHaveCSS("color", secondary);
  await expect(page.getByText("Caption with primary ink", { exact: true })).toHaveCSS("color", primary);
});
