import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { pageErrors } from "../support/console";
import { crawlRoutes, settled } from "../support/crawl";
import { px, roleDp } from "../support/geometry";
import { tab } from "../support/keyboard";

const WIDTHS = [1440, 390] as const;
const SUFFIX = " — paper-ui";

const main = (page: Page) => page.getByRole("main");
const header = (page: Page) => page.getByRole("banner");
const docsNav = (page: Page) => page.getByRole("navigation", { name: "문서 목차" });
const playgroundNav = (page: Page) => page.getByRole("navigation", { name: "플레이그라운드 목차" });
const toggle = (page: Page) => page.getByRole("button", { name: /테마로 전환/ });

const contentWidth = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  });

test("every route a visitor can reach has one main and one banner, a title with the site's name, no error and no horizontal overflow, at 1440 and 390", async ({ page }) => {
  test.setTimeout(480_000);
  const errors = pageErrors(page);
  const routes = await crawlRoutes(page);
  expect(routes.length).toBeGreaterThan(60);
  for (const part of ["/", "/demo", "/playground", "/docs", "/playground/foundations/color", "/playground/button", "/docs/get-started/philosophy"]) expect(routes, part).toContain(part);
  const problems: string[] = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const before = errors.length;
      await page.goto(route);
      await settled(page);
      const at = `${route} @${width}`;
      const found = {
        mains: await main(page).count(),
        banners: await header(page).count(),
        title: await page.title(),
        overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
      };
      if (found.mains !== 1) problems.push(`${at}: ${found.mains} main landmarks`);
      if (found.banners !== 1) problems.push(`${at}: ${found.banners} banners`);
      if (route === "/" ? found.title !== "paper-ui" : !found.title.endsWith(SUFFIX) || found.title === SUFFIX.trim()) problems.push(`${at}: title "${found.title}"`);
      if (found.overflow > 0) problems.push(`${at}: overflows by ${found.overflow}px`);
      if (errors.length > before) problems.push(`${at}: ${errors.slice(before).join(" | ")}`);
    }
  }
  expect(problems).toEqual([]);
});

test("a page's title is its name, and it follows a client-side navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("paper-ui");
  await page.goto("/docs/foundations/color");
  await expect(page).toHaveTitle("Color — paper-ui");
  await page.goto("/docs");
  await expect(page).toHaveTitle("Overview — paper-ui");
  for (const [route, title] of [["/docs/foundations", "Foundations"], ["/docs/primitives", "Primitives"], ["/docs/atoms", "Atoms"]] as const) {
    await page.goto(route);
    await expect(page).toHaveTitle(`${title} Overview — paper-ui`);
  }
  await page.goto("/playground/icon-button");
  await expect(page).toHaveTitle("IconButton — paper-ui");
  await page.goto("/playground/foundations/motion");
  await expect(page).toHaveTitle("Motion — paper-ui");
  await page.goto("/playground");
  await expect(page).toHaveTitle("플레이그라운드 — paper-ui");
  await playgroundNav(page).getByRole("link", { name: "Badge", exact: true }).click();
  await expect(page).toHaveTitle("Badge — paper-ui");
  await page.goto("/demo");
  await expect(page).toHaveTitle("데모 — paper-ui");
  await page.goto("/demo/arcfield");
  await expect(page).toHaveTitle("데모 — paper-ui");
});

test("the Demo is a product of its own: its toolbar is the banner and its stack is the main landmark the skip link reaches", async ({ page }) => {
  await page.goto("/demo/arcfield");
  await settled(page);
  await expect(header(page)).toHaveCount(1);
  await expect(header(page).getByRole("search")).toBeVisible();
  await expect(main(page)).toHaveAttribute("id", "main");
  await tab(page);
  const skip = page.getByRole("link", { name: "본문으로 건너뛰기" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(main(page)).toBeFocused();
});

test("the first Tab shows the skip link at the top left, and Enter moves focus to the main landmark", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/docs/atoms/states");
  await settled(page);
  const skip = page.getByRole("link", { name: "본문으로 건너뛰기" });
  await expect(skip).not.toBeInViewport();
  await tab(page);
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  const box = (await skip.boundingBox())!;
  expect(box.x, "the link is at the left edge").toBeLessThan(40);
  expect(box.y, "the link is at the top").toBeLessThan(40);
  await page.keyboard.press("Enter");
  await expect(main(page)).toBeFocused();
  await expect(main(page)).toHaveCSS("outline-style", "none");
});

test("an anchor lands below the sticky header, from a URL and from a link in the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const height = async () => (await header(page).boundingBox())!.height;
  await page.goto("/docs/foundations/color#accent");
  const accent = page.locator("#accent");
  await expect(accent).toBeVisible();
  await expect.poll(async () => (await accent.boundingBox())!.y).toBeGreaterThanOrEqual(await height());
  expect((await accent.boundingBox())!.y, "it lands at the header, not far below it").toBeLessThan((await height()) + 40);

  await page.goto("/docs/foundations/typography");
  await settled(page);
  await main(page).getByRole("link", { name: "역할을 적용하는 단위", exact: true }).first().click();
  const target = page.locator("#역할을-적용하는-단위");
  await expect.poll(async () => (await target.boundingBox())!.y).toBeGreaterThanOrEqual(await height());
  expect((await target.boundingBox())!.y).toBeLessThan((await height()) + 40);
});

test("a navigation starts at the top of the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto("/playground/button");
  await settled(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await playgroundNav(page).getByRole("link", { name: "Badge", exact: true }).click();
  await expect(page).toHaveURL(/\/playground\/badge$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("the page loads under a visible header", async ({ page }) => {
  await page.route(/\/src\/pages\/Docs\.tsx/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto("/docs");
  await expect(header(page)).toBeVisible();
  await expect(docsNav(page)).toBeVisible();
  await expect(page.getByText("불러오는 중…")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
});

test("the sidebars are one frame: Docs, the Playground, and every page body fill the same content column at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const widths: Record<string, number> = {};
  for (const route of ["/docs/foundations/color", "/playground", "/playground/button", "/playground/foundations/color"]) {
    await page.goto(route);
    await settled(page);
    const column = await contentWidth(main(page));
    const head = await page.getByRole("heading", { level: 1 }).locator("xpath=../..").boundingBox();
    expect(Math.round(head!.width), `${route}: the page fills the column`).toBe(Math.round(column));
    widths[route] = Math.round(column);
  }
  expect(new Set(Object.values(widths)).size, JSON.stringify(widths)).toBe(1);
});

test("[app.shell.wide-frame] a page with a sidebar takes the screen past container.content, the header with it, a doc's text and tables fill it, and Home stays inside it", async ({ page }) => {
  const content = roleDp(tokens.layout.container.content);
  const edge = roleDp(tokens.layout.gap["2xl"]);
  await page.setViewportSize({ width: content + 400, height: 900 });
  const clientWidth = () => page.evaluate(() => document.documentElement.clientWidth);
  for (const route of ["/playground/button", "/docs/foundations/color"]) {
    await page.goto(route);
    await settled(page);
    const width = await clientWidth();
    const brand = (await header(page).getByRole("link").first().boundingBox())!;
    expect(Math.round(brand.x), `${route}: the brand`).toBe(edge);
    const column = (await main(page).boundingBox())!;
    expect(Math.round(column.x + column.width), `${route}: the column`).toBe(width - edge);
  }
  const prose = page.getByTestId("prose");
  const end = async (target: Locator) => { const box = (await target.boundingBox())!; return Math.round(box.x + box.width); };
  await page.goto("/docs/foundations/typography");
  await settled(page);
  const proseEnd = await end(prose);
  expect(await end(prose.locator(":scope > p").first()), "running text").toBe(proseEnd);
  expect(await end(prose.getByTestId("prose-table").first().locator("table")), "a table").toBe(proseEnd);
  await page.goto("/");
  await settled(page);
  const brand = (await header(page).getByRole("link").first().boundingBox())!;
  expect(Math.round(brand.x)).toBe(Math.round(((await clientWidth()) - content) / 2 + roleDp(tokens.layout.gutter)));
});

test("Home's content starts where the header's content starts, at every width", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settled(page);
    const brand = await header(page).getByRole("link").first().boundingBox();
    const hero = await page.getByTestId("home-column").locator("> *").first().boundingBox();
    expect(Math.round(hero!.x), `${width}`).toBe(Math.round(brand!.x));
  }
});

test("the head of a Docs page and of a Playground page is a crumb above the title", async ({ page }) => {
  const crumb = (title: string) => main(page).getByRole("heading", { level: 1, name: title, exact: true }).locator("xpath=preceding-sibling::*[1]/*");
  for (const [route, title, expected] of [
    ["/docs/foundations/color", "Color", ["Foundations", "/", "Color"]],
    ["/docs", "Overview", ["문서", "/", "Overview"]],
    ["/playground", "Overview", ["플레이그라운드", "/", "Overview"]],
    ["/playground/button", "Button", ["Atoms", "/", "Button"]],
  ] as const) {
    await page.goto(route);
    await expect(crumb(title), route).toHaveText([...expected]);
  }
});

test("an item of a sidebar takes the pointer's tint, and the current one keeps its face", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, nav, other] of [["/docs/foundations/color", docsNav, "Typography"], ["/playground/button", playgroundNav, "Badge"]] as const) {
    await page.goto(route);
    await settled(page);
    const item = nav(page).getByRole("link", { name: other, exact: true });
    await page.mouse.move(0, 0);
    const rest = await item.evaluate((element) => getComputedStyle(element).backgroundImage);
    await item.hover();
    await expect.poll(() => item.evaluate((element) => getComputedStyle(element).backgroundImage), route).not.toBe(rest);
    const current = nav(page).locator('a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await page.mouse.move(0, 0);
    const faceOf = (row: Locator) => row.evaluate((element) => { const { backgroundColor, backgroundImage } = getComputedStyle(element); return `${backgroundColor} ${backgroundImage}`; });
    const resting = await faceOf(item);
    await expect.poll(() => faceOf(current), route).not.toBe(resting);
  }
});

test("the theme toggle has a name for the theme it goes to, and flips the document's theme", async ({ page }) => {
  await page.goto("/");
  const button = toggle(page);
  await expect(button).toHaveAccessibleName("다크 테마로 전환");
  await expect(button.locator("svg")).toBeVisible();
  await button.click();
  await expect(page.locator("html")).toHaveAttribute("data-pui-theme", "dark");
  await expect(button).toHaveAccessibleName("라이트 테마로 전환");
  await button.click();
  await expect(page.locator("html")).toHaveAttribute("data-pui-theme", "light");
});

test("at 390 the header is static and the sidebars are closed drawers that a menu button in the header opens, and that close on a link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/foundations/color");
  await settled(page);
  await expect(header(page)).toHaveCSS("position", "static");
  await expect(main(page)).toHaveCSS("padding-left", px(roleDp(tokens.layout.gutter)));
  for (const [route, nav, link] of [["/docs/foundations/color", docsNav, "Typography"], ["/playground/button", playgroundNav, "Badge"]] as const) {
    await page.goto(route);
    await settled(page);
    const list = nav(page);
    const menu = page.getByRole("button", { name: "목차 열기" });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveAttribute("aria-controls", (await list.getAttribute("id"))!);
    await expect(list).toHaveAttribute("inert", "");
    await expect(list.getByRole("link", { name: link, exact: true })).not.toBeInViewport();
    await menu.click();
    await expect(page.getByRole("button", { name: "목차 닫기" })).toHaveAttribute("aria-expanded", "true");
    await expect(list.getByRole("link", { name: link, exact: true })).toBeInViewport();
    await list.getByRole("link", { name: link, exact: true }).click();
    await expect(list).toHaveAttribute("inert", "");
    await expect(list.getByRole("link", { name: link, exact: true })).not.toBeInViewport();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  }
});

test("in a short window a sidebar scrolls inside itself and stays under the header, to its last link", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 400 });
  for (const [route, nav] of [["/docs/primitives/float", docsNav], ["/playground/button", playgroundNav]] as const) {
    await page.goto(route);
    await settled(page);
    const list = nav(page);
    const last = list.getByRole("link").last();
    expect(await list.evaluate((element) => element.scrollHeight > element.clientHeight), `${route}: the list is taller than the window`).toBe(true);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const bottom = (await header(page).boundingBox())!.height;
    expect((await list.boundingBox())!.y, `${route}: the list stays below the header`).toBeGreaterThanOrEqual(bottom - 1);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    expect((await last.boundingBox())!.y, `${route}: its last link is not under the header`).toBeGreaterThanOrEqual(bottom);
  }
});

test("at 1440 the sidebars are open rails with no menu button, and the header stays at the top", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  for (const [route, nav] of [["/docs", docsNav], ["/playground", playgroundNav]] as const) {
    await page.goto(route);
    await settled(page);
    await expect(page.getByRole("button", { name: "목차 열기" })).toBeHidden();
    await expect(nav(page).getByRole("link").first()).toBeVisible();
    await expect(header(page)).toHaveCSS("position", "sticky");
    await expect(nav(page)).toHaveCSS("position", "sticky");
    await expect(nav(page)).toHaveCSS("overflow-y", "auto");
  }
});

test("at 1440 a sidebar row is sm tall on an sm + xs pitch, starts md + sm from the viewport edge, and a group folds from its icon button", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const row = roleDp(tokens.shape.control.height.sm);
  const pitch = row + roleDp(tokens.layout.gap.xs);
  for (const [route, nav] of [["/docs/foundations/color", docsNav], ["/playground/button", playgroundNav]] as const) {
    await page.goto(route);
    await settled(page);
    const links = nav(page).getByRole("link");
    const first = (await links.nth(0).boundingBox())!;
    const tops = await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getBoundingClientRect().top));
    expect(first.height, `${route}: row`).toBe(row);
    expect(Math.min(...tops.slice(1).map((top, at) => top - tops[at]!)), `${route}: pitch`).toBe(pitch);
    expect(first.x, `${route}: edge to item`).toBe(roleDp(tokens.layout.gap.md) + roleDp(tokens.layout.gap.sm));
    const fold = nav(page).locator("button[aria-expanded]").first();
    await expect(fold, route).toHaveAccessibleName(/\S/);
    const head = (await fold.boundingBox())!;
    expect(head.height, `${route}: fold button`).toBe(roleDp(tokens.shape.control.height.xs));
    const group = nav(page).getByRole("group", { name: (await fold.evaluate((element) => document.getElementById(element.getAttribute("aria-labelledby")!)!.textContent))! });
    const open = await group.getByRole("link").count();
    expect(open, route).toBeGreaterThan(0);
    await fold.click();
    await expect(fold).toHaveAttribute("aria-expanded", "false");
    await expect(group.getByRole("link")).toHaveCount(0);
    await fold.click();
    await expect(group.getByRole("link")).toHaveCount(open);
  }
});

test("the group that holds the current page folds and stays folded until a page in it opens again", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/docs/foundations/color");
  await settled(page);
  const fold = docsNav(page).getByRole("button", { name: "Foundations" });
  const current = docsNav(page).locator('[aria-current="page"]');
  await fold.click();
  await expect(fold).toHaveAttribute("aria-expanded", "false");
  await docsNav(page).getByRole("link", { name: "Element" }).click();
  await expect(current).toHaveText("Element");
  await expect(fold).toHaveAttribute("aria-expanded", "false");
  await page.goBack();
  await expect(current).toHaveText("Color");
  await expect(fold).toHaveAttribute("aria-expanded", "true");
  await expect(current).toBeVisible();
});
