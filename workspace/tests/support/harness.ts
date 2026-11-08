import { expect, type Page } from "@playwright/test";

import type { CaseName } from "../../fixtures/harness/src/case-names";
import { pageErrors } from "./console";
import { chooseOption } from "./select";

// The two servers the e2e run starts: the app and the @paper-ui/harness page. Each has a fixed port with
// --strictPort and no reuse, so a server from another worktree or branch never answers for this one.
// E2E_APP_PORT and E2E_HARNESS_PORT move them.
export const APP_PORT = Number(process.env.E2E_APP_PORT ?? 41731);
export const HARNESS_PORT = Number(process.env.E2E_HARNESS_PORT ?? 41732);

export const app = (path = "/") => new URL(path, `http://localhost:${APP_PORT}`).href;
export const harness = (name?: CaseName, params: Record<string, string> = {}) => {
  const url = new URL(`http://localhost:${HARNESS_PORT}/`);
  if (name) url.searchParams.set("case", name);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.href;
};

// A Playground page, once its heading is up.
export const openPlayground = async (page: Page, slug: string, name: string) => {
  await page.goto(`/playground/${slug}`);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
};

// A Props control is a Select, or a segment (a radio group) when its choices are few and its resting value is one of them. A spec that
// drives a component through its props picks a value either way; which of the two a prop gets is the Playground's own contract, and
// app/playground.spec.ts checks it.
export const chooseProp = async (page: Page, name: string, value: string) => {
  const select = page.getByRole("combobox", { name, exact: true });
  const segment = page.getByRole("radiogroup", { name, exact: true });
  await expect(select.or(segment)).toBeVisible();
  if ((await select.count()) > 0) await chooseOption(select, value);
  else await segment.getByRole("radio", { name: value, exact: true }).click();
};

// A harness case, once it has rendered. The page must mount without an error.
export const openHarness = async (page: Page, name: CaseName, params?: Record<string, string>) => {
  const errors = pageErrors(page);
  await page.goto(harness(name, params));
  await expect.poll(async () => errors.length > 0 || (await page.locator("#root > *").count()) > 0).toBe(true);
  expect(errors, `?case=${name} mounts without errors`).toEqual([]);
};
