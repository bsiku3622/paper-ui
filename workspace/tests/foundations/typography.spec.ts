import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens, type TextVariant } from "../../packages/paper-ui/src/tokens";
import { FONT_STYLESHEETS } from "../../packages/paper-ui/src/tokens/typography";
import { pageErrors } from "../support/console";
import { metrics } from "../support/geometry";
import { openHarness } from "../support/harness";
import { expectStyle } from "../support/style";

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
  test("[foundations.typography.body-role] a docs paragraph renders like a Text body, and so does a link outside any role", async ({ page }) => {
    await page.goto("/docs/primitives/content");
    const paragraph = page.getByTestId("prose").locator("p").first();
    await expect(paragraph).toBeVisible();
    await expectStyle(paragraph, role("body"));
    expect([await css(paragraph, "fontSize"), await css(paragraph, "fontWeight"), await css(paragraph, "lineHeight")]).toEqual(["14px", "500", "20px"]);
    expect(await css(paragraph, "wordBreak")).toBe("keep-all");

    const link = page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link").first();
    expect([await css(link, "fontSize"), await css(link, "fontWeight"), await css(link, "lineHeight")]).toEqual(["14px", "500", "20px"]);
    expect(await css(page.locator("body"), "overflowWrap")).toBe("break-word");
  });

  test("the chrome's version number sets its digits tabular", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("v0.1.0", { exact: true })).toBeVisible();
    expect(await css(page.getByText("v0.1.0", { exact: true }), "fontVariantNumeric")).toContain("tabular-nums");
  });
});

test.describe("line breaking", () => {
  test("[foundations.typography.line-breaking] sans text keeps Korean words whole, and mono text breaks anywhere", async ({ page }) => {
    await mount(page);
    const korean = fixture(page, "text-korean");
    expect([await css(korean, "wordBreak"), await css(korean, "overflowWrap")]).toEqual(["keep-all", "break-word"]);
    const mono = fixture(page, "text-mono");
    expect([await css(mono, "wordBreak"), await css(mono, "overflowWrap")]).toEqual(["normal", "anywhere"]);

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
      expect([await css(part, "wordBreak"), await css(part, "overflowWrap")]).toEqual(["keep-all", "break-word"]);
    }
  });

  test("a Button or Badge label never wraps, and a Field or Textarea does not promise that", async ({ page }) => {
    await mount(page);
    expect(await css(fixture(page, "button-md"), "whiteSpace")).toBe("nowrap");
    expect(await css(fixture(page, "badge-md"), "whiteSpace")).toBe("nowrap");
    expect(await css(page.getByLabel("textarea-md"), "whiteSpace")).not.toBe("nowrap");
  });
});

test.describe("control presets", () => {
  test("[foundations.typography.input-line] a Field's value sits in a 20px line box inside the 16px glyph line, and a Select keeps 16", async ({ page }) => {
    await mount(page);
    const input = page.getByLabel("field-md", { exact: true });
    expect(await css(input, "lineHeight")).toBe("20px");
    expect(await css(fixture(page, "field-md"), "lineHeight")).toBe("16px");
    expect((await metrics(fixture(page, "field-md"))).padding).toBe(8);
    expect(await css(page.getByLabel("select-md", { exact: true }), "lineHeight")).toBe("16px");
    expect(await css(page.getByLabel("textarea-md"), "lineHeight")).toBe("20px");
  });

  test("a solid Button is strong, the others are medium, and Badge keeps 12px", async ({ page }) => {
    await mount(page);
    expect(await css(fixture(page, "button-md"), "fontWeight")).toBe("650");
    expect(await css(fixture(page, "button-medium"), "fontWeight")).toBe("500");
    expect(await css(fixture(page, "badge-md"), "fontSize")).toBe("12px");
    expect(await css(page.getByLabel("field-md", { exact: true }), "fontWeight")).toBe("450");
  });

  test("[foundations.typography.font-size-escape] fontSize changes the size of the letters and nothing of the box", async ({ page }) => {
    await mount(page);
    const button = fixture(page, "button-md");
    const sized = async (target: Locator) => ({ fontSize: await css(target, "fontSize"), lineHeight: await css(target, "lineHeight"), box: await metrics(target) });
    const base = await sized(button);
    expect(base.fontSize).toBe("13px");

    const body = await sized(fixture(page, "button-body"));
    const label = await sized(fixture(page, "button-label"));
    expect([body.fontSize, label.fontSize]).toEqual(["14px", "12px"]);
    for (const other of [body, label]) {
      expect(other.lineHeight).toBe(base.lineHeight);
      expect(other.box.height).toBe(base.box.height);
      expect(other.box.padding).toBe(base.box.padding);
    }

    const badge = await metrics(fixture(page, "badge-md"));
    expect(await css(fixture(page, "badge-body"), "fontSize")).toBe("14px");
    expect((await metrics(fixture(page, "badge-body"))).height).toBe(badge.height);

    expect(await css(fixture(page, "field-body"), "fontSize")).toBe("14px");
    expect(await css(page.getByLabel("field-body", { exact: true }), "lineHeight")).toBe("20px");
    expect(await metrics(fixture(page, "field-body"))).toMatchObject({ height: 32, padding: 8 });
    expect(await css(page.getByLabel("select-body", { exact: true }), "fontSize")).toBe("14px");
    expect(await css(page.getByLabel("textarea-body"), "fontSize")).toBe("14px");
    expect(await css(page.getByLabel("textarea-body"), "lineHeight")).toBe("20px");
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

  test("hero is the one fluid role: it follows the viewport between 36px and 60px and keeps a unitless leading", async ({ page }) => {
    await mount(page);
    const hero = fixture(page, "text-hero");
    expect(await hero.evaluate((element) => element.tagName)).toBe("H1");
    await expectStyle(hero, role("hero"));
    await page.setViewportSize({ width: 1440, height: 900 });
    expect([await css(hero, "fontSize"), await css(hero, "lineHeight")]).toEqual(["60px", "62.4px"]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await css(hero, "fontSize")).toBe("36px");
    await page.setViewportSize({ width: 800, height: 900 });
    expect(await css(hero, "fontSize")).toBe("48px");
    expect(await css(fixture(page, "text-display"), "fontSize")).toBe("32px");
    expect(await css(fixture(page, "text-display"), "lineHeight")).toBe("40px");
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
    await expect(page.getByText("v0.1.0", { exact: true })).toBeVisible();
    expect(requested.sort()).toEqual(Object.values(FONT_STYLESHEETS).sort());

    await page.evaluate(() => document.fonts.ready);
    const resolved = await page.evaluate(() => [450, 500, 650].map((weight) => document.fonts.check(`${weight} 14px 'Pretendard Variable'`)));
    expect(resolved).toEqual([true, true, true]);
  });

  test("the body text is set in the web font once it has loaded", async ({ page }) => {
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
    expect(await control("[data-testid=button-md]")).toMatchObject({ height: 32, padding: 11 });
    expect(await control("[data-testid=field-md]")).toMatchObject({ height: 32, padding: 8 });
    expect((await control("textarea[aria-label=textarea-md]")).blockPadding).toBe(5);

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

  test("inline code is 0.85 of the paragraph around it and code in a table cell 0.8, in the mono family", async ({ page }) => {
    await page.goto("/docs/atoms");
    const paragraph = prose(page).locator("p").filter({ has: page.locator("code") }).first();
    const inline = paragraph.locator("code").first();
    expect(await size(inline) / (await size(paragraph))).toBeCloseTo(0.85, 3);
    const cell = prose(page).locator("td").filter({ has: page.locator("code") }).first();
    expect(await size(cell.locator("code").first()) / (await size(cell))).toBeCloseTo(0.8, 3);
    for (const code of [inline, cell.locator("code").first()]) await expectStyle(code, { fontFamily: tokens.typography.palette.family.mono });
  });

  test("a docs code block is 13/20/400, a Playground code block and its editor 13/20/450", async ({ page }) => {
    await page.goto("/docs/primitives/select");
    const block = prose(page).locator("pre code").first();
    expect([await css(block, "fontSize"), await css(block, "lineHeight"), await css(block, "fontWeight")]).toEqual(["13px", "20px", "400"]);

    await page.goto("/playground/button");
    const code = page.getByTestId("code-block").locator("pre");
    await expect(code).toBeVisible();
    expect([await css(code, "fontSize"), await css(code, "lineHeight"), await css(code, "fontWeight")]).toEqual(["13px", "20px", "450"]);
    await page.getByRole("button", { name: "코드 편집" }).click();
    const editor = page.getByRole("textbox", { name: "컴포넌트 코드 편집" });
    expect([await css(editor, "fontSize"), await css(editor, "lineHeight"), await css(editor, "fontWeight")]).toEqual(["13px", "20px", "450"]);
    await expectStyle(editor, { fontFamily: tokens.typography.palette.family.mono });
  });

  test("the landing headline is the hero role, its padding the section role and the footer logo the subdued opacity", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const headline = page.getByRole("heading", { level: 1 });
    await expectStyle(headline, { ...role("hero"), color: tokens.color.ink.primary });
    expect([await css(headline, "fontSize"), await css(headline, "lineHeight"), await css(headline, "letterSpacing"), await css(headline, "fontWeight")]).toEqual(["60px", "62.4px", "-2.1px", "700"]);
    // The period is part of the headline's ink: nothing inside it is coloured on its own.
    await expect(headline.locator(":scope > :not(br)")).toHaveCount(0);
    const hero = headline.locator("xpath=..");
    await expectStyle(hero, { paddingTop: tokens.layout.section.start, paddingBottom: tokens.layout.section.end, maxWidth: tokens.shape.measure.xl });
    await expectStyle(page.getByText("레이아웃은 Primitive로"), { maxWidth: tokens.shape.measure.md });
    await expectStyle(page.locator("footer svg"), { opacity: tokens.color.opacity.subdued });
    await expect(page.locator("footer svg")).toHaveCSS("opacity", "0.7");
  });
});

test.describe("what line breaking leaves to the shell", () => {
  const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

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
    for (const width of [1440, 769, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/docs");
      const header = page.getByRole("banner");
      const links = page.getByRole("navigation", { name: "주요 메뉴" });
      await expect(links).toBeVisible();
      const brand = (await page.getByRole("link", { name: "Paper UI 홈" }).boundingBox())!;
      const row = (await links.boundingBox())!;
      const stacked = width <= 768;
      expect(row.y >= brand.y + brand.height - 1, `${width}: links on their own row`).toBe(stacked);
      for (const link of await links.getByRole("link").all()) expect((await link.boundingBox())!.height, `${width}: no link wraps`).toBeLessThanOrEqual(row.height);
      const height = (await header.boundingBox())!.height;
      expect(stacked ? height > 52 : height === 52, `${width}: header height ${height}`).toBe(true);
      expect(await header.evaluate((element) => element.scrollWidth <= element.clientWidth), `${width}: the header holds its content`).toBe(true);
    }
  });

  test("on the demo at 480px or less the topbar gives its workspace label to the search", async ({ page }) => {
    for (const width of [600, 481, 480, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/demo");
      const label = page.getByText("내 작업 공간");
      const search = page.getByLabel("전체 검색").locator("xpath=..");
      await expect(search).toBeVisible();
      if (width <= 480) await expect(label).toBeHidden();
      else await expect(label).toBeVisible();
      const box = (await search.boundingBox())!;
      expect(box.x + box.width, `${width}: the search stays inside the viewport`).toBeLessThanOrEqual(width);
      expect(await overflow(page), `${width}: no overflow`).toBeLessThanOrEqual(0);
    }
  });
});
