import { expect, test } from "@playwright/test";

// The site speaks the visitor's language: the browser's until the visitor picks one, and the pick is kept.

test.describe("a browser that asks for English", () => {
  test.use({ locale: "en-US" });

  test("gets the site in English, with <html lang> to match", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const nav = page.getByRole("navigation", { name: "Main menu" });
    await expect(nav.getByRole("link")).toHaveText(["Home", "Demo", "Playground", "Docs"]);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Complex web apps on quiet ground.");
  });

  test("reads a doc in its English translation, told it is one", async ({ page }) => {
    await page.goto("/docs/get-started/install");
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).not.toHaveText(/[가-힣]/);
    await expect(page.getByText("This page is translated from the Korean original.", { exact: false })).toBeVisible();
    await expect(page.getByTestId("prose")).toHaveAttribute("lang", "en");
  });
});

test("a Korean browser gets Korean, and the language button switches to English and keeps it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link")).toHaveText(["홈", "데모", "플레이그라운드", "문서"]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("복잡한 웹앱을 위한 조용한 바탕.");
  await page.getByRole("button", { name: "View in English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("navigation", { name: "Main menu" }).getByRole("link")).toHaveText(["Home", "Demo", "Playground", "Docs"]);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "한국어로 보기" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
});
