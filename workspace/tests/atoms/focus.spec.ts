import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { openHarness } from "../support/harness";
import { tab } from "../support/keyboard";
import { expectStyle } from "../support/style";

// Each ring owner of the Button family, with the corner its ring follows.
const OWNERS = [
  ["solid", tokens.shape.radius.control],
  ["hairline", tokens.shape.radius.control],
  ["link-button", tokens.shape.radius.control],
  ["pill", tokens.shape.radius.full],
  ["icon-button", tokens.shape.radius.control],
  ["pill-icon-button", tokens.shape.radius.full],
  ["link", tokens.shape.radius.control],
] as const;

const ringOf = {
  outlineStyle: "solid",
  outlineWidth: tokens.shape.focus.width,
  outlineOffset: tokens.shape.focus.offset,
  outlineColor: tokens.color.interaction.focus,
};

// Put focus on the element before the target in the Tab order, then press Tab, so the focus the target holds is the keyboard's.
const reachByKeyboard = async (page: Page, target: Locator) => {
  await target.evaluate((element) => {
    const tabbable = [...document.querySelectorAll<HTMLElement>("button, a[href], input, [tabindex]")].filter((candidate) => !candidate.hasAttribute("disabled") && candidate.tabIndex >= 0);
    tabbable[tabbable.indexOf(element as HTMLElement) - 1]?.focus();
  });
  await tab(page);
  await expect(target).toBeFocused();
};

test.beforeEach(async ({ page }) => {
  await openHarness(page, "states");
});

for (const [id, corner] of OWNERS) {
  test(`[atoms.focus.ring] ${id} shows its ring for the keyboard and not for the pointer, on its own corner`, async ({ page }) => {
    const target = page.getByTestId(id);
    await target.click();
    await target.focus();
    await expect(target).toBeFocused();
    await expect(target).not.toHaveAttribute("data-focus-visible", /.*/);
    await expectStyle(target, { outlineStyle: "none" });

    await reachByKeyboard(page, target);
    await expect(target).toHaveAttribute("data-focus-visible", "true");
    await expectStyle(target, { ...ringOf, borderTopLeftRadius: corner });
  });
}

test("[atoms.focus.ring] a Button that is busy keeps its ring when the keyboard reaches it", async ({ page }) => {
  const loading = page.getByTestId("loading");
  await loading.click({ force: true });
  await reachByKeyboard(page, loading);
  await expect(loading).toHaveAttribute("data-focus-visible", "true");
  await expectStyle(loading, ringOf);
});
