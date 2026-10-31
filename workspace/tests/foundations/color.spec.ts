import { expect, test } from "@playwright/test";

import { LAYOUT_SOURCE } from "../../packages/paper-ui/src/tokens/layout";
import { ACCENT_PALETTES, ACCENT_STEPS } from "../../packages/paper-ui/src/tokens/palette";
import { ACCENTS, VARIANTS } from "../../packages/paper-ui/src/tokens";
import { expectStyle, profile } from "../support/style";

// The narrow layout starts at the md breakpoint; the wide one is the desktop frame.
for (const width of [LAYOUT_SOURCE.breakpoint.md, 1440]) {
  test(`palette rows stay aligned at ${width}px`, async ({ page }) => {
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

test("the accent × variant table pairs every accent with every variant as a real Button and Badge", async ({ page }) => {
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
