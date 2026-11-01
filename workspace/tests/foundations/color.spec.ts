import { expect, test, type Page } from "@playwright/test";

import { ACCENTS, STATUSES, VARIANTS, tokens } from "../../packages/paper-ui/src/tokens";
import { ACCENT_PALETTES, ACCENT_STEPS, PALETTE_TOKENS } from "../../packages/paper-ui/src/tokens/inspect/color";
import { VARIANT_RECIPE } from "../../packages/paper-ui/src/tokens/color-recipes";
import { STATUS_EXCEPTIONS } from "../../packages/paper-ui/src/tokens/colors";
import { LAYOUT_SOURCE } from "../../packages/paper-ui/src/tokens/layout";
import { themeVariables } from "../../packages/paper-ui/src/tokens/variables";
import { contrast, over } from "../support/contrast";
import { openHarness } from "../support/harness";
import { expectStyle, profile } from "../support/style";

// The narrow layout starts at the md breakpoint; the wide one is the desktop frame.
for (const width of [LAYOUT_SOURCE.breakpoint.md, 1440]) {
  test(`[foundations.pages.derived-rows] palette rows stay aligned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/playground/foundations/color");
    const matrix = page.getByTestId("palette-matrix");
    await expect(matrix).toBeVisible();
    const rows = await matrix.evaluate((el) => {
      const children = Array.from(el.children);
      const columns = getComputedStyle(el).gridTemplateColumns.split(" ").length;
      return Array.from({ length: children.length / columns }, (_, row) =>
        children.slice(row * columns, (row + 1) * columns).map((child) => child.getBoundingClientRect().top));
    });
    expect(rows).toHaveLength(ACCENT_PALETTES.length + 2);
    for (const row of rows) {
      expect(row).toHaveLength(ACCENT_STEPS.length + 1);
      // Labels are vertically centered in the swatch row.
      expect(Math.max(...row) - Math.min(...row)).toBeLessThan(20);
    }
  });
}

test("[foundations.pages.derived-rows] the accent × variant table pairs every accent with every variant as a real Button and Badge", async ({ page }) => {
  await page.goto("/playground/foundations/color");
  const table = page.getByTestId("color-variant-matrix");
  await expect(table).toBeVisible();
  const rows = table.getByRole("row");
  await expect(rows).toHaveCount(VARIANTS.length + 1);
  for (const row of await rows.all()) {
    expect(await row.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(ACCENTS.length + 1);
  }
  const buttons = table.getByRole("button");
  await expect(buttons).toHaveCount(ACCENTS.length * VARIANTS.length);
  const cells = table.getByRole("cell");
  await expect(cells).toHaveCount(ACCENTS.length * VARIANTS.length);
  for (const [index, variant] of VARIANTS.entries()) {
    for (const [column, accent] of ACCENTS.entries()) {
      const cell = cells.nth(index * ACCENTS.length + column);
      const paint = profile(accent, variant);
      await expectStyle(cell.getByRole("button"), paint);
      await expectStyle(cell.locator(":scope > :nth-child(2)"), { backgroundColor: paint.backgroundColor!, color: paint.color! });
    }
  }
});

// The mode in force on the page: the project's colour scheme, since no attribute is on <html>.
const modeOf = (page: Page) => page.evaluate(() => (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

test("[foundations.color.accent-variants-readable] all 25 accent × variant Buttons read at 4.5:1 at rest and hovered, solid differs from soft, and none casts a shadow", async ({ page }) => {
  await openHarness(page, "accents");
  const mode = await modeOf(page);
  const canvas = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  // The documented exception: a status whose solid and wash the exception table replaces in this mode.
  const excepted = (accent: string) => mode in ((STATUS_EXCEPTIONS as Record<string, Record<string, object>>)[accent] ?? {});
  const solids: Record<string, string> = {};
  const softs: Record<string, string> = {};
  for (const accent of ACCENTS) {
    for (const variant of VARIANTS) {
      const button = page.getByTestId(`accent-${accent}-${variant}`);
      const paint = () => button.evaluate((element) => {
        const style = getComputedStyle(element);
        return { face: style.backgroundColor, ink: style.color, tint: style.getPropertyValue("--pui-state-tint").trim(), shadow: style.boxShadow };
      });
      const rest = await paint();
      // A transparent face stands on the canvas the Button sits on.
      const ground = /^rgba\(.*, 0\)$/.test(rest.face) ? canvas : rest.face;
      const at = `${mode} ${accent} ${variant}`;
      const check = (ratio: number, where: string) => {
        if (variant === "solid" && excepted(accent)) expect(ratio, `${at} ${where}, the documented exception`).toBeLessThan(4.5);
        else expect(ratio, `${at} ${where}`).toBeGreaterThanOrEqual(4.5);
      };
      check(contrast(rest.ink, ground), "at rest");
      expect(rest.shadow, `${at} casts no shadow`).toBe("none");
      // A tint hover lays a colour over the face: composited, the text still reads. A border hover leaves the face alone.
      await button.hover();
      if (VARIANT_RECIPE[variant].hover === "tint") await expect.poll(async () => (await paint()).tint, `${at} hover tint`).not.toBe(rest.tint);
      const hovered = await paint();
      check(contrast(hovered.ink, over(hovered.tint, ground)), "hovered");
      await page.mouse.move(0, 0);
      if (variant === "solid") solids[accent] = rest.face;
      if (variant === "soft") softs[accent] = rest.face;
    }
    expect(solids[accent], `${accent}: solid differs from soft`).not.toBe(softs[accent]);
  }
});

// A custom property as the stylesheet declares it and the browser returns it: the same tokens, spaced alike.
const normal = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ").replace(/(?<![\d.])0\./g, ".");

test("[foundations.pages.palette-chips] a chip of the Palette says its step and HEX under the pointer, and a role card names the Palette Token it selects", async ({ page, colorScheme }) => {
  await page.goto("/playground/foundations/color");
  const matrix = page.getByTestId("palette-matrix");
  await expect(matrix).toBeVisible();
  for (const step of ACCENT_STEPS) await expect(matrix.getByTitle(`Blue ${step} · ${PALETTE_TOKENS.accent.blue[step]}`, { exact: true }), step).toHaveCount(1);
  // The steps the matrix does not show are named on the role cards of the mode in force: 0 on a light page, 875 on a dark one, and the alpha steps on both.
  const steps = [colorScheme === "dark" ? /^neutral\.875 · #/ : /^neutral\.0 · #/, /^alpha\d+\.neutral\.\d+ · #/];
  for (const token of steps) expect(await page.getByTitle(token).count(), String(token)).toBeGreaterThan(0);
});

test("[foundations.color.status-dots] a status point beside letters takes their ink, where one that stands alone takes the accent's solid", async ({ page }) => {
  await openHarness(page, "accents");
  const badge = page.getByTestId("badge-dot");
  const [ink, point] = await badge.evaluate((element) => [getComputedStyle(element).color, getComputedStyle(element.querySelector("[aria-hidden]")!).backgroundColor]);
  expect(point).toBe(ink);
  await page.goto("/playground");
  for (const status of STATUSES) await expectStyle(page.getByTestId(`dot-${status}`), { backgroundColor: tokens.color.accent[status].solid });
});

test("[foundations.emission.root-values] the computed variables of :root, and of a mode scope and its children, are the ones themeVariables() declares", async ({ page }) => {
  await openHarness(page, "theme");
  const { source, invariant, modes } = themeVariables();
  const mode = await modeOf(page);
  const computed = (selector: string, names: string[]) =>
    page.locator(selector).evaluate((element, names) => names.map((name) => [name, getComputedStyle(element).getPropertyValue(name)] as const), names);
  const differing = async (selector: string, declared: Record<string, string>) => {
    const rows = await computed(selector, Object.keys(declared));
    return rows.filter(([name, value]) => normal(value) !== normal(declared[name]!)).map(([name, value]) => `${selector} ${name}: ${value.trim()} ≠ ${declared[name]}`);
  };
  // :root carries the sources, the invariants and the mode in force, ground roles included.
  expect(await differing("html", { ...source, ...invariant, ...modes[mode].own, ...modes[mode].ground })).toEqual([]);
  // A scope paints its own roles on itself and the ground roles from its children down, whatever the mode around it.
  await page.evaluate(() => {
    document.body.insertAdjacentHTML("beforeend", `<div id="scope-light" data-pui-theme="light"><div id="scope-light-child"></div></div><div id="scope-dark" data-pui-theme="dark"><div id="scope-dark-child"></div></div>`);
  });
  for (const scope of ["light", "dark"] as const) {
    expect(await differing(`#scope-${scope}`, modes[scope].own), `${scope} scope`).toEqual([]);
    expect(await differing(`#scope-${scope}-child`, modes[scope].ground), `${scope} scope child`).toEqual([]);
  }
  // The sources are the same in every mode, so a scope inherits them untouched.
  expect(await differing("#scope-dark", source)).toEqual([]);
});
