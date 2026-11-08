import { expect, test } from "@playwright/test";

import { openHarness } from "../support/harness";

const read = (locator: import("@playwright/test").Locator, property: string) =>
  locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

test("[install.provider.source-overrides] [install.provider.color-overrides] a Provider's values reach the parts that read them, in each mode", async ({ page }) => {
  await openHarness(page, "provider-overrides");
  await expect(page.getByTestId("button")).toBeVisible();
  expect(await read(page.getByTestId("button"), "border-top-left-radius")).toBe("11px");
  expect(await read(page.getByTestId("light-face"), "background-color")).toBe("rgb(1, 2, 3)");
  expect(await read(page.getByTestId("dark-face"), "background-color")).toBe("rgb(7, 8, 9)");
  expect(await read(page.getByTestId("info"), "background-color")).toBe("rgb(10, 11, 12)");
  expect(await read(page.getByTestId("light-face"), "box-shadow")).toContain("0px 1px 2px 3px");
  expect(await read(page.getByTestId("disabled"), "opacity")).toBe("0.25");
});
