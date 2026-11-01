import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens, type TextVariant } from "../../packages/paper-ui/src/tokens";
import { OPACITY_VALUES } from "../../packages/paper-ui/src/tokens/colors";
import { LAYOUT_SOURCE } from "../../packages/paper-ui/src/tokens/layout";
import { SHAPE_RECIPES } from "../../packages/paper-ui/src/tokens/shape-recipes";
import { CODE_SPEC, CONTROL_SIZES, FONT_STYLESHEETS, PRESET_SPEC, ROLE_SPEC, TEXT_VARIANTS, TYPOGRAPHY, TYPOGRAPHY_SOURCE } from "../../packages/paper-ui/src/tokens/typography";
import { pageErrors } from "../support/console";
import { metrics, px, roleDp } from "../support/geometry";
import { openHarness } from "../support/harness";
import { expectStyle } from "../support/style";

// The version the chrome shows is the one the package's manifest says.
const { version } = JSON.parse(readFileSync(new URL("../../packages/paper-ui/package.json", import.meta.url), "utf8")) as { version: string };
const VERSION = `v${version}`;

// Typography is chromium-only: the CDP and font parts need it, and the other engines run the shape,
// primitive and atom specs. The harness (?case=typography) mounts the package the way a consumer does;
// the app supplies the docs, the shell and the Playground.

const role = (variant: TextVariant) => {
  const spec = tokens.typography.role[variant];
  return { fontSize: spec.size, fontWeight: spec.weight, lineHeight: spec.leading, letterSpacing: spec.tracking };
};

const mount = async (page: Page) => {
  await openHarness(page, "typography");
  await expect(page.getByLabel("select-md", { exact: true })).toBeVisible();
};
const fixture = (page: Page, testid: string) => page.getByTestId(testid);
const css = <K extends keyof CSSStyleDeclaration>(target: Locator, property: K) =>
  target.evaluate((element, property) => getComputedStyle(element)[property] as string, property);

// The lines a text breaks into, read from the rendered boxes: each character is grouped by the row it sits on.
const lines = (target: Locator) =>
  target.evaluate((element) => {
    const node = element.firstChild as Text;
    const rows: { top: number; text: string }[] = [];
    const range = document.createRange();
    for (let index = 0; index < node.length; index += 1) {
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      const rect = range.getClientRects()[0];
      if (!rect || rect.width === 0) continue;
      const row = rows.find((candidate) => Math.abs(candidate.top - rect.top) < rect.height / 2);
      if (row) row.text += node.data[index];
      else rows.push({ top: rect.top, text: node.data[index]! });
    }
    return rows.map((row) => row.text);
  });

test.describe("the body role", () => {
  test("[foundations.typography.code-rule] a docs heading renders like the Text role it stands for", async ({ page }) => {
    await page.goto("/docs/get-started/philosophy");
    const prose = page.getByTestId("prose");
    await expectStyle(prose.locator("h2").first(), role("heading"));
    await expectStyle(prose.locator("h3").first(), role("subheading"));
  });

  test("[foundations.typography.body-role] a docs paragraph renders like a Text body, and so does a link outside any role", async ({ page }) => {
    await page.goto("/docs/primitives/content");
    const paragraph = page.getByTestId("prose").locator("p").first();
    await expect(paragraph).toBeVisible();
    await expectStyle(paragraph, role("body"));
    await expectType(paragraph, resolved(ROLE_SPEC.body), "paragraph");
    expect(await css(paragraph, "wordBreak")).toBe(TYPOGRAPHY_SOURCE.breaking.sans.wordBreak);

    const link = page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link").first();
    await expectType(link, resolved(ROLE_SPEC.body), "link");
    expect(await css(page.locator("body"), "overflowWrap")).toBe(TYPOGRAPHY_SOURCE.breaking.sans.overflowWrap);
  });

  test("[primitives.text.numeric] the chrome's version number sets its digits tabular", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(VERSION, { exact: true })).toBeVisible();
    expect(await css(page.getByText(VERSION, { exact: true }), "fontVariantNumeric")).toContain("tabular-nums");
  });
});

test.describe("line breaking", () => {
  test("[foundations.typography.line-breaking] sans text keeps Korean words whole, and mono text breaks anywhere", async ({ page }) => {
    await mount(page);
    const korean = fixture(page, "text-korean");
    expect({ wordBreak: await css(korean, "wordBreak"), overflowWrap: await css(korean, "overflowWrap") }).toEqual(TYPOGRAPHY_SOURCE.breaking.sans);
    const mono = fixture(page, "text-mono");
    expect({ wordBreak: await css(mono, "wordBreak"), overflowWrap: await css(mono, "overflowWrap") }).toEqual(TYPOGRAPHY_SOURCE.breaking.mono);

    const words = (await korean.innerText()).split(/\s+/);
    await korean.evaluate((element) => { element.style.width = "120px"; });
    const broken = await lines(korean);
    expect(broken.length).toBeGreaterThan(1);
    expect(broken.flatMap((line) => line.trim().split(/\s+/))).toEqual(words);

    await mono.evaluate((element) => { element.style.width = "90px"; });
    expect((await lines(mono)).length).toBeGreaterThan(1);
    expect(await mono.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  });

  test("[foundations.typography.line-breaking] Label and the parts of a FormField break like the roles they are drawn with", async ({ page }) => {
    await mount(page);
    for (const part of [fixture(page, "label"), page.locator("[data-part=label]"), page.locator("[data-part=description]"), page.locator("[data-part=error]")]) {
      expect({ wordBreak: await css(part, "wordBreak"), overflowWrap: await css(part, "overflowWrap") }).toEqual(TYPOGRAPHY_SOURCE.breaking.sans);
    }
  });

  test("[foundations.typography.single-line] a Button or Badge label never wraps, and a Field or Textarea does not promise that", async ({ page }) => {
    await mount(page);
    expect(await css(fixture(page, "button-md"), "whiteSpace")).toBe("nowrap");
    expect(await css(fixture(page, "badge-md"), "whiteSpace")).toBe("nowrap");
    expect(await css(page.getByLabel("textarea-md"), "whiteSpace")).not.toBe("nowrap");
  });
});

// What a role or preset has to compute to, from the authored numbers: size and line in px, weight, and tracking in em of
// the element's own size. Hero's fluid size follows the viewport, so the page is measured at a width it is given.
const VIEWPORT = 1280;
type Step = { size: string; weight: string; leading: string; tracking: string };
const fluidSize = ({ min, vw, max }: { min: number; vw: number; max: number }, viewport: number) => Math.min(Math.max(min, (vw / 100) * viewport), max);
const resolved = (step: Step, mono = false, viewport = VIEWPORT) => {
  const fluid = step.size in TYPOGRAPHY_SOURCE.fluid ? TYPOGRAPHY_SOURCE.fluid[step.size as keyof typeof TYPOGRAPHY_SOURCE.fluid] : undefined;
  const base = fluid ? fluidSize(fluid, viewport) : TYPOGRAPHY_SOURCE.fontSize[step.size as keyof typeof TYPOGRAPHY_SOURCE.fontSize];
  const fontSize = mono ? base * TYPOGRAPHY_SOURCE.monoSizeScale : base;
  // A unitless leading is a factor of the element's own size, so mono's smaller letters get a proportionally smaller line.
  const leading = step.leading in TYPOGRAPHY_SOURCE.fluid ? TYPOGRAPHY_SOURCE.fluid[step.leading as keyof typeof TYPOGRAPHY_SOURCE.fluid].leading * fontSize : TYPOGRAPHY_SOURCE.leading[step.leading as keyof typeof TYPOGRAPHY_SOURCE.leading];
  const tracking = (mono ? TYPOGRAPHY_SOURCE.tracking.mono : TYPOGRAPHY_SOURCE.tracking[step.tracking as keyof typeof TYPOGRAPHY_SOURCE.tracking]) * fontSize;
  return { fontSize, fontWeight: TYPOGRAPHY_SOURCE.weight[step.weight as keyof typeof TYPOGRAPHY_SOURCE.weight], lineHeight: leading, letterSpacing: tracking };
};
const typeOf = (target: Locator) =>
  target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: parseFloat(style.fontSize), fontWeight: Number(style.fontWeight), lineHeight: parseFloat(style.lineHeight), letterSpacing: style.letterSpacing === "normal" ? 0 : parseFloat(style.letterSpacing) };
  });
const expectType = async (target: Locator, expected: ReturnType<typeof resolved>, at: string) => {
  const computed = await typeOf(target);
  for (const key of ["fontSize", "fontWeight", "lineHeight", "letterSpacing"] as const) expect(computed[key], `${at} ${key}`).toBeCloseTo(expected[key], 2);
};

test("[foundations.typography.role-computed] every Text variant, sans and mono, and every control preset computes the size, weight, line and tracking its source resolves to", async ({ page }) => {
  await page.setViewportSize({ width: VIEWPORT, height: 900 });
  await mount(page);
  for (const variant of TEXT_VARIANTS) {
    await expectType(page.getByTestId(`role-${variant}`), resolved(ROLE_SPEC[variant]), variant);
    // Mono scales the size by monoSizeScale and swaps in its own tracking; weight and a fixed line stay the role's.
    await expectType(page.getByTestId(`role-mono-${variant}`), resolved(ROLE_SPEC[variant], true), `mono ${variant}`);
  }
  for (const size of CONTROL_SIZES) {
    await expectType(page.getByTestId(`preset-button-medium-${size}`), resolved(PRESET_SPEC.button.medium[size]), `button medium ${size}`);
    await expectType(page.getByTestId(`preset-button-strong-${size}`), resolved(PRESET_SPEC.button.strong[size]), `button strong ${size}`);
    // A field's wrapper holds the glyph line, and the value sits in the taller line box its input draws.
    await expectType(page.getByTestId(`preset-field-${size}`), resolved(PRESET_SPEC.field[size]), `field ${size}`);
    await expectType(page.getByLabel(`preset ${size} field`, { exact: true }), { ...resolved(PRESET_SPEC.field[size]), lineHeight: TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.field[size].inputLeading] }, `field input ${size}`);
    await expectType(page.getByTestId(`preset-textarea-${size}`), resolved(PRESET_SPEC.textarea[size]), `textarea ${size}`);
  }
  await expectType(page.getByTestId("preset-badge"), resolved(PRESET_SPEC.badge), "badge");
});

test.describe("control presets", () => {
  test("[foundations.typography.input-line] a Field's value sits in the preset's input line box inside its glyph line, and a Select keeps the glyph line", async ({ page }) => {
    await mount(page);
    const field = PRESET_SPEC.field.md;
    const input = page.getByLabel("field-md", { exact: true });
    expect(await css(input, "lineHeight")).toBe(px(TYPOGRAPHY_SOURCE.leading[field.inputLeading]));
    expect(await css(fixture(page, "field-md"), "lineHeight")).toBe(px(TYPOGRAPHY_SOURCE.leading[field.leading]));
    expect((await metrics(fixture(page, "field-md"))).padding).toBe(roleDp(tokens.shape.control.inset.input.md));
    expect(await css(page.getByLabel("select-md", { exact: true }), "lineHeight")).toBe(px(TYPOGRAPHY_SOURCE.leading[field.leading]));
    expect(await css(page.getByLabel("textarea-md"), "lineHeight")).toBe(px(TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.textarea.md.leading]));
  });

  test("[foundations.typography.control-preset] a solid Button is strong, the others are medium, and Badge keeps its own size", async ({ page }) => {
    await mount(page);
    const weight = (name: keyof typeof TYPOGRAPHY_SOURCE.weight) => String(TYPOGRAPHY_SOURCE.weight[name]);
    expect(await css(fixture(page, "button-md"), "fontWeight")).toBe(weight(PRESET_SPEC.button.strong.md.weight));
    expect(await css(fixture(page, "button-medium"), "fontWeight")).toBe(weight(PRESET_SPEC.button.medium.md.weight));
    expect(await css(fixture(page, "badge-md"), "fontSize")).toBe(px(TYPOGRAPHY_SOURCE.fontSize[PRESET_SPEC.badge.size]));
    expect(await css(page.getByLabel("field-md", { exact: true }), "fontWeight")).toBe(weight(PRESET_SPEC.field.md.weight));
  });

  test("[foundations.typography.font-size-escape] fontSize changes the size of the letters and nothing of the box", async ({ page }) => {
    await mount(page);
    const button = fixture(page, "button-md");
    const sized = async (target: Locator) => ({ fontSize: await css(target, "fontSize"), lineHeight: await css(target, "lineHeight"), box: await metrics(target) });
    const base = await sized(button);
    expect(base.fontSize).toBe(px(TYPOGRAPHY_SOURCE.fontSize[PRESET_SPEC.button.strong.md.size]));

    const bodySize = px(TYPOGRAPHY_SOURCE.fontSize[ROLE_SPEC.body.size]);
    const inputLine = px(TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.textarea.md.leading]);
    const body = await sized(fixture(page, "button-body"));
    const label = await sized(fixture(page, "button-label"));
    expect([body.fontSize, label.fontSize]).toEqual([bodySize, px(TYPOGRAPHY_SOURCE.fontSize[ROLE_SPEC.label.size])]);
    for (const other of [body, label]) {
      expect(other.lineHeight).toBe(base.lineHeight);
      expect(other.box.height).toBe(base.box.height);
      expect(other.box.padding).toBe(base.box.padding);
    }

    const badge = await metrics(fixture(page, "badge-md"));
    expect(await css(fixture(page, "badge-body"), "fontSize")).toBe(bodySize);
    expect((await metrics(fixture(page, "badge-body"))).height).toBe(badge.height);

    expect(await css(fixture(page, "field-body"), "fontSize")).toBe(bodySize);
    expect(await css(page.getByLabel("field-body", { exact: true }), "lineHeight")).toBe(px(TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.field.md.inputLeading]));
    expect(await metrics(fixture(page, "field-body"))).toMatchObject({ height: roleDp(tokens.shape.control.height.md), padding: roleDp(tokens.shape.control.inset.input.md) });
    expect(await css(page.getByLabel("select-body", { exact: true }), "fontSize")).toBe(bodySize);
    expect(await css(page.getByLabel("textarea-body"), "fontSize")).toBe(bodySize);
    expect(await css(page.getByLabel("textarea-body"), "lineHeight")).toBe(inputLine);
  });
});

test.describe("Text", () => {
  test("[primitives.text.numeric] numeric sets digits tabular on Text and on a Field's value, and nothing else does", async ({ page }) => {
    await mount(page);
    expect(await css(fixture(page, "text-numeric"), "fontVariantNumeric")).toContain("tabular-nums");
    expect(await css(page.getByLabel("field-numeric", { exact: true }), "fontVariantNumeric")).toContain("tabular-nums");
    expect(await css(fixture(page, "text-korean"), "fontVariantNumeric")).not.toContain("tabular-nums");
    expect(await css(page.getByLabel("field-md", { exact: true }), "fontVariantNumeric")).not.toContain("tabular-nums");
  });

  test("[foundations.typography.hero-fluid] hero is the one fluid role: it follows the viewport between the two bounds of its source and keeps a unitless leading", async ({ page }) => {
    await mount(page);
    const hero = fixture(page, "text-hero");
    expect(await hero.evaluate((element) => element.tagName)).toBe("H1");
    await expectStyle(hero, role("hero"));
    const { min, vw, max, leading } = TYPOGRAPHY_SOURCE.fluid.hero;
    // The widths where the viewport term meets each bound: past the upper one the size stays at max, under the lower one at min, and between them it follows.
    const widthAt = (size: number) => (size / vw) * 100;
    await page.setViewportSize({ width: Math.round(widthAt(max)) + 100, height: 900 });
    expect(parseFloat(await css(hero, "fontSize"))).toBeCloseTo(max, 2);
    expect(parseFloat(await css(hero, "lineHeight"))).toBeCloseTo(max * leading, 2);
    await page.setViewportSize({ width: Math.round(widthAt(min)) - 100, height: 844 });
    expect(parseFloat(await css(hero, "fontSize"))).toBeCloseTo(min, 2);
    const between = Math.round(widthAt((min + max) / 2));
    await page.setViewportSize({ width: between, height: 900 });
    expect(parseFloat(await css(hero, "fontSize"))).toBeCloseTo((vw / 100) * between, 2);
    // A fixed role does not follow the viewport.
    await expectType(fixture(page, "text-display"), resolved(ROLE_SPEC.display), "display");
  });

  test("[primitives.form-field.parts] a FormField's label, description and error are drawn with the label and caption roles", async ({ page }) => {
    await mount(page);
    await expectStyle(page.locator("[data-part=label]"), { ...role("label"), color: tokens.color.ink.secondary });
    await expectStyle(page.locator("[data-part=description]"), { ...role("caption"), color: tokens.color.ink.secondary });
    await expectStyle(page.locator("[data-part=error]"), { ...role("caption"), color: tokens.color.accent.error.ink });
    await expectStyle(fixture(page, "label"), { ...role("label"), color: tokens.color.ink.secondary });
  });
});

test.describe("fonts", () => {
  test("[install.fonts.stylesheets] the site requests exactly the stylesheets FONT_STYLESHEETS names, and the weights of the ladder resolve", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "stylesheet" && new URL(request.url()).hostname === "cdn.jsdelivr.net") requested.push(request.url());
    });
    await page.goto("/");
    await expect(page.getByText(VERSION, { exact: true })).toBeVisible();
    expect(requested.sort()).toEqual(Object.values(FONT_STYLESHEETS).sort());

    await page.evaluate(() => document.fonts.ready);
    const weights = Object.values(TYPOGRAPHY_SOURCE.weight);
    const loaded = await page.evaluate((weights) => weights.map((weight) => document.fonts.check(`${weight} 1em 'Pretendard Variable'`)), weights);
    expect(loaded).toEqual(weights.map(() => true));
  });

  test("[install.fonts.stylesheets] the body text is set in the web font once it has loaded", async ({ page }) => {
    await page.goto("/docs/primitives/content");
    await expect(page.getByTestId("prose").locator("p").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument");
    const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: "[data-testid=prose] p" });
    const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    expect(fonts.map((font) => font.familyName)).toContain("Pretendard Variable");
  });

  test("[install.fonts.geometry-without-font] without the web font a control keeps its geometry and the page does not overflow", async ({ page }) => {
    await page.route("**/cdn.jsdelivr.net/**", (route) => route.abort());
    await openHarness(page, "geometry");
    await expect(page.getByLabel("select-md", { exact: true })).toBeVisible();
    const control = (selector: string) => metrics(page.locator("#shape-fixture").locator(selector));
    const { control: shape } = tokens.shape;
    expect(await control("[data-testid=button-md]")).toMatchObject({ height: roleDp(shape.height.md), padding: roleDp(shape.inset.button.md) });
    expect(await control("[data-testid=field-md]")).toMatchObject({ height: roleDp(shape.height.md), padding: roleDp(shape.inset.input.md) });
    expect((await control("textarea[aria-label=textarea-md]")).blockPadding).toBe(roleDp(SHAPE_RECIPES.textarea.paddingBlock.md));

    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of ["/playground", "/playground/foundations/typography", "/docs/foundations/typography"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), path).toBe(true);
    }
  });
});

test.describe("the docs, the Playground and the landing page take their type from roles", () => {
  const prose = (page: Page) => page.getByTestId("prose");
  const size = async (target: Locator) => parseFloat(await css(target, "fontSize"));

  test("[foundations.typography.code-rule] inline code and code in a table cell are the source's ratio of the text around them, in the mono family", async ({ page }) => {
    await page.goto("/docs/atoms");
    const paragraph = prose(page).locator("p").filter({ has: page.locator("code") }).first();
    const inline = paragraph.locator("code").first();
    expect(await size(inline) / (await size(paragraph))).toBeCloseTo(TYPOGRAPHY_SOURCE.codeScale.inline, 3);
    const cell = prose(page).locator("td").filter({ has: page.locator("code") }).first();
    expect(await size(cell.locator("code").first()) / (await size(cell))).toBeCloseTo(TYPOGRAPHY_SOURCE.codeScale.compact, 3);
    for (const code of [inline, cell.locator("code").first()]) await expectStyle(code, { fontFamily: TYPOGRAPHY.palette.family.mono });
  });

  test("[foundations.typography.code-rule] a Playground code block and its editor are the code block's size, line and weight, and a docs code block is the same at the regular weight", async ({ page }) => {
    const { block } = CODE_SPEC;
    const [fontSize, lineHeight] = [px(TYPOGRAPHY_SOURCE.fontSize[block.size]), px(TYPOGRAPHY_SOURCE.leading[block.leading])];
    await page.goto("/docs/primitives/select");
    const docs = prose(page).locator("pre code").first();
    expect([await css(docs, "fontSize"), await css(docs, "lineHeight"), await css(docs, "fontWeight")]).toEqual([fontSize, lineHeight, String(TYPOGRAPHY_SOURCE.weight.regular)]);

    await page.goto("/playground/button");
    const code = page.getByTestId("code-block").locator("pre");
    await expect(code).toBeVisible();
    const weight = String(TYPOGRAPHY_SOURCE.weight[block.weight]);
    expect([await css(code, "fontSize"), await css(code, "lineHeight"), await css(code, "fontWeight")]).toEqual([fontSize, lineHeight, weight]);
    await page.getByRole("button", { name: "코드 편집" }).click();
    const editor = page.getByRole("textbox", { name: "컴포넌트 코드 편집" });
    expect([await css(editor, "fontSize"), await css(editor, "lineHeight"), await css(editor, "fontWeight")]).toEqual([fontSize, lineHeight, weight]);
    await expectStyle(editor, { fontFamily: TYPOGRAPHY.palette.family.mono });
  });

  test("the landing headline is the hero role, its padding the section role and the footer logo the subdued opacity", async ({ page }) => {
    const WIDTH = 1440;
    await page.setViewportSize({ width: WIDTH, height: 900 });
    await page.goto("/");
    const headline = page.getByRole("heading", { level: 1 });
    await expectStyle(headline, { ...role("hero"), color: tokens.color.ink.primary });
    await expectType(headline, resolved(ROLE_SPEC.hero, false, WIDTH), "headline");
    // The period is part of the headline's ink: nothing inside it is coloured on its own.
    await expect(headline.locator(":scope > :not(br)")).toHaveCount(0);
    const hero = headline.locator("xpath=..");
    await expectStyle(hero, { paddingTop: tokens.layout.section.start, paddingBottom: tokens.layout.section.end, maxWidth: tokens.shape.measure.xl });
    await expectStyle(page.getByText("레이아웃은 Primitive로"), { maxWidth: tokens.shape.measure.md });
    await expectStyle(page.locator("footer svg"), { opacity: tokens.color.opacity.subdued });
    await expect(page.locator("footer svg")).toHaveCSS("opacity", OPACITY_VALUES.subdued);
  });
});

test.describe("what line breaking leaves to the shell", () => {
  const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  // When the page overflows, what is past its edge: elements and text runs outside any clipping box, and boxes whose
  // content is wider than they are. An overflow can happen on one platform only, so the failure has to name it.
  const pastTheEdge = (page: Page) =>
    page.evaluate(() => {
      const edge = document.documentElement.clientWidth;
      const clipped = (node: Node) => {
        for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
          if (getComputedStyle(parent).overflowX !== "visible") return true;
        }
        return false;
      };
      const name = (element: Element) => `${element.tagName.toLowerCase()}.${element.getAttribute("class")?.split(/\s+/)[0] ?? ""}`;
      const found: string[] = [];
      for (const element of document.body.querySelectorAll("*")) {
        if (clipped(element)) continue;
        const { left, right } = element.getBoundingClientRect();
        if (right > edge) found.push(`box ${name(element)} ${left.toFixed(2)}..${right.toFixed(2)}`);
        if (element.scrollWidth > element.clientWidth && element.clientWidth > 0) found.push(`wider ${name(element)} ${element.clientWidth}<${element.scrollWidth}`);
      }
      const texts = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (texts.nextNode()) {
        const text = texts.currentNode;
        if (!text.textContent?.trim() || clipped(text)) continue;
        range.selectNodeContents(text);
        const { right } = range.getBoundingClientRect();
        if (right > edge) found.push(`text "${text.textContent.trim().slice(0, 24)}" ..${right.toFixed(2)} in ${name(text.parentElement!)}`);
      }
      return `edge ${edge}; ${found.join("; ") || "nothing measurable"}`;
    });

  test("nothing overflows horizontally at 390 on the landing page or the demo", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = pageErrors(page);
    for (const path of ["/", "/demo"]) {
      await page.goto(path);
      await expect(page.locator("h1, [role=banner]").first()).toBeVisible();
      expect(await overflow(page), path).toBeLessThanOrEqual(0);
    }
    expect(errors).toEqual([]);
  });

  test("below md the GNB puts its links on a second row instead of breaking them per character", async ({ page }) => {
    const { md } = LAYOUT_SOURCE.breakpoint;
    for (const width of [1440, md + 1, md, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/docs");
      const header = page.getByRole("banner");
      const links = page.getByRole("navigation", { name: "주요 메뉴" });
      await expect(links).toBeVisible();
      const brand = (await page.getByRole("link", { name: "Paper UI 홈" }).boundingBox())!;
      const row = (await links.boundingBox())!;
      const stacked = width <= md;
      expect(row.y >= brand.y + brand.height - 1, `${width}: links on their own row`).toBe(stacked);
      for (const link of await links.getByRole("link").all()) expect((await link.boundingBox())!.height, `${width}: no link wraps`).toBeLessThanOrEqual(row.height);
      const height = (await header.boundingBox())!.height;
      expect(stacked ? height > 52 : height === 52, `${width}: header height ${height}`).toBe(true);
      expect(await header.evaluate((element) => element.scrollWidth <= element.clientWidth), `${width}: the header holds its content`).toBe(true);
    }
  });

  test("on the demo at the sm breakpoint or less the topbar gives its workspace label to the search", async ({ page }) => {
    const { sm } = LAYOUT_SOURCE.breakpoint;
    for (const width of [sm + 120, sm + 1, sm, sm - 90]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/demo");
      const label = page.getByText("내 작업 공간");
      const search = page.getByLabel("전체 검색").locator("xpath=..");
      await expect(search).toBeVisible();
      if (width <= sm) await expect(label).toBeHidden();
      else await expect(label).toBeVisible();
      const box = (await search.boundingBox())!;
      expect(box.x + box.width, `${width}: the search stays inside the viewport`).toBeLessThanOrEqual(width);
      const over = await overflow(page);
      expect(over, `${width}: no overflow${over > 0 ? ` (${await pastTheEdge(page)})` : ""}`).toBeLessThanOrEqual(0);
    }
  });
});
