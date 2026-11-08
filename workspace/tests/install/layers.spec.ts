import { expect, test } from "@playwright/test";

import { openHarness } from "../support/harness";

const SUBLAYERS = ["reset", "theme", "base", "utilities", "components"];

test("[install.layers.app-css-wins] app CSS linked before the package beats its component and state rules", async ({ page }) => {
  await openHarness(page, "layers");
  const consumerButton = page.getByRole("button", { name: "Consumer button", exact: true });
  await expect(consumerButton).toHaveCSS("padding-inline-start", "23px");
  await expect(consumerButton).toHaveCSS("padding-inline-end", "23px");
  await expect(page.getByRole("button", { name: "Package button", exact: true })).not.toHaveCSS("padding-inline-start", "23px");
  const packageField = page.getByTestId("package-field");
  const rest = await packageField.evaluate((element) => getComputedStyle(element).borderTopColor);
  await packageField.hover();
  await expect(packageField).not.toHaveCSS("border-top-color", rest);
  const consumerField = page.getByTestId("consumer-field");
  await consumerField.hover();
  await expect(consumerField).toHaveCSS("border-top-color", "rgb(255, 0, 128)");
  await expect(page.getByTestId("consumer-box")).toHaveCSS("width", "123px");
  await expect(page.getByTestId("package-box")).not.toHaveCSS("width", "123px");
});

test("[install.layers.contents] each sublayer holds what the docs say: the resets, the variables, the document ground, the classes a shared axis names, and the components", async ({ page }) => {
  await openHarness(page, "layers");
  const rules = await page.evaluate(() => {
    const found: { layer: string; selector: string; properties: string[] }[] = [];
    const walk = (list: CSSRuleList, layer: string) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, layer ? `${layer}.${rule.name}` : rule.name);
        else if (rule instanceof CSSStyleRule) found.push({ layer, selector: rule.selectorText, properties: Array.from(rule.style) });
        else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, layer);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      if (sheet.href?.endsWith("/consumer-first.css")) continue;
      // React Aria adds one rule of its own to the head on the first press (touch-action, in an anonymous layer).
      if ((sheet.ownerNode as Element | null)?.id === "react-aria-pressable-style") continue;
      walk(sheet.cssRules, "");
    }
    return found;
  });
  const inLayer = (layer: string) => rules.filter((rule) => rule.layer === `pui.${layer}`);
  const selects = (layer: string, selector: string) => inLayer(layer).some((rule) => rule.selector.includes(selector));
  const declares = (layer: string, property: string) => inLayer(layer).some((rule) => rule.properties.includes(property));

  expect(inLayer("reset").some((rule) => rule.selector === "*" && rule.properties.includes("box-sizing"))).toBe(true);
  expect(inLayer("reset").some((rule) => rule.selector === "body" && rule.properties.includes("margin-top"))).toBe(true);
  expect(inLayer("reset").some((rule) => rule.selector.startsWith(":where(.") && rule.properties.includes("appearance"))).toBe(true);
  expect(inLayer("theme").flatMap((rule) => rule.properties).filter((name) => !name.startsWith("--") && name !== "color-scheme")).toEqual([]);
  expect(selects("base", "body")).toBe(true);
  expect(selects("base", ":focus-visible")).toBe(true);
  expect(inLayer("base").filter((rule) => /\.[A-Za-z_-]/.test(rule.selector))).toEqual([]);
  expect(declares("utilities", "background-color")).toBe(true);
  expect(declares("utilities", "row-gap")).toBe(true);
  expect(inLayer("utilities").some((rule) => rule.selector.startsWith(".") && rule.properties.includes("font-size") && rule.properties.includes("line-height"))).toBe(true);
  expect(declares("utilities", "animation-name")).toBe(true);
  expect(inLayer("components").some((rule) => rule.selector.startsWith("."))).toBe(true);
  expect(inLayer("components").some((rule) => rule.selector.includes("*") && rule.properties.includes("transition-duration"))).toBe(true);
});

test("[install.layers.every-rule-layered] every package rule sits in a pui sublayer; only @keyframes and @property stand outside", async ({ page }) => {
  await openHarness(page, "layers");
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
      if ((sheet.ownerNode as Element | null)?.id === "react-aria-pressable-style") continue;
      walk(sheet.cssRules, []);
    }
    return { outside, filled: [...filled] };
  }, SUBLAYERS);
  expect(outside).toEqual([]);
  expect(filled.sort()).toEqual([...SUBLAYERS].sort());
});

test("[guardrails.internal-class.no-class-names] the package stylesheet names no global pui- class; its classes are scoped to the build", async ({ page }) => {
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
  expect(selectors.length).toBeGreaterThan(100);
  expect(selectors.filter((selector) => /\.pui-[a-z]/.test(selector))).toEqual([]);
});
