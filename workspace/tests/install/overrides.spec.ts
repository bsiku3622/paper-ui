import { expect, test, type Locator, type Page } from "@playwright/test";

import { THEME_ATTRIBUTE } from "../../packages/paper-ui/src/tokens";
import { openHarness } from "../support/harness";

// How an override of the ground roles has to be written. The package re-declares them on the children of every theme scope,
// so a rule must reach those children; being outside the layers, it then wins whatever its specificity.

const FOCUS = "rgb(1, 2, 3)";
const SHADOW = "rgb(4, 5, 6)";
const declarations = `--pui-color-interaction-focus: ${FOCUS}; --pui-color-shadow-floating: ${SHADOW};`;
const WRITTEN_AS_DOCUMENTED = `:root, [data-pui-theme] > * { ${declarations} }`;

type Case = { rule: string; page: boolean; scoped: boolean; panel: boolean };

// The three places a ground role is read, with the rule applied: an element on the page, the child of a theme Surface, a Floating panel.
const mount = async (page: Page, attribute: "light" | null, rule: string) => {
  await page.emulateMedia({ colorScheme: "light" });
  await openHarness(page, "theme");
  if (attribute) await page.evaluate(([name, value]) => document.documentElement.setAttribute(name!, value!), [THEME_ATTRIBUTE, attribute]);
  await page.addStyleTag({ content: rule });
  await page.getByTestId("ink-trigger").click();
  await expect(page.getByTestId("ink-floating-raw")).toBeVisible();
};
// The ring an element shows once the keyboard has the focus.
const ringOf = async (target: Locator) => {
  await target.page().keyboard.press("Tab");
  await target.focus();
  return target.evaluate((element) => getComputedStyle(element).outlineColor);
};
const reached = async (page: Page) => {
  const onPanel = await page.locator("[role=dialog]").evaluate((element) => getComputedStyle(element).boxShadow);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("ink-floating-raw")).toBeHidden();
  return {
    page: (await ringOf(page.getByTestId("inverse-card"))) === FOCUS,
    scoped: (await ringOf(page.getByTestId("ink-pressable"))) === FOCUS,
    panel: onPanel.includes(SHADOW),
  };
};

const WITH_ATTRIBUTE: Case[] = [
  { rule: `:root { ${declarations} }`, page: false, scoped: false, panel: false },
  { rule: `body { ${declarations} }`, page: true, scoped: false, panel: false },
  { rule: `#root { ${declarations} }`, page: true, scoped: false, panel: false },
  { rule: `[data-pui-theme] > * { ${declarations} }`, page: true, scoped: true, panel: true },
  { rule: WRITTEN_AS_DOCUMENTED, page: true, scoped: true, panel: true },
];

for (const { rule, ...expected } of WITH_ATTRIBUTE) {
  test(`[install.overrides.ground-roles] with a mode on <html>, \`${rule.slice(0, rule.indexOf(" {"))}\` reaches the page ${expected.page}, a scope's child ${expected.scoped}, a Floating panel ${expected.panel}`, async ({ page }) => {
    await mount(page, "light", rule);
    expect(await reached(page)).toEqual(expected);
  });
}

test("[install.overrides.ground-roles] with no attribute on <html>, `:root` reaches the page but not a scope's child or a panel, and the documented rule reaches them all", async ({ page }) => {
  await mount(page, null, `:root { ${declarations} }`);
  expect(await reached(page)).toEqual({ page: true, scoped: false, panel: false });
  await mount(page, null, WRITTEN_AS_DOCUMENTED);
  expect(await reached(page)).toEqual({ page: true, scoped: true, panel: true });
});

test("[install.overrides.ground-roles] the shadow's geometry is overridden the same way, and a mode in the selector limits a rule to the ground of that mode", async ({ page }) => {
  await mount(page, "light", ":root, [data-pui-theme] > * { --pui-layout-shadow-floating-0: 0px 9px 9px 0px; }");
  expect(await page.locator("[role=dialog]").evaluate((element) => getComputedStyle(element).boxShadow)).toContain("0px 9px 9px 0px");

  // The panel stands in the dark scope it was opened from; the page is light.
  await mount(page, "light", `[data-pui-theme="dark"] > * { ${declarations} }`);
  expect(await reached(page)).toEqual({ page: false, scoped: true, panel: true });
});
