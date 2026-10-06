import { expect, test } from "@playwright/test";

for (const [size, height, padding, font, buttonPadding] of [
  ["sm", 30, 7, 13, 10],
  ["md", 32, 8, 13, 11],
  ["lg", 36, 10, 14, 14],
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
    await expect(button).toHaveCSS("padding-left", `${buttonPadding}px`);
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

for (const theme of ["light", "dark"] as const) {
  test(`outlined controls share surfaces and hover in ${theme}`, async ({ page }) => {
    await page.goto("/playground");
    await page.evaluate((theme) => document.documentElement.setAttribute("data-theme", theme), theme);
    const controls = ["base-button", "base-field", "base-select", "base-textarea"].map(id => page.getByTestId(id));
    const styles = async () => Promise.all(controls.map(control => control.evaluate(el => {
      const s = getComputedStyle(el);
      return { background: s.backgroundColor, border: s.borderColor, color: s.color, radius: s.borderRadius };
    })));
    const resting = await styles();
    for (const style of resting) expect(style).toEqual(resting[0]);
    const hoverColor = await page.evaluate(() => {
      const hex = getComputedStyle(document.documentElement).getPropertyValue("--pui-color-border-hover").trim();
      return `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
    });
    const hovered = [];
    for (const control of controls) {
      await control.hover();
      await expect(control).toHaveCSS("border-color", hoverColor);
      hovered.push(await control.evaluate(el => { const s = getComputedStyle(el); return { border:s.borderColor, background:s.backgroundColor }; }));
    }
    for (const style of hovered) expect(style).toEqual(hovered[0]);
    for (const [id, radius] of [["radius-small", 4], ["radius-card", 6], ["radius-large", 8]] as const) {
      await expect(page.getByTestId(id)).toHaveCSS("border-radius", `${radius}px`);
    }
    await expect(page.getByTestId("btn-hairline-muted")).toHaveCount(0);
  });
}
