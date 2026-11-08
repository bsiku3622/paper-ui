import { expect, test, type Locator, type Page } from "@playwright/test";

import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { pageErrors } from "../support/console";
import { nativeSelect } from "../support/select";

const ARCFIELD = "/demo/arcfield";
const SECURITY = `${ARCFIELD}/security`;
const SEARCH = `${ARCFIELD}/search`;
const LOGIN = `${ARCFIELD}/login`;
const SETTINGS = `${ARCFIELD}/settings`;

const SCREENS = [
  { path: ARCFIELD, heading: "개요" },
  { path: SECURITY, heading: "보안과 접근" },
  { path: SEARCH, heading: "검색" },
  { path: LOGIN, heading: "다시 이어서 만들어 볼까요?" },
  { path: SETTINGS, heading: "설정" },
] as const;

const signIn = (page: Page) => page.getByRole("form", { name: "로그인" });

test("/demo has one banner holding its h1, one main, and shows the Arcfield dashboard in its frame", async ({ page }) => {
  const errors = pageErrors(page);
  await page.goto("/demo");
  await expect(page).toHaveTitle("데모 — paper-ui");
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("banner").getByRole("heading", { level: 1 })).toHaveText("데모");
  await expect(page.getByRole("main")).toHaveCount(1);
  const frame = page.frameLocator("iframe").first();
  await expect(frame.getByRole("main").getByRole("heading", { level: 1 })).toHaveText("개요");
  expect(errors).toEqual([]);
});

test("the app list holds Arcfield and the eight demo apps, and the one shown is current", async ({ page }) => {
  await page.goto("/demo");
  const apps = page.getByRole("navigation", { name: "앱" });
  await expect(apps.getByRole("link")).toHaveCount(9);
  await expect(apps.getByRole("link", { name: "Arcfield" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("iframe")).toHaveAttribute("src", ARCFIELD);
  await expect(page.getByRole("link", { name: "새 탭에서 열기" })).toHaveAttribute("href", ARCFIELD);
});

test("picking an app puts it in the address and the frame opens it under /demos/", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("navigation", { name: "앱" }).getByRole("link", { name: "Doodle" }).click();
  await expect(page).toHaveURL(/\/demo\?app=doodle$/);
  await expect(page.getByRole("navigation", { name: "앱" }).getByRole("link", { name: "Doodle" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("iframe")).toHaveAttribute("src", "/demos/doodle/");
  await expect(page.getByRole("link", { name: "새 탭에서 열기" })).toHaveAttribute("href", "/demos/doodle/");
});

test("an address naming no app shows Arcfield", async ({ page }) => {
  await page.goto("/demo?app=nothing");
  await expect(page.locator("iframe")).toHaveAttribute("src", ARCFIELD);
});

for (const { path, heading } of SCREENS) {
  test(`${path}: one banner, one main, and its h1`, async ({ page }) => {
    const errors = pageErrors(page);
    await page.goto(path);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(heading);
    expect(errors).toEqual([]);
  });
}

test("the settings form is opened from the sidebar and leads back, and the sign-in is reached by signing out", async ({ page }) => {
  await page.goto(ARCFIELD);
  await page.getByRole("navigation", { name: "계정 메뉴" }).getByRole("link", { name: "설정" }).click();
  await expect(page).toHaveURL(/\/demo\/arcfield\/settings$/);
  await expect(page).toHaveTitle("설정 폼 데모 — paper-ui");
  await page.getByRole("banner").getByRole("link", { name: "대시보드" }).click();
  await expect(page).toHaveURL(/\/demo\/arcfield$/);
  await page.getByRole("button", { name: "내 계정" }).click();
  await page.getByRole("link", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/demo\/arcfield\/login$/);
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText("다시 이어서 만들어 볼까요?");
});

test("the findings table is a table to assistive technology: seven headers over a page of ten rows of seven cells", async ({ page }) => {
  await page.goto(SECURITY);
  const table = page.getByRole("table", { name: "점검 결과" });
  await expect(table.getByRole("columnheader")).toHaveCount(7);
  await expect(table.getByRole("row")).toHaveCount(11);
  await expect(table.getByRole("row").nth(1).getByRole("cell")).toHaveCount(7);
  await expect(table.getByRole("row").nth(1)).toContainText("SEC-1042");
});

test("the window scrolls and the dashboard's sidebar stands still beside it, a gap from the column and inside the window", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.goto(ARCFIELD);
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
  expect((await boxOf(main)).x - (before.x + before.width)).toBe(24);
});

test("below the md breakpoint the sidebar leaves and the column takes the whole width", async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 800 });
  await page.goto(ARCFIELD);
  await expect(page.getByRole("complementary")).toBeHidden();
  expect((await page.getByRole("main").boundingBox())!.width).toBe(767 - 2 * SHAPE_SOURCE.space.xl);
  await page.setViewportSize({ width: 768, height: 800 });
  await expect(page.getByRole("complementary")).toBeVisible();
});

test("a long word in a table cell is cut by an ellipsis instead of breaking the row", async ({ page }) => {
  await page.goto(SECURITY);
  const title = page.getByRole("table", { name: "점검 결과" }).getByRole("cell").filter({ hasText: "SEC-1042" }).getByText("공개 읽기가 허용된 버킷");
  await expect(title).toHaveCSS("text-overflow", "ellipsis");
  await expect(title).toHaveCSS("white-space", "nowrap");
});

test("the dashboard's sidebar links mark one page, and following another moves the mark", async ({ page }) => {
  await page.goto(SECURITY);
  const nav = page.getByRole("navigation", { name: "제품 메뉴" });
  const here = (name: string) => expect(nav.getByRole("link", { name })).toHaveAttribute("aria-current", "page");
  await here("보안과 접근");
  await nav.getByRole("link", { name: "배포" }).click();
  await expect(page).toHaveURL(/\/demo\/arcfield\/deploy$/);
  await here("배포");
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
});

test("a tablist is one tab stop: arrow keys move focus and the panel, and each panel is named by its tab", async ({ page }) => {
  await page.goto(SECURITY);
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
  await page.goto(LOGIN);
  await signIn(page).getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("이메일을 입력해주세요.")).toBeVisible();
  await expect(page.getByText("비밀번호를 입력해주세요.")).toBeVisible();
  const email = signIn(page).getByLabel("이메일");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription("이메일을 입력해주세요.");
});

test("the failing account gets a notice it can dismiss, and a good one gets its welcome", async ({ page }) => {
  await page.goto(LOGIN);
  const form = signIn(page);
  await form.getByLabel("이메일").fill("wrong@paper.ui");
  await form.getByLabel("비밀번호", { exact: true }).fill("paper2026");
  await form.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("이메일 또는 비밀번호가 맞지 않습니다")).toBeVisible();
  await page.getByRole("button", { name: "알림 닫기" }).click();
  await expect(page.getByText("이메일 또는 비밀번호가 맞지 않습니다")).toBeHidden();
  await form.getByLabel("이메일").fill("name@paper.ui");
  await form.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("name님, 다시 만나서 반갑습니다.")).toBeVisible();
});

test("the password reset is a modal: the field takes the focus and Escape closes it", async ({ page }) => {
  await page.goto(LOGIN);
  await page.getByRole("button", { name: "비밀번호 찾기" }).click();
  const dialog = page.getByRole("dialog", { name: "비밀번호 찾기" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("이메일")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("the sign-in has no tabs: a line under it leads to the sign-up, which holds its own form and its own errors and leads back", async ({ page }) => {
  await page.goto(LOGIN);
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await page.getByRole("button", { name: "회원가입하기" }).click();
  await expect(page).toHaveURL(/step=signup/);
  await expect(signIn(page)).toHaveCount(0);
  const form = page.getByRole("form", { name: "회원가입" });
  await form.getByRole("button", { name: "가입하기" }).click();
  await expect(form.getByText("약관에 동의해야 가입할 수 있습니다.")).toBeVisible();
  await form.getByLabel("이메일").fill("name@paper.ui");
  await form.getByLabel("비밀번호", { exact: true }).fill("paper2026");
  await form.getByLabel("비밀번호 확인").fill("paper2026");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByText("가입을 마쳤습니다")).toBeVisible();
});

test("the sign-up leads back to the sign-in by the line under it", async ({ page }) => {
  await page.goto(`${LOGIN}?step=signup`);
  await page.getByRole("button", { name: "로그인하기" }).click();
  await expect(signIn(page)).toBeVisible();
  await expect(page.getByRole("form", { name: "회원가입" })).toHaveCount(0);
});

test("the settings form ties every label to its control, and the field in error says so", async ({ page }) => {
  await page.goto(SETTINGS);
  await expect(page.getByLabel("이름")).toHaveValue("한서윤");
  await expect(nativeSelect(page.getByLabel("언어"))).toHaveValue("ko");
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
