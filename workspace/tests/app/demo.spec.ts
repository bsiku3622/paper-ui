import { expect, test, type Locator, type Page } from "@playwright/test";

import { pageErrors } from "../support/console";

// /demo is three product screens drawn with nothing but Paper (pages/demo/pure.test.ts holds them to that). They own their
// landmarks (chrome 'none'), so these tests read them the way a user does.

const SCREENS = [
  { path: "/demo", label: "대시보드", heading: "보안과 접근" },
  { path: "/demo/login", label: "로그인", heading: "다시 이어서 만들어 볼까요?" },
  { path: "/demo/settings", label: "설정 폼", heading: "설정" },
] as const;

const bar = (page: Page) => page.getByRole("navigation", { name: "데모 화면" });
const signIn = (page: Page) => page.getByRole("form", { name: "로그인" });

for (const { path, label, heading } of SCREENS) {
  test(`${label}: one banner, one main, its h1, and the bar marks it`, async ({ page }) => {
    const errors = pageErrors(page);
    await page.goto(path);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(bar(page).getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    await expect(bar(page).locator('[aria-current="page"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

test("the bar moves between the screens and leaves for the site", async ({ page }) => {
  await page.goto("/demo");
  await bar(page).getByRole("link", { name: "설정 폼" }).click();
  await expect(page).toHaveURL(/\/demo\/settings$/);
  await expect(page).toHaveTitle("설정 폼 데모 — paper-ui");
  await bar(page).getByRole("link", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/demo\/login$/);
  await page.getByRole("banner").getByRole("link", { name: "Paper UI" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("the dashboard's table is a table to assistive technology: seven headers over seven rows of seven cells", async ({ page }) => {
  await page.goto("/demo");
  const table = page.getByRole("table", { name: "점검 결과" });
  await expect(table.getByRole("columnheader")).toHaveCount(7);
  await expect(table.getByRole("row")).toHaveCount(8);
  await expect(table.getByRole("row").nth(1).getByRole("cell")).toHaveCount(7);
  await expect(table.getByRole("row").nth(1)).toContainText("SEC-1042");
});

test("the window scrolls and the dashboard's sidebar stands still beside it, a gap from the column and inside the window", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.goto("/demo");
  const sidebar = page.getByRole("complementary");
  const main = page.getByRole("main");
  const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
  const before = await boxOf(sidebar);
  expect(before.height + before.y * 2).toBe(500);
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
  const after = await boxOf(sidebar);
  expect(after.y).toBe(before.y);
  expect(after.height).toBe(before.height);
  // The space between them is the grid's gap, the 24 of xl.
  expect((await boxOf(main)).x - (before.x + before.width)).toBe(24);
});

test("below the md breakpoint the sidebar leaves and the column takes the whole width", async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 800 });
  await page.goto("/demo");
  await expect(page.getByRole("complementary")).toBeHidden();
  expect((await page.getByRole("main").boundingBox())!.width).toBe(767 - 32);
  await page.setViewportSize({ width: 768, height: 800 });
  await expect(page.getByRole("complementary")).toBeVisible();
});

test("a long word in a table cell is cut by an ellipsis instead of breaking the row", async ({ page }) => {
  await page.goto("/demo");
  const title = page.getByRole("table", { name: "점검 결과" }).getByRole("cell").filter({ hasText: "SEC-1042" }).getByText("공개 읽기가 허용된 버킷");
  await expect(title).toHaveCSS("text-overflow", "ellipsis");
  await expect(title).toHaveCSS("white-space", "nowrap");
});

test("the dashboard's sidebar marks one page, and picking another moves the mark", async ({ page }) => {
  await page.goto("/demo");
  const nav = page.getByRole("navigation", { name: "제품 메뉴" });
  const here = (name: string) => expect(nav.getByRole("button", { name })).toHaveAttribute("aria-current", "page");
  await here("보안과 접근");
  await nav.getByRole("button", { name: "배포" }).click();
  await here("배포");
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
});

test("a tablist is one tab stop: arrow keys move focus and the panel, and each panel is named by its tab", async ({ page }) => {
  await page.goto("/demo");
  const list = page.getByRole("tablist", { name: "보안과 접근" });
  const first = list.getByRole("tab", { name: "점검 결과" });
  await expect(first).toHaveAttribute("aria-selected", "true");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  const second = list.getByRole("tab", { name: "접근" });
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "접근" })).toContainText("접근 권한 목록");
  await expect(page.getByRole("table", { name: "점검 결과" })).toBeHidden();
});

test("signing in with nothing says what is missing and puts the focus on the first of it", async ({ page }) => {
  await page.goto("/demo/login");
  await signIn(page).getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("이메일을 입력해주세요.")).toBeVisible();
  await expect(page.getByText("비밀번호를 입력해주세요.")).toBeVisible();
  const email = signIn(page).getByLabel("이메일");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription("이메일을 입력해주세요.");
});

test("the failing account gets a notice it can dismiss, and a good one gets its welcome", async ({ page }) => {
  await page.goto("/demo/login");
  const form = signIn(page);
  await form.getByLabel("이메일").fill("wrong@paper.ui");
  await form.getByLabel("비밀번호", { exact: true }).fill("paper2026");
  await form.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("이메일 또는 비밀번호가 맞지 않아요")).toBeVisible();
  await page.getByRole("button", { name: "알림 닫기" }).click();
  await expect(page.getByText("이메일 또는 비밀번호가 맞지 않아요")).toBeHidden();
  await form.getByLabel("이메일").fill("name@paper.ui");
  await form.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("name님, 다시 만나서 반가워요.")).toBeVisible();
});

test("the password reset is a modal: the field takes the focus and Escape closes it", async ({ page }) => {
  await page.goto("/demo/login");
  await page.getByRole("button", { name: "비밀번호 찾기" }).click();
  const dialog = page.getByRole("dialog", { name: "비밀번호 찾기" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("이메일")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("the sign-up tab holds its own form and its own errors", async ({ page }) => {
  await page.goto("/demo/login");
  await page.getByRole("tab", { name: "회원가입" }).click();
  const form = page.getByRole("form", { name: "회원가입" });
  await form.getByRole("button", { name: "가입하기" }).click();
  await expect(form.getByText("약관에 동의해야 가입할 수 있어요.")).toBeVisible();
  await form.getByLabel("이메일").fill("name@paper.ui");
  await form.getByLabel("비밀번호", { exact: true }).fill("paper2026");
  await form.getByLabel("비밀번호 확인").fill("paper2026");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByText("가입을 마쳤어요")).toBeVisible();
});

test("the settings form ties every label to its control, and the field in error says so", async ({ page }) => {
  await page.goto("/demo/settings");
  await expect(page.getByLabel("이름")).toHaveValue("백재원");
  await expect(page.getByLabel("언어")).toHaveValue("ko");
  await expect(page.getByRole("textbox", { name: "웹사이트" }).locator("..")).toHaveAttribute("data-status", "error");
  await expect(page.getByLabel("소개")).toBeVisible();
  const site = page.getByLabel("웹사이트");
  await expect(site).toHaveAttribute("aria-invalid", "true");
  await expect(site).toHaveAccessibleDescription("주소 형식이 맞지 않습니다.");
  await expect(page.getByRole("switch", { name: "주간 요약 받기" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "팀 전체에 공개" })).toBeChecked();
});

test("no screen overflows horizontally at 1440 and 390, and nothing is reported broken", async ({ page }) => {
  const errors = pageErrors(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const { path } of SCREENS) {
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${path} at ${width}`).toBeLessThanOrEqual(0);
    }
  }
  expect(errors).toEqual([]);
});
