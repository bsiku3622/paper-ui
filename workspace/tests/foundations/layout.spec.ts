import { expect, test, type Locator } from "@playwright/test";

import { ELEVATION, ELEVATION_NEST_LIMIT } from "../../packages/paper-ui/src/tokens";
import { BREAKPOINTS, ELEVATIONS, LAYOUT_SOURCE, type Elevation } from "../../packages/paper-ui/src/tokens/layout";
import { px } from "../support/geometry";
import { openHarness, openPlayground } from "../support/harness";
import { expectStyle } from "../support/style";

// CDP runs in chromium only, so this spec is not part of the cross-engine set.

const z = (tier: Elevation) => String(LAYOUT_SOURCE.elevation.tier[tier].z);

test("[foundations.layout.breakpoint-em] [foundations.pages.derived-rows] the Layout page reads each breakpoint in em beside its px at the default root font", async ({ page }) => {
  await page.goto("/playground/foundations/layout");
  for (const name of BREAKPOINTS) {
    const dp = LAYOUT_SOURCE.breakpoint[name];
    await expect(page.getByText(`${dp / 16}em · ${dp}px`, { exact: true }), name).toBeVisible();
  }
});

test("[foundations.layout.breakpoint-em] a breakpoint follows the browser's default font size, and so does the container", async ({ page }) => {
  // The browser's default font goes from 16px to 20px, which moves an em breakpoint and a rem length by that ratio. The
  // window stands between md at the two fonts: wider than it at first, narrower than it after.
  const FONT = 20;
  const ratio = FONT / 16;
  const { md } = LAYOUT_SOURCE.breakpoint;
  const { content } = LAYOUT_SOURCE.container;
  await page.setViewportSize({ width: Math.round((md + md * ratio) / 2), height: 900 });
  const sidebar = page.getByTestId("home-mockup-side");
  const column = page.getByTestId("home-column");

  await page.goto("/");
  await expect(column).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(column).toHaveCSS("max-width", px(content));

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: FONT } });
  await page.reload();
  await expect(column).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("font-size", px(FONT));
  await expect(sidebar).toBeHidden();
  await expect(column).toHaveCSS("max-width", px(content * ratio));
});

test("[foundations.layout.elevation-unit] a Surface in block flow takes its tier's position, z and shadow together", async ({ page }) => {
  await openHarness(page, "elevation");
  for (const tier of ELEVATIONS) {
    const surface = page.getByTestId(`tier-${tier}`);
    await expect(surface, tier).toHaveCSS("position", LAYOUT_SOURCE.elevation.tier[tier].position);
    await expect(surface, tier).toHaveCSS("z-index", z(tier));
    await expectStyle(surface, { boxShadow: ELEVATION.shadow[tier] });
  }
});

test("[foundations.layout.elevation-tier-order] the computed z-index of every tier's Surface, and of a popover and a modal Floating, rises strictly with the tier and keeps a nest of the limit's depth under the next tier", async ({ page }) => {
  await openHarness(page, "elevation");
  const zIndex = (locator: Locator) => locator.evaluate((element) => Number(getComputedStyle(element).zIndex));
  const tiers = await Promise.all(ELEVATIONS.map((tier) => zIndex(page.getByTestId(`tier-${tier}`))));
  expect(tiers).toEqual(ELEVATIONS.map((tier) => LAYOUT_SOURCE.elevation.tier[tier].z));
  tiers.forEach((value, index) => {
    if (index > 0) expect(value, ELEVATIONS[index]).toBeGreaterThan(tiers[index - 1]!);
  });
  const { nudge } = LAYOUT_SOURCE.elevation;
  tiers.slice(0, -1).forEach((value, index) => expect(value + ELEVATION_NEST_LIMIT * nudge, ELEVATIONS[index]).toBeLessThan(tiers[index + 1]!));
  // The Floating tiers are the same steps: a popover panel stands at overlay, a modal's scrim at modal, and a toast above both.
  expect(await zIndex(page.getByTestId("popover"))).toBe(LAYOUT_SOURCE.elevation.tier.overlay.z);
  const toast = await zIndex(page.getByTestId("toast"));
  expect(toast).toBe(LAYOUT_SOURCE.elevation.tier.toast.z);
  await openHarness(page, "elevation", { modal: "" });
  const scrim = await zIndex(page.getByTestId("popover").locator("xpath=.."));
  expect(scrim).toBe(LAYOUT_SOURCE.elevation.tier.modal.z);
  expect(scrim).toBeLessThan(toast);
});

test("[foundations.layout.elevation-unit] the GNB is sticky at the sticky tier, and the Demo toast stands at the toast tier with the floating shadow", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toHaveCSS("position", "sticky");
  await expect(header).toHaveCSS("z-index", z("sticky"));
  await page.goto("/demo");
  // The finished task leaves the list, so the click is not followed by a state check.
  await page.getByRole("checkbox", { name: "랜딩 페이지 정보 구조 확정 완료 처리" }).click();
  // The notice is the plate inside the live region the page mounts from the start.
  const toast = page.getByRole("status").locator(":scope > *");
  await expect(toast).toBeVisible();
  await expect(toast).toHaveCSS("z-index", z("toast"));
  await expectStyle(toast, { boxShadow: ELEVATION.shadow.toast });
});

test("[foundations.layout.elevation-nesting] the Floating example's popover stands at the overlay tier, and its confirm dialog's scrim covers it", async ({ page }) => {
  await openPlayground(page, "floating", "Floating");
  await page.getByRole("button", { name: "설정 열기", exact: true }).click();
  const popover = page.getByRole("dialog", { name: "설정", exact: true });
  // React Aria stacks an anchored panel at 100000; the tier decides instead.
  await expect(popover).toHaveCSS("z-index", z("overlay"));
  await expectStyle(popover, { boxShadow: ELEVATION.shadow.overlay });
  // The panel rises into place first: Playwright's click retries on a moving target and its scrolling chases the panel, which a real mouse does not do.
  await expect(popover).not.toHaveAttribute("data-presence", /.*/);
  await popover.getByRole("button", { name: "확인 창 열기", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "중첩 확인", exact: true });
  const scrim = confirm.locator("xpath=..");
  await expect(scrim).toHaveCSS("z-index", z("modal"));
  await expectStyle(confirm, { boxShadow: ELEVATION.shadow.modal });
  const corner = await popover.evaluate((element) => {
    const { x, y } = element.getBoundingClientRect();
    return { x: x + 4, y: y + 4 };
  });
  expect(await scrim.evaluate((element, point) => element.contains(document.elementFromPoint(point.x, point.y)), corner), "the scrim is above the popover").toBe(true);
});

test("[foundations.layout.elevation-nesting] a modal Floating stands at the modal tier, and one nested in it a nudge above", async ({ page }) => {
  await openPlayground(page, "floating", "Floating");
  await page.getByRole("combobox", { name: "presentation", exact: true }).selectOption("modal");
  await page.getByRole("button", { name: "설정 열기", exact: true }).click();
  const outer = page.getByRole("dialog", { name: "설정", exact: true });
  await expect(outer.locator("xpath=..")).toHaveCSS("z-index", z("modal"));
  await expectStyle(outer, { boxShadow: ELEVATION.shadow.modal });
  await outer.getByRole("button", { name: "확인 창 열기", exact: true }).click();
  const inner = page.getByRole("dialog", { name: "중첩 확인", exact: true });
  const nudge = LAYOUT_SOURCE.elevation.nudge;
  await expect(inner.locator("xpath=..")).toHaveCSS("z-index", String(Number(z("modal")) + nudge));
  await expectStyle(inner, { boxShadow: ELEVATION.shadow.modal });
});

test("[foundations.layout.elevation-nesting] a toast paints above an open popover", async ({ page }) => {
  await openHarness(page, "elevation");
  const popover = page.getByTestId("popover");
  await expect(popover).toBeVisible();
  await expect(popover).toHaveCSS("z-index", z("overlay"));
  await expect(page.getByTestId("toast")).toHaveCSS("z-index", z("toast"));
  const stack = await popover.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return document.elementsFromPoint(x + width / 2, y + height / 2).map((hit) => hit.getAttribute("data-testid")).filter(Boolean);
  });
  expect(stack.indexOf("popover"), "the popover is under the point").toBeGreaterThanOrEqual(0);
  expect(stack.indexOf("toast")).toBeGreaterThanOrEqual(0);
  expect(stack.indexOf("toast")).toBeLessThan(stack.indexOf("popover"));
});

test("[foundations.layout.elevation-nesting] a toast paints above an open modal and its scrim", async ({ page }) => {
  await openHarness(page, "elevation", { modal: "true" });
  const dialog = page.getByTestId("popover");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("xpath=..")).toHaveCSS("z-index", z("modal"));
  await expect(page.getByTestId("toast")).toHaveCSS("z-index", z("toast"));
  // An open modal makes #root inert, which only takes it out of hit-testing; what is asked here is paint order.
  await page.evaluate(() => document.getElementById("root")!.removeAttribute("inert"));
  const order = await dialog.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    const hits = document.elementsFromPoint(x + width / 2, y + height / 2);
    return { scrim: hits.indexOf(element.parentElement!), toast: hits.findIndex((hit) => hit.getAttribute("data-testid") === "toast") };
  });
  expect(order.scrim, "the scrim is under the point").toBeGreaterThanOrEqual(0);
  expect(order.toast).toBeGreaterThanOrEqual(0);
  expect(order.toast, "the toast is ahead of the scrim").toBeLessThan(order.scrim);
});

test("[foundations.layout.elevation-nesting] [foundations.layout.stage-isolation] a previewed Surface at the toast tier stays under the GNB, because the preview stage isolates its content", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await openPlayground(page, "surface", "Surface");
  await page.getByRole("combobox", { name: "elevation", exact: true }).selectOption("toast");
  const sample = page.getByTestId("surface-example");
  await expect(sample).toHaveCSS("z-index", z("toast"));
  await expect(page.locator("[data-preview-background]")).toHaveCSS("isolation", "isolate");
  // Scroll the sample to the top of the window, where the sticky GNB is; the GNB is what a point there hits.
  const box = (await sample.boundingBox())!;
  await page.evaluate((y) => window.scrollBy(0, y), box.y + box.height / 2 - 20);
  const hit = await sample.evaluate((element) => {
    const { x, width } = element.getBoundingClientRect();
    return document.elementFromPoint(x + width / 2, 20)?.closest("header") !== null;
  });
  expect(hit, "the GNB is above the previewed Surface").toBe(true);
});

test("[foundations.layout.elevation-nesting] [foundations.layout.stage-isolation] a sticky rail that rides up under the GNB at the end of a page stays under it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 400 });
  // The sidebars are not here: they scroll inside themselves (tests/app/shell.spec.ts), so they never ride up.
  const rails = [{ path: "/playground/button", heading: "Button", anchor: () => page.getByText("Props", { exact: true }) }];
  for (const { path, heading, anchor } of rails) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const { overlap, underGnb } = await anchor().evaluate((element) => {
      let rail: HTMLElement | null = element as HTMLElement;
      while (rail && getComputedStyle(rail).position !== "sticky") rail = rail.parentElement;
      const gnb = document.querySelector("header")!.getBoundingClientRect();
      const { left, top } = rail!.getBoundingClientRect();
      const hit = document.elementFromPoint(left + 20, gnb.height / 2);
      return { overlap: top < gnb.bottom, underGnb: hit?.closest("header") != null };
    });
    expect(overlap, `${path}: the rail reaches the GNB's strip`).toBe(true);
    expect(underGnb, `${path}: the GNB owns its strip`).toBe(true);
  }
});
