import { expect, test, type Locator } from "@playwright/test";

import { openHarness } from "../support/harness";

const once = async (target: Locator) => {
  await expect(target).toHaveAttribute("data-presses", "1");
  await expect(target).toHaveAttribute("data-clicks", "1");
};

const flipped = async (target: Locator) => {
  await expect(target).toHaveAttribute("aria-pressed", "true");
  await expect(target).toHaveAttribute("data-clicks", "1");
};

// React Aria leaves Enter to the browser on a Mac and keeps it back everywhere else, so the keys run under both.
const PLATFORMS = { "a Mac": "MacIntel", "another platform": "Win32" };

for (const [name, platform] of Object.entries(PLATFORMS)) {
  test.describe(`on ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((value) => {
        Object.defineProperty(navigator, "platform", { get: () => value });
        Object.defineProperty(navigator, "userAgentData", { get: () => undefined });
      }, platform);
      await openHarness(page, "press");
    });

    for (const key of ["Enter", "Space"]) {
      test(`[primitives.pressable.one-click] ${key} on a button is one press and one click`, async ({ page }) => {
        const button = page.getByTestId("button");
        await button.focus();
        await page.keyboard.press(key);
        await once(button);
      });

      test(`[primitives.pressable.one-click] ${key} on an element with no key activation of its own is one press and one click`, async ({ page }) => {
        const element = page.getByTestId("role-button");
        await element.focus();
        await page.keyboard.press(key);
        await once(element);
      });

      test(`[primitives.pressable.one-click] ${key} on a submit button submits once`, async ({ page }) => {
        await page.getByTestId("submit").focus();
        await page.keyboard.press(key);
        await expect(page.getByTestId("form")).toHaveAttribute("data-submits", "1");
      });
    }

    for (const key of ["Enter", "Space"]) {
      test(`[primitives.pressable.one-click] ${key} on <Pressable as={Selectable}> flips the selection once with one press`, async ({ page }) => {
        const target = page.getByTestId("pressable-selectable");
        await target.focus();
        await page.keyboard.press(key);
        await expect(target).toHaveAttribute("aria-pressed", "true");
        await once(target);
      });

      test(`[primitives.selectable.input-paths] ${key} on a bare Selectable flips the selection once`, async ({ page }) => {
        const target = page.getByTestId("selectable");
        await target.focus();
        await page.keyboard.press(key);
        await flipped(target);
      });

      test(`[primitives.pressable.one-click] ${key} on <Pressable as={Floating.Trigger}> opens once with one press`, async ({ page }) => {
        const target = page.getByTestId("pressable-trigger");
        await target.focus();
        await page.keyboard.press(key);
        await expect(target).toHaveAttribute("aria-expanded", "true");
        await once(target);
        await expect(page.getByRole("dialog", { name: "Panel" })).toBeVisible();
      });

      test(`[primitives.target.projection] ${key} on <Selectable as="div"> flips the selection once`, async ({ page }) => {
        const target = page.getByTestId("div-selectable");
        await target.focus();
        await page.keyboard.press(key);
        await flipped(target);
      });

      test(`[primitives.target.projection] ${key} on <Floating.Trigger as="div"> opens once, and the key's release does not reach the Close that took focus`, async ({ page }) => {
        const target = page.getByTestId("div-trigger");
        await target.focus();
        await page.keyboard.press(key);
        await expect(target).toHaveAttribute("aria-expanded", "true");
        await expect(target).toHaveAttribute("data-clicks", "1");
        await expect(page.getByRole("dialog", { name: "Div panel" })).toBeVisible();
      });
    }

    for (const key of ["Enter", "Space"]) {
      test(`[primitives.pressable.one-click] ${key} on a Button is one click, and on <Button as={Selectable}> and <Button as={Floating.Trigger}> one more of what the part does`, async ({ page }) => {
        const button = page.getByTestId("atom-button");
        await button.focus();
        await page.keyboard.press(key);
        await expect(button).toHaveAttribute("data-clicks", "1");

        const selectable = page.getByTestId("atom-selectable");
        await selectable.focus();
        await page.keyboard.press(key);
        await flipped(selectable);

        const trigger = page.getByTestId("atom-trigger");
        await trigger.focus();
        await page.keyboard.press(key);
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        await expect(trigger).toHaveAttribute("data-clicks", "1");
        await expect(page.getByRole("dialog", { name: "Atom panel" })).toBeVisible();
      });
    }

    test("[primitives.pressable.one-click] Enter on a link is one press and one click", async ({ page }) => {
      const link = page.getByTestId("link");
      await link.focus();
      await page.keyboard.press("Enter");
      await once(link);
    });
  });
}

test.describe("with other inputs", () => {
  test.beforeEach(async ({ page }) => {
    await openHarness(page, "press");
  });

  test("[primitives.pressable.one-click] a mouse click is one press and one click", async ({ page }) => {
    const button = page.getByTestId("button");
    await button.click();
    await once(button);
  });

  test("[primitives.pressable.one-click] assistive technology's element.click() is one press and one click", async ({ page }) => {
    const button = page.getByTestId("button");
    await button.evaluate((node: HTMLElement) => node.click());
    await once(button);
  });

  test("[primitives.pressable.one-click] a mouse click flips <Pressable as={Selectable}> once with one press", async ({ page }) => {
    const target = page.getByTestId("pressable-selectable");
    await target.click();
    await expect(target).toHaveAttribute("aria-pressed", "true");
    await once(target);
  });

  test("[primitives.pressable.one-click] element.click() flips <Pressable as={Selectable}> once with one press", async ({ page }) => {
    const target = page.getByTestId("pressable-selectable");
    await target.evaluate((node: HTMLElement) => node.click());
    await expect(target).toHaveAttribute("aria-pressed", "true");
    await once(target);
  });

  test("[primitives.selectable.input-paths] a mouse click flips a bare Selectable once", async ({ page }) => {
    const target = page.getByTestId("selectable");
    await target.click();
    await flipped(target);
  });

  test("[primitives.pressable.one-click] a mouse click on a Button, and on a Button over a part, is one click", async ({ page }) => {
    await page.getByTestId("atom-button").click();
    await expect(page.getByTestId("atom-button")).toHaveAttribute("data-clicks", "1");
    await page.getByTestId("atom-selectable").click();
    await flipped(page.getByTestId("atom-selectable"));
    await page.getByTestId("atom-trigger").click();
    await expect(page.getByTestId("atom-trigger")).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("atom-trigger")).toHaveAttribute("data-clicks", "1");
  });

  test("[primitives.pressable.one-click] a disabled target gets neither", async ({ page }) => {
    const disabled = page.getByTestId("disabled");
    await disabled.click({ force: true });
    await expect(disabled).toHaveAttribute("data-presses", "0");
    await expect(disabled).toHaveAttribute("data-clicks", "0");
  });
});

test.describe("by touch", () => {
  test.use({ hasTouch: true });

  test("[primitives.pressable.one-click] a tap is one press and one click", async ({ page }) => {
    await openHarness(page, "press");
    const button = page.getByTestId("button");
    await button.tap();
    await once(button);
  });

  test("[primitives.pressable.one-click] a tap on a Button, and on a Button over a Selectable, is one click", async ({ page }) => {
    await openHarness(page, "press");
    await page.getByTestId("atom-button").tap();
    await expect(page.getByTestId("atom-button")).toHaveAttribute("data-clicks", "1");
    await page.getByTestId("atom-selectable").tap();
    await flipped(page.getByTestId("atom-selectable"));
  });

  test("[primitives.pressable.one-click] a tap flips <Pressable as={Selectable}> once with one press", async ({ page }) => {
    await openHarness(page, "press");
    const target = page.getByTestId("pressable-selectable");
    await target.tap();
    await expect(target).toHaveAttribute("aria-pressed", "true");
    await once(target);
  });
});
