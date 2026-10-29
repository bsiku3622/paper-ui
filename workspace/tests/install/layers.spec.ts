import { expect, test } from "@playwright/test";

import { openHarness } from "../support/harness";

const SUBLAYERS = ["reset", "theme", "base", "utilities", "components"];

test("[install.layers.app-css-wins] app CSS linked before the package beats its component and state rules", async ({ page }) => {
  await openHarness(page, "layers");
  const consumerButton = page.getByRole("button", { name: "Consumer button", exact: true });
  await expect(consumerButton).toHaveCSS("padding-inline-start", "23px");
  await expect(consumerButton).toHaveCSS("padding-inline-end", "23px");
  await expect(page.getByRole("button", { name: "Package button", exact: true })).not.toHaveCSS("padding-inline-start", "23px");
  // The package's hover border is live on the twin Field, and the app's border still wins while hovered.
  const packageField = page.getByTestId("package-field");
  const rest = await packageField.evaluate((element) => getComputedStyle(element).borderTopColor);
  await packageField.hover();
  await expect(packageField).not.toHaveCSS("border-top-color", rest);
  const consumerField = page.getByTestId("consumer-field");
  await consumerField.hover();
  await expect(consumerField).toHaveCSS("border-top-color", "rgb(255, 0, 128)");
  // A named Box size is a class, so the app's own width replaces it, while the twin keeps the named one.
  await expect(page.getByTestId("consumer-box")).toHaveCSS("width", "123px");
  await expect(page.getByTestId("package-box")).not.toHaveCSS("width", "123px");
});

test("[install.layers.every-rule-layered] every package rule sits in a pui sublayer; only @keyframes and @property stand outside", async ({ page }) => {
  await openHarness(page, "layers");
  // Walks every stylesheet but the app's own, through @layer, @media and @supports blocks and nested rules.
  const { outside, filled } = await page.evaluate((sublayers) => {
    const TOP_LEVEL = ["CSSKeyframesRule", "CSSPropertyRule"];
    const outside: string[] = [];
    const filled = new Set<string>();
    const walk = (rules: CSSRuleList, layers: string[]) => {
      for (const rule of Array.from(rules)) {
        const kind = rule.constructor.name;
        if (kind === "CSSLayerStatementRule") continue;
        if (kind === "CSSLayerBlockRule") {
          walk((rule as CSSLayerBlockRule).cssRules, [...layers, (rule as CSSLayerBlockRule).name]);
          continue;
        }
        if (layers.length === 0 && TOP_LEVEL.includes(kind)) continue;
        if (kind === "CSSStyleRule" || !("cssRules" in rule)) {
          const [root, sublayer, ...rest] = layers.join(".").split(".");
          if (root === "pui" && sublayers.includes(sublayer!) && rest.length === 0) filled.add(sublayer!);
          else outside.push(`${layers.join(".") || "(no layer)"} ${rule.cssText.slice(0, 80)}`);
          if (kind === "CSSStyleRule") walk((rule as CSSStyleRule).cssRules, layers);
          continue;
        }
        walk((rule as CSSGroupingRule).cssRules, layers);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      if (sheet.href?.endsWith("/consumer-first.css")) continue;
      walk(sheet.cssRules, []);
    }
    return { outside, filled: [...filled] };
  }, SUBLAYERS);
  expect(outside).toEqual([]);
  // Every sublayer holds rules, so the walk saw the whole stylesheet.
  expect(filled.sort()).toEqual([...SUBLAYERS].sort());
});

test("the package stylesheet names no global pui- class; its classes are scoped to the build", async ({ page }) => {
  await openHarness(page, "layers");
  const selectors = await page.evaluate(() => {
    const found: string[] = [];
    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) found.push(rule.selectorText);
        if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      if (sheet.href?.endsWith("/consumer-first.css")) continue;
      walk(sheet.cssRules);
    }
    return found;
  });
  // The walk saw the package's rules, and none of them is a hand-named class.
  expect(selectors.length).toBeGreaterThan(100);
  expect(selectors.filter((selector) => /\.pui-[a-z]/.test(selector))).toEqual([]);
});
