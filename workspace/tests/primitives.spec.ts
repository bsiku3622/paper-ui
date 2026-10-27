import { expect, test, type Page } from "@playwright/test";

const open = async (page: Page, slug: string, name: string) => {
  await page.goto(`/playground/${slug}`);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
};
const dragBy = async (page: Page, locator: ReturnType<Page["locator"]>, x: number, y: number, release = true) => {
  await locator.scrollIntoViewIfNeeded();
  const box = (await locator.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + x, box.y + box.height / 2 + y, { steps: 5 });
  if (release) await page.mouse.up();
};

test("press normalizes mouse, Enter, and Space and exposes focus state", async ({ page }) => {
  await open(page, "pressable", "Pressable");
  const button = page.getByTestId("press-example");
  await button.click();
  await expect(page.getByText("실행: 1", { exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("data-focus-visible", "true");
  await page.keyboard.press("Enter");
  await page.keyboard.down("Space");
  await expect(button).toHaveAttribute("data-pressed", "true");
  await page.keyboard.up("Space");
  await expect(page.getByText("실행: 3", { exact: true })).toBeVisible();
  await page.getByRole("switch", { name: "disabled", exact: true }).check();
  await expect(button).toBeDisabled();
});

test("toggle preserves selection across press releases and supports keyboard input", async ({ page }) => {
  await open(page, "toggleable", "Toggleable");
  const button = page.getByTestId("toggle-example");
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button).toHaveAttribute("data-selected", "true");
  await page.keyboard.press("Space");
  await expect(button).toHaveAttribute("aria-pressed", "false");
});

test("hover exposes pointer state without becoming a button or hover-on-touch", async ({ page }) => {
  await open(page, "hoverable", "Hoverable");
  const element = page.getByTestId("hover-example");
  await element.hover();
  await expect(element).toHaveAttribute("data-hovered", "true");
  await expect(element).not.toHaveAttribute("role");
  await page.mouse.move(0, 0);
  await expect(element).not.toHaveAttribute("data-hovered");
  await element.dispatchEvent("pointerenter", { pointerType: "touch" });
  await expect(element).not.toHaveAttribute("data-hovered");
});

test("handle moves the entire box while content and internal actions remain independent", async ({ page }) => {
  await open(page, "draggable", "Draggable");
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

test("move supports Escape cancellation, keyboard movement, disabled and axis restrictions", async ({ page }) => {
  await open(page, "draggable", "Draggable");
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

test("transfer drag accepts native data through a dedicated handle", async ({ page }) => {
  await open(page, "droppable", "Droppable");
  const handle = page.getByRole("button", { name: "항목 전달", exact: true });
  await expect(handle).toHaveAttribute("draggable", "true");
  await handle.dragTo(page.getByRole("button", { name: "항목 받기", exact: true }));
  await expect(page.getByText("받음: Paper item", { exact: true })).toBeVisible();
});

test("transfer and drop have a keyboard path", async ({ page }) => {
  await open(page, "droppable", "Droppable");
  const handle = page.getByRole("button", { name: "항목 전달", exact: true });
  await handle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("여기에 놓으세요", { exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("받음: Paper item", { exact: true })).toBeVisible();
});

test("FocusScope contains focus and restores the opener", async ({ page }) => {
  await open(page, "focus-scope", "FocusScope");
  const opener = page.getByRole("button", { name: "Focus scope 열기", exact: true });
  await opener.click();
  const first = page.getByRole("textbox", { name: "첫 입력" });
  const close = page.getByRole("button", { name: "Focus scope 닫기", exact: true });
  await expect(first).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await close.click();
  await expect(opener).toBeFocused();
});

test("hidden content names the button and a focusable skip link becomes visible", async ({ page }) => {
  await open(page, "visually-hidden", "VisuallyHidden");
  await expect(page.getByRole("button", { name: "새 항목 추가", exact: true })).toBeVisible();
  const skip = page.getByRole("link", { name: "본문으로 건너뛰기", exact: true });
  await skip.focus();
  await expect(skip).toBeFocused();
  const clipped = await skip.evaluate((node) => getComputedStyle(node.parentElement!).position);
  expect(clipped).not.toBe("absolute");
});

test("Grid responds to its track count without losing token gaps", async ({ page }) => {
  await open(page, "grid", "Grid");
  const grid = page.locator(".pui-gap-sm").filter({ has: page.getByText("6", { exact: true }) }).last();
  expect(await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(3);
  await page.getByRole("combobox", { name: "columns", exact: true }).selectOption("2");
  expect(await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(2);
});
