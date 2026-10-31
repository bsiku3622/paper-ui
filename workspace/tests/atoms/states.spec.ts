import { expect, test, type Locator } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { accentProfile, itemProfile } from "../../packages/paper-ui/src/tokens/color-recipes";
import type { Accent, Variant } from "../../packages/paper-ui/src/tokens";
import { openHarness } from "../support/harness";
import { tab } from "../support/keyboard";
import { expectStyle } from "../support/style";

// What a hoverable control lays over its own face: the computed gradient of the tint property.
const tint = (color: string) => ({ backgroundImage: `linear-gradient(${color}, ${color})` });
const hoverTint = (accent: Accent, variant: Variant) => {
  const { hover } = accentProfile(accent, variant);
  if (!("tint" in hover)) throw new Error(`${variant} answers a hover by its border`);
  return hover.tint;
};

const TINTED = [["solid", "primary", "solid"], ["soft", "primary", "soft"], ["ghost", "primary", "ghost"], ["error", "error", "solid"]] as const;

test.beforeEach(async ({ page }) => {
  await openHarness(page, "states");
});

test("[atoms.button.tint] a hover lays the profile's tint over the Button's own face and gives it back, and a hairline raises its border instead", async ({ page }) => {
  for (const [id, accent, variant] of TINTED) {
    const button = page.getByTestId(id);
    const face = accentProfile(accent, variant).face;
    await page.mouse.move(0, 0);
    await expectStyle(button, { backgroundColor: face, ...tint("transparent") });
    await button.hover();
    await expectStyle(button, { backgroundColor: face, ...tint(hoverTint(accent, variant)) });
    await page.mouse.move(0, 0);
    await expectStyle(button, { backgroundColor: face, ...tint("transparent") });
  }

  const hairline = page.getByTestId("hairline");
  const rest = accentProfile("primary", "hairline");
  if (!("border" in rest.hover)) throw new Error("a hairline rises by its border");
  await page.mouse.move(0, 0);
  await expectStyle(hairline, { borderTopColor: rest.border, ...tint("transparent") });
  await hairline.hover();
  await expectStyle(hairline, { borderTopColor: rest.hover.border, ...tint("transparent") });
});

test("[atoms.button.tint] a selected Button wears its selected face, and a hover over it adds a tint and no border", async ({ page }) => {
  for (const id of ["selected-ghost", "selected-hairline", "current"]) {
    const button = page.getByTestId(id);
    const variant = id === "selected-hairline" ? "hairline" : "ghost";
    const selected = accentProfile("primary", variant).selected!;
    await page.mouse.move(0, 0);
    await expectStyle(button, { backgroundColor: selected.face, color: selected.ink, borderTopColor: selected.border, ...tint("transparent") });
    await button.hover();
    await expectStyle(button, { backgroundColor: selected.face, color: selected.ink, borderTopColor: selected.border, ...tint(itemProfile.hoverTint) });
  }
});

test("[atoms.button.selected] announces its selection with aria-pressed and data-selected, and leaves a current item to aria-current", async ({ page }) => {
  for (const id of ["selected-ghost", "selected-hairline"]) {
    await expect(page.getByTestId(id)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId(id)).toHaveAttribute("data-selected", "true");
  }
  await expect(page.getByTestId("current")).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("current")).not.toHaveAttribute("aria-pressed", /.*/);
  await expect(page.getByTestId("ghost")).not.toHaveAttribute("aria-pressed", /.*/);
});

test("[atoms.button.press] a press sinks the Button by one stroke, by the pointer and by Enter alike", async ({ page }) => {
  const sunk = { transform: `translateY(${tokens.motion.role.press.offset})` };
  for (const id of ["solid", "ghost", "icon-button"]) {
    const button = page.getByTestId(id);
    await expectStyle(button, { transform: "none" });
    await button.hover();
    await page.mouse.down();
    await expect(button).toHaveAttribute("data-active", "true");
    await expectStyle(button, sunk);
    await page.mouse.up();
    await expectStyle(button, { transform: "none" });

    await button.focus();
    await page.keyboard.down("Enter");
    await expect(button).toHaveAttribute("data-active", "true");
    await expectStyle(button, sunk);
    await page.keyboard.up("Enter");
    await expect(button).not.toHaveAttribute("data-active", /.*/);
    await expectStyle(button, { transform: "none" });
  }
});

test("[atoms.button.disabled] every disabled or busy Button, link-styled or not, is dimmed, shows the not-allowed cursor and takes no tint", async ({ page }) => {
  for (const id of ["disabled", "disabled-hairline", "disabled-icon-button", "disabled-link-button", "loading"]) {
    const button = page.getByTestId(id);
    await expect(button).toHaveAttribute("data-disabled", "true");
    await expectStyle(button, { opacity: tokens.color.opacity.disabled, cursor: "not-allowed" });
    await button.hover({ force: true });
    await expectStyle(button, tint("transparent"));
  }
  await expect(page.getByTestId("disabled")).toBeDisabled();
  await expect(page.getByTestId("disabled-link-button")).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("disabled-link-button")).toHaveAttribute("tabindex", "-1");
});

test("[atoms.button.target] a disabled link-styled Button does not navigate, and an enabled one does", async ({ page }) => {
  const disabled = page.getByTestId("disabled-link-button");
  await disabled.click({ force: true });
  expect(new URL(page.url()).hash).toBe("");
  await disabled.click({ button: "middle", force: true });
  expect(await disabled.evaluate((node) => !node.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 })))).toBe(true);
  await page.getByTestId("link-button").click();
  expect(new URL(page.url()).hash).toBe("#target");
  expect(page.context().pages()).toHaveLength(1);
});

test("[atoms.button.loading] stays focusable and busy, and neither a key nor a click submits its form", async ({ page }) => {
  const loading = page.getByTestId("loading");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loading).toHaveAttribute("aria-disabled", "true");
  await expect(loading).toHaveJSProperty("disabled", false);
  await loading.focus();
  await expect(loading).toBeFocused();

  const submit = page.getByTestId("submit-loading");
  await expect(submit).toHaveJSProperty("disabled", false);
  await submit.focus();
  await expect(submit).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await submit.click({ force: true });
  await page.getByTestId("name").fill("Baek");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("form")).toHaveAttribute("data-submits", "0");
});

test("[atoms.link.underline] a Link underlines at rest, or only under the pointer when asked, in the link ink", async ({ page }) => {
  const link = page.getByTestId("link");
  const hover = page.getByTestId("link-hover");
  await page.mouse.move(0, 0);
  await expectStyle(link, { color: tokens.color.interaction.link, textDecorationLine: "underline" });
  await expectStyle(hover, { color: tokens.color.interaction.link, textDecorationLine: "none" });
  await hover.hover();
  await expectStyle(hover, { textDecorationLine: "underline" });
  await page.mouse.move(0, 0);
  await expectStyle(hover, { textDecorationLine: "none" });
  const blocked = page.getByTestId("link-hover-disabled");
  await blocked.hover();
  await expectStyle(blocked, { textDecorationLine: "none" });
  await page.mouse.move(0, 0);
});

test("[atoms.link.underline] a link in a documentation page is the Link Atom: underlined at rest, in the link ink, with the Link's corner", async ({ page }) => {
  await page.goto("/docs/atoms");
  const link = page.locator(".md a").first();
  await expect(link).toBeVisible();
  await expectStyle(link, { color: tokens.color.interaction.link, textDecorationLine: "underline", borderTopLeftRadius: tokens.shape.radius.control });
});

const FRAMES = ["field", "textarea", "select"] as const;

test("[atoms.field.frame] a neutral input rests on the base border and rises to the hover border under a pointer, and a status keeps its own border", async ({ page }) => {
  for (const id of FRAMES) {
    const frame = page.getByTestId(id);
    await page.mouse.move(0, 0);
    await expectStyle(frame, { borderTopColor: tokens.color.border.base });
    await frame.hover();
    await expectStyle(frame, { borderTopColor: tokens.color.border.hover });
    await page.mouse.move(0, 0);
    await expectStyle(frame, { borderTopColor: tokens.color.border.base });
  }
  for (const [id, accent] of [["field-error", "error"], ["textarea-error", "error"], ["select-error", "error"], ["field-warning", "warning"]] as const) {
    const frame = page.getByTestId(id);
    await expect(frame).toHaveAttribute("data-status", accent);
    await page.mouse.move(0, 0);
    await expectStyle(frame, { borderTopColor: tokens.color.accent[accent].ink });
    await frame.hover();
    await expectStyle(frame, { borderTopColor: tokens.color.accent[accent].ink });
  }
  await page.mouse.move(0, 0);
});

test("[atoms.field.frame] a disabled input is dimmed, shows the not-allowed cursor over its whole frame and native control, and does not rise under a pointer", async ({ page }) => {
  for (const id of ["field-disabled", "textarea-disabled", "select-disabled"]) {
    const frame = page.getByTestId(id);
    await expect(frame).toHaveAttribute("data-disabled", "true");
    await expectStyle(frame, { opacity: tokens.color.opacity.disabled, cursor: "not-allowed" });
    await frame.hover({ force: true });
    await expectStyle(frame, { borderTopColor: tokens.color.border.base });
  }
  await page.mouse.move(0, 0);
  for (const label of ["Field disabled", "Select disabled", "Textarea disabled"]) {
    const control = page.getByLabel(label, { exact: true });
    await expect(control).toBeDisabled();
    await expectStyle(control, { cursor: "not-allowed" });
  }
  await expectStyle(page.getByTestId("field"), { cursor: "text" });
  await expect(page.getByLabel("Field", { exact: true })).not.toHaveCSS("cursor", "not-allowed");
});

test("[atoms.field.frame] a Field action rests tertiary and answers a pointer with the primary ink, and the toggle of a disabled Field stays drawn and does nothing", async ({ page }) => {
  const clear = page.getByTestId("search").getByRole("button", { name: "Clear" });
  await page.mouse.move(0, 0);
  await expectStyle(clear, { color: tokens.color.ink.tertiary, cursor: "pointer" });
  await clear.hover();
  await expectStyle(clear, { color: tokens.color.ink.primary });
  await page.mouse.move(0, 0);

  const locked = page.getByTestId("locked").getByRole("button", { name: "Show password" });
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveAttribute("data-disabled", "true");
  await expectStyle(locked, { color: tokens.color.ink.tertiary, cursor: "not-allowed" });
  await locked.hover({ force: true });
  await expectStyle(locked, { color: tokens.color.ink.tertiary });
  await locked.click({ force: true });
  await expect(page.getByLabel("Locked", { exact: true })).toHaveAttribute("type", "password");
  // Tab passes over it: the disabled Field has nothing to stop at.
  await page.getByTestId("field-warning").locator("input").focus();
  for (let i = 0; i < 6; i++) {
    await tab(page);
    await expect(locked).not.toBeFocused();
  }
});

test("[atoms.field.actions] the password toggle flips the field once per press, by pointer and by key, and says so with aria-pressed and a name that does not change", async ({ page }) => {
  const input = page.getByLabel("Secret", { exact: true });
  const toggle = page.getByTestId("secret").getByRole("button", { name: "Show password" });
  await expect(input).toHaveAttribute("type", "password");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(input).toHaveAttribute("type", "text");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAttribute("data-selected", "true");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(input).toHaveAttribute("type", "password");
  await page.keyboard.press("Space");
  await expect(input).toHaveAttribute("type", "text");
  await expect(toggle).toHaveAccessibleName("Show password");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

test.describe("on a pointer that cannot hover", () => {
  test.use({ hasTouch: true, isMobile: true });
  test.skip(({ browserName }) => browserName !== "chromium", "only Chromium emulates a touch-only device");

  test("[atoms.button.tint] a tap leaves no tint and no underline behind", async ({ page }) => {
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    for (const id of ["solid", "ghost", "icon-button"]) {
      await page.getByTestId(id).tap();
      await expectStyle(page.getByTestId(id), tint("transparent"));
    }
    await page.getByTestId("hairline").tap();
    await expectStyle(page.getByTestId("hairline"), { borderTopColor: accentProfile("primary", "hairline").border });
    await page.getByTestId("link-hover").tap();
    await expectStyle(page.getByTestId("link-hover"), { textDecorationLine: "none" });
  });

  test("[atoms.field.frame] a tap raises no input border and leaves a Field action its resting ink", async ({ page }) => {
    // What a hover would start is a transition from the resting value, so these wait it out before reading.
    const settled = (target: Locator) => target.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
    const toggle = page.getByTestId("secret").getByRole("button", { name: "Show password" });
    await toggle.tap();
    await settled(toggle);
    await expectStyle(toggle, { color: tokens.color.ink.tertiary });
    for (const id of FRAMES) {
      const frame = page.getByTestId(id);
      await frame.tap();
      await settled(frame);
      await expectStyle(frame, { borderTopColor: tokens.color.border.base });
    }
  });
});
