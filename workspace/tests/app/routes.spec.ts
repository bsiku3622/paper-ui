import { expect, test } from "@playwright/test";

import { DOC_GROUPS, docSlug } from "../../app/src/site/site-core";
import { pageErrors } from "../support/console";
import { settled } from "../support/crawl";

test("former palette and tokens routes land on the Color foundation", async ({ page }) => {
  for (const route of ["/playground/palette", "/playground/tokens", "/playground/foundations"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/playground\/foundations\/color$/);
  }
});

test("the slugs of the renamed primitives land on their new pages", async ({ page }) => {
  const renamed = { toggleable: "selectable", "toggle-group": "selectable-group", overlay: "floating", hoverable: "surface" };
  for (const [old, current] of Object.entries(renamed)) {
    await page.goto(`/playground/${old}`);
    await expect(page).toHaveURL(new RegExp(`/playground/${current}$`));
  }
});

test("an unknown docs slug lands on the docs overview", async ({ page }) => {
  await page.goto("/docs/no-such-doc");
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
});

test("the docs sidebar lists the groups of DOC_GROUPS in order, one link per doc", async ({ page }) => {
  await page.goto("/docs");
  const sidebar = page.getByRole("navigation", { name: "문서 목차" });
  await expect(sidebar.getByRole("link")).toHaveCount(DOC_GROUPS.reduce((total, group) => total + group.docs.length, 0));
  const labels = DOC_GROUPS.map((group) => group.label).filter(Boolean);
  expect((await sidebar.innerText()).split("\n").filter((line) => labels.includes(line))).toEqual(labels);
});

test("[foundations.typography.code-breaking] a table wider than the docs column scrolls inside its wrapper and leaves the page alone", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/docs/atoms/states");
  const wrapper = page.getByTestId("prose-table").filter({ hasText: "링 주인" }).first();
  await expect(wrapper).toBeVisible();
  const { pageOverflow, wrapperOverflow } = await wrapper.evaluate((element) => ({
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    wrapperOverflow: element.scrollWidth - element.clientWidth,
  }));
  expect(pageOverflow).toBe(0);
  expect(wrapperOverflow).toBeGreaterThan(0);
});

// The routes the site declares: its pages, the docs manifest, and the Playground sidebar as it draws its links. The
// dark project runs a smoke pass over a few of them.
const SMOKE = ["/", "/demo", "/docs", "/docs/get-started/install", "/playground", "/playground/button", "/playground/foundations/color"];

test("[app.routes.every-route] every route of the site map, the docs manifest and the Playground sidebar draws its h1 in main, reports no error and does not overflow at 390", async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = pageErrors(page);
  await page.goto("/playground");
  await settled(page);
  const sidebar = await page.locator('a[href^="/playground/"]').evaluateAll((anchors) => (anchors as HTMLAnchorElement[]).map((anchor) => anchor.pathname));
  const docs = DOC_GROUPS.flatMap((group) => group.docs.map((doc) => docSlug(group.id, doc))).map((slug) => (slug === "" ? "/docs" : `/docs/${slug}`));
  const all = [...new Set(["/", "/demo", "/playground", ...docs, ...sidebar])];
  expect(all.length, "the manifests list the site").toBeGreaterThan(60);
  for (const route of info.project.name === "chromium-dark" ? SMOKE : all) {
    await page.goto(route);
    await settled(page);
    expect(new URL(page.url()).pathname, `${route} is not redirected`).toBe(route);
    // The Demo is a product of its own: its banner holds the h1, and its main the work.
    const h1 = route === "/demo" ? page.getByRole("heading", { level: 1 }) : page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(h1.first(), `${route} has an h1`).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${route} overflows at 390`).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});
