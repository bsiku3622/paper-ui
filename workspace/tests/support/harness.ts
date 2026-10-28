import { expect, type Page } from "@playwright/test";

import type { CaseName } from "../../fixtures/harness/src/case-names";
import { pageErrors } from "./console";

// The two servers the e2e run starts: the app and the @paper-ui/harness page. Each has a fixed port with
// --strictPort and no reuse, so a server from another worktree or branch never answers for this one.
// E2E_APP_PORT and E2E_HARNESS_PORT move them.
export const APP_PORT = Number(process.env.E2E_APP_PORT ?? 41731);
export const HARNESS_PORT = Number(process.env.E2E_HARNESS_PORT ?? 41732);

export const app = (path = "/") => new URL(path, `http://localhost:${APP_PORT}`).href;
export const harness = (name?: CaseName) => {
  const url = new URL(`http://localhost:${HARNESS_PORT}/`);
  if (name) url.searchParams.set("case", name);
  return url.href;
};

// A Playground page, once its heading is up.
export const openPlayground = async (page: Page, slug: string, name: string) => {
  await page.goto(`/playground/${slug}`);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
};

// A harness case, once it has rendered. The page must mount without an error.
export const openHarness = async (page: Page, name: CaseName) => {
  const errors = pageErrors(page);
  await page.goto(harness(name));
  await expect.poll(async () => errors.length > 0 || (await page.locator("#root > *").count()) > 0).toBe(true);
  expect(errors, `?case=${name} mounts without errors`).toEqual([]);
};
