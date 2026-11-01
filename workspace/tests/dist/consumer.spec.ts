import { expect, test, type Page } from "@playwright/test";

import { INVENTORY } from "../../packages/paper-ui/src/inventory";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { themeVariables } from "../../packages/paper-ui/src/tokens/variables";
import { pageErrors } from "../support/console";

// A consumer built from the tarball with React 19 and with React 18 (playwright.dist.config.ts): the harness page the
// workspace e2e mounts from source, here served from its production build, with the package resolved to dist.
const open = async (page: Page, name: string) => {
  const errors = pageErrors(page);
  await page.goto(`/?case=${name}`);
  await expect.poll(async () => errors.length > 0 || (await page.locator("#root > *").count()) > 0).toBe(true);
  expect(errors, `?case=${name} mounts without errors`).toEqual([]);
  return errors;
};

test("[install.styles.single-import] styles.css is the only style the package brings, and it defines the variables and the md Button height", async ({ page }) => {
  await open(page, "geometry");
  // The harness links one consumer stylesheet of its own; the build adds one for the package, and no other. (React Aria
  // puts an inline rule of its own in the head the first time something is pressed; it is not a linked sheet.)
  const linked = await page.evaluate(() => Array.from(document.styleSheets).flatMap((sheet) => (sheet.href ? [sheet.href] : [])));
  expect(linked.filter((href) => !href.endsWith("/consumer-first.css"))).toHaveLength(1);
  const { source, modes } = themeVariables();
  const names = [...Object.keys(source), ...Object.keys(modes.light.own)];
  const missing = await page.evaluate((names) => {
    const root = getComputedStyle(document.documentElement);
    return names.filter((name) => root.getPropertyValue(name).trim() === "");
  }, names);
  expect(missing).toEqual([]);
  // dp is px at the default root, and the page keeps the browser's default root size.
  await expect(page.getByTestId("button-md")).toHaveCSS("height", `${SHAPE_SOURCE.control.height.md}px`);
});

test("[install.layers.app-css-wins] consumer CSS linked before the package still beats its component and state rules", async ({ page }) => {
  await open(page, "layers");
  const consumerButton = page.getByRole("button", { name: "Consumer button", exact: true });
  await expect(consumerButton).toHaveCSS("padding-inline-start", "23px");
  await expect(page.getByRole("button", { name: "Package button", exact: true })).not.toHaveCSS("padding-inline-start", "23px");
  const consumerField = page.getByTestId("consumer-field");
  await consumerField.hover();
  await expect(consumerField).toHaveCSS("border-top-color", "rgb(255, 0, 128)");
  await expect(page.getByTestId("consumer-box")).toHaveCSS("width", "123px");
  await expect(page.getByTestId("package-box")).not.toHaveCSS("width", "123px");
});

// Every value the root entry exports, as INVENTORY lists them.
const ROOT_EXPORTS = [
  ...Object.values(INVENTORY.primitives).flatMap((group) => [...group.components, ...group.hooks, ...("functions" in group ? group.functions : [])]),
  ...INVENTORY.atoms,
  ...Object.values(INVENTORY.utilities).flat(),
  ...INVENTORY.classes,
  "INVENTORY",
  "PRIMITIVE_ORDERS",
  "PRIMITIVE_GROUPS",
];

test("[install.entry.exports-render] every root export renders or runs with zero console errors", async ({ page }) => {
  const errors = await open(page, "exports");
  const probes = await page.locator("[data-export]").evaluateAll((elements) => elements.map((element) => ({ name: element.getAttribute("data-export")!, filled: element.childElementCount > 0 || (element.textContent ?? "").trim() !== "" })));
  expect(probes.map(({ name }) => name).sort()).toEqual([...ROOT_EXPORTS].sort());
  // A portal's content leaves the probe it was rendered in, so those two are held to the page, not to their wrapper.
  const empty = probes.filter(({ filled, name }) => !filled && name !== "Portal" && name !== "Floating").map(({ name }) => name);
  expect(empty).toEqual([]);
  await expect(page.getByText("Portal", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Floating panel" })).toBeVisible();
  const boot = page.locator("[data-boot-attribute]");
  await expect(boot).toHaveAttribute("data-boot-attribute", "data-pui-theme");
  await expect(boot).toHaveText("string");
  expect(errors).toEqual([]);
});
