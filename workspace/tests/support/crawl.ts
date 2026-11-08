import { expect, type Page } from "@playwright/test";

export const settled = async (page: Page) => {
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByText("불러오는 중…")).toHaveCount(0);
};

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
