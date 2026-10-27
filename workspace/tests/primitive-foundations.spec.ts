import { expect, test } from "@playwright/test";

test("roving focus has one Tab stop, supports keys and recovers after removal", async ({ page }) => {
  await page.goto("/playground/roving-focus");
  const toolbar = page.getByRole("toolbar", { name: "텍스트 도구" });
  const first = toolbar.getByRole("button", { name: "굵게", exact: true });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(toolbar.getByRole("button", { name: "밑줄", exact: true })).toBeFocused();
  await expect(toolbar.locator('[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("End");
  await expect(toolbar.getByRole("button", { name: "이 항목 제거" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(toolbar.getByRole("button", { name: "밑줄", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "항목 복원" })).toBeFocused();
  await page.getByRole("combobox", { name: "dir", exact: true }).selectOption("rtl");
  await first.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(toolbar.getByRole("button", { name: "밑줄", exact: true })).toBeFocused();
});

test("group selection separates focus, supports multiple and removes unavailable keys", async ({ page }) => {
  await page.goto("/playground/toggle-group");
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

test("field labels, descriptions and errors point to the actual native input", async ({ page }) => {
  await page.goto("/playground/form-field");
  const input = page.getByRole("textbox", { name: "이메일", exact: true });
  await expect(input).toHaveAccessibleDescription("연락받을 이메일을 입력해주세요.");
  await page.getByText("이메일", { exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("required", "");
  await page.getByRole("button", { name: "오류 표시" }).click();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription("연락받을 이메일을 입력해주세요. 이메일 형식을 확인해주세요.");
  await page.getByRole("button", { name: "오류 해제" }).click();
  await expect(input).toHaveAccessibleDescription("연락받을 이메일을 입력해주세요.");
  await page.getByRole("switch", { name: "disabled", exact: true }).check();
  await expect(input).toBeDisabled();
});

test("popover portals, anchors, dismisses and restores focus", async ({ page }) => {
  await page.goto("/playground/overlay");
  const trigger = page.getByRole("button", { name: "설정 열기", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "설정", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "설정", exact: true })).toBeFocused();
  expect(await dialog.evaluate((element) => !document.querySelector("#root")?.contains(element))).toBe(true);
  expect(await dialog.getAttribute("data-placement")).toMatch(/top|bottom/);
  const triggerBox = (await trigger.boundingBox())!;
  const contentBox = (await dialog.boundingBox())!;
  expect(Math.abs(contentBox.x - triggerBox.x)).toBeLessThan(20);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("heading", { name: "Overlay", exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

test("nested modal closes only the top overlay, contains focus and restores each trigger", async ({ page }) => {
  await page.goto("/playground/overlay");
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
  await page.keyboard.press("Tab");
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

test("outside dismissal can be disabled while Escape remains available", async ({ page }) => {
  await page.goto("/playground/overlay");
  await page.getByRole("switch", { name: "dismissable", exact: true }).uncheck();
  await page.getByRole("button", { name: "설정 열기", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "설정", exact: true });
  await page.getByRole("heading", { name: "Overlay", exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "표시 이름", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("hook composition keeps press, hover and focus behavior on one node", async ({ page }) => {
  await page.goto("/playground/composition");
  const button = page.getByRole("button", { name: "Hook으로 조립한 버튼" });
  await button.hover();
  await expect(button).toHaveAttribute("data-hovered", "true");
  await button.click();
  await page.keyboard.press("Space");
  await expect(page.getByText("실행: 2", { exact: true })).toBeVisible();
  await expect(button).toHaveAttribute("data-focus-visible", "true");
});
