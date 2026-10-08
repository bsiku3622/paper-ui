import { expect, test } from "@playwright/test";

for (const width of [760, 1440]) {
  test(`palette rows stay aligned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/playground/foundations/color");
    const matrix = page.locator(".foundation-palette-matrix");
    await expect(matrix).toBeVisible();
    const rows = await matrix.evaluate((el) => {
      const children = Array.from(el.children);
      const columns = getComputedStyle(el).gridTemplateColumns.split(" ").length;
      return Array.from({ length: children.length / columns }, (_, row) =>
        children.slice(row * columns, (row + 1) * columns).map((child) => child.getBoundingClientRect().top));
    });
    expect(rows).toHaveLength(6);
    for (const row of rows) {
      expect(row).toHaveLength(15);
      // Labels are vertically centered in the swatch row.
      expect(Math.max(...row) - Math.min(...row)).toBeLessThan(20);
    }
    await page.goto("/playground/palette");
    for (const selector of [".palette-grid--neutral", ".palette-grid--accent"]) {
      const grids = page.locator(selector);
      for (const grid of await grids.all()) {
        const tops = await grid.evaluate((el) => Array.from(el.children).map((child) => child.getBoundingClientRect().top));
        expect(new Set(tops).size).toBe(1);
      }
    }
  });
}
