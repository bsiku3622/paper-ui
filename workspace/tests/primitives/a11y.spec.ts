import { expect, test } from "@playwright/test";

import { openPlayground } from "../support/harness";
import { tab } from "../support/keyboard";

test("[primitives.roving-focus.tab-stop] roving focus has one Tab stop, supports keys and recovers after removal", async ({ page }) => {
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
  await tab(page);
  await expect(page.getByRole("button", { name: "항목 복원" })).toBeFocused();
  await page.getByRole("combobox", { name: "dir", exact: true }).selectOption("rtl");
  await first.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(toolbar.getByRole("button", { name: "밑줄", exact: true })).toBeFocused();
});

test("[primitives.form-field.relations] field labels, descriptions and errors point to the actual native input", async ({ page }) => {
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

test("FocusScope contains focus and restores the opener", async ({ page }) => {
  await openPlayground(page, "focus-scope", "FocusScope");
  const opener = page.getByRole("button", { name: "Focus scope 열기", exact: true });
  await opener.click();
  const first = page.getByRole("textbox", { name: "첫 입력" });
  const close = page.getByRole("button", { name: "Focus scope 닫기", exact: true });
  await expect(first).toBeFocused();
  await tab(page);
  await expect(close).toBeFocused();
  await tab(page);
  await expect(first).toBeFocused();
  await close.click();
  await expect(opener).toBeFocused();
});

test("hidden content names the button and a focusable skip link becomes visible", async ({ page }) => {
  await openPlayground(page, "visually-hidden", "VisuallyHidden");
  await expect(page.getByRole("button", { name: "새 항목 추가", exact: true })).toBeVisible();
  const skip = page.getByRole("link", { name: "본문으로 건너뛰기", exact: true });
  await skip.focus();
  await expect(skip).toBeFocused();
  const clipped = await skip.evaluate((node) => getComputedStyle(node.parentElement!).position);
  expect(clipped).not.toBe("absolute");
});
