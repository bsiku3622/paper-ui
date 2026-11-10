import { expect, test } from "@playwright/test";

import { COLOR_VALUES_BY_MODE } from "../../packages/paper-ui/src/tokens/colors";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { openHarness } from "../support/harness";

const BAR = 56;

test.describe("a wide screen", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("[components.sidebar.rail] sticks below the bar with the rest of the height, one line on its end edge and the scrollbar inside it", async ({ page }) => {
    await openHarness(page, "sidebar");
    const nav = page.getByTestId("sidebar");
    const before = (await nav.boundingBox())!;
    expect(before.y).toBe(BAR);
    expect(before.width).toBe(240);
    expect(before.height).toBe(900 - BAR);
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect.poll(async () => (await nav.boundingBox())!.y).toBe(BAR);
    const read = await nav.evaluate((element) => {
      const style = getComputedStyle(element);
      return { position: style.position, edge: style.borderInlineEndWidth, color: style.borderInlineEndColor, start: style.borderInlineStartWidth, overflow: style.overflowY, inert: element.hasAttribute("inert") };
    });
    expect(read).toMatchObject({ position: "sticky", edge: "1px", start: "0px", overflow: "auto", inert: false });
    expect(read.color).toBe(await page.evaluate((hex) => { const probe = document.createElement("i"); probe.style.color = hex; document.body.append(probe); const resolved = getComputedStyle(probe).color; probe.remove(); return resolved; }, COLOR_VALUES_BY_MODE.light.border.base));
  });

  test("[components.sidebar.rail] keeps the footer at the bottom of the rail", async ({ page }) => {
    await openHarness(page, "sidebar");
    const nav = (await page.getByTestId("sidebar").boundingBox())!;
    const last = (await page.getByTestId("sidebar-last").boundingBox())!;
    expect(nav.y + nav.height - (last.y + last.height)).toBeLessThan(24);
    await expect(page.getByTestId("sidebar-menu")).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("a screen just below md", () => {
  test.use({ viewport: { width: 600, height: 900 } });

  test("[components.sidebar.drawer] grows the drawer to the xl width and no further, leaving the rest to the scrim", async ({ page }) => {
    await openHarness(page, "sidebar");
    const nav = page.getByTestId("sidebar");
    await page.getByTestId("sidebar-menu").click();
    await expect.poll(async () => (await nav.boundingBox())!.x).toBe(0);
    expect((await nav.boundingBox())!.width).toBe(SHAPE_SOURCE.dimension.width.xl);
  });
});

test.describe("a narrow screen", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("[components.sidebar.drawer] waits off screen and inert, then stands in place under the bar with the scrim around it", async ({ page }) => {
    await openHarness(page, "sidebar");
    const nav = page.getByTestId("sidebar");
    const closed = (await nav.boundingBox())!;
    expect(closed.x + closed.width).toBeLessThanOrEqual(0);
    await expect(nav).toHaveAttribute("inert", "");

    await page.getByTestId("sidebar-menu").click();
    await expect(nav).not.toHaveAttribute("inert", "");
    await expect.poll(async () => (await nav.boundingBox())!.x).toBe(0);
    const open = (await nav.boundingBox())!;
    expect(open.y).toBe(BAR);
    expect(open.height).toBe(844 - BAR);
    expect(open.width).toBe(390 - SHAPE_SOURCE.space["3xl"]);
    expect(await nav.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");

    const scrim = await page.evaluate(() => {
      const element = document.elementFromPoint(380, 400)!;
      const style = getComputedStyle(element);
      return { tag: element.tagName, top: element.getBoundingClientRect().top, background: style.backgroundColor, position: style.position };
    });
    expect(scrim).toMatchObject({ tag: "DIV", top: BAR, position: "fixed" });
    expect(scrim.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  });

  test("[components.sidebar.dismiss] closes on the scrim, on Escape and on an item, and gives focus back to the menu button", async ({ page }) => {
    await openHarness(page, "sidebar");
    const nav = page.getByTestId("sidebar");
    const menu = page.getByTestId("sidebar-menu");
    for (const close of [() => page.mouse.click(380, 400), () => page.keyboard.press("Escape"), () => page.getByTestId("sidebar-first").click()]) {
      await menu.click();
      await expect(nav).not.toHaveAttribute("inert", "");
      await close();
      await expect(nav).toHaveAttribute("inert", "");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
    }
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(nav).not.toHaveAttribute("inert", "");
    expect(await nav.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
  });
});
