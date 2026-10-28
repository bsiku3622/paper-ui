import { expect, test, type Page } from "@playwright/test";

import { THEME_ATTRIBUTE, tokens } from "../../packages/paper-ui/src/tokens";
import { COLOR_CONTRAST_MORE, COLOR_VALUES_BY_MODE } from "../../packages/paper-ui/src/tokens/colors";
import { LAYOUT_MODE_VALUES } from "../../packages/paper-ui/src/tokens/layout";
import { openHarness } from "../support/harness";
import { expectStyle } from "../support/style";

// The real package without a Provider (?case=theme): the stylesheet alone decides the mode, from the
// attribute on <html> or, with none, from the OS.
const mount = async (page: Page, colorScheme: "light" | "dark") => {
  await page.emulateMedia({ colorScheme });
  await openHarness(page, "theme");
  await expect(page.locator("html")).not.toHaveAttribute(THEME_ATTRIBUTE);
};

const rgb = (hex: string) => `rgb(${[1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)).join(", ")})`;

// A scope with a raw span, a child and a grandchild — each element's computed variables, by name.
const FIXTURE = `<div id="scope" ${THEME_ATTRIBUTE}="dark"><span id="raw">raw</span><div id="child"><div id="grandchild"></div></div><div id="nested" ${THEME_ATTRIBUTE}="light"><div id="nested-child"></div></div></div>`;
const variable = (page: Page, selector: string, name: string) =>
  page.locator(selector).evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim().toLowerCase(), name);

const light = COLOR_VALUES_BY_MODE.light;
const dark = COLOR_VALUES_BY_MODE.dark;

test("[foundations.theme.system-fallback] with no attribute on <html> the OS mode applies, and follows the OS live", async ({ page }) => {
  await mount(page, "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(dark.bg.canvas));
  await expect(page.locator("body")).toHaveCSS("color", rgb(dark.ink.primary));
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(light.bg.canvas));
  await expect(page.locator("body")).toHaveCSS("color", rgb(light.ink.primary));
  expect(await variable(page, "html", "--pui-color-interaction-focus")).toBe(light.interaction.focus);
});

test("[foundations.theme.system-fallback] an attribute on <html> beats the OS", async ({ page }) => {
  await mount(page, "dark");
  await page.evaluate((name) => document.documentElement.setAttribute(name, "light"), THEME_ATTRIBUTE);
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(light.bg.canvas));
  expect(await variable(page, "html", "--pui-color-shadow-floating")).toBe(light.shadow.floating);
  await page.evaluate((name) => document.documentElement.removeAttribute(name), THEME_ATTRIBUTE);
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(dark.bg.canvas));
  expect(await variable(page, "html", "--pui-color-shadow-floating")).toBe(dark.shadow.floating);
});

test("[foundations.theme.scope-roles] a scope re-declares ink, takes its own roles itself and draws ground roles from its children down", async ({ page }) => {
  await mount(page, "light");
  await page.evaluate((html) => document.body.insertAdjacentHTML("beforeend", html), FIXTURE);
  // Ink is inherited, so a raw span inside the dark scope reads the dark ink.
  await expect(page.locator("#raw")).toHaveCSS("color", rgb(dark.ink.primary));
  await expect(page.locator("#scope")).toHaveCSS("color", rgb(dark.ink.primary));
  // The scope's own roles are its mode's.
  expect(await variable(page, "#scope", "--pui-color-bg-canvas")).toBe(dark.bg.canvas);
  // Ground roles — the focus ring, the shadow colour and the shadow geometry — belong to the ground the scope stands on.
  expect(await variable(page, "#scope", "--pui-color-interaction-focus")).toBe(light.interaction.focus);
  expect(await variable(page, "#scope", "--pui-color-shadow-floating")).toBe(light.shadow.floating);
  expect(await variable(page, "#scope", "--pui-layout-shadow-floating-0")).toBe(LAYOUT_MODE_VALUES.light.shadow.floating["0"]);
  // …and its children draw them in the scope's mode, which their own children inherit.
  for (const selector of ["#child", "#grandchild"]) {
    expect(await variable(page, selector, "--pui-color-interaction-focus"), selector).toBe(dark.interaction.focus);
    expect(await variable(page, selector, "--pui-color-shadow-floating"), selector).toBe(dark.shadow.floating);
    expect(await variable(page, selector, "--pui-layout-shadow-floating-0"), selector).toBe(LAYOUT_MODE_VALUES.dark.shadow.floating["0"]);
  }
  // A light scope inside the dark one: light roles of its own, drawn on a dark ground.
  await expect(page.locator("#nested")).toHaveCSS("color", rgb(light.ink.primary));
  expect(await variable(page, "#nested", "--pui-color-bg-canvas")).toBe(light.bg.canvas);
  expect(await variable(page, "#nested", "--pui-color-interaction-focus")).toBe(dark.interaction.focus);
  expect(await variable(page, "#nested-child", "--pui-color-interaction-focus")).toBe(light.interaction.focus);
});

test("[foundations.theme.scope-roles] a Box scope casts its shadow on the ground it stands on, and the Box inside casts in the scope's mode", async ({ page }) => {
  await mount(page, "light");
  const card = page.getByTestId("inverse-card");
  const inside = page.getByTestId("inverse-card-child");
  await expect(card).toHaveAttribute(THEME_ATTRIBUTE, "dark");
  // Beside the card, an element on the same ground casts the same shadow: the page's, light.
  await expectStyle(card, { boxShadow: tokens.layout.elevation.overlay.shadow });
  const shadow = (locator: typeof card) => locator.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(await shadow(card)).toContain("24px 0px");
  expect(await shadow(inside)).toContain("22px -5px");
  expect(await shadow(inside)).not.toBe(await shadow(card));
});

test("[foundations.color.contrast-more] prefers-contrast: more lifts the quiet roles in the mode in force, scopes included", async ({ page }) => {
  await mount(page, "light");
  await page.evaluate((html) => document.body.insertAdjacentHTML("beforeend", html), FIXTURE);
  expect(await variable(page, "html", "--pui-color-border-base")).toBe(light.border.base);
  await page.emulateMedia({ contrast: "more" });
  expect(await variable(page, "html", "--pui-color-border-base")).toBe(COLOR_CONTRAST_MORE.light.border.base);
  expect(await variable(page, "html", "--pui-color-ink-tertiary")).toBe(COLOR_CONTRAST_MORE.light.ink.tertiary);
  expect(await variable(page, "#scope", "--pui-color-border-strong")).toBe(COLOR_CONTRAST_MORE.dark.border.strong);
  expect(await variable(page, "#nested", "--pui-color-border-hover")).toBe(COLOR_CONTRAST_MORE.light.border.hover);
  // Only the quiet roles move.
  expect(await variable(page, "html", "--pui-color-ink-primary")).toBe(light.ink.primary);
  // With no attribute, the OS mode picks the lift as well.
  await page.emulateMedia({ colorScheme: "dark", contrast: "more" });
  expect(await variable(page, "html", "--pui-color-border-base")).toBe(COLOR_CONTRAST_MORE.dark.border.base);
  expect(await variable(page, "html", "--pui-color-ink-tertiary")).toBe(COLOR_CONTRAST_MORE.dark.ink.tertiary);
  await page.emulateMedia({ contrast: "no-preference" });
  expect(await variable(page, "html", "--pui-color-border-base")).toBe(dark.border.base);
});

// The site: the Provider writes the attribute from the stored choice, and the GNB toggle flips it.
const openSite = async (page: Page, stored: "light" | "dark", colorScheme: "light" | "dark", path = "/") => {
  await page.emulateMedia({ colorScheme });
  await page.addInitScript((value) => window.localStorage.setItem("paper-theme", value), stored);
  await page.goto(path);
};

test("a stored dark choice applies under a light OS, and the GNB toggle flips the attribute", async ({ page }) => {
  await openSite(page, "dark", "light");
  const html = page.locator("html");
  await expect(html).toHaveAttribute(THEME_ATTRIBUTE, "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(dark.bg.canvas));
  await page.getByRole("button", { name: "라이트 테마로 전환" }).click();
  await expect(html).toHaveAttribute(THEME_ATTRIBUTE, "light");
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(light.bg.canvas));
  await page.getByRole("button", { name: "다크 테마로 전환" }).click();
  await expect(html).toHaveAttribute(THEME_ATTRIBUTE, "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(dark.bg.canvas));
});

test("the sunken preview background says it is the canvas where the mode folds the two together", async ({ page }) => {
  await openSite(page, "dark", "light", "/playground/button");
  const sunken = page.getByRole("group", { name: "미리보기 배경" }).getByRole("button", { name: "sunken background" });
  await expect(sunken).toHaveAttribute("title", "다크에서는 canvas와 같은 단계");
  await page.getByRole("button", { name: "라이트 테마로 전환" }).click();
  await expect(sunken).toHaveAttribute("title", "sunken background");
  await page.getByRole("button", { name: "다크 테마로 전환" }).click();
  await expect(sunken).toHaveAttribute("title", "다크에서는 canvas와 같은 단계");
});
