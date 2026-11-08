import { expect, test, type Locator } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { roleDp } from "../support/geometry";
import { openHarness } from "../support/harness";
import { expectStyle } from "../support/style";

const shadow = (target: Locator) => target.evaluate((element) => getComputedStyle(element).boxShadow);
const CONTROLS = ["field", "select", "textarea"] as const;
const MARKS = ["checkbox", "radio"] as const;

test.beforeEach(async ({ page }) => {
  await openHarness(page, "ground");
});

test.describe("the face of a frame and of an off mark", () => {
  const edge = (target: Locator) => target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: style.borderTopWidth, color: style.borderTopColor };
  });

  for (const at of ["page", "canvas", "sunken", "raised", "nested"]) {
    test(`[atoms.input.ground] stands the same on ${at}: the frame and the mark on their own white faces in the one grey line, with no shadow`, async ({ page }) => {
      for (const control of CONTROLS) {
        const target = page.getByTestId(`${control}-${at}`);
        await expectStyle(target, { backgroundColor: tokens.color.control.field, borderTopColor: tokens.color.border.base });
        expect((await edge(target)).width, control).toBe("1px");
        expect(await shadow(target), control).toBe("none");
      }
      for (const mark of MARKS) {
        const target = page.getByTestId(`${mark}-${at}`);
        await expectStyle(target, { backgroundColor: tokens.color.control.mark, borderTopColor: tokens.color.border.base });
        expect((await edge(target)).width, mark).toBe("1px");
        expect(await shadow(target), mark).toBe("none");
      }
    });
  }

  test("[atoms.input.face] takes a chosen face, its line or none, and a shadow only when asked", async ({ page }) => {
    await expectStyle(page.getByTestId("field-hairline"), { backgroundColor: tokens.color.control.field, borderColor: tokens.color.border.base });
    expect(await shadow(page.getByTestId("field-hairline"))).toBe("none");
    await expectStyle(page.getByTestId("field-chosen"), { backgroundColor: tokens.color.bg.sunken });
    expect(await shadow(page.getByTestId("field-chosen"))).toBe("none");
    expect(await shadow(page.getByTestId("field-no-shadow"))).toBe("none");
  });
});

// How wide a control's line is, and where what it holds starts, from its outer edge.
const room = (target: Locator) => target.evaluate((frame) => {
  const value = frame.matches("input, select, textarea, button") ? frame : (frame.querySelector("input, select, textarea") ?? frame);
  const own = getComputedStyle(value);
  const left = frame.getBoundingClientRect().left;
  const text = [...value.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim());
  const range = document.createRange();
  if (text) range.selectNodeContents(text);
  const start = text ? range.getBoundingClientRect().left - left : value.getBoundingClientRect().left + parseFloat(own.paddingLeft) + (value === frame ? parseFloat(own.borderLeftWidth) : 0) - left;
  return { line: parseFloat(getComputedStyle(frame).borderLeftWidth), start };
});

test.describe("the room a control keeps for its line", () => {
  test("[foundations.shape.control-line-room] keeps none for a line it does not draw, and gives the room it takes back out of the inset", async ({ page }) => {
    // A frame and a button that draw no line keep no room for one, so their face reaches the edge.
    for (const id of ["field-ghost", "button-solid"]) expect((await room(page.getByTestId(id))).line, id).toBe(0);
    // A line takes a pixel, the default frame's, an error's, an off mark's, and what the control holds stays where it stood.
    const ghost = await room(page.getByTestId("field-ghost"));
    for (const id of ["field-page", "field-hairline", "field-error"]) {
      const lined = await room(page.getByTestId(id));
      expect(lined.line, id).toBe(1);
      expect(lined.start, id).toBeCloseTo(ghost.start, 1);
    }
    for (const id of [...MARKS.map((mark) => `${mark}-raised`), "checkbox-error"]) expect((await room(page.getByTestId(id))).line, id).toBe(1);
    const [solid, hairline] = [await room(page.getByTestId("button-solid")), await room(page.getByTestId("button-hairline"))];
    expect(hairline.line).toBe(1);
    expect(hairline.start).toBeCloseTo(solid.start, 1);
  });
});

test.describe("SegmentControl", () => {
  const thumbOver = async (root: Locator, item: Locator) => {
    const thumb = root.locator("span[aria-hidden=true]");
    const [a, b] = [await thumb.boundingBox(), await item.boundingBox()];
    expect(Math.abs(a!.x - b!.x), "left").toBeLessThan(1);
    expect(Math.abs(a!.width - b!.width), "width").toBeLessThan(1);
  };

  test("[atoms.segment.radiogroup] lays its chip over the chosen item, whatever its width, and follows the choice and the keys", async ({ page }) => {
    const root = page.getByTestId("segment");
    const long = root.getByRole("radio", { name: "훨씬 긴 이름의 칸" });
    const short = root.getByRole("radio", { name: "하나" });
    await thumbOver(root, long);
    // A choice not chosen rests in the secondary ink; the chosen one is primary.
    await page.mouse.move(0, 0);
    await expectStyle(short, { color: tokens.color.ink.secondary });
    await expectStyle(long, { color: tokens.color.ink.primary });
    await short.click();
    await expect(short).toHaveAttribute("aria-checked", "true");
    await expect(async () => thumbOver(root, short)).toPass();
    await page.keyboard.press("ArrowRight");
    await expect(long).toHaveAttribute("aria-checked", "true");
    await expect(long).toBeFocused();
    await expect(async () => thumbOver(root, long)).toPass();
  });

  test("[atoms.segment.outline] stands in an input's frame, splits it with the same line, and gives the chosen one a face and a check", async ({ page }) => {
    const root = page.getByTestId("segment-outline");
    const field = page.getByTestId("field-beside");
    // The frame is the input's: its face, its one line and its corner, at the height of a Field of the same size. No chip slides.
    await expectStyle(root, { backgroundColor: tokens.color.control.field, borderTopColor: tokens.color.border.base });
    expect(await root.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe("1px");
    await expect(root.locator(":scope > span[aria-hidden=true]")).toHaveCount(0);
    const [frame, beside] = [await root.boundingBox(), await field.boundingBox()];
    expect(Math.abs(frame!.height - beside!.height)).toBeLessThan(0.5);
    expect(await root.evaluate((element) => getComputedStyle(element).borderTopLeftRadius)).toBe(await field.evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
    const choice = (name: string) => root.getByRole("radio", { name, exact: true });
    const [one, two, three] = [choice("가"), choice("나다라마"), choice("바")];
    // The choices after the first draw the line on their start side; the first leans on the frame's.
    expect(await one.evaluate((element) => getComputedStyle(element).borderInlineStartWidth)).toBe("0px");
    await expectStyle(two, { borderLeftColor: tokens.color.border.base });
    expect(await two.evaluate((element) => getComputedStyle(element).borderLeftWidth)).toBe("1px");
    // The chosen one has the chosen face and the check before its words, which leaves its name alone; the others have neither.
    const check = (item: Locator) => item.locator("svg");
    await expectStyle(two, { backgroundColor: tokens.color.control.chosen, color: tokens.color.ink.primary });
    await expect(check(two)).toBeVisible();
    await expect(check(two)).toHaveAttribute("aria-hidden", "true");
    await expect(check(one)).toBeHidden();
    expect(await one.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    // The face fills the frame inside its line, so the chosen face reaches it.
    const [inner, face] = [await root.evaluate((element) => element.clientHeight), await two.boundingBox()];
    expect(Math.abs(face!.height - inner)).toBeLessThan(0.5);
    // Choosing moves the face and the check.
    await three.click();
    await expect(three).toHaveAttribute("aria-checked", "true");
    await expect(check(three)).toBeVisible();
    await expect(check(two)).toBeHidden();
  });

  test("[atoms.segment.radiogroup] gives no choice of a shared-out row less than its words and its check, and shares what is left equally", async ({ page }) => {
    const root = page.getByTestId("segment-full-outline");
    const items = root.getByRole("radio");
    // Nothing spills over its neighbour: every choice holds what it shows.
    expect(await items.evaluateAll((elements) => elements.filter((element) => element.scrollWidth > element.clientWidth).length)).toBe(0);
    const widths = await items.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
    expect(widths[2]).toBeGreaterThan(widths[1]! + 1);
    // The second and the fourth both stand behind a dividing line; the first has none, so it is one line narrower.
    expect(Math.abs(widths[3]! - widths[1]!)).toBeLessThan(0.5);
    expect(Math.abs(widths[1]! - widths[0]! - roleDp(tokens.shape.stroke.border))).toBeLessThan(0.5);
    // The row still takes all it is given and no more.
    const [inner, row] = await root.evaluate((element) => [element.clientWidth, element.scrollWidth]);
    expect(row).toBeLessThanOrEqual(inner! + 0.5);
  });

  test("[atoms.segment.radiogroup] shares the row out equally when it is given all the width", async ({ page }) => {
    const root = page.getByTestId("segment-full");
    const [one, two] = [await root.getByRole("radio", { name: "가" }).boundingBox(), await root.getByRole("radio", { name: "나다라마" }).boundingBox()];
    expect(Math.abs(one!.width - two!.width)).toBeLessThan(1);
    await thumbOver(root, root.getByRole("radio", { name: "나다라마" }));
  });
});

test.describe("Slider", () => {
  test("[atoms.slider.native] moves with the keys, and the fill goes with it", async ({ page }) => {
    const slider = page.getByTestId("slider");
    const image = () => slider.evaluate((element) => getComputedStyle(element).backgroundImage);
    const before = await image();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("26");
    expect(await image()).not.toBe(before);
  });

  test("[atoms.slider.native] says an error with a ring in the error ink", async ({ page }) => {
    const ring = await page.getByTestId("slider-error").evaluate((element) => getComputedStyle(element).boxShadow);
    expect(ring).toContain("inset");
  });

  test("[atoms.slider.native] reaches the minimum target with room its groove does not paint into", async ({ page }) => {
    const box = await page.getByTestId("slider").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(24);
  });
});
