import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

// Render the real package through Vite, without a test-only route in the product app.
const mount = async (page: Page) => {
  const modules: Record<string, string> = {};
  page.on("response", (response) => {
    for (const name of ["react.js", "react-dom_client.js"]) {
      if (new URL(response.url()).pathname.endsWith(`/${name}`)) modules[name] = response.url();
    }
  });
  await page.goto("/playground");
  await expect(page.getByRole("heading", { name: "Playground", exact: true })).toBeVisible();
  await page.evaluate(async ({ entry, modules }) => {
    const react = await import(modules["react.js"]!);
    const h = (react.default ?? react).createElement;
    const dom = await import(modules["react-dom_client.js"]!);
    const { createRoot } = dom.default ?? dom;
    const ui = await import(entry);
    document.getElementById("root")!.style.display = "none";
    const host = document.createElement("div");
    host.id = "shape-fixture";
    document.body.append(host);
    const options = [h(ui.Select.Option, { key: "empty", value: "" }, "Choose"), h(ui.Select.Option, { key: "a", value: "a" }, "Option A")];
    createRoot(host).render(h("form", { id: "shape-form" },
      h("button", { type: "button", id: "before-select" }, "Before"),
      ...["sm", "md", "lg"].map((size) => h("div", { key: size, "data-size": size },
        h(ui.Button, { size, "data-testid": `button-${size}` }, "Button"),
        h(ui.IconButton, { size, "aria-label": `icon-${size}`, "data-testid": `icon-${size}` }, h(ui.Icon, {}, h("path", {d:"M12 4v16M4 12h16"}))),
        h(ui.Field, { size, "aria-label": `field-${size}`, "data-testid": `field-${size}` }),
        h(ui.Select, { size, name: `select-${size}`, "aria-label": `select-${size}` }, options),
        h(ui.Textarea, { size, "aria-label": `textarea-${size}` }),
        h(ui.Checkbox, { size, defaultChecked: true, "aria-label": `checkbox-${size}` }),
        h(ui.Radio, { size, defaultChecked: true, "aria-label": `radio-${size}` }),
        h(ui.Switch, { size, defaultChecked: true, "aria-label": `switch-${size}` }),
        h(ui.Badge, { size, "data-testid": `badge-${size}` }, "Badge"),
      )),
      h(ui.Box, { radius: "sm", "data-testid": "surface-corner" }, "Surface"),
      h(ui.ThemeScope, { theme: "dark" },
        h(ui.Select, { "aria-label": "dark-select", defaultValue: "a" }, options),
        h(ui.ThemeScope, { theme: "light" }, h(ui.Select, { "aria-label": "nested-light-select" }, options)),
      ),
    ));
  }, { entry: `/@fs${resolve("packages/paper-ui/src/index.ts")}`, modules });
  await expect(page.getByLabel("select-md", { exact: true })).toBeVisible();
};

const metrics = (page: Page, selector: string, pseudo?: string) => page.locator("#shape-fixture").locator(selector).evaluate((element, pseudo) => {
  const s = getComputedStyle(element, pseudo);
  return { width: parseFloat(s.width), height: parseFloat(s.height), padding: parseFloat(s.paddingInlineStart), blockPadding: parseFloat(s.paddingBlockStart), radius: parseFloat(s.borderRadius), transform: s.transform, inset: parseFloat(s.insetInlineStart) };
}, pseudo);

test("all control sizes retain their geometry and optical marks", async ({ page }) => {
  await mount(page);
  const sizes = ["sm", "md", "lg"];
  for (const [i, size] of sizes.entries()) {
    const button = await metrics(page, `[data-testid=button-${size}]`);
    expect(button.height).toBe([30, 32, 36][i]);
    expect(button.padding).toBe([10, 11, 14][i]);
    const icon = await metrics(page, `[data-testid=icon-${size}]`);
    expect(icon.width).toBe(icon.height);
    const field = await metrics(page, `[data-testid=field-${size}]`);
    expect(field.height).toBe(button.height);
    expect(field.padding).toBe([7, 8, 10][i]);
    const select = await metrics(page, `span:has(> select[aria-label=select-${size}])`);
    expect(select.height).toBe(button.height);
    expect(select.padding).toBe([7, 8, 10][i]);
    // One textarea row is exactly one control tall.
    expect((await metrics(page, `textarea[aria-label=textarea-${size}]`)).blockPadding).toBe([4, 5, 7][i]);
    expect((await metrics(page, `span:has(> select[aria-label=select-${size}]) > svg`)).width).toBe([16, 18, 20][i]);
    expect((await metrics(page, `[aria-label=checkbox-${size}]`)).width).toBe([15, 16, 18][i]);
    expect((await metrics(page, `[aria-label=checkbox-${size}]`)).radius).toBe(3);
    expect((await metrics(page, `[aria-label=checkbox-${size}]`, "::after")).width).toBe([7.5, 8, 9][i]);
    expect((await metrics(page, `[aria-label=radio-${size}]`, "::after")).width).toBe([7.5, 8, 9][i]);
    const track = await metrics(page, `[aria-label=switch-${size}]`);
    const thumb = await metrics(page, `[aria-label=switch-${size}]`, "::after");
    expect(track.width).toBe([30, 32, 36][i]);
    expect(track.height).toBe([17, 18, 20][i]);
    expect(thumb.width).toBe([13, 14, 16][i]);
    expect(thumb.inset).toBe(2);
    expect((await metrics(page, `[data-testid=badge-${size}]`)).height).toBe([20, 22, 24][i]);
  }
});

test("one source override in a subtree re-derives every role built on it", async ({ page }) => {
  await mount(page);
  await page.locator("#shape-fixture").evaluate((element) => {
    for (const [name, value] of Object.entries({
      "--pui-shape-control-height-md": "40px",
      "--pui-shape-radius-control": "9px",
      "--pui-shape-radius-surface-sm": "3px",
      "--pui-shape-focus-width": "5px",
    })) element.style.setProperty(name, value);
  });
  // control height 40 → inset (40 − 16) / 2 = 12, button round(12 × 1.4) = 17, selection 20.
  expect((await metrics(page, "[data-testid=button-md]")).height).toBe(40);
  expect((await metrics(page, "[data-testid=button-md]")).padding).toBe(17);
  expect((await metrics(page, "[data-testid=field-md]")).padding).toBe(12);
  expect((await metrics(page, "[aria-label=checkbox-md]")).width).toBe(20);
  expect((await metrics(page, "[aria-label=checkbox-md]", "::after")).width).toBe(10);
  expect((await metrics(page, "[aria-label=radio-md]", "::after")).width).toBe(10);
  expect((await metrics(page, "[aria-label=switch-md]")).width).toBe(40);
  expect((await metrics(page, "[aria-label=switch-md]")).height).toBe(22);
  expect((await metrics(page, "[aria-label=switch-md]", "::after")).width).toBe(18);
  expect((await metrics(page, "textarea[aria-label=textarea-md]")).blockPadding).toBe(9);
  expect((await metrics(page, "[data-testid=button-md]")).radius).toBe(9);
  expect((await metrics(page, "[data-testid=surface-corner]")).radius).toBe(3);
  // Focus width changes do not alter the switch rim or checkbox mark thickness.
  expect((await metrics(page, "[aria-label=switch-md]", "::after")).inset).toBe(2);
  await page.locator("#shape-fixture").evaluate((element: HTMLElement) => { element.dir = "rtl"; });
  await expect.poll(async () => (await metrics(page, "[aria-label=switch-md]", "::after")).transform).toBe("matrix(1, 0, 0, 1, -18, -9)");
});

test("rem geometry scales together while edge strokes stay in CSS pixels", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "20px"; });
  expect((await metrics(page, "[data-testid=button-md]")).height).toBe(40);
  expect((await metrics(page, "[aria-label=switch-md]")).width).toBe(40);
  // The switch rim is an emphasis stroke, so it stays 2px while the track grows.
  expect((await metrics(page, "[aria-label=switch-md]")).height).toBe(22);
  expect((await metrics(page, "[aria-label=switch-md]", "::after")).width).toBe(18);
  expect((await metrics(page, "[aria-label=switch-md]", "::after")).inset).toBe(2);
  // (40 − 25) / 2 − 1: the textarea line still sits where a Field's would.
  expect((await metrics(page, "textarea[aria-label=textarea-md]")).blockPadding).toBe(6.5);
  await expect(page.locator("#shape-fixture [data-testid=button-md]")).toHaveCSS("border-top-width", "1px");
});

test("Select keeps native form and keyboard contracts while its arrow follows scoped ink", async ({ page }) => {
  await mount(page);
  const select = page.getByLabel("select-md", { exact: true });
  const arrow = select.locator("+ svg");
  await page.locator("#shape-fixture").evaluate((element) => {
    element.style.setProperty("--pui-color-ink-secondary", "rebeccapurple");
    element.style.setProperty("--pui-color-ink-tertiary", "teal");
  });
  await expect(arrow).toHaveCSS("color", "rgb(0, 128, 128)");
  await select.selectOption("a");
  await expect(arrow).toHaveCSS("stroke", "rgb(102, 51, 153)");
  expect(await page.locator("#shape-form").evaluate((form) => new FormData(form as HTMLFormElement).get("select-md"))).toBe("a");
  await select.click();
  await page.keyboard.press("Escape");
  await expect(select).toHaveCSS("outline-style", "none");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(select).toBeFocused();
  await expect(select.locator("..")).toHaveCSS("outline-width", "2px");
  await select.locator("..").evaluate((element) => { element.style.width = "240px"; });
  expect((await select.locator("..").boundingBox())!.width).toBe(240);
  const selectBox = (await select.locator("..").boundingBox())!;
  const arrowBox = (await arrow.boundingBox())!;
  // The arrow is a trailing icon at the input inset (8) inside the 1px border.
  expect(selectBox.x + selectBox.width - arrowBox.x - arrowBox.width).toBe(9);
  // A nested light scope must win over the outer dark scope in both text and arrow.
  const dark = page.getByLabel("dark-select", { exact: true });
  const nested = page.getByLabel("nested-light-select", { exact: true });
  const ink = async (selector: typeof dark, role: string) => selector.evaluate((element, role) => {
    const sample = document.createElement("span");
    sample.style.color = `var(--pui-color-ink-${role})`;
    element.parentElement!.append(sample);
    const color = getComputedStyle(sample).color;
    sample.remove();
    return color;
  }, role);
  await expect(dark.locator("+ svg")).toHaveCSS("color", await ink(dark, "secondary"));
  await expect(nested.locator("+ svg")).toHaveCSS("color", await ink(nested, "tertiary"));
});
