import { expect, test, type Page } from "@playwright/test";

import { metrics as measure } from "../support/geometry";
import { openHarness, openPlayground } from "../support/harness";
import { tab } from "../support/keyboard";

// The real package, mounted by the harness through its exports (?case=geometry).
const mount = async (page: Page) => {
  await openHarness(page, "geometry");
  await expect(page.getByLabel("select-md", { exact: true })).toBeVisible();
};

const metrics = (page: Page, selector: string, pseudo?: string) => measure(page.locator("#shape-fixture").locator(selector), pseudo);

test("[foundations.shape.control-geometry] [foundations.shape.recipe-geometry] all control sizes retain their geometry and optical marks", async ({ page }) => {
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

test("[foundations.override.rederives-roles] one source override in a subtree re-derives every role built on it", async ({ page }) => {
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

test("[foundations.override.portal-carry] a Floating opened inside an overriding region draws its controls with the region's source, and one opened outside keeps the defaults", async ({ page }) => {
  await mount(page);
  await page.locator("#shape-fixture").evaluate((element) => {
    element.style.setProperty("--pui-shape-control-height-md", "40px");
    element.style.setProperty("--pui-shape-space-lg", "24px");
  });
  for (const [where, height, gutter] of [["inside", 40, 24], ["outside", 32, 16]] as const) {
    for (const presentation of ["popover", "modal"] as const) {
      const id = `${where}-${presentation}`;
      await page.getByTestId(`${id}-trigger`).click();
      await expect(page.getByTestId(id)).toBeVisible();
      expect((await measure(page.getByTestId(`${id}-button`))).height, `${id} button`).toBe(height);
      expect((await measure(page.getByTestId(`${id}-field`))).height, `${id} field`).toBe(height);
      // The dialog's scrim keeps the page gutter from the dialog.
      if (presentation === "modal") expect((await measure(page.getByTestId(id).locator("xpath=.."))).padding, `${id} scrim`).toBe(gutter);
      await page.getByTestId(id).getByRole("button", { name: "Close" }).click();
      await expect(page.locator("[data-presentation]")).toHaveCount(0);
    }
  }
});

for (const [where, height, gutter, gap] of [["inside", 40, 24, 12], ["outside", 32, 16, 8]] as const) {
  for (const presentation of ["popover", "modal"] as const) {
    for (const trigger of ["above", "below"] as const) {
      for (const mount of ["page", "press"] as const) {
        test(`[foundations.override.portal-carry] a panel already open when it mounts takes the source of its Trigger's region: ${where}, ${presentation}, Trigger ${trigger}, focus ${mount === "page" ? "on the page" : "in another region"}`, async ({ page }) => {
          await openHarness(page, "carry", { where, presentation, trigger, mount });
          if (mount === "press") {
            await page.getByTestId("mount").focus();
            await page.keyboard.press("Enter");
          }
          const panel = page.getByTestId("panel");
          await expect(panel).toBeVisible();
          expect((await measure(page.getByTestId("button"))).height).toBe(height);
          expect((await measure(page.getByTestId("field"))).height).toBe(height);
          if (presentation === "modal") {
            expect((await measure(panel.locator("xpath=.."))).padding).toBe(gutter);
          } else {
            await expect(panel).not.toHaveAttribute("data-presence", /.*/);
            const [from, to] = [(await page.getByTestId("trigger").boundingBox())!, (await panel.boundingBox())!];
            expect(to.y - (from.y + from.height)).toBeCloseTo(gap, 1);
          }
        });
      }
    }
  }
}

test("[foundations.shape.stroke-px] rem geometry scales together while edge strokes stay in CSS pixels", async ({ page }) => {
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

test("[atoms.select.native-form] Select keeps native form and keyboard contracts while its arrow follows scoped ink", async ({ page }) => {
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
  await tab(page);
  await tab(page, { shift: true });
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

test("[foundations.shape.focus-ring] the baseline draws the ring on an element with no corners of its own and leaves its corners alone, where Link and the prose link keep theirs", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.id = "ring-probe";
    probe.tabIndex = 0;
    probe.textContent = "no corners of its own";
    document.body.prepend(probe);
  });
  await tab(page);
  const probe = page.locator("#ring-probe");
  await expect(probe).toBeFocused();
  await expect(probe).toHaveCSS("outline-style", "solid");
  await expect(probe).toHaveCSS("outline-width", "2px");
  await expect(probe).toHaveCSS("outline-offset", "2px");
  await expect(probe).toHaveCSS("border-top-left-radius", "0px");

  // A link in prose is rounded by the rule that styles it, so its ring is still a rounded one.
  await page.goto("/docs/foundations/shape");
  await expect(page.locator(".md a").first()).toHaveCSS("border-top-left-radius", "4px");
  // So is the Link Atom, whose stylesheet declares the corner its ring follows.
  await openPlayground(page, "link", "Link");
  await expect(page.getByRole("link", { name: "링크", exact: true })).toHaveCSS("border-top-left-radius", "4px");
});
