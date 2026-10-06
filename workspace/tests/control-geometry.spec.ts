import { expect, test } from "@playwright/test";

for (const [size, height, padding, font] of [
  ["sm", 26, 6, 13],
  ["md", 30, 8, 13],
  ["lg", 36, 10, 14],
] as const) {
  test(`Paperdown geometry: ${size} controls align and preserve value space`, async ({ page }) => {
    await page.goto("/playground");
    const row = page.getByTestId(`spec-size-${size}`);
    const input = row.getByRole("textbox");
    const select = row.getByRole("combobox");
    const button = row.getByRole("button");
    const field = input.locator("..");
    for (const control of [field, select, button]) {
      await expect(control).toHaveCSS("height", `${height}px`);
      await expect(control).toHaveCSS("border-radius", "4px");
      await expect(control).toHaveCSS("font-size", `${font}px`);
    }
    await expect(field).toHaveCSS("padding-left", `${padding}px`);
    await expect(select).toHaveCSS("padding-left", `${padding}px`);
    const boxes = await Promise.all([field, select, button].map((control) => control.boundingBox()));
    expect(Math.max(...boxes.map((box) => box!.y)) - Math.min(...boxes.map((box) => box!.y))).toBeLessThanOrEqual(1);
    await input.fill("11.25");
    await expect(input).toHaveValue("11.25");
    expect(await input.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(50);
    await input.press("Tab");
    await expect(select).toBeFocused();
    await expect(select).toHaveCSS("outline-style", "solid");
  });
}
