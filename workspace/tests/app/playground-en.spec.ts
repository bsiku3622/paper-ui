import { expect, test, type Locator, type Page } from "@playwright/test";

import { pageErrors } from "../support/console";

test.use({ locale: "en-US" });

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;

const spoken = async (main: Locator): Promise<string> =>
  main.evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("pre, code, [data-testid^='text-'], [data-testid='variant-sheet']").forEach((node) => node.remove());
    const names = Array.from(copy.querySelectorAll("[aria-label], [title], [placeholder]"), (node) => [node.getAttribute("aria-label"), node.getAttribute("title"), node.getAttribute("placeholder")].join(" "));
    return `${copy.textContent ?? ""} ${names.join(" ")}`;
  });

const visit = async (page: Page, path: string, heading: string | RegExp) => {
  const errors = pageErrors(page);
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");
  const main = page.getByRole("main");
  expect(await spoken(main)).not.toMatch(HANGUL);
  expect(errors).toEqual([]);
};

test("the Overview speaks English", async ({ page }) => {
  await visit(page, "/playground", "Overview");
  await expect(page.getByRole("heading", { name: "Other Atoms" })).toBeVisible();
});

test("an Atom page speaks English", async ({ page }) => {
  await visit(page, "/playground/button", "Button");
  await expect(page.getByRole("button", { name: "Copy", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Props table" })).toBeVisible();
});

test("a Foundations page speaks English", async ({ page }) => {
  await visit(page, "/playground/foundations/color", /Color/);
});

test("every page of the sidebar speaks English", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/playground");
  const paths = await page.getByRole("navigation").locator("a[href^='/playground']").evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
  expect(paths.length).toBeGreaterThan(40);
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const korean = (await spoken(page.getByRole("main"))).replace(/Aa 가나다?|TRACKING · 가나다|다람쥐 헌 쳇바퀴/g, "");
    expect(korean.match(HANGUL) === null, `${path}: ${korean.match(/.{0,30}[ᄀ-ᇿ㄰-㆏가-힣].{0,30}/)?.[0]}`).toBe(true);
  }
});
