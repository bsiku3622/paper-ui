import { expect, test, type Page } from "@playwright/test";

import { openPlayground } from "../support/harness";
import { tab } from "../support/keyboard";

const dragBy = async (page: Page, locator: ReturnType<Page["locator"]>, x: number, y: number, release = true) => {
  await locator.scrollIntoViewIfNeeded();
  const box = (await locator.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + x, box.y + box.height / 2 + y, { steps: 5 });
  if (release) await page.mouse.up();
};

test("[primitives.pressable.input-paths] press normalizes mouse, Enter, and Space and exposes focus state", async ({ page }) => {
  await openPlayground(page, "pressable", "Pressable");
  const button = page.getByTestId("press-example");
  await button.click();
  await expect(page.getByText("실행: 1", { exact: true })).toBeVisible();
  await tab(page);
  await tab(page, { shift: true });
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("data-focus-visible", "true");
  await page.keyboard.press("Enter");
  await page.keyboard.down("Space");
  await expect(button).toHaveAttribute("data-active", "true");
  await page.keyboard.up("Space");
  await expect(page.getByText("실행: 3", { exact: true })).toBeVisible();
  await page.getByRole("switch", { name: "disabled", exact: true }).check();
  await expect(button).toBeDisabled();
});

test("[primitives.selectable.input-paths] selection survives press releases and follows keyboard input", async ({ page }) => {
  await openPlayground(page, "selectable", "Selectable");
  const button = page.getByTestId("select-example");
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button).toHaveAttribute("data-selected", "true");
  await page.keyboard.press("Space");
  await expect(button).toHaveAttribute("aria-pressed", "false");
});

test("[primitives.paint.hover] a hoverable Paint takes its tint under a pointer that can hover, and a blocked one does not", async ({ page }) => {
  await openPlayground(page, "paint", "Paint");
  const element = page.getByTestId("paint-example");
  await expect(element).toHaveCSS("background-image", "none");
  // Without hoverable the tint is never taken.
  await element.hover();
  await expect(element).toHaveCSS("background-image", "none");
  await page.getByRole("switch", { name: "hoverable", exact: true }).check();
  await element.hover();
  await expect(element).not.toHaveCSS("background-image", "none");
  await page.mouse.move(0, 0);
  await expect(element).toHaveCSS("background-image", "none");
  // A target that is blocked does not take it either.
  await page.getByRole("switch", { name: "aria-disabled", exact: true }).check();
  await element.hover();
  await expect(element).toHaveCSS("background-image", "none");
});

test.describe("on a pointer that cannot hover", () => {
  test.use({ hasTouch: true, isMobile: true });
  test.skip(({ browserName }) => browserName !== "chromium", "only Chromium emulates a touch-only device");

  test("[primitives.paint.hover] a hoverable Paint never takes the tint, whatever the tap leaves behind", async ({ page }) => {
    await openPlayground(page, "paint", "Paint");
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    const element = page.getByTestId("paint-example");
    await page.getByRole("switch", { name: "hoverable", exact: true }).check();
    await element.tap();
    await expect(element).toHaveCSS("background-image", "none");
  });
});

test("[primitives.draggable.input-paths] handle moves the entire box while content and internal actions remain independent", async ({ page }) => {
  await openPlayground(page, "draggable", "Draggable");
  const panel = page.getByTestId("moving-panel");
  const before = (await panel.boundingBox())!;
  await page.getByRole("button", { name: "내부 버튼: 0" }).click();
  await expect(page.getByRole("button", { name: "내부 버튼: 1" })).toBeVisible();
  await dragBy(page, page.getByText("이동할 박스", { exact: true }), 25, 15);
  await expect(page.getByTestId("position")).toHaveText("x: 0, y: 0");
  // Start on the SVG inside the handle, not only on the button's empty space.
  await dragBy(page, page.getByRole("button", { name: "패널 이동", exact: true }).locator("svg"), 35, 20);
  await expect(page.getByTestId("position")).toHaveText("x: 35, y: 20");
  const after = (await panel.boundingBox())!;
  expect(after.x - before.x).toBeCloseTo(35, 1);
  expect(after.y - before.y).toBeCloseTo(20, 1);
});

test("[primitives.draggable.input-paths] move supports Escape cancellation, keyboard movement, disabled and axis restrictions", async ({ page }) => {
  await openPlayground(page, "draggable", "Draggable");
  const handle = page.getByRole("button", { name: "패널 이동", exact: true });
  await dragBy(page, handle, 30, 20, false);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.getByTestId("position")).toHaveText("x: 0, y: 0");
  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("position")).not.toHaveText("x: 0, y: 0");
  await page.getByRole("combobox", { name: "axis", exact: true }).selectOption("x");
  const before = await page.getByTestId("position").textContent();
  await handle.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("position")).toHaveText(before!);
  await page.getByRole("switch", { name: "disabled", exact: true }).check();
  await expect(handle).toBeDisabled();
});

test("[primitives.droppable.input-paths] transfer drag accepts native data through a dedicated handle", async ({ page }) => {
  await openPlayground(page, "droppable", "Droppable");
  const handle = page.getByRole("button", { name: "항목 전달", exact: true });
  await expect(handle).toHaveAttribute("draggable", "true");
  await handle.dragTo(page.getByRole("button", { name: "항목 받기", exact: true }));
  await expect(page.getByText("받음: Paper item", { exact: true })).toBeVisible();
});

test("[primitives.droppable.input-paths] transfer and drop have a keyboard path", async ({ page }) => {
  await openPlayground(page, "droppable", "Droppable");
  const handle = page.getByRole("button", { name: "항목 전달", exact: true });
  await handle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("여기에 놓으세요", { exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("받음: Paper item", { exact: true })).toBeVisible();
});

test("[primitives.selectable-group.multiple] group selection separates focus, supports multiple and removes unavailable keys", async ({ page }) => {
  await page.goto("/playground/selectable-group");
  const group = page.getByRole("group", { name: "정렬 선택", exact: true });
  const left = group.getByRole("button", { name: "왼쪽", exact: true });
  const center = group.getByRole("button", { name: "가운데", exact: true });
  await left.focus();
  await page.keyboard.press("ArrowRight");
  await expect(center).toBeFocused();
  await expect(left).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(left).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("combobox", { name: "selectionMode", exact: true }).selectOption("multiple");
  await left.click();
  await group.getByRole("button", { name: "오른쪽", exact: true }).click();
  await expect(page.getByText("선택: center, left, right", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "오른쪽 제거", exact: true }).click();
  await expect(page.getByText("선택: center, left", { exact: true })).toBeVisible();
  await page.getByRole("switch", { name: "disabled", exact: true }).check();
  await expect(left).toBeDisabled();
  await expect(group.locator('[tabindex="0"]')).toHaveCount(0);
});

test("[primitives.floating.portal] popover portals, anchors, dismisses and restores focus", async ({ page }) => {
  await page.goto("/playground/floating");
  const trigger = page.getByRole("button", { name: "설정 열기", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "설정", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "설정", exact: true })).toBeFocused();
  expect(await dialog.evaluate((element) => !document.querySelector("#root")?.contains(element))).toBe(true);
  // The panel sits in the portal root, which takes no box of its own.
  await expect(dialog.locator("xpath=..")).toHaveCSS("display", "contents");
  expect(await dialog.getAttribute("data-placement")).toMatch(/top|bottom/);
  const triggerBox = (await trigger.boundingBox())!;
  const contentBox = (await dialog.boundingBox())!;
  expect(Math.abs(contentBox.x - triggerBox.x)).toBeLessThan(20);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("heading", { name: "Floating", exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

test("[primitives.floating.nesting] [primitives.floating.focus-restore] nested modal closes only the top panel, contains focus and restores each trigger", async ({ page }) => {
  await page.goto("/playground/floating");
  await page.getByRole("switch", { name: "modal", exact: true }).check();
  const trigger = page.getByRole("button", { name: "설정 열기", exact: true });
  await trigger.click();
  const outer = page.getByRole("dialog", { name: "설정", exact: true });
  await expect(outer).toHaveAttribute("aria-modal", "true");
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).overflow)).toBe("hidden");
  expect(await trigger.evaluate((element) => !!element.closest("[inert]"))).toBe(true);
  const innerTrigger = outer.getByRole("button", { name: "확인 창 열기", exact: true });
  await innerTrigger.click();
  const inner = page.getByRole("dialog", { name: "중첩 확인", exact: true });
  await expect(inner).toBeVisible();
  const close = inner.getByRole("button", { name: "확인 창 닫기", exact: true });
  await expect(close).toBeFocused();
  await tab(page);
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(inner).toHaveCount(0);
  await expect(outer).toBeVisible();
  await expect(innerTrigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(outer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await trigger.evaluate((element) => !!element.closest("[inert]"))).toBe(false);
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).overflow)).not.toBe("hidden");
});

test("[primitives.floating.dismiss] outside dismissal can be disabled while Escape remains available", async ({ page }) => {
  await page.goto("/playground/floating");
  await page.getByRole("switch", { name: "dismissable", exact: true }).uncheck();
  await page.getByRole("button", { name: "설정 열기", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "설정", exact: true });
  await page.getByRole("heading", { name: "Floating", exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "표시 이름", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("hook composition keeps press and focus behavior on one node", async ({ page }) => {
  await page.goto("/playground/composition");
  const button = page.getByRole("button", { name: "Hook으로 조립한 버튼" });
  await button.click();
  await page.keyboard.press("Space");
  await expect(page.getByText("실행: 2", { exact: true })).toBeVisible();
  await expect(button).toHaveAttribute("data-focus-visible", "true");
});
