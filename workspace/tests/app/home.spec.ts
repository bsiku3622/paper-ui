import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { MOTION } from "../../packages/paper-ui/src/tokens/motion-recipes";
import { expectStyle, profile } from "../support/style";

test("[atoms.link.target] the hero Buttons that are links carry no underline, and the demo link is a Link with an arrow icon that underlines under the pointer", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Read the docs", "Explore the Playground"]) await expect(page.getByRole("link", { name, exact: true })).toHaveCSS("text-decoration-line", "none");
  const demo = page.getByRole("link", { name: "Open the demo", exact: true });
  await page.mouse.move(0, 0);
  await expectStyle(demo, { color: tokens.color.interaction.link, textDecorationLine: "none" });
  await demo.hover();
  await expectStyle(demo, { textDecorationLine: "underline" });
});

test("the footer's links are Link Atoms in a quiet ink: no mark at rest, an underline on hover", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("footer").getByRole("link", { name: "Principles", exact: true });
  await page.mouse.move(0, 0);
  await expectStyle(link, { color: tokens.color.ink.secondary, textDecorationLine: "none" });
  await link.hover();
  await expectStyle(link, { textDecorationLine: "underline" });
});

// The brand label is not a status: a neutral badge on the primary soft face.
test("the brand label is a neutral badge", async ({ page }) => {
  await page.goto("/");
  const brand = page.getByText("Studio Baeks", { exact: true }).first();
  await expectStyle(brand, profile("primary", "soft"));
  await expectStyle(brand, { backgroundColor: tokens.color.accent.primary.soft });
});

// The stage is the Arcfield demo itself, not a drawing of a screen: a frame of /demo/arcfield, inert, in the page's theme.
test("[app.home.motion] shows the Arcfield demo itself on the stage, as a picture the page scrolls past", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const frame = page.locator("iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("src", /\/demo\/arcfield$/);
  await expect(frame).toHaveAttribute("inert", "");
  await expect(frame).toHaveAttribute("title", /Arcfield/);
  await frame.scrollIntoViewIfNeeded();
  const demo = page.frameLocator("iframe");
  await expect(demo.getByRole("navigation", { name: "제품 메뉴" })).toBeVisible();
  await expect(demo.locator("html")).toHaveAttribute("data-pui-theme", "light");
  // The link under it opens the demo to use.
  await expect(page.getByRole("link", { name: "Open the demo", exact: true })).toHaveAttribute("href", /\/demo\/arcfield$/);
});

// The landing page's motion: what comes in, in what order, and what stands in place at once where less motion is asked.
const playing = (target: Locator) => target.evaluate((element) => {
  const style = getComputedStyle(element);
  return { name: style.animationName, delay: parseFloat(style.animationDelay) * 1000, direction: style.animationDirection };
});
const viewTimelines = (page: Page) => page.evaluate(() => CSS.supports("animation-timeline: view()"));

test("[app.home.motion] brings the hero in a step at a time and opens the slot last, and where less motion is asked puts it all in place at once", async ({ page }) => {
  await page.goto("/");
  const headline = page.getByRole("heading", { level: 1 });
  const hero = headline.locator("xpath=..");
  const lines = headline.locator(":scope > span");
  // The meta line, the two lines of the headline, the paragraph and the actions, one step of the reveal role apart.
  const parts = [hero.locator(":scope > *").first(), lines.nth(0), lines.nth(1), hero.locator(":scope > p"), hero.locator(":scope > *").last()];
  const slot = lines.nth(1).locator(":scope > span");
  const step = parseFloat(MOTION.reveal.step);
  for (const [index, part] of parts.entries()) {
    const { name, delay } = await playing(part);
    expect(name, `part ${index}`).not.toBe("none");
    expect(delay, `part ${index}`).toBeCloseTo(step * index, 3);
  }
  const opening = await playing(slot);
  expect(opening.name).not.toBe("none");
  expect(opening.delay).toBeCloseTo(step * parts.length, 3);
  await expect(slot.getByRole("switch", { name: "Dark theme" })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  for (const part of [...parts, slot]) expect((await playing(part)).name).toBe("none");
  await expect(lines.nth(1)).toHaveCSS("opacity", "1");
});

test("[app.home.motion] the slot's switch is the page's theme, and the demo on the stage follows it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  const toggle = page.getByRole("switch", { name: "Dark theme" });
  await expect(toggle).not.toBeChecked();
  await toggle.click();
  await expect(html).toHaveAttribute("data-pui-theme", "dark");
  await expect(toggle).toBeChecked();
  // The stage takes no theme of its own, and the demo in it comes up in the page's.
  await expect(page.locator("[data-pui-theme]")).toHaveCount(1);
  await page.locator("iframe").scrollIntoViewIfNeeded();
  await expect(page.frameLocator("iframe").locator("html")).toHaveAttribute("data-pui-theme", "dark");
});

test("[app.home.motion] lights the statement up as it comes up the screen, and lights it all at once where less motion is asked", async ({ page }) => {
  await page.goto("/");
  test.skip(!(await viewTimelines(page)), "the lighting follows a view timeline");
  const words = page.getByTestId("home-statement").locator(":scope > span");
  // Below the fold the words wait in the quiet ink, and in the middle of the screen they are lit.
  await expectStyle(words.first(), { color: tokens.color.ink.tertiary });
  await words.first().evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expectStyle(words.first(), { color: tokens.color.ink.primary });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expectStyle(words.first(), { color: tokens.color.ink.primary });
});

test("[app.home.motion] lays a wall of real components in four columns that drift against each other", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const wall = page.getByTestId("home-wall");
  const columns = wall.locator(":scope > div");
  await expect(columns).toHaveCount(4);
  // The controls are the Atoms themselves, and they work.
  const mention = wall.getByRole("switch", { name: "When I'm mentioned" });
  await expect(mention).toBeChecked();
  await mention.click();
  await expect(mention).not.toBeChecked();
  if (await viewTimelines(page)) {
    const drifts = await Promise.all([0, 1, 2, 3].map(async (index) => playing(columns.nth(index))));
    expect(drifts.map((drift) => drift.direction)).toEqual(["normal", "reverse", "normal", "reverse"]);
    for (const drift of drifts) expect(drift.name).not.toBe("none");
  }
});
