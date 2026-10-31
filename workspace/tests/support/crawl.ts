import { expect, type Page } from "@playwright/test";

// A page, once the shell and the page under it have drawn: the main landmark is up and nothing is loading.
export const settled = async (page: Page) => {
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByText("불러오는 중…")).toHaveCount(0);
};

// Every route a visitor can reach from the home page: a breadth-first walk over the same-origin links each page
// draws. It reads the site the way a visitor does, so it needs nothing from the app, and a page nobody links to
// is not in it. Routes come back as paths, sorted, without hashes.
export const crawlRoutes = async (page: Page, start = "/"): Promise<string[]> => {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    await page.goto(queue.shift()!);
    await settled(page);
    const paths = await page.locator("a[href]").evaluateAll((anchors) =>
      (anchors as HTMLAnchorElement[]).filter((anchor) => anchor.origin === location.origin).map((anchor) => anchor.pathname),
    );
    for (const path of paths) {
      if (seen.has(path)) continue;
      seen.add(path);
      queue.push(path);
    }
  }
  return [...seen].sort();
};
