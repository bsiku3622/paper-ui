import { expect, test } from "@playwright/test";

import { SHAPE_RECIPES, tokens } from "../../packages/paper-ui/src/tokens";
import { CONTROL } from "../../packages/paper-ui/src/tokens/control-recipes";
import { px, roleDp } from "../support/geometry";
import { openHarness } from "../support/harness";

const SIZES = ["xs", "sm", "md", "lg"] as const;
const size = (name: keyof typeof tokens.shape.icon.size) => px(roleDp(tokens.shape.icon.size[name]));

test.beforeEach(async ({ page }) => {
  await openHarness(page, "control");
});

test("[primitives.control.size] one size sets the height, the corner and the inset of every anatomy that has them", async ({ page }) => {
  for (const name of SIZES) {
    const height = px(roleDp(tokens.shape.control.height[name]));
    const corner = px(roleDp(tokens.shape.radius.control[name]));
    const box = (anatomy: string) => page.getByTestId(`control-${name}-${anatomy}`);
    await expect(box("label"), name).toHaveCSS("height", height);
    await expect(box("label"), name).toHaveCSS("padding-inline-start", px(roleDp(CONTROL.inset.button[name])));
    await expect(box("label"), name).toHaveCSS("border-top-left-radius", corner);
    await expect(box("input"), name).toHaveCSS("height", height);
    await expect(box("input"), name).toHaveCSS("padding-inline-start", px(roleDp(CONTROL.inset.input[name])));
    await expect(box("frame"), name).toHaveCSS("height", height);
    await expect(box("frame"), name).toHaveCSS("padding-inline-start", "0px");
    await expect(box("area"), name).toHaveCSS("padding-inline-start", px(roleDp(CONTROL.inset.input[name])));
    await expect(box("area"), name).toHaveCSS("padding-block-start", px(roleDp(CONTROL.area.paddingBlock[name])));
  }
});

test("[primitives.control.anatomy] an icon is a square the height of its size, and a label centres its content until told otherwise", async ({ page }) => {
  for (const name of SIZES) {
    const box = page.getByTestId(`control-${name}-icon`);
    const height = px(roleDp(tokens.shape.control.height[name]));
    await expect(box, name).toHaveCSS("height", height);
    await expect(box, name).toHaveCSS("width", height);
    await expect(box, name).toHaveCSS("padding-inline-start", "0px");
  }
  await expect(page.getByTestId("control-bare")).toHaveCSS("justify-content", "center");
  await expect(page.getByTestId("control-justified")).toHaveCSS("justify-content", "flex-start");
  await expect(page.getByTestId("control-pill")).toHaveCSS("border-top-left-radius", px(roleDp(tokens.shape.radius.pill)));
});

test("[primitives.control.anatomy] a mark, a track, a badge and a ring each read their own value of the one size", async ({ page }) => {
  for (const name of SIZES) {
    const box = (anatomy: string) => page.getByTestId(`control-${name}-${anatomy}`);
    const mark = px(roleDp(tokens.shape.selection.size[name]));
    await expect(box("mark"), name).toHaveCSS("width", mark);
    await expect(box("mark"), name).toHaveCSS("height", mark);
    await expect(box("track"), name).toHaveCSS("width", px(roleDp(SHAPE_RECIPES.switch.width[name])));
    await expect(box("track"), name).toHaveCSS("height", px(roleDp(SHAPE_RECIPES.switch.height[name])));
    await expect(box("badge"), name).toHaveCSS("height", px(roleDp(SHAPE_RECIPES.badge.height[name])));
    await expect(box("badge"), name).toHaveCSS("padding-inline-start", px(roleDp(SHAPE_RECIPES.badge.inset[name])));
    await expect(box("badge"), name).toHaveCSS("border-top-left-radius", px(roleDp(tokens.shape.radius.control[name])));
    const ring = px(roleDp(tokens.shape.control.icon[name]));
    await expect(box("spinner"), name).toHaveCSS("width", ring);
    await expect(box("spinner"), name).toHaveCSS("height", ring);
  }
});

test("[primitives.control.arrangement] gap, align and justify lay out the content apart from the size, on a Control, a Button and a Badge", async ({ page }) => {
  const gap = px(roleDp(tokens.layout.gap.xl));
  for (const id of ["control-arranged", "button-arranged", "badge-arranged"]) {
    const box = page.getByTestId(id);
    await expect(box, id).toHaveCSS("column-gap", gap);
    await expect(box, id).toHaveCSS("align-items", "flex-end");
    await expect(box, id).toHaveCSS("justify-content", "space-between");
  }
  // The size stays what it was.
  await expect(page.getByTestId("control-arranged")).toHaveCSS("height", px(roleDp(tokens.shape.control.height.md)));
  // Untold, each anatomy holds its own.
  const bare = page.getByTestId("control-bare");
  await expect(bare).toHaveCSS("column-gap", px(roleDp(tokens.shape.control.gap)));
  await expect(bare).toHaveCSS("align-items", "center");
  await expect(bare).toHaveCSS("justify-content", "center");
  const badge = page.getByTestId("badge-bare");
  await expect(badge).toHaveCSS("column-gap", px(roleDp(SHAPE_RECIPES.badge.gap)));
  await expect(badge).toHaveCSS("align-items", "center");
  await expect(badge).toHaveCSS("justify-content", "normal");
});

test("[primitives.control.arrangement] a Field takes the gap between what it lays in a row, and only the gap", async ({ page }) => {
  await expect(page.getByTestId("field-bare")).toHaveCSS("column-gap", px(roleDp(tokens.shape.control.gap)));
  const arranged = page.getByTestId("field-arranged");
  await expect(arranged).toHaveCSS("column-gap", px(roleDp(tokens.layout.gap.xl)));
  await expect(arranged).toHaveCSS("height", px(roleDp(tokens.shape.control.height.md)));
  const icon = (await page.getByTestId("field-arranged-icon").boundingBox())!;
  const input = (await page.getByLabel("field-arranged", { exact: true }).boundingBox())!;
  expect(input.x - (icon.x + icon.width)).toBe(roleDp(tokens.layout.gap.xl));
});

test("[primitives.control.paints-nothing] a bare Control draws no face and no line", async ({ page }) => {
  const bare = page.getByTestId("control-bare");
  await expect(bare).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(bare).toHaveCSS("border-top-width", "0px");
});

test("[primitives.icon.size-precedence] an Icon takes its own size over what its Control set, and that over body", async ({ page }) => {
  await expect(page.getByTestId("icon-alone")).toHaveCSS("width", size("body"));
  await expect(page.getByTestId("icon-follows")).toHaveCSS("width", px(roleDp(tokens.shape.control.icon.lg)));
  await expect(page.getByTestId("icon-explicit")).toHaveCSS("width", size("label"));
  await expect(page.getByTestId("icon-told")).toHaveCSS("width", size("label"));
  for (const name of SIZES) await expect(page.getByTestId(`field-icon-${name}`), name).toHaveCSS("height", px(roleDp(tokens.shape.control.icon[name])));
});

test("[primitives.control.parts] what an Atom draws inside its control reads the same size", async ({ page }) => {
  for (const name of SIZES) {
    const frame = page.getByTestId(`select-${name}`);
    const button = frame.getByRole("combobox");
    // The value stops at its end inset from the frame's edge; the frame's line takes its room out of the button's padding.
    const frameLine = await frame.evaluate((element) => parseFloat(getComputedStyle(element).borderInlineEndWidth));
    expect(await button.evaluate((element) => parseFloat(getComputedStyle(element).paddingInlineEnd)) + frameLine, name).toBe(roleDp(CONTROL.select.paddingEnd[name]));
    await expect(frame.locator("svg"), name).toHaveCSS("width", px(roleDp(tokens.shape.control.icon[name])));
    await expect(page.getByLabel(`field-${name}`, { exact: true }), name).toHaveCSS("line-height", px(roleDp(CONTROL.inputLine[name])));
    // One row of a Textarea is exactly a control tall.
    const area = (await page.getByTestId(`textarea-${name}`).boundingBox())!;
    expect(area.height, name).toBe(roleDp(tokens.shape.control.height[name]));
  }
});
