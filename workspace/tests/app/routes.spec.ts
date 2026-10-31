import { expect, test } from "@playwright/test";

import { DOC_GROUPS } from "../../app/src/site/site-core";

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

test("a table wider than the docs column scrolls inside its wrapper and leaves the page alone", async ({ page }) => {
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
