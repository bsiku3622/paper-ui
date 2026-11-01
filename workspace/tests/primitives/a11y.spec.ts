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

test("[primitives.roving-focus.direction] the dir control starts at its omission, and an inherited right-to-left page mirrors the arrows", async ({ page }) => {
  await page.goto("/playground/roving-focus");
  const dir = page.getByRole("combobox", { name: "dir", exact: true });
  await expect(dir.locator("option:checked")).toHaveText("default (inherit)");
  const toolbar = page.getByRole("toolbar", { name: "텍스트 도구" });
  await expect(toolbar).not.toHaveAttribute("dir", /./);
  await page.evaluate(() => { document.documentElement.dir = "rtl"; });
  const first = toolbar.getByRole("button", { name: "굵게", exact: true });
  await first.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(toolbar.getByRole("button", { name: "밑줄", exact: true })).toBeFocused();
  await dir.selectOption("ltr");
  await expect(toolbar).toHaveAttribute("dir", "ltr");
});

test("[primitives.live-region.roles] the LiveRegion page keeps its region mounted and changes only what is inside", async ({ page }) => {
  await page.goto("/playground/live-region");
  const region = page.getByTestId("live-region");
  await expect(region).toHaveAttribute("role", "status");
  await expect(region).toHaveAttribute("aria-live", "polite");
  await expect(region).toHaveAttribute("aria-atomic", "true");
  await page.getByRole("button", { name: "영역 내용 바꾸기", exact: true }).click();
  await expect(region).toHaveText("1번째로 저장했습니다.");
  await page.getByRole("combobox", { name: "politeness", exact: true }).selectOption("assertive");
  await expect(region).toHaveAttribute("role", "alert");
  await expect(region).toHaveAttribute("aria-live", "assertive");
});

test("[primitives.live-region.announce] announce leaves a message in the page's live region and nothing visible", async ({ page }) => {
  await page.goto("/playground/live-region");
  await page.getByRole("button", { name: "announce() 호출", exact: true }).click();
  await expect(page.locator('[data-testid="live-region"]')).toHaveText("아직 알릴 내용이 없습니다.");
  await expect(page.locator('[aria-live="polite"]', { hasText: "저장했습니다." }).first()).toBeAttached();
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

test("[primitives.focus-scope.options] FocusScope contains focus and restores the opener", async ({ page }) => {
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

test("[primitives.visually-hidden.accessible] hidden content names the button and a focusable skip link becomes visible", async ({ page }) => {
  await openPlayground(page, "visually-hidden", "VisuallyHidden");
  await expect(page.getByRole("button", { name: "새 항목 추가", exact: true })).toBeVisible();
  // The page has a skip link of its own, outside <main>; this is the specimen's.
  const skip = page.getByRole("main").getByRole("link", { name: "본문으로 건너뛰기", exact: true });
  await skip.focus();
  await expect(skip).toBeFocused();
  const clipped = await skip.evaluate((node) => getComputedStyle(node.parentElement!).position);
  expect(clipped).not.toBe("absolute");
});
