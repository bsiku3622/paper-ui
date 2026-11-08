import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { roleDp } from "../support/geometry";
import { openHarness } from "../support/harness";
import { tab } from "../support/keyboard";
import { nativeSelect } from "../support/select";

test.beforeEach(async ({ page }) => {
  await openHarness(page, "states");
});

// Put the focus on what comes before the target in the Tab order, then press Tab, so the focus the target holds is the keyboard's.
const reachByKeyboard = async (page: Page, target: Locator) => {
  await target.evaluate((element) => {
    const tabbable = [...document.querySelectorAll<HTMLElement>("button, a[href], input, textarea, select, [tabindex]")].filter((candidate) => !candidate.hasAttribute("disabled") && candidate.tabIndex >= 0);
    tabbable[tabbable.indexOf(element as HTMLElement) - 1]?.focus();
  });
  await tab(page);
  await expect(target).toBeFocused();
};

test("[atoms.select.listbox] [primitives.floating.content-options] opens its list under the frame (over it without room) from its start edge, never narrower than the frame, with rows of the Select's own height", async ({ page }) => {
  // A Select away from the window's edges: the one at the end of an auto track.
  const frame = page.getByTestId("select-auto");
  await frame.evaluate((element) => element.scrollIntoView({ block: "center" }));
  const trigger = frame.getByRole("combobox");
  await trigger.click();
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-controls", (await list.getAttribute("id"))!);
  await expect(trigger).toBeFocused();
  // The list rises in as it opens; it is measured where it settles.
  await expect(list).not.toHaveAttribute("data-presence", /.*/);
  const box = (await frame.boundingBox())!;
  const panel = (await list.boundingBox())!;
  // Under the frame, or over it when the window has no room below; either way a step of the gap scale from it.
  const gap = roleDp(tokens.layout.gap.xs);
  const below = panel.y - (box.y + box.height);
  const above = box.y - (panel.y + panel.height);
  expect(Math.min(Math.abs(below - gap), Math.abs(above - gap))).toBeLessThan(1);
  expect(Math.abs(panel.x - box.x)).toBeLessThan(1);
  expect(panel.width).toBeGreaterThanOrEqual(box.width - 0.5);
  const height = roleDp(tokens.shape.control.height.md);
  for (const option of await list.getByRole("option").all()) expect((await option.boundingBox())!.height).toBeCloseTo(height, 0);
});

test("[atoms.select.listbox] [primitives.floating.content-options] keeps the list of a Select that spans the window inside the window's gutters", async ({ page }) => {
  const frame = page.getByTestId("select");
  await frame.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await frame.getByRole("combobox").click();
  await expect(page.getByRole("listbox")).not.toHaveAttribute("data-presence", /.*/);
  const panel = (await page.getByRole("listbox").boundingBox())!;
  const width = await page.evaluate(() => document.documentElement.clientWidth);
  const gutter = roleDp(tokens.layout.gutter);
  expect((await frame.boundingBox())!.width).toBe(width);
  expect(panel.x).toBeGreaterThanOrEqual(gutter - 0.5);
  expect(panel.x + panel.width).toBeLessThanOrEqual(width - gutter + 0.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("[atoms.select.keyboard] [atoms.select.native-form] is driven from the keyboard: the ring stays on the frame while the list is open, Enter chooses, and Tab goes on to what follows, the next Select", async ({ page }) => {
  const frame = page.getByTestId("select");
  const trigger = frame.getByRole("combobox");
  await reachByKeyboard(page, trigger);
  await expect(frame).toHaveAttribute("data-focus-visible", "true");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(frame).toHaveAttribute("data-focus-visible", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(nativeSelect(trigger)).toHaveValue("a");
  await expect(trigger).toHaveText("Option A");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(nativeSelect(trigger)).toHaveValue("a");
  await page.keyboard.press("ArrowDown");
  await tab(page);
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Select ghost", exact: true })).toBeFocused();
});

test("[atoms.select.pointer] a press opens the list and chooses from it with the focus kept on the button, the pointer points, and a press outside closes without choosing", async ({ page }) => {
  const trigger = page.getByTestId("select-fills").getByRole("combobox");
  await trigger.click();
  const list = page.getByRole("listbox");
  await list.getByRole("option", { name: "Option A" }).click();
  await expect(list).toHaveCount(0);
  await expect(nativeSelect(trigger)).toHaveValue("a");
  await expect(trigger).toBeFocused();
  await trigger.click();
  const choose = list.getByRole("option", { name: "Choose" });
  await choose.hover();
  await expect(trigger).toHaveAttribute("aria-activedescendant", (await choose.getAttribute("id"))!);
  await page.mouse.click(4, 4);
  await expect(list).toHaveCount(0);
  await expect(nativeSelect(trigger)).toHaveValue("a");
});
