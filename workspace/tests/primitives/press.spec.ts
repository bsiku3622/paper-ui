import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { openHarness } from "../support/harness";
import { tab } from "../support/keyboard";
import { expectStyle } from "../support/style";

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
      test(`[primitives.pressable.one-click] [primitives.selectable.pressable] ${key} on <Pressable as={Selectable}> flips the selection once with one press`, async ({ page }) => {
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

      test(`[primitives.target.projection] [primitives.selectable.target] ${key} on <Selectable as="div"> flips the selection once`, async ({ page }) => {
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

test.describe("the callbacks of one press", () => {
  const log = (target: Locator) => target.getAttribute("data-log");
  const released = ["up", "end", "change:false", "press"];

  test.beforeEach(async ({ page }) => {
    await openHarness(page, "press");
  });

  test("[primitives.pressable.input-paths] a mouse press runs onPressStart and onPressChange when it begins, then onPressUp, onPressEnd, onPressChange and onPress when it ends", async ({ page }) => {
    const target = page.getByTestId("logged");
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect.poll(() => log(target)).toBe("start change:true");
    await page.mouse.up();
    await expect.poll(() => log(target)).toBe(["start", "change:true", ...released].join(" "));
  });

  test("[primitives.pressable.input-paths] a key runs the same callbacks in the same order", async ({ page }) => {
    const target = page.getByTestId("logged");
    await target.focus();
    await page.keyboard.down("Enter");
    await expect.poll(() => log(target)).toBe("start change:true");
    await page.keyboard.up("Enter");
    await expect.poll(() => log(target)).toBe(["start", "change:true", ...released].join(" "));
  });

  test("[primitives.pressable.input-paths] a pointer that leaves and comes back still presses, unless cancelOnPointerExit ended the press when it left", async ({ page }) => {
    const leaveAndReturn = async (target: Locator) => {
      const box = (await target.boundingBox())!;
      const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + box.width * 2, y + box.height * 4, { steps: 3 });
      // Leaving ends the press either way.
      await expect.poll(() => log(target)).toBe("start change:true end change:false");
      await page.mouse.move(x, y, { steps: 3 });
      await page.mouse.up();
    };
    const logged = page.getByTestId("logged");
    await leaveAndReturn(logged);
    await expect.poll(async () => (await log(logged))!.split(" ").at(-1)).toBe("press");
    const exits = page.getByTestId("exits");
    await leaveAndReturn(exits);
    // The release is told, and no press comes of it.
    await expect.poll(async () => (await log(exits))!.split(" ").at(-1)).toBe("up");
    expect((await log(exits))!.split(" ")).not.toContain("press");
  });

  test("[primitives.pressable.input-paths] a press holds the text around it still, unless allowTextSelection leaves it free", async ({ page }) => {
    const whilePressed = async (target: Locator) => {
      const box = (await target.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      // WebKit knows the property by its prefixed name.
      const select = await target.evaluate((element) => { const { style } = element as HTMLElement; return style.userSelect || style.webkitUserSelect; });
      await page.mouse.up();
      return select;
    };
    expect(await whilePressed(page.getByTestId("logged"))).toBe("none");
    expect(await whilePressed(page.getByTestId("selects"))).toBe("");
  });
});

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

test.describe("the keyboard ring", () => {
  const ring = {
    outlineStyle: "solid",
    outlineWidth: tokens.shape.focus.width,
    outlineOffset: tokens.shape.focus.offset,
    outlineColor: tokens.color.interaction.focus,
  };

  test.beforeEach(async ({ page }) => {
    await openHarness(page, "press");
  });

  test("[primitives.pressable.ring] a bare Pressable draws its ring from its own judgement of the keyboard, and not for the pointer", async ({ page }) => {
    const target = page.getByTestId("button");
    await target.click();
    await target.focus();
    await expect(target).toBeFocused();
    await expect(target).not.toHaveAttribute("data-focus-visible", /.*/);
    await expectStyle(target, { outlineStyle: "none" });

    await page.getByTestId("selects").focus();
    await tab(page);
    await expect(target).toBeFocused();
    await expect(target).toHaveAttribute("data-focus-visible", "true");
    await expectStyle(target, ring);

    // With the judgement gone the ring goes, though the browser's heuristic still matches: the baseline no longer draws here.
    const heuristic = await target.evaluate((element) => {
      element.removeAttribute("data-focus-visible");
      return element.matches(":focus-visible");
    });
    expect(heuristic).toBe(true);
    await expectStyle(target, { outlineStyle: "none" });
  });

  test("[primitives.pressable.ring] a part with no judge of its own keeps the baseline, and <Pressable as={part}> takes the ring over", async ({ page }) => {
    const bare = page.getByTestId("selectable");
    await page.getByTestId("submit").focus();
    await tab(page);
    await expect(bare).toBeFocused();
    await expect(bare).not.toHaveAttribute("data-focus-visible", /.*/);
    await expectStyle(bare, ring);

    const pressed = page.getByTestId("pressable-selectable");
    await tab(page);
    await expect(pressed).toBeFocused();
    await expect(pressed).toHaveAttribute("data-focus-visible", "true");
    await expectStyle(pressed, ring);
  });
});

test.describe("what a press lets through to a parent", () => {
  const TARGETS = ["pressable", "button"];

  // Listeners on document, as an outside-click handler has them: one set in the bubble phase, one in capture.
  const listen = (page: Page) =>
    page.evaluate(() => {
      const heard = { bubble: [] as string[], capture: [] as string[] };
      for (const name of ["pointerdown", "mousedown", "pointerup", "mouseup", "click", "keydown", "keyup"]) {
        document.addEventListener(name, () => heard.bubble.push(name));
        document.addEventListener(name, () => heard.capture.push(name), true);
      }
      Object.assign(window, { heard });
    });
  const onDocument = (page: Page) => page.evaluate(() => (window as unknown as { heard: { bubble: string[]; capture: string[] } }).heard);
  const clear = (page: Page) => page.evaluate(() => { const { heard } = window as unknown as { heard: { bubble: string[]; capture: string[] } }; heard.bubble.length = 0; heard.capture.length = 0; });
  // Sorted where the order is the engine's and not the contract.
  const set = (names: string[] | string | null) => (typeof names === "string" ? names.split(" ") : names ?? []).filter(Boolean).sort();
  const parent = (page: Page, id: string) => page.getByTestId(`parent-${id}`);
  const heardBy = async (page: Page, id: string) => ({ react: set(await parent(page, id).getAttribute("data-log")), captured: set(await parent(page, id).getAttribute("data-captured")) });

  const press = {
    mouse: (target: Locator) => target.click(),
    Enter: async (target: Locator) => { await target.focus(); await target.page().keyboard.press("Enter"); },
    Space: async (target: Locator) => { await target.focus(); await target.page().keyboard.press("Space"); },
    "element.click()": (target: Locator) => target.evaluate((element: HTMLElement) => element.click()),
  };
  const POINTER = ["click", "mousedown", "mouseup", "pointerdown", "pointerup"];
  const KEYS = ["click", "keydown", "keyup"];

  test.beforeEach(async ({ page }) => {
    await openHarness(page, "press");
    await listen(page);
  });

  test("[primitives.pressable.propagation] a plain button hides nothing, for comparison", async ({ page }) => {
    await press.mouse(page.getByTestId("from-plain"));
    expect((await heardBy(page, "plain")).react).toEqual(POINTER);
    expect(set((await onDocument(page)).bubble)).toEqual(POINTER);
  });

  for (const id of TARGETS) {
    test(`[primitives.pressable.propagation] a mouse press on a ${id} lets pointerup and mouseup through; pointerdown, mousedown and click reach only a capture listener`, async ({ page }) => {
      await press.mouse(page.getByTestId(`from-${id}`));
      const { react, captured } = await heardBy(page, id);
      expect(react).toEqual(["mouseup", "pointerup"]);
      expect(captured).toEqual(["click", "mousedown", "pointerdown"]);
      const { bubble, capture } = await onDocument(page);
      expect(set(bubble)).toEqual(["mouseup", "pointerup"]);
      expect(set(capture)).toEqual(POINTER);
    });

    for (const key of ["Enter", "Space"] as const) {
      test(`[primitives.pressable.propagation] ${key} on a ${id} lets click and keyup through; keydown reaches only a capture listener`, async ({ page }) => {
        await press[key](page.getByTestId(`from-${id}`));
        expect((await heardBy(page, id)).react).toEqual(["click", "keyup"]);
        const { bubble, capture } = await onDocument(page);
        expect(set(bubble)).toEqual(["click", "keyup"]);
        expect(set(capture)).toEqual(KEYS);
      });
    }

    test(`[primitives.pressable.propagation] element.click() on a ${id} stops at the target; only a capture listener hears it`, async ({ page }) => {
      await press["element.click()"](page.getByTestId(`from-${id}`));
      const { react, captured } = await heardBy(page, id);
      expect(react).toEqual([]);
      expect(captured).toEqual(["click"]);
      const { bubble, capture } = await onDocument(page);
      expect(bubble).toEqual([]);
      expect(capture).toEqual(["click"]);
    });
  }

  for (const id of ["up", "end", "press"]) {
    test(`[primitives.pressable.propagation-way-out] continuePropagation() in onPress${id === "press" ? "" : id[0]!.toUpperCase() + id.slice(1)} lets the click through, from a mouse and from element.click()`, async ({ page }) => {
      const target = page.getByTestId(`from-${id}`);
      await press.mouse(target);
      expect((await heardBy(page, id)).react).toEqual(["click", "mouseup", "pointerup"]);
      expect(set((await onDocument(page)).bubble)).toEqual(["click", "mouseup", "pointerup"]);
      await parent(page, id).evaluate((element) => element.removeAttribute("data-log"));
      await clear(page);
      await press["element.click()"](target);
      expect((await heardBy(page, id)).react).toEqual(["click"]);
      expect((await onDocument(page)).bubble).toEqual(["click"]);
    });
  }

  test("[primitives.pressable.propagation-way-out] continuePropagation() in onPressStart lets pointerdown through from a mouse and keydown from a key, and leaves the click and mousedown stopped", async ({ page }) => {
    const target = page.getByTestId("from-start");
    await press.mouse(target);
    expect((await heardBy(page, "start")).react).toEqual(["mouseup", "pointerdown", "pointerup"]);
    expect(set((await onDocument(page)).bubble)).toEqual(["mouseup", "pointerdown", "pointerup"]);
    await parent(page, "start").evaluate((element) => element.removeAttribute("data-log"));
    await press.Enter(target);
    expect((await heardBy(page, "start")).react).toEqual(KEYS);
  });

  test("[primitives.pressable.propagation-way-out] continuePropagation() in onPressStart lets the click of element.click() through", async ({ page }) => {
    await press["element.click()"](page.getByTestId("from-start"));
    expect((await heardBy(page, "start")).react).toEqual(["click"]);
    expect((await onDocument(page)).bubble).toEqual(["click"]);
  });

  test("[primitives.pressable.propagation-way-out] nothing lets mousedown through: a Button that declines at every step still keeps it", async ({ page }) => {
    await press.mouse(page.getByTestId("from-declines-button"));
    const { react, captured } = await heardBy(page, "declines-button");
    expect(react).toEqual(["click", "mouseup", "pointerdown", "pointerup"]);
    expect(captured).toContain("mousedown");
    expect(set((await onDocument(page)).capture)).toContain("mousedown");
    expect(set((await onDocument(page)).bubble)).not.toContain("mousedown");
  });

  test.describe("by touch", () => {
    test.use({ hasTouch: true });

    test("[primitives.pressable.propagation] a tap lets through what a mouse press does", async ({ page }) => {
      await page.getByTestId("from-pressable").tap();
      expect((await heardBy(page, "pressable")).react).toEqual(["mouseup", "pointerup"]);
      expect(set((await onDocument(page)).bubble)).toEqual(["mouseup", "pointerup"]);
      expect(set((await onDocument(page)).capture)).toEqual(POINTER);
    });

    test("[primitives.pressable.propagation-way-out] continuePropagation() lets a tap's pointerdown through from onPressStart, and its click from onPress", async ({ page }) => {
      await page.getByTestId("from-start").tap();
      expect((await heardBy(page, "start")).react).toEqual(["mouseup", "pointerdown", "pointerup"]);
      await page.getByTestId("from-press").tap();
      expect((await heardBy(page, "press")).react).toEqual(["click", "mouseup", "pointerup"]);
    });
  });
});
