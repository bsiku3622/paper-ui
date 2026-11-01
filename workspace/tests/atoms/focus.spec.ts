import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { openHarness } from "../support/harness";
import { tab } from "../support/keyboard";
import { expectStyle } from "../support/style";

// Each ring owner of the Button family, with the corner its ring follows.
const OWNERS = [
  ["solid", tokens.shape.radius.control],
  ["hairline", tokens.shape.radius.control],
  ["link-button", tokens.shape.radius.control],
  ["pill", tokens.shape.radius.full],
  ["icon-button", tokens.shape.radius.control],
  ["pill-icon-button", tokens.shape.radius.full],
  ["link", tokens.shape.radius.control],
] as const;

const ringOf = {
  outlineStyle: "solid",
  outlineWidth: tokens.shape.focus.width,
  outlineOffset: tokens.shape.focus.offset,
  outlineColor: tokens.color.interaction.focus,
};

// Put focus on the element before the target in the Tab order, then press Tab, so the focus the target holds is the keyboard's.
const reachByKeyboard = async (page: Page, target: Locator) => {
  await target.evaluate((element) => {
    const tabbable = [...document.querySelectorAll<HTMLElement>("button, a[href], input, [tabindex]")].filter((candidate) => !candidate.hasAttribute("disabled") && candidate.tabIndex >= 0);
    tabbable[tabbable.indexOf(element as HTMLElement) - 1]?.focus();
  });
  await tab(page);
  await expect(target).toBeFocused();
};

test.beforeEach(async ({ page }) => {
  await openHarness(page, "states");
});

for (const [id, corner] of OWNERS) {
  test(`[atoms.focus.ring] [atoms.focus.input-modality] ${id} shows its ring for the keyboard and not for the pointer, on its own corner`, async ({ page }) => {
    const target = page.getByTestId(id);
    await target.click();
    await target.focus();
    await expect(target).toBeFocused();
    await expect(target).not.toHaveAttribute("data-focus-visible", /.*/);
    await expectStyle(target, { outlineStyle: "none" });

    await reachByKeyboard(page, target);
    await expect(target).toHaveAttribute("data-focus-visible", "true");
    await expectStyle(target, { ...ringOf, borderTopLeftRadius: corner });
  });
}

test("[atoms.focus.ring] [atoms.states.ring-channel] [atoms.states.atom-table] a Button that is busy keeps its ring when the keyboard reaches it", async ({ page }) => {
  const loading = page.getByTestId("loading");
  await loading.click({ force: true });
  await reachByKeyboard(page, loading);
  await expect(loading).toHaveAttribute("data-focus-visible", "true");
  await expectStyle(loading, ringOf);
});

test("[atoms.states.ring-channel] the ring stands outside the state chain: a selected Button draws the same ring as a resting one when the keyboard reaches it", async ({ page }) => {
  const selected = page.getByTestId("selected-ghost");
  await reachByKeyboard(page, selected);
  await expect(selected).toHaveAttribute("data-focus-visible", "true");
  await expectStyle(selected, ringOf);
});

// The input family: Field and Select draw the ring on their wrapper, Textarea on itself; the control the keyboard lands on is the native one.
const INPUTS = [
  ["Field", "field", tokens.shape.radius.control],
  ["Textarea", "textarea", tokens.shape.radius.control],
  ["Select", "select", tokens.shape.radius.control],
] as const;

for (const [label, id, corner] of INPUTS) {
  test(`[atoms.focus.ring] [atoms.focus.input-modality] [atoms.states.pointer-focus] [atoms.states.hover-table] ${label} shows no ring for a click, and Tab away then Shift+Tab back draws the focus ring on its frame`, async ({ page }) => {
    const control = page.getByLabel(label, { exact: true });
    const frame = page.getByTestId(id);
    await control.click();
    await expect(control).toBeFocused();
    await expect(frame).not.toHaveAttribute("data-focus-visible", /.*/);
    await expectStyle(frame, { outlineStyle: "none" });
    await expectStyle(control, { outlineStyle: "none" });
    // A key pressed on a Select is the keyboard's, and closes the list it opened.
    if (label === "Select") await page.keyboard.press("Escape");

    await tab(page);
    await expect(control).not.toBeFocused();
    await tab(page, { shift: true });
    await expect(control).toBeFocused();
    await expect(frame).toHaveAttribute("data-focus-visible", "true");
    await expectStyle(frame, { ...ringOf, borderTopLeftRadius: corner });
    // The ring belongs to the frame; the native control inside a wrapper draws none of its own.
    if (label !== "Textarea") await expectStyle(control, { outlineStyle: "none" });
  });
}

test("[atoms.focus.ring] [atoms.states.pointer-focus] typing in a Field or a Textarea after a click draws no ring, and a click on the wrapper's padding puts the caret in the input without one", async ({ page }) => {
  for (const [label, id] of [["Field", "field"], ["Textarea", "textarea"]] as const) {
    const control = page.getByLabel(label, { exact: true });
    await control.click();
    await page.keyboard.type("hello");
    await expect(page.getByTestId(id)).not.toHaveAttribute("data-focus-visible", /.*/);
    await expectStyle(page.getByTestId(id), { outlineStyle: "none" });
  }
  const field = page.getByTestId("field");
  await field.click({ position: { x: 2, y: 2 } });
  await expect(page.getByLabel("Field", { exact: true })).toBeFocused();
  await expect(field).not.toHaveAttribute("data-focus-visible", /.*/);
});

test("[atoms.focus.ring] [atoms.states.pointer-focus] a key that is not typing counts as the keyboard after a click: Escape in a clicked text input and a key on a clicked Select draw the frame ring", async ({ page }) => {
  for (const [label, id] of [["Field", "field"], ["Textarea", "textarea"], ["Select", "select"]] as const) {
    const control = page.getByLabel(label, { exact: true });
    const frame = page.getByTestId(id);
    await control.click();
    await expect(control).toBeFocused();
    await expect(frame).not.toHaveAttribute("data-focus-visible", /.*/);
    await page.keyboard.press("Escape");
    await expect(frame).toHaveAttribute("data-focus-visible", "true");
    await expectStyle(frame, ringOf);
  }
});

test("[atoms.focus.ring] keyboard focus returning to a Field's input from its own actions draws the frame ring again", async ({ page }) => {
  const input = page.getByLabel("Secret", { exact: true });
  const frame = page.getByTestId("secret");
  const clear = frame.getByRole("button", { name: "Clear" });
  const reveal = frame.getByRole("button", { name: "Show password" });
  await input.click();
  await expect(frame).not.toHaveAttribute("data-focus-visible", /.*/);

  await tab(page);
  await expect(clear).toBeFocused();
  await expect(clear).toHaveAttribute("data-focus-visible", "true");
  await expectStyle(clear, { ...ringOf, borderTopLeftRadius: tokens.shape.radius.control });
  await expect(frame).not.toHaveAttribute("data-focus-visible", /.*/);
  await tab(page);
  await expect(reveal).toBeFocused();
  await expect(reveal).toHaveAttribute("data-focus-visible", "true");
  await expect(frame).not.toHaveAttribute("data-focus-visible", /.*/);

  await tab(page, { shift: true });
  await tab(page, { shift: true });
  await expect(input).toBeFocused();
  await expect(frame).toHaveAttribute("data-focus-visible", "true");
  await expectStyle(frame, ringOf);
});

test("[atoms.field.actions] clear, pressed from the keyboard, empties the Field and hands the focus and the ring back to the input; pressed by a pointer, the focus comes back without a ring", async ({ page }) => {
  const input = page.getByLabel("Search", { exact: true });
  const frame = page.getByTestId("search");
  const clear = frame.getByRole("button", { name: "Clear" });
  await expect(clear).toHaveCount(1);

  await input.focus();
  await tab(page);
  await expect(clear).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(frame).toHaveAttribute("data-focus-visible", "true");
  await expect(frame.getByRole("button")).toHaveCount(0);

  await input.fill("again");
  await clear.click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(frame).not.toHaveAttribute("data-focus-visible", /.*/);
});

test("[atoms.field.actions] a search Field exposes exactly one clear control, Field's own", async ({ page }) => {
  const buttons = page.getByTestId("search").getByRole("button");
  await expect(buttons).toHaveCount(1);
  await expect(buttons).toHaveAccessibleName("Clear");
});

test("[atoms.field.actions] [atoms.contract.axes] the browser's cancel button and search decoration are gone from a search Field", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "the browser's own controls live in a user-agent shadow tree that only Chromium's DevTools protocol shows");
  await page.evaluate(() => {
    const bare = document.createElement("input");
    bare.type = "search";
    bare.value = "bare";
    bare.id = "bare-search";
    document.body.append(bare);
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });
  type Node = { nodeId: number; nodeName: string; attributes?: string[]; children?: Node[]; shadowRoots?: Node[] };
  const attribute = (node: Node, name: string) => node.attributes?.[(node.attributes?.indexOf(name) ?? -1) + 1];
  // The native search controls of the input that matches, found by walking its user-agent shadow tree.
  const nativeOf = (isOwner: (input: Node) => boolean) => {
    const found: Array<{ pseudo: string; nodeId: number }> = [];
    const walk = (node: Node, inside: boolean) => {
      const pseudo = attribute(node, "pseudo");
      if (inside && pseudo) found.push({ pseudo, nodeId: node.nodeId });
      for (const child of node.children ?? []) walk(child, inside);
      for (const shadow of node.shadowRoots ?? []) walk(shadow, inside || (node.nodeName === "INPUT" && isOwner(node)));
    };
    walk(root as Node, false);
    return found.filter(({ pseudo }) => /search-(cancel-button|decoration)/.test(pseudo));
  };
  const displayOf = async (nodeId: number) => (await cdp.send("CSS.getComputedStyleForNode", { nodeId })).computedStyle.find((property) => property.name === "display")?.value;

  const bare = nativeOf((input) => attribute(input, "id") === "bare-search");
  expect(bare.map(({ pseudo }) => pseudo), "a bare search input draws the browser's cancel button").toContain("-webkit-search-cancel-button");
  for (const { nodeId } of bare.filter(({ pseudo }) => pseudo.endsWith("cancel-button"))) expect(await displayOf(nodeId)).not.toBe("none");
  const ours = nativeOf((input) => attribute(input, "aria-label") === "Search");
  expect(ours.length).toBeGreaterThan(0);
  for (const { pseudo, nodeId } of ours) expect(await displayOf(nodeId), pseudo).toBe("none");
});

// The selection marks are their own ring owners: the input draws the ring on its own corner.
test.describe("the selection marks", () => {
  test.beforeEach(async ({ page }) => {
    await openHarness(page, "marks");
  });

  for (const [id, corner] of [["checkbox-md", tokens.shape.radius.selection], ["radio-md", tokens.shape.radius.full], ["switch-md", tokens.shape.radius.full]] as const) {
    test(`[atoms.focus.ring] [atoms.focus.input-modality] ${id} shows its ring for the keyboard and not for the pointer, on its own corner`, async ({ page }) => {
      const target = page.getByTestId(id);
      await target.click();
      await target.focus();
      await expect(target).toBeFocused();
      await expect(target).not.toHaveAttribute("data-focus-visible", /.*/);
      await expectStyle(target, { outlineStyle: "none" });

      await reachByKeyboard(page, target);
      await expect(target).toHaveAttribute("data-focus-visible", "true");
      await expectStyle(target, { ...ringOf, borderTopLeftRadius: corner });
    });
  }
});
