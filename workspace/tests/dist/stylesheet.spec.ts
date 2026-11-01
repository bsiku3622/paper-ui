import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

// dist/paper-ui.css of the tarball (the smoke hands its path over), loaded into a blank page. The rules that carry no
// class are the ones that reach elements the package does not own, so they are the rules the docs declare.
const STYLESHEET = process.env.DIST_STYLESHEET;
if (!STYLESHEET) throw new Error("DIST_STYLESHEET is not set: the dist specs run only through `pnpm smoke:dist`.");

const SUBLAYERS = ["pui.reset", "pui.theme", "pui.base", "pui.utilities", "pui.components"];

// A selector as the docs write it and the browser serialises it, compared without quotes or extra spaces.
const normal = (selector: string) => selector.replace(/["']/g, "").replace(/\s+/g, " ").trim();

// Every layer's rules without a class selector, one entry per selector of a rule's list, and everything that is
// not inside a sublayer of pui.
const readStylesheet = async (page: Page) => {
  await page.goto("about:blank");
  await page.addStyleTag({ path: STYLESHEET });
  return page.evaluate((sublayers) => {
    const TOP_LEVEL = ["CSSKeyframesRule", "CSSPropertyRule", "CSSLayerStatementRule"];
    const classless = new Map<string, Set<string>>();
    const outside: string[] = [];
    const split = (list: string) => {
      const parts: string[] = [];
      let depth = 0;
      let current = "";
      for (const char of list) {
        if ("([".includes(char)) depth++;
        if (")]".includes(char)) depth--;
        if (char === "," && depth === 0) {
          parts.push(current);
          current = "";
        } else current += char;
      }
      return [...parts, current].map((part) => part.trim());
    };
    const walk = (rules: CSSRuleList, layers: string[]) => {
      for (const rule of Array.from(rules)) {
        const kind = rule.constructor.name;
        if (kind === "CSSLayerBlockRule") {
          walk((rule as CSSLayerBlockRule).cssRules, [...layers, (rule as CSSLayerBlockRule).name]);
          continue;
        }
        if (layers.length === 0) {
          if (!TOP_LEVEL.includes(kind)) outside.push(`${kind} ${rule.cssText.slice(0, 80)}`);
          continue;
        }
        const layer = layers.join(".");
        if (kind === "CSSStyleRule") {
          // A rule nested inside a class rule belongs to that class: only the top of a rule counts.
          if (!sublayers.includes(layer)) outside.push(`${layer} ${rule.cssText.slice(0, 80)}`);
          for (const selector of split((rule as CSSStyleRule).selectorText).filter((part) => !/\.[A-Za-z_-]/.test(part))) classless.set(layer, (classless.get(layer) ?? new Set()).add(selector));
          continue;
        }
        if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, layers);
        else if (!TOP_LEVEL.includes(kind) || layers.length > 0) outside.push(`${layer} ${kind}`);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, []);
    return { classless: Object.fromEntries([...classless].map(([layer, selectors]) => [layer, [...selectors]])), outside };
  }, SUBLAYERS);
};

// The rows of the table under a heading: layer → the selectors its second cell names.
const documented = (path: string, heading: RegExp): Record<string, string[]> => {
  const lines = readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8").split("\n");
  const start = lines.findIndex((line) => heading.test(line));
  expect(start, `${path} has the section ${heading}`).toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  const found: Record<string, Set<string>> = {};
  for (const row of lines.slice(start, end < 0 ? undefined : end).filter((line) => /^\|\s*`pui\./.test(line))) {
    const [, layerCell = "", selectorCell = ""] = row.split("|");
    const layer = /`([^`]+)`/.exec(layerCell)![1]!;
    for (const [, selector] of selectorCell.matchAll(/`([^`]+)`/g)) (found[layer] ??= new Set()).add(normal(selector!));
  }
  return Object.fromEntries(Object.entries(found).map(([layer, selectors]) => [layer, [...selectors].sort()]));
};

test("[install.stylesheet.global-rules] the rules without a class selector are exactly the documented ones, layer by layer", async ({ page }) => {
  const { classless } = await readStylesheet(page);
  const actual = Object.fromEntries(Object.entries(classless).map(([layer, selectors]) => [layer, selectors.map(normal).sort()]));
  expect(Object.keys(actual).sort()).toEqual(["pui.base", "pui.components", "pui.reset", "pui.theme"]);
  expect(documented("../../../docs/get-started/install.md", /^## 이 스타일시트가 거는 전역 규칙$/)).toEqual(actual);
  expect(documented("../../packages/paper-ui/README.md", /^## What the stylesheet sets globally$/)).toEqual(actual);
});

test("[install.stylesheet.global-rules] every rule sits inside a pui sublayer, and only @keyframes and @property stand outside", async ({ page }) => {
  const { outside } = await readStylesheet(page);
  expect(outside).toEqual([]);
});
