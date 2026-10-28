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
  });
}

test("former palette and tokens routes land on the Color foundation", async ({ page }) => {
  for (const route of ["/playground/palette", "/playground/tokens", "/playground/foundations"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/playground\/foundations\/color$/);
  }
});
