import { expect, test } from "@playwright/test";

// The palette is the Color source: one chip per generated step, all the same size, one row per ramp.
for (const width of [760, 1440]) {
  test(`color palette chips stay one size and one row per ramp at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/playground/foundations/color");
    const section = page.locator("section", { has: page.getByRole("heading", { name: "Color Palette", exact: true }) });
    const chips = section.getByRole("img");
    // neutral 16 steps + 4 accent ramps × 14 steps + 2 alpha ramps × 19 steps
    await expect(chips).toHaveCount(16 + 4 * 14 + 2 * 19);
    const rects = await chips.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { family: (element.getAttribute("aria-label") ?? "").split(" ").slice(0, -2).join(" "), width: rect.width, top: rect.top };
    }));
    const ramp = rects.slice(0, 16 + 4 * 14);
    const widths = ramp.map((rect) => rect.width);
    // The first and last steps are as wide as the middle ones.
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.5);
    for (const family of new Set(ramp.map((rect) => rect.family))) {
      expect(new Set(ramp.filter((rect) => rect.family === family).map((rect) => Math.round(rect.top))).size).toBe(1);
    }
  });
}

test("former palette and tokens routes land on the Color foundation", async ({ page }) => {
  for (const route of ["/playground/palette", "/playground/tokens", "/playground/foundations"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/playground\/foundations\/color$/);
  }
});
