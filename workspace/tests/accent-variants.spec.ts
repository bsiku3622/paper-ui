import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
test(`${theme} accent variants preserve readable labels and quiet surfaces`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme });
  await page.goto("/playground");
  const matrix = page.getByTestId("color-variant-matrix");
  await expect(matrix.getByRole("button")).toHaveCount(25);
  const measure = (element: HTMLElement) => {
    const css = getComputedStyle(element);
    const root = getComputedStyle(document.documentElement);
    const parse = (color: string) => color.startsWith("#")
      ? [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
      : (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const luminance = (color: number[]) => {
      const c = color.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return c[0]! * 0.2126 + c[1]! * 0.7152 + c[2]! * 0.0722;
    };
    let background = css.backgroundColor === "rgba(0, 0, 0, 0)"
      ? parse(root.getPropertyValue("--pui-color-bg-raised").trim()) : parse(css.backgroundColor);
    const overlay = css.backgroundImage.match(/rgba?\([^)]+\)/)?.[0];
    if (overlay) {
      const rgba = (overlay.match(/[\d.]+/g) ?? []).map(Number);
      const alpha = rgba[3] ?? 1;
      background = background.map((v, i) => v * (1 - alpha) + rgba[i]! * alpha);
    }
    const l = [luminance(parse(css.color)), luminance(background)].sort((a, b) => b - a);
    return { color: css.color, contrast: (l[0]! + 0.05) / (l[1]! + 0.05), shadow: css.boxShadow, background: css.backgroundColor };
  };
  for (const button of await matrix.getByRole("button").all()) {
    const whiteWarning = theme === "light" && (await button.getAttribute("class"))?.includes("pui-a-warning-solid");
    if (whiteWarning) {
      // User-selected white-on-amber is intentionally outside the AA contrast requirement.
      expect((await button.evaluate(measure)).color).toBe("rgb(255, 255, 255)");
    } else expect((await button.evaluate(measure)).contrast).toBeGreaterThanOrEqual(4.5);
    await button.hover();
    if (whiteWarning) await expect(button).toHaveCSS("color", "rgb(255, 255, 255)");
    else await expect.poll(async () => (await button.evaluate(measure)).contrast, { message: await button.getAttribute("class") ?? "accent hover contrast" }).toBeGreaterThanOrEqual(4.5);
    expect((await button.evaluate(measure)).shadow).toBe("none");
  }
  const solid = matrix.getByRole("row").filter({ hasText: /^solid/ });
  const soft = matrix.getByRole("row").filter({ hasText: /^soft/ });
  for (const accent of ["primary", "info", "success", "warning", "error"]) {
    const fill = await solid.getByRole("button", { name: accent, exact: true }).evaluate(measure);
    const tint = await soft.getByRole("button", { name: accent, exact: true }).evaluate(measure);
    expect(fill.background).not.toBe(tint.background);
  }
});

}
