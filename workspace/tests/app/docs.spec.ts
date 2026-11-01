import { expect, test, type Page } from "@playwright/test";

import { DOC_GROUPS, docSlug } from "../../app/src/site/site-core";
import { pageErrors } from "../support/console";
import { settled } from "../support/crawl";

// Every link a docs page draws, followed the way a reader follows it. The links are read from the rendered page, so
// what is checked is what the Prose component made of the Markdown, not the Markdown.
const SLUGS = DOC_GROUPS.flatMap((group) => group.docs.map((doc) => docSlug(group.id, doc)));
const pathOf = (slug: string) => (slug === "" ? "/docs" : `/docs/${slug}`);

type Link = { href: string; text: string };
const linksOf = (page: Page): Promise<Link[]> =>
  page.getByTestId("prose").locator("a[href]").evaluateAll((anchors) => (anchors as HTMLAnchorElement[]).map((anchor) => ({ href: anchor.getAttribute("href")!, text: anchor.textContent ?? "" })));

const hasId = (page: Page, id: string) => page.evaluate((id) => document.getElementById(id) !== null, id);

test("[app.docs.links-resolve] every link a docs page draws resolves: a doc link to a manifest page, an anchor to an id that exists, an app link to a page that keeps its path and has a heading", async ({ page }) => {
  test.setTimeout(180_000);
  const errors = pageErrors(page);
  const appTargets = new Map<string, string>();
  const anchors: { from: string; to: string; hash: string }[] = [];
  for (const slug of SLUGS) {
    const from = pathOf(slug);
    await page.goto(from);
    await settled(page);
    for (const { href, text } of await linksOf(page)) {
      const at = `${from}: "${text}" → ${href}`;
      // An external link is the reader's browser's to follow.
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue;
      if (href.startsWith("#")) expect(await hasId(page, decodeURIComponent(href.slice(1))), `${at} lands on an id of its own page`).toBe(true);
      else {
        const [path = "", hash = ""] = href.split("#");
        expect(path.startsWith("/"), `${at} is an absolute app path`).toBe(true);
        if (path === "/docs" || path.startsWith("/docs/")) {
          // A doc link names a page of the manifest; its anchor is looked for on that page.
          expect(SLUGS, `${at} names a docs page`).toContain(path === "/docs" ? "" : path.slice("/docs/".length));
          if (hash) anchors.push({ from, to: path, hash: decodeURIComponent(hash) });
        } else appTargets.set(path, at);
      }
    }
  }
  expect(errors).toEqual([]);
  // The anchors that point into another doc, each page loaded once.
  const wanted = new Map<string, typeof anchors>();
  for (const link of anchors) wanted.set(link.to, [...(wanted.get(link.to) ?? []), link]);
  for (const [to, links] of wanted) {
    await page.goto(to);
    await settled(page);
    for (const { from, hash } of links) expect(await hasId(page, hash), `${from} → ${to}#${hash} lands on an id`).toBe(true);
  }
  // The app links land where they say, with no redirect, on a page with a heading.
  expect(appTargets.size).toBeGreaterThan(0);
  for (const [path, at] of appTargets) {
    await page.goto(path);
    await settled(page);
    expect(new URL(page.url()).pathname, `${at} keeps its path`).toBe(path);
    await expect(page.getByRole("heading", { level: 1 }).first(), `${at} has an h1`).toBeVisible();
  }
});
