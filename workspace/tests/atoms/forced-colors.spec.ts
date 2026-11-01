import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { strokeRing } from "../../packages/paper-ui/src/tokens/shape-recipes";
import { px } from "../support/geometry";
import { openHarness } from "../support/harness";
import { tab } from "../support/keyboard";
import { expectStyle } from "../support/style";

// The forced-colours blocks run in the chromium-forced-colors project, where the OS owns the palette, so every expected colour is a
// CSS system colour resolved by the browser the way the page's own rules resolve it. The increased-contrast block runs once, in chromium.

type Fixtures = { contextOptions: { forcedColors?: string | null } };
const isForced = ({ contextOptions }: Fixtures) => contextOptions.forcedColors === "active";

// The colour a system colour is, as the page computes it.
const system = (page: Page, name: string) =>
  page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = name;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return resolved;
  }, name);

const systems = async <Name extends string>(page: Page, ...names: Name[]) =>
  Object.fromEntries(await Promise.all(names.map(async (name) => [name, await system(page, name)]))) as Record<Name, string>;

type Painted = { backgroundColor: string; borderTopColor: string; borderBottomColor: string; borderRightColor: string; boxShadow: string; color: string };
// The computed colours of an element, or of one of its pseudo-elements.
const painted = (target: Locator, pseudo?: "::after"): Promise<Painted> =>
  target.evaluate((element, pseudo) => {
    const style = getComputedStyle(element, pseudo);
    return {
      backgroundColor: style.backgroundColor,
      borderTopColor: style.borderTopColor,
      borderBottomColor: style.borderBottomColor,
      borderRightColor: style.borderRightColor,
      boxShadow: style.boxShadow,
      color: style.color,
    };
  }, pseudo);

test.describe("under forced colours", () => {
  test.skip(({ contextOptions }) => !isForced({ contextOptions }), "forced colours are emulated only by chromium-forced-colors");

  test("the page is under forced colours", async ({ page }) => {
    await openHarness(page, "marks");
    expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  });
});

test.describe("the selection marks", () => {
  test.skip(({ contextOptions }) => !isForced({ contextOptions }), "forced colours are emulated only by chromium-forced-colors");

  test.beforeEach(async ({ page }) => {
    await openHarness(page, "marks");
  });

  test("[atoms.mark.forced-colors] [foundations.color.forced-colors] an off and an on Switch differ in their track: ButtonFace in a ButtonText ring, and Highlight with a HighlightText thumb", async ({ page }) => {
    const { ButtonFace: buttonFace, ButtonText: buttonText, Highlight: highlight, HighlightText: highlightText } = await systems(page, "ButtonFace", "ButtonText", "Highlight", "HighlightText");
    const off = await painted(page.getByTestId("switch-md"));
    const on = await painted(page.getByTestId("switch-on"));
    expect(off.backgroundColor).not.toBe(on.backgroundColor);
    expect(off.backgroundColor).toBe(buttonFace);
    expect(off.boxShadow).toContain(buttonText);
    expect(on.backgroundColor).toBe(highlight);
    expect((await painted(page.getByTestId("switch-md"), "::after")).backgroundColor).toBe(buttonText);
    expect((await painted(page.getByTestId("switch-md"), "::after")).boxShadow).toBe("none");
    expect((await painted(page.getByTestId("switch-on"), "::after")).backgroundColor).toBe(highlightText);
  });

  test("[atoms.mark.forced-colors] a Checkbox is Canvas in a ButtonText ring, and Highlight with a HighlightText check or dash once checked or mixed", async ({ page }) => {
    const { Canvas: canvas, ButtonText: buttonText, Highlight: highlight, HighlightText: highlightText } = await systems(page, "Canvas", "ButtonText", "Highlight", "HighlightText");
    const off = await painted(page.getByTestId("checkbox-md"));
    expect([off.backgroundColor, off.borderTopColor]).toEqual([canvas, buttonText]);
    const on = await painted(page.getByTestId("checkbox-on"));
    expect([on.backgroundColor, on.borderTopColor]).toEqual([highlight, highlight]);
    expect((await painted(page.getByTestId("checkbox-on"), "::after")).borderBottomColor).toBe(highlightText);
    const mixed = await painted(page.getByTestId("checkbox-mixed"));
    expect([mixed.backgroundColor, mixed.borderTopColor]).toEqual([highlight, highlight]);
    // The dash is drawn on the Highlight face, so it must not be the face's own colour.
    const dash = await painted(page.getByTestId("checkbox-mixed"), "::after");
    expect(dash.backgroundColor).toBe(highlightText);
    expect(dash.backgroundColor).not.toBe(mixed.backgroundColor);
  });

  test("[atoms.mark.forced-colors] a Radio is Canvas in a ButtonText ring, and Highlight with a Highlight dot once checked", async ({ page }) => {
    const { Canvas: canvas, ButtonText: buttonText, Highlight: highlight } = await systems(page, "Canvas", "ButtonText", "Highlight");
    const off = await painted(page.getByTestId("radio-md"));
    expect([off.backgroundColor, off.borderTopColor]).toEqual([canvas, buttonText]);
    const on = await painted(page.getByTestId("radio-on"));
    expect(on.borderTopColor).toBe(highlight);
    const dot = await painted(page.getByTestId("radio-on"), "::after");
    expect(dot.backgroundColor).toBe(highlight);
    expect(dot.backgroundColor).not.toBe(canvas);
  });

  test("[atoms.mark.forced-colors] [foundations.color.forced-colors] a disabled mark is GrayText, checked or not", async ({ page }) => {
    const gray = await system(page, "GrayText");
    for (const id of ["checkbox-disabled", "checkbox-on-disabled", "radio-disabled", "radio-on-disabled", "radio-error-disabled"]) expect((await painted(page.getByTestId(id))).borderTopColor, id).toBe(gray);
    expect((await painted(page.getByTestId("checkbox-on-disabled"))).backgroundColor).toBe(gray);
    expect((await painted(page.getByTestId("radio-on-disabled"), "::after")).backgroundColor).toBe(gray);
    expect((await painted(page.getByTestId("switch-disabled"))).boxShadow).toContain(gray);
    expect((await painted(page.getByTestId("switch-error-disabled"))).boxShadow).toContain(gray);
    expect((await painted(page.getByTestId("switch-on-disabled"))).backgroundColor).toBe(gray);
  });

  test("[atoms.marker.forced-colors] a Marker is the OS's Mark pair, with no image over it", async ({ page }) => {
    const { Mark: mark, MarkText: markText } = await systems(page, "Mark", "MarkText");
    const painted_ = await painted(page.getByTestId("marker"));
    expect(painted_.backgroundColor).toBe(mark);
    expect(painted_.color).toBe(markText);
    await expect(page.getByTestId("marker")).toHaveCSS("background-image", "none");
  });

  test("[atoms.mark.forced-colors] an error mark keeps the system ring, since the colour is not the author's to choose", async ({ page }) => {
    const buttonText = await system(page, "ButtonText");
    expect((await painted(page.getByTestId("checkbox-error"))).borderTopColor).toBe(buttonText);
    expect((await painted(page.getByTestId("radio-error"))).borderTopColor).toBe(buttonText);
    expect((await painted(page.getByTestId("switch-error"))).boxShadow).toContain(buttonText);
  });

  test("[atoms.mark.forced-colors] a Spinner's arc and its ring are two colours, and a Divider is a visible solid border, one stroke wide", async ({ page }) => {
    const { CanvasText: canvasText, GrayText: grayText, Canvas: canvas } = await systems(page, "CanvasText", "GrayText", "Canvas");
    const spinner = await painted(page.getByTestId("spinner"));
    expect(spinner.borderTopColor).not.toBe(spinner.borderRightColor);
    expect([spinner.borderTopColor, spinner.borderRightColor]).toEqual([canvasText, grayText]);
    const rule = await page.getByTestId("divider").evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: style.borderTopWidth, style: style.borderTopStyle, color: style.borderTopColor };
    });
    expect(rule).toMatchObject({ width: px(SHAPE_SOURCE.stroke.border), style: "solid" });
    expect(rule.color).not.toBe(canvas);
    expect(rule.color).not.toBe("rgba(0, 0, 0, 0)");
  });
});

test.describe("the Button family", () => {
  test.skip(({ contextOptions }) => !isForced({ contextOptions }), "forced colours are emulated only by chromium-forced-colors");

  test.beforeEach(async ({ page }) => {
    await openHarness(page, "states");
  });

  test("[atoms.button.forced-colors] [atoms.states.atom-table] [foundations.color.forced-colors] a selected Button is Highlight, a hovered one has a Highlight border, a disabled one is GrayText and a ring is Highlight", async ({ page }) => {
    const { Highlight: highlight, HighlightText: highlightText, GrayText: grayText } = await systems(page, "Highlight", "HighlightText", "GrayText");
    const selected = await painted(page.getByTestId("selected-ghost"));
    expect([selected.backgroundColor, selected.color]).toEqual([highlight, highlightText]);
    await page.getByTestId("hairline").hover();
    await expectStyle(page.getByTestId("hairline"), { borderTopColor: "Highlight" });
    await page.mouse.move(0, 0);
    expect((await painted(page.getByTestId("disabled"))).color).toBe(grayText);
    expect((await painted(page.getByTestId("disabled-icon-button"))).color).toBe(grayText);

    const solid = page.getByTestId("solid");
    await page.getByTestId("before").focus();
    await tab(page);
    await expect(solid).toBeFocused();
    await expect(solid).toHaveAttribute("data-focus-visible", "true");
    await expectStyle(solid, { outlineColor: "Highlight", outlineStyle: "solid" });
  });
});

test.describe("the input frames", () => {
  test.skip(({ contextOptions }) => !isForced({ contextOptions }), "forced colours are emulated only by chromium-forced-colors");

  for (const id of ["field", "textarea", "select"]) {
    test(`[atoms.field.forced-colors] the ${id} frame's border is CanvasText at rest and Highlight under a pointer`, async ({ page }) => {
      await openHarness(page, "states");
      const frame = page.getByTestId(id);
      await expectStyle(frame, { borderTopColor: "CanvasText" });
      await frame.hover();
      await expectStyle(frame, { borderTopColor: "Highlight" });
    });
  }
});

test.describe("the display Atoms", () => {
  test.skip(({ contextOptions }) => !isForced({ contextOptions }), "forced colours are emulated only by chromium-forced-colors");

  test("[atoms.label.forced-colors] a Label's text is the OS's CanvasText", async ({ page }) => {
    await openHarness(page, "marks");
    await expectStyle(page.getByTestId("label"), { color: "CanvasText" });
  });

  test("[atoms.link.forced-colors] a Link is the OS's LinkText", async ({ page }) => {
    await openHarness(page, "states");
    await expectStyle(page.getByTestId("link"), { color: "LinkText" });
  });

  for (const id of ["badge", "badge-ghost"]) {
    test(`[atoms.badge.forced-colors] ${id} stays a visible solid border, one stroke wide`, async ({ page }) => {
      await openHarness(page, "marks");
      const canvas = await system(page, "Canvas");
      const line = await page.getByTestId(id).evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: style.borderTopWidth, style: style.borderTopStyle, color: style.borderTopColor };
      });
      expect(line).toMatchObject({ width: px(SHAPE_SOURCE.stroke.border), style: "solid" });
      expect(line.color).not.toBe(canvas);
      expect(line.color).not.toBe("rgba(0, 0, 0, 0)");
    });
  }
});

// Increased contrast is a different media query from forced colours: the page here is not under forced colours, only asking for more contrast.
test.describe("under increased contrast", () => {
  test.skip(({ browserName, contextOptions }) => browserName !== "chromium" || isForced({ contextOptions }), "chromium emulates the preference, and the forced-colours project has no use for it");

  const luminance = (rgb: string) => {
    const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map((channel) => Number(channel) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
    return r * 0.2126 + g * 0.7152 + b * 0.0722;
  };
  const ratio = (a: string, b: string) => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (high + 0.05) / (low + 0.05);
  };
  const colourOf = (page: Page, reference: string) =>
    page.evaluate((reference) => {
      const probe = document.createElement("span");
      probe.style.color = reference;
      document.body.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    }, reference);

  for (const scheme of ["light", "dark"] as const) {
    test(`[foundations.color.contrast-more] [atoms.mark.contrast-more] in ${scheme}, the border role stands 3:1 off the raised face, and a selected item gains an ink ring`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: "none", contrast: "more", colorScheme: scheme });
      await openHarness(page, "marks");
      const [border, raised] = await Promise.all([colourOf(page, tokens.color.border.base), colourOf(page, tokens.color.bg.raised)]);
      expect(ratio(border, raised)).toBeGreaterThanOrEqual(3);
      const ring = page.getByTestId("button-selected");
      await expectStyle(ring, { boxShadow: strokeRing(tokens.color.ink.primary) });
    });
  }
});
