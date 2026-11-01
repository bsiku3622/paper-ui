import { expect, test, type Locator, type Page } from "@playwright/test";

import { DEMO_LAYOUT } from "../../app/src/pages/demo/layout";
import { tokens } from "../../packages/paper-ui/src/tokens";
import { PRESET_SPEC, TYPOGRAPHY_SOURCE } from "../../packages/paper-ui/src/tokens/typography";
import { pageErrors } from "../support/console";
import { tab } from "../support/keyboard";
import { colors, contrast } from "../support/contrast";
import { px } from "../support/geometry";
import { expectStyle, profile } from "../support/style";

// /demo is the product the system is checked against: an issue tracker built from the Primitives, the Atoms and the
// app's own compositions. It owns its landmarks (chrome 'none'), so these tests read it the way a user does.

const filterGroup = (page: Page) => page.getByRole("group", { name: "상태 필터" });
const rows = (page: Page) => page.locator("tbody tr");
const role = (variant: keyof typeof tokens.typography.role) => {
  const spec = tokens.typography.role[variant];
  return { fontSize: spec.size, fontWeight: spec.weight, lineHeight: spec.leading, letterSpacing: spec.tracking };
};


test.beforeEach(async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("main")).toBeVisible();
});

test("the status filter is one roving group: one tab stop, arrow keys move focus, Space selects, and aria-pressed says which", async ({ page }) => {
  const group = filterGroup(page);
  const buttons = group.getByRole("button");
  await expect(buttons).toHaveCount(5);
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  expect(await buttons.evaluateAll((items) => items.map((item) => item.getAttribute("tabindex")))).toEqual(["0", "-1", "-1", "-1", "-1"]);

  await buttons.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("button", { name: /^할 일/ })).toBeFocused();
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(group.getByRole("button", { name: /^할 일/ })).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "false");
  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).first()).toContainText("모바일 내비게이션 프로토타입");

  // Tab leaves the group in one step, and Shift+Tab comes back to the one stop.
  await tab(page);
  await expect(group.locator(":focus")).toHaveCount(0);
  await tab(page, { shift: true });
  await expect(group.getByRole("button", { name: /^할 일/ })).toBeFocused();
});

test("'완료 포함' is a Selectable button: aria-pressed switches it and the finished tasks come into the list", async ({ page }) => {
  const toggle = page.getByRole("button", { name: "완료 포함" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("컴포넌트 간격 검토")).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("컴포넌트 간격 검토")).toBeVisible();
});

test("'새 작업' opens a modal dialog: focus goes to the name, Escape closes it and gives focus back, no native prompt appears", async ({ page }) => {
  page.on("dialog", () => { throw new Error("a native dialog opened"); });
  const opener = page.getByRole("button", { name: "새 작업" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "새 작업" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog.getByLabel(/작업 이름/)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("submitting the dialog adds the task, closes it and announces it; an empty name stays open with its error", async ({ page }) => {
  await page.getByRole("button", { name: "새 작업" }).click();
  const dialog = page.getByRole("dialog", { name: "새 작업" });
  await dialog.getByRole("button", { name: "추가" }).click();
  await expect(dialog).toBeVisible();
  const name = dialog.getByLabel(/작업 이름/);
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(dialog.getByText("작업 이름을 입력해주세요.")).toBeVisible();

  await name.fill("배포 체크리스트 정리");
  await name.press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(rows(page).first()).toContainText("배포 체크리스트 정리");
  await expect(page.locator('[aria-live="polite"]', { hasText: "새 작업을 추가했습니다" }).first()).toBeAttached();
  await expect(page.getByRole("button", { name: "새 작업" })).toBeFocused();
});

test("both bars are progressbars with values, and the sprint bar shows the true share", async ({ page }) => {
  const sprint = page.getByRole("progressbar", { name: "스프린트 진행률" });
  const milestone = page.getByRole("progressbar", { name: "마일스톤까지 지난 기간" });
  await expect(page.getByRole("progressbar")).toHaveCount(2);
  for (const [bar, value] of [[sprint, "17"], [milestone, "40"]] as const) {
    await expect(bar).toHaveAttribute("aria-valuenow", value);
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
  }
  const share = await sprint.evaluate((track) => track.firstElementChild!.getBoundingClientRect().width / track.getBoundingClientRect().width);
  expect(share).toBeCloseTo(0.17, 2);
  await expectStyle(sprint, { backgroundColor: tokens.color.control.track });
  await expectStyle(sprint.locator(":scope > *"), { backgroundColor: tokens.color.accent.primary.solid });
  await page.getByRole("checkbox", { name: "랜딩 페이지 정보 구조 확정 완료 처리" }).click();
  await expect(sprint).toHaveAttribute("aria-valuenow", "33");
});

test("the sidebar links name the page with aria-current, and following one moves it", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "작업 공간 메뉴" });
  const web = nav.getByRole("link", { name: "웹사이트 리뉴얼" });
  const mobile = nav.getByRole("link", { name: "모바일 앱" });
  await expect(web).toHaveAttribute("aria-current", "page");
  await expect(mobile).not.toHaveAttribute("aria-current", /.*/);
  await mobile.click();
  await expect(page).toHaveURL(/\?project=mobile$/);
  await expect(mobile).toHaveAttribute("aria-current", "page");
  await expect(web).not.toHaveAttribute("aria-current", /.*/);
  await nav.getByRole("link", { name: /내 작업/ }).click();
  await expect(page).toHaveURL(/\?view=mine$/);
  await expect(nav.getByRole("link", { name: /내 작업/ })).toHaveAttribute("aria-current", "page");
  await expect(mobile).not.toHaveAttribute("aria-current", /.*/);
});

test("the toast's live region is there before any notice, and a notice goes into it", async ({ page }) => {
  const region = page.getByRole("status");
  await expect(region).toHaveCount(1);
  await expect(region).toBeEmpty();
  await page.getByRole("checkbox", { name: "랜딩 페이지 정보 구조 확정 완료 처리" }).click();
  await expect(region).toContainText("작업을 완료했습니다");
  await expect(region.locator("svg")).toBeVisible();
  await expect(region).toBeEmpty();
});

// The height of a pill, which app/src/compositions/pill.css.ts holds as that composition's own.
const PILL = "22px";

test("avatars, day chips and the workspace mark are pills of the composition's own height around a body label", async ({ page }) => {
  const avatar = page.getByRole("navigation", { name: "작업 공간 메뉴" }).getByText("재", { exact: true }).locator("..");
  await expectStyle(avatar, { fontSize: tokens.typography.role.body.size, height: PILL, paddingLeft: tokens.shape.inset.sm, paddingRight: tokens.shape.inset.sm, borderTopLeftRadius: tokens.shape.radius.full, ...profile("primary", "soft") });
  const mark = page.getByRole("navigation", { name: "작업 공간 메뉴" }).getByText("S", { exact: true }).locator("..");
  await expectStyle(mark, { height: PILL, borderTopLeftRadius: tokens.shape.radius.control });
  const today = page.getByText("25", { exact: true }).locator("..");
  await expectStyle(today, { fontSize: tokens.typography.role.body.size, height: PILL, ...profile("primary", "solid") });
  await expect(today).toHaveAttribute("aria-current", "date");
  await expectStyle(page.getByText("24", { exact: true }).locator(".."), profile("primary", "ghost"));
});

test("badges keep the badge preset's size and say what they are: counts, statuses and priorities, with the teams neutral", async ({ page }) => {
  const size = px(TYPOGRAPHY_SOURCE.fontSize[PRESET_SPEC.badge.size]);
  for (const name of ["진행 중", "긴급"]) await expect(page.getByText(name, { exact: true }).first()).toHaveCSS("font-size", size);
  await expect(page.getByRole("navigation", { name: "작업 공간 메뉴" }).getByText("4", { exact: true })).toHaveCSS("font-size", size);
  await expectStyle(page.getByText("디자인 팀 · 회의"), { fontSize: size, ...profile("primary", "muted") });
  await expectStyle(page.getByText("콘텐츠 팀 · 회의"), profile("primary", "muted"));
});

test("meta is caption, the section heads and the table head are the label role, and the eyebrow is sentence case", async ({ page }) => {
  await expectStyle(page.getByText("9월 28일", { exact: true }), role("caption"));
  await expectStyle(page.getByText("Studio Baeks", { exact: true }).last(), role("caption"));
  for (const name of ["Workspace", "Projects"]) {
    const head = page.getByText(name, { exact: true });
    await expectStyle(head, { ...role("label"), color: tokens.color.ink.tertiary });
    await expect(head).toHaveCSS("text-transform", "none");
  }
  await expectStyle(page.getByText("Sprint 04 / 9월 21일 — 10월 4일"), role("caption"));
  await expectStyle(page.getByRole("columnheader", { name: "작업" }), { ...role("label"), color: tokens.color.ink.tertiary });
});

for (const scheme of ["light", "dark"] as const) {
  test(`the brand mark is a wash on the primary solid, readable at 4.5:1 (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const mark = page.getByRole("banner").locator("svg").first().locator("..");
    await expectStyle(mark, { backgroundColor: tokens.color.accent.primary.solid, color: tokens.color.accent.primary.wash });
    const { background, color } = await colors(mark);
    expect(contrast(background, color)).toBeGreaterThanOrEqual(4.5);
    await expectStyle(page.getByRole("progressbar", { name: "스프린트 진행률" }).locator(":scope > *"), { backgroundColor: tokens.color.accent.primary.solid });
  });
}

test("the page switches its columns exactly at the widths of its own layout module", async ({ page }) => {
  const { rail: wide, nav: narrow, stack } = DEMO_LAYOUT.collapse;
  const columns = async (width: number, target: (page: Page) => Locator) => {
    await page.setViewportSize({ width, height: 900 });
    return target(page).evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  };
  const layout = (page: Page) => page.getByRole("main").locator("..");
  const rail = (page: Page) => layout(page).locator(":scope > *").nth(2);
  expect([await columns(wide + 1, layout), await columns(wide, layout), await columns(narrow + 1, layout), await columns(narrow, layout)]).toEqual([3, 2, 2, 1]);
  await page.setViewportSize({ width: wide + 1, height: 900 });
  await expect(page.getByRole("navigation", { name: "작업 공간 메뉴" })).toBeVisible();
  await page.setViewportSize({ width: narrow, height: 900 });
  await expect(page.getByRole("navigation", { name: "작업 공간 메뉴" })).toBeHidden();
  await expect(rail(page)).toHaveCSS("position", "static");
  expect([await columns(stack + 1, rail), await columns(stack, rail)]).toEqual([2, 1]);
});

test("nothing overflows horizontally at 1440 and 390, and nothing is reported broken", async ({ page }) => {
  const errors = pageErrors(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demo");
    await expect(page.getByRole("main")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});
