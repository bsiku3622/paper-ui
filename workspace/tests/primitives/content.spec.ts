import { expect, test, type Page } from "@playwright/test";

import { CONTROL_ICON, TEXT_VARIANTS } from "../../packages/paper-ui/src/tokens";
import { ROLE_SPEC, TYPOGRAPHY_SOURCE } from "../../packages/paper-ui/src/tokens/typography";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { px } from "../support/geometry";
import { openHarness } from "../support/harness";

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

test("[primitives.text.strong] strong moves a role between its own weight, its strong one and the regular one, and nothing else of it, on either family", async ({ page }) => {
  await openHarness(page, "typography");
  const { weight } = TYPOGRAPHY_SOURCE;
  for (const variant of TEXT_VARIANTS) {
    await expect(page.getByTestId(`role-${variant}`), variant).toHaveCSS("font-weight", String(weight[ROLE_SPEC[variant].weight]));
    await expect(page.getByTestId(`strong-${variant}`), variant).toHaveCSS("font-weight", String(weight[ROLE_SPEC[variant].strong]));
    await expect(page.getByTestId(`plain-${variant}`), variant).toHaveCSS("font-weight", String(weight.regular));
  }
  const label = page.getByTestId("plain-label");
  await expect(label).toHaveCSS("font-size", px(TYPOGRAPHY_SOURCE.fontSize["12"]));
  await expect(label).toHaveCSS("line-height", px(TYPOGRAPHY_SOURCE.leading["16"]));
  await expect(page.getByTestId("mono-plain")).toHaveCSS("font-weight", String(weight.regular));
});

test("[primitives.text.truncate] a truncated line stays one line inside its cell, cut by an ellipsis, with all its words still there", async ({ page }) => {
  await openHarness(page, "layout");
  const text = page.getByTestId("truncate");
  await expect(text).toHaveCSS("text-overflow", "ellipsis");
  await expect(text).toHaveCSS("white-space", "nowrap");
  const box = await text.evaluate((node) => ({ scroll: node.scrollWidth, client: node.clientWidth, height: node.clientHeight, row: node.parentElement!.clientWidth, words: node.textContent!.length }));
  expect(box.client).toBeLessThanOrEqual(box.row);
  expect(box.scroll).toBeGreaterThan(box.client);
  expect(box.height).toBe(parseFloat(px(TYPOGRAPHY_SOURCE.leading["20"])));
  expect(box.words).toBeGreaterThan(100);
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
  await expect(page.getByText("Caption with its own ink", { exact: true })).toHaveCSS("color", secondary);
  await expect(page.getByText("Caption with primary ink", { exact: true })).toHaveCSS("color", primary);
});
