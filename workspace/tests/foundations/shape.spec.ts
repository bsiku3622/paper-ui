import { expect, test, type Locator, type Page } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import type { SourceOverrides } from "../../packages/paper-ui/src/tokens/overrides";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { SHAPE_RECIPES } from "../../packages/paper-ui/src/tokens/shape-recipes";
import { CONTROL_SIZES, type ControlSize } from "../../packages/paper-ui/src/tokens/control-sizes";
import { CONTROL } from "../../packages/paper-ui/src/tokens/control-recipes";
import { PRESET_SPEC, TYPOGRAPHY_SOURCE } from "../../packages/paper-ui/src/tokens/typography";
import { metrics as measure, px, roleDp } from "../support/geometry";
import { openHarness, openPlayground } from "../support/harness";
import { tab } from "../support/keyboard";
import { chooseOption } from "../support/select";

const mount = async (page: Page) => {
  await openHarness(page, "geometry");
  await expect(page.getByLabel("select-md", { exact: true })).toBeVisible();
};

const metrics = (page: Page, selector: string, pseudo?: string) => measure(page.locator("#shape-fixture").locator(selector), pseudo);

const thumbEdges = (track: Locator) => track.evaluate((element) => {
  const thumb = getComputedStyle(element, "::after");
  return { left: parseFloat(thumb.left), right: parseFloat(thumb.right) };
});

test("[foundations.shape.control-geometry] [foundations.shape.recipe-geometry] all control sizes retain their geometry and optical marks", async ({ page }) => {
  await mount(page);
  const { control, selection } = tokens.shape;
  for (const size of CONTROL_SIZES) {
    const height = roleDp(control.height[size]);
    const icon = roleDp(control.icon[size]);
    const inputInset = roleDp(control.inset.input[size]);
    const button = await metrics(page, `[data-testid=button-${size}]`);
    expect(button.height).toBe(height);
    expect(button.padding).toBe(roleDp(control.inset.button[size]));
    const iconButton = await metrics(page, `[data-testid=icon-${size}]`);
    expect(iconButton.width).toBe(iconButton.height);
    expect((await metrics(page, `[data-testid=icon-${size}] svg`)).width).toBe(icon);
    const field = await metrics(page, `[data-testid=field-${size}]`);
    expect(field.height).toBe(height);
    expect(field.padding).toBe(inputInset);
    for (const svg of [0, 1]) expect((await metrics(page, `[data-testid=actions-${size}] button >> nth=${svg} >> svg`)).width, `${size} action ${svg}`).toBe(icon);
    expect((await metrics(page, `[data-testid=select-${size}]`)).height).toBe(height);
    const selectLine = await page.locator(`#shape-fixture [data-testid=select-${size}]`).evaluate((element) => parseFloat(getComputedStyle(element).borderInlineStartWidth));
    expect((await metrics(page, `[data-testid=select-${size}] [role=combobox]`)).padding + selectLine).toBe(inputInset);
    const textareaPadding = roleDp(CONTROL.area.paddingBlock[size]);
    expect((await metrics(page, `textarea[aria-label=textarea-${size}]`)).blockPadding).toBe(textareaPadding);
    expect((await metrics(page, `textarea[aria-label=textarea-row-${size}]`)).height).toBe(height);
    const line = TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.textarea[size].leading];
    expect((await metrics(page, `textarea[aria-label=textarea-${size}]`)).height).toBe(4 * line + 2 * textareaPadding);
    expect((await metrics(page, `[data-testid=select-${size}] > svg`)).width).toBe(icon);
    const box = roleDp(selection.size[size]);
    expect((await metrics(page, `[aria-label=checkbox-${size}]`)).width).toBe(box);
    expect((await metrics(page, `[aria-label=checkbox-${size}]`)).radius).toBe(SHAPE_SOURCE.radius.selection);
    expect((await metrics(page, `[aria-label=checkbox-${size}]`, "::after")).width).toBe(roleDp(SHAPE_RECIPES.checkbox.mark[size]));
    expect((await metrics(page, `[aria-label=radio-${size}]`, "::after")).width).toBeCloseTo(roleDp(SHAPE_RECIPES.radio.dot[size]), 1);
    const track = await metrics(page, `[aria-label=switch-${size}]`);
    const thumb = await metrics(page, `[aria-label=switch-${size}]`, "::after");
    expect(track.width).toBe(roleDp(SHAPE_RECIPES.switch.width[size]));
    expect(track.height).toBe(roleDp(SHAPE_RECIPES.switch.height[size]));
    expect(thumb.width).toBe(roleDp(SHAPE_RECIPES.switch.thumbWidth[size]));
    expect(thumb.inset).toBe(roleDp(SHAPE_RECIPES.switch.inset) + roleDp(SHAPE_RECIPES.switch.travel[size]));
    expect((await metrics(page, `[data-testid=badge-${size}]`)).height).toBe(SHAPE_SOURCE.anatomy.badge.height[size]);
  }
});

test("[foundations.override.rederives-roles] [foundations.shape.radius-separate] source overrides in a subtree, named by sourceVars, re-derive every role built on them: shape, text and layout", async ({ page }) => {
  await mount(page);
  type Paper = { __paper: { sourceVars: (overrides: SourceOverrides) => Record<string, string> } };
  const overrides: SourceOverrides = {
    shape: { control: { height: { md: "40px" } }, selection: { size: { md: "20px" } }, radius: { control: { md: "9px" }, surface: { sm: "3px" } }, focus: { width: "5px" }, space: { md: "20px" } },
    typography: { palette: { leading: { "16": "20px" } } },
  };
  const vars = await page.evaluate((overrides) => (window as unknown as Paper).__paper.sourceVars(overrides), overrides);
  await page.locator("#shape-fixture").evaluate((element, declarations) => {
    for (const [name, value] of Object.entries(declarations)) element.style.setProperty(name, value);
  }, vars);
  const { control, selection } = tokens.shape;
  const dp = (role: string) => roleDp(role, vars);
  const rim = SHAPE_SOURCE.stroke.emphasis;
  expect(dp(control.height.md)).toBe(40);
  expect((await metrics(page, "[data-testid=button-md]")).height).toBe(40);
  expect((await metrics(page, "[data-testid=button-md]")).padding).toBe(dp(control.inset.button.md));
  expect(dp(control.inset.button.md)).toBe(SHAPE_SOURCE.control.buttonInset.md);
  expect((await metrics(page, "[data-testid=field-md]")).padding).toBe(dp(control.inset.input.md));
  expect(dp(control.inset.input.md)).toBe(10);
  expect((await metrics(page, "[aria-label=checkbox-md]")).width).toBe(dp(selection.size.md));
  expect((await metrics(page, "[aria-label=checkbox-md]", "::after")).width).toBe(dp(SHAPE_RECIPES.checkbox.mark.md));
  expect((await metrics(page, "[aria-label=radio-md]", "::after")).width).toBeCloseTo(dp(SHAPE_RECIPES.radio.dot.md), 1);
  expect((await metrics(page, "[aria-label=switch-md]")).width).toBe(dp(SHAPE_RECIPES.switch.width.md));
  expect((await metrics(page, "[aria-label=switch-md]")).height).toBe(dp(SHAPE_RECIPES.switch.height.md));
  expect((await metrics(page, "[aria-label=switch-md]", "::after")).width).toBe(dp(SHAPE_RECIPES.switch.thumbWidth.md));
  expect((await metrics(page, "textarea[aria-label=textarea-md]")).blockPadding).toBe(dp(CONTROL.area.paddingBlock.md));
  expect((await metrics(page, "[data-testid=button-md]")).radius).toBe(9);
  expect((await metrics(page, "[data-testid=surface-corner]")).radius).toBe(3);
  const gap = await page.getByTestId("gap-md").evaluate((element) => ({ column: getComputedStyle(element).columnGap, row: getComputedStyle(element).rowGap }));
  expect(gap).toEqual({ column: `${dp(tokens.layout.gap.md)}px`, row: `${dp(tokens.layout.gap.md)}px` });
  expect(dp(tokens.layout.gap.md)).toBe(20);
  await expect.poll(async () => (await metrics(page, "[aria-label=switch-md]", "::after")).inset).toBe(rim + dp(SHAPE_RECIPES.switch.travel.md));
  await page.locator("#shape-fixture").evaluate((element: HTMLElement) => { element.dir = "rtl"; });
  const thumb = dp(SHAPE_RECIPES.switch.thumbWidth.md);
  await expect.poll(() => thumbEdges(page.locator("#shape-fixture [aria-label=switch-md]"))).toEqual({ left: rim, right: dp(SHAPE_RECIPES.switch.width.md) - rim - thumb });
  await page.locator("#shape-fixture").evaluate((element: HTMLElement) => { element.dir = "ltr"; });
  const checkbox = page.locator("#shape-fixture [aria-label=checkbox-md]");
  await checkbox.focus();
  await expect(checkbox).toHaveCSS("outline-width", "5px");
  const mark = await checkbox.evaluate((element) => { const style = getComputedStyle(element, "::after"); return [style.borderBottomWidth, style.borderLeftWidth]; });
  expect(mark).toEqual([px(rim), px(rim)]);
  expect((await metrics(page, "[aria-label=switch-md]", "::after")).inset).toBe(rim + dp(SHAPE_RECIPES.switch.travel.md));
});

test("[foundations.override.source-paths-only] window.__paper.sourceVars names the variables of a source override, a region that wears them re-derives its controls, and a role path throws", async ({ page }) => {
  await openHarness(page, "overrides");
  type Paper = { __paper: { sourceVars: (overrides: SourceOverrides) => Record<string, string> } };
  const vars = await page.evaluate(() => (window as unknown as Paper).__paper.sourceVars({ shape: { control: { height: { md: "40px" } }, radius: { control: { md: "9px" } } } }));
  expect(vars).toEqual({ "--pui-shape-control-height-md": "40px", "--pui-shape-radius-control-md": "9px" });
  expect((await measure(page.getByTestId("button"))).height).toBe(roleDp(tokens.shape.control.height.md));
  await page.getByTestId("override-region").evaluate((element, declarations) => {
    for (const [name, value] of Object.entries(declarations)) element.style.setProperty(name, value);
  }, vars);
  const button = await measure(page.getByTestId("button"));
  expect(button.height).toBe(40);
  expect(button.padding).toBe(roleDp(tokens.shape.control.inset.button.md, vars));
  expect(button.radius).toBe(9);
  expect((await measure(page.getByTestId("field"))).height).toBe(40);
  const refusal = await page.evaluate(() => {
    try {
      (window as unknown as Paper).__paper.sourceVars({ shape: { inset: { lg: "24px" } } } as unknown as SourceOverrides);
      return "";
    } catch (error) {
      return (error as Error).message;
    }
  });
  expect(refusal).toContain("shape.inset.lg");
});

test.describe("the plain CSS form of an override", () => {
  const warningsOf = async (page: Page, params: Record<string, string> = {}) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning" && message.text().startsWith("[paper-ui] ")) warnings.push(message.text());
    });
    await openHarness(page, "provider", params);
    await expect(page.getByTestId("mounted")).toBeVisible();
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
    return warnings;
  };

  test("[foundations.override.unknown-warning] a Provider warns once of a name the package does not emit, however deep the rule, and of nothing else", async ({ page }) => {
    const css = `
      .a { --pui-shape-control-height-huge: 1px; --pui-shape-control-height-md: 40px; }
      @media (min-width: 1px) { .b { --pui-layout-gutter: 1px; --pui-layout-shadow-floating-0: 0 0 0 0; } }
      @layer mine { .c { --pui-typography-role-body-size: 1px; --pui-color-ink-primary: red; --mine: 1; } }
    `;
    const warnings = await warningsOf(page, { css });
    await expect.poll(() => warnings.length).toBe(1);
    for (const name of ["--pui-shape-control-height-huge", "--pui-layout-gutter", "--pui-typography-role-body-size"]) expect(warnings[0]).toContain(name);
    for (const name of ["--pui-shape-control-height-md", "--pui-layout-shadow-floating-0", "--pui-color-ink-primary", "--mine"]) expect(warnings[0]).not.toContain(name);
  });

  test("[foundations.override.unknown-warning] the package's own stylesheet raises nothing, and neither do overrides that name a source", async ({ page }) => {
    const warnings = await warningsOf(page, { css: ".a { --pui-shape-control-height-md: 40px; }" });
    expect(warnings).toEqual([]);
  });

  test("[foundations.override.unknown-warning] an inline style is not read", async ({ page }) => {
    const warnings = await warningsOf(page, { custom: "--pui-shape-inline-only" });
    expect(await page.getByTestId("inline").evaluate((element) => getComputedStyle(element).getPropertyValue("--pui-shape-inline-only"))).toBe("1px");
    expect(warnings).toEqual([]);
  });

  test("[foundations.override.unknown-warning] a sheet of another origin is skipped without an error, though it is on the page", async ({ page }) => {
    const sheet = "https://styles.example/unknown.css";
    await page.route(sheet, (route) => route.fulfill({ contentType: "text/css", body: ".x { --pui-shape-cross-origin: 1px; }" }));
    const warnings = await warningsOf(page, { sheet });
    const refused = await page.evaluate((href) => {
      const loaded = [...document.styleSheets].find((candidate) => candidate.href === href);
      try {
        return loaded ? loaded.cssRules.length : "missing";
      } catch (error) {
        return (error as Error).name;
      }
    }, sheet);
    expect(refused).toBe("SecurityError");
    expect(warnings).toEqual([]);
  });
});

test("[foundations.override.portal-carry] a Floating opened inside an overriding region draws its controls with the region's source, and one opened outside keeps the defaults", async ({ page }) => {
  await mount(page);
  await page.locator("#shape-fixture").evaluate((element) => {
    element.style.setProperty("--pui-shape-control-height-md", "40px");
    element.style.setProperty("--pui-shape-space-lg", "24px");
  });
  for (const [where, height, gutter] of [["inside", 40, 24], ["outside", roleDp(tokens.shape.control.height.md), roleDp(tokens.layout.gutter)]] as const) {
    for (const presentation of ["popover", "modal"] as const) {
      const id = `${where}-${presentation}`;
      await page.getByTestId(`${id}-trigger`).click();
      await expect(page.getByTestId(id)).toBeVisible();
      expect((await measure(page.getByTestId(`${id}-button`))).height, `${id} button`).toBe(height);
      expect((await measure(page.getByTestId(`${id}-field`))).height, `${id} field`).toBe(height);
      if (presentation === "modal") expect((await measure(page.getByTestId(id).locator("xpath=.."))).padding, `${id} scrim`).toBe(gutter);
      await page.getByTestId(id).getByRole("button", { name: "Close" }).click();
      await expect(page.locator("[data-presentation]")).toHaveCount(0);
    }
  }
});

for (const [where, height, gutter, gap] of [["inside", 40, 24, 12], ["outside", roleDp(tokens.shape.control.height.md), roleDp(tokens.layout.gutter), roleDp(tokens.layout.gap.sm)]] as const) {
  for (const presentation of ["popover", "modal"] as const) {
    for (const trigger of ["above", "below"] as const) {
      for (const mount of ["page", "press"] as const) {
        test(`[foundations.override.portal-carry] [primitives.floating.open-from-start] a panel already open when it mounts takes the source of its Trigger's region: ${where}, ${presentation}, Trigger ${trigger}, focus ${mount === "page" ? "on the page" : "in another region"}`, async ({ page }) => {
          await openHarness(page, "carry", { where, presentation, trigger, mount });
          if (mount === "press") {
            await page.getByTestId("mount").focus();
            await page.keyboard.press("Enter");
          }
          const panel = page.getByTestId("panel");
          await expect(panel).toBeVisible();
          expect((await measure(page.getByTestId("button"))).height).toBe(height);
          expect((await measure(page.getByTestId("field"))).height).toBe(height);
          if (presentation === "modal") {
            expect((await measure(panel.locator("xpath=.."))).padding).toBe(gutter);
          } else {
            await expect(panel).not.toHaveAttribute("data-presence", /.*/);
            const [from, to] = [(await page.getByTestId("trigger").boundingBox())!, (await panel.boundingBox())!];
            expect(to.y - (from.y + from.height)).toBeCloseTo(gap, 1);
          }
        });
      }
    }
  }
}

test("[foundations.shape.target-reach] [foundations.shape.hit-area] a pointer inside the minimum target around a Field action's centre hits that action, and the two neighbours never share a point", async ({ page }) => {
  await mount(page);
  const named = (x: number, y: number) => page.evaluate(([px, py]) => document.elementFromPoint(px!, py!)?.closest("button")?.getAttribute("aria-label") ?? null, [x, y]);
  const inside = SHAPE_SOURCE.target.min / 2 - 1;
  for (const size of CONTROL_SIZES) {
    const actions = page.locator(`#shape-fixture [data-testid=actions-${size}] button`);
    await page.locator(`#shape-fixture [data-testid=actions-${size}]`).evaluate((element) => element.scrollIntoView({ block: "center" }));
    const [clear, reveal] = [(await actions.nth(0).boundingBox())!, (await actions.nth(1).boundingBox())!];
    expect(await actions.nth(0).getAttribute("aria-label")).toBe("Clear");
    expect(await actions.nth(1).getAttribute("aria-label")).toBe("Show password");
    for (const [box, name] of [[clear, "Clear"], [reveal, "Show password"]] as const) {
      const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
      for (const [dx, dy] of [[0, 0], [-inside, 0], [inside, 0], [0, -inside], [0, inside]] as const) expect(await named(x + dx, y + dy), `${size} ${name} at ${dx},${dy}`).toBe(name);
    }
    const gap = reveal.x - (clear.x + clear.width);
    expect(gap).toBeGreaterThan(0);
    const y = clear.y + clear.height / 2;
    expect(await named(clear.x + clear.width + 0.5, y), `${size} just past Clear`).toBe("Clear");
    expect(await named(reveal.x - 0.5, y), `${size} just before the toggle`).toBe("Show password");
  }
});

test("[foundations.shape.stroke-px] rem geometry scales together while edge strokes stay in CSS pixels", async ({ page }) => {
  await mount(page);
  const ROOT = 20;
  const ratio = ROOT / 16;
  await page.evaluate((root) => { document.documentElement.style.fontSize = `${root}px`; }, ROOT);
  const height = SHAPE_SOURCE.control.height.md * ratio;
  const line = TYPOGRAPHY_SOURCE.leading[PRESET_SPEC.textarea.md.leading] * ratio;
  const { emphasis: rim, border } = SHAPE_SOURCE.stroke;
  const mark = SHAPE_SOURCE.selection.size.md * ratio;
  const track = (mark + rim) * SHAPE_SOURCE.anatomy.switch.length;
  const thumb = mark - rim;
  const travel = track - thumb - rim - rim;
  expect((await metrics(page, "[data-testid=button-md]")).height).toBeCloseTo(height, 2);
  expect((await metrics(page, "[aria-label=switch-md]")).width).toBeCloseTo(track, 2);
  expect((await metrics(page, "[aria-label=switch-md]")).height).toBeCloseTo(mark + rim, 2);
  expect((await metrics(page, "[aria-label=switch-md]", "::after")).width).toBeCloseTo(thumb, 2);
  await expect.poll(async () => (await metrics(page, "[aria-label=switch-md]", "::after")).inset).toBeCloseTo(rim + travel, 2);
  expect((await metrics(page, "textarea[aria-label=textarea-md]")).blockPadding).toBeCloseTo((height - line) / 2, 2);
  await expect(page.locator("#shape-fixture [data-testid=field-md]")).toHaveCSS("border-top-width", px(border));
});

test("[atoms.select.native-form] Select keeps its form in a native select and the keyboard on its button, while its arrow follows scoped ink", async ({ page }) => {
  await mount(page);
  const select = page.getByRole("combobox", { name: "select-md", exact: true });
  const arrow = select.locator("+ svg");
  await page.locator("#shape-fixture").evaluate((element) => {
    element.style.setProperty("--pui-color-ink-secondary", "rebeccapurple");
    element.style.setProperty("--pui-color-ink-tertiary", "teal");
  });
  await expect(arrow).toHaveCSS("color", "rgb(0, 128, 128)");
  await chooseOption(select, "a");
  await expect(arrow).toHaveCSS("stroke", "rgb(102, 51, 153)");
  expect(await page.locator("#shape-form").evaluate((form) => new FormData(form as HTMLFormElement).get("select-md"))).toBe("a");
  await select.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(select).toHaveCSS("outline-style", "none");
  await expect(select.locator("..")).toHaveCSS("outline-style", "none");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await tab(page);
  await tab(page, { shift: true });
  await expect(select).toBeFocused();
  await expect(select.locator("..")).toHaveCSS("outline-width", px(SHAPE_SOURCE.focus.width));
  await select.locator("..").evaluate((element) => { element.style.width = "240px"; });
  expect((await select.locator("..").boundingBox())!.width).toBe(240);
  const selectBox = (await select.locator("..").boundingBox())!;
  const arrowBox = (await arrow.boundingBox())!;
  expect(selectBox.x + selectBox.width - arrowBox.x - arrowBox.width).toBe(roleDp(tokens.shape.control.inset.input.md));
  const dark = page.getByLabel("dark-select", { exact: true });
  const nested = page.getByLabel("nested-light-select", { exact: true });
  const ink = async (selector: typeof dark, role: string) => selector.evaluate((element, role) => {
    const sample = document.createElement("span");
    sample.style.color = `var(--pui-color-ink-${role})`;
    element.parentElement!.append(sample);
    const color = getComputedStyle(sample).color;
    sample.remove();
    return color;
  }, role);
  await expect(dark.locator("+ svg")).toHaveCSS("color", await ink(dark, "secondary"));
  await expect(nested.locator("+ svg")).toHaveCSS("color", await ink(nested, "tertiary"));
});

test("[foundations.shape.focus-ring] the baseline draws the ring on an element with no corners of its own and leaves its corners alone, where Link and the prose link keep theirs", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.id = "ring-probe";
    probe.tabIndex = 0;
    probe.textContent = "no corners of its own";
    document.body.prepend(probe);
  });
  await tab(page);
  const probe = page.locator("#ring-probe");
  await expect(probe).toBeFocused();
  await expect(probe).toHaveCSS("outline-style", "solid");
  await expect(probe).toHaveCSS("outline-width", px(SHAPE_SOURCE.focus.width));
  await expect(probe).toHaveCSS("outline-offset", px(SHAPE_SOURCE.focus.offset));
  await expect(probe).toHaveCSS("border-top-left-radius", "0px");

  await page.goto("/docs/foundations/shape");
  const corner = px(roleDp(tokens.shape.radius.text));
  await expect(page.getByTestId("prose").locator("a").first()).toHaveCSS("border-top-left-radius", corner);
  await openPlayground(page, "link", "Link");
  await expect(page.getByRole("link", { name: "링크", exact: true })).toHaveCSS("border-top-left-radius", corner);
});

test("[foundations.shape.radius-table] each control takes the corner its row names: control, selection, pill and full, and a Surface the surface family", async ({ page }) => {
  await mount(page);
  const { radius } = tokens.shape;
  const corner = (selector: string, role: string) => metrics(page, selector).then(({ radius: read }) => expect(read, selector).toBe(roleDp(role)));
  for (const id of ["button-md", "icon-md", "field-md", "select-md", "badge-rounded-md"]) await corner(`[data-testid=${id}]`, radius.control.md);
  await corner("textarea[aria-label=textarea-md]", radius.control.md);
  await corner("[data-testid=badge-md]", radius.pill);
  await corner("[aria-label=checkbox-md]", radius.selection);
  await corner("[aria-label=radio-md]", radius.full);
  await corner("[aria-label=switch-md]", radius.full);
  await corner("[data-testid=surface-corner]", radius.surface.sm);
});

const wear = async (page: Page, overrides: SourceOverrides) => {
  type Paper = { __paper: { sourceVars: (overrides: SourceOverrides) => Record<string, string> } };
  const vars = await page.evaluate((given) => (window as unknown as Paper).__paper.sourceVars(given), overrides);
  await page.locator("#shape-fixture").evaluate((element, declarations) => {
    for (const [name, value] of Object.entries(declarations)) element.style.setProperty(name, value);
  }, vars);
};

test("[foundations.shape.corner-by-size] a control and a rounded Badge read the corner of their own size", async ({ page }) => {
  await mount(page);
  const corners = { xs: 1, sm: 2, md: 3, lg: 5, xl: 7 } as const;
  await wear(page, { shape: { radius: { control: { xs: "1px", sm: "2px", md: "3px", lg: "5px", xl: "7px" } } } });
  for (const size of CONTROL_SIZES) {
    for (const id of ["button", "icon", "field", "select", "badge-rounded"]) {
      expect((await metrics(page, `[data-testid=${id}-${size}]`)).radius, `${id}-${size}`).toBe(corners[size]);
    }
    expect((await metrics(page, `textarea[aria-label=textarea-${size}]`)).radius, `textarea-${size}`).toBe(corners[size]);
  }
});

test("[foundations.shape.pill-not-circle] lowering radius.pill moves a pill and leaves a circle round", async ({ page }) => {
  await mount(page);
  await wear(page, { shape: { radius: { pill: "6px" } } });
  expect((await metrics(page, "[data-testid=badge-md]")).radius).toBe(6);
  expect((await metrics(page, "[aria-label=radio-md]")).radius).toBe(roleDp(tokens.shape.radius.full));
  expect((await metrics(page, "[aria-label=switch-md]")).radius).toBe(roleDp(tokens.shape.radius.full));
});

test("[foundations.shape.pill-inset] a pill Field or Select holds its value, its arrow and the value's end at a button's inset", async ({ page }) => {
  await mount(page);
  const { control } = tokens.shape;
  for (const size of CONTROL_SIZES) {
    const inset = roleDp(control.inset.button[size]);
    expect((await metrics(page, `[data-testid=field-pill-${size}]`)).padding, `field ${size}`).toBe(inset);
    const frame = page.locator(`#shape-fixture [data-testid=select-pill-${size}]`);
    const trigger = frame.getByRole("combobox");
    const [box, arrow] = [(await frame.boundingBox())!, (await trigger.locator("+ svg").boundingBox())!];
    expect(box.x + box.width - arrow.x - arrow.width, `arrow ${size}`).toBeCloseTo(inset, 1);
    const [line, room] = [await measure(frame), await measure(trigger)];
    expect(line.padding + room.padding, `value ${size}`).toBeCloseTo(inset, 1);
    const end = await trigger.evaluate((element) => parseFloat(getComputedStyle(element).paddingInlineEnd));
    expect(end + line.padding, `value end ${size}`).toBeCloseTo(inset + roleDp(control.icon[size]) + roleDp(control.gap), 1);
  }
  expect((await metrics(page, "[data-testid=field-md]")).padding).toBe(roleDp(control.inset.input.md));
});

const openShapes = async (page: Page) => {
  await openHarness(page, "shapes");
  await expect(page.getByLabel("select-small-md", { exact: true })).toBeVisible();
};

const inShapes = (page: Page, selector: string) => measure(page.locator("#shapes-fixture").locator(selector));

test("[foundations.shape.control-shapes] sharp has no corner and small reads radius.small of its own size, and the corners inside a control follow it", async ({ page }) => {
  await openShapes(page);
  const { radius, inset } = tokens.shape;
  for (const size of CONTROL_SIZES) {
    const corner = { sharp: 0, small: roleDp(radius.small[size]) };
    for (const shape of ["sharp", "small"] as const) {
      for (const id of ["button", "icon", "field", "select", "badge", "segment"]) {
        expect((await inShapes(page, `[data-testid=${id}-${shape}-${size}]`)).radius, `${id} ${shape} ${size}`).toBe(corner[shape]);
      }
      expect((await inShapes(page, `textarea[aria-label=textarea-${shape}-${size}]`)).radius, `textarea ${shape} ${size}`).toBe(corner[shape]);
      const clear = page.locator(`#shapes-fixture [data-testid=field-${shape}-${size}]`).getByRole("button");
      expect((await measure(clear)).radius, `clear ${shape} ${size}`).toBe(Math.min(corner[shape], roleDp(radius.control.xs)));
      const chosen = page.locator(`#shapes-fixture [data-testid=segment-${shape}-${size}]`).getByRole("radio", { checked: true });
      expect((await measure(chosen)).radius, `segment ${shape} ${size}`).toBe(Math.max(0, corner[shape] - roleDp(SHAPE_RECIPES.segment.inset)));
    }
  }
  for (const shape of ["sharp", "small"] as const) {
    const corner = shape === "sharp" ? 0 : roleDp(radius.small.md);
    await page.getByLabel(`select-${shape}-md`, { exact: true }).click();
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    expect((await measure(list)).radius, `list ${shape}`).toBe(corner + Math.min(corner, roleDp(inset.xs)));
    expect((await measure(list.getByRole("option").first())).radius, `option ${shape}`).toBe(corner);
    await page.keyboard.press("Escape");
    await expect(list).toBeHidden();
  }
});

test("[foundations.shape.app-shape] PaperProvider's controlShape shapes the controls under it, a control's own shape wins, and a Textarea stands rounded under pill", async ({ page }) => {
  await openShapes(page);
  const { radius } = tokens.shape;
  for (const id of ["app-button", "app-field"]) expect((await inShapes(page, `[data-testid=${id}]`)).radius, id).toBe(roleDp(radius.small.md));
  expect((await inShapes(page, "textarea[aria-label=app-textarea]")).radius).toBe(roleDp(radius.small.md));
  expect((await inShapes(page, "[data-testid=app-button-pill]")).radius).toBe(roleDp(radius.pill));
  expect((await inShapes(page, "textarea[aria-label=app-pill-textarea]")).radius).toBe(roleDp(radius.control.md));
});

test("[foundations.shape.switch-thumb] a Switch's thumb sits the rim from its end when unchecked and the rim from the other end when checked, and the ends swap right to left", async ({ page }) => {
  await openHarness(page, "marks");
  const edges = (id: string) => thumbEdges(page.getByTestId(id));
  const rim = roleDp(SHAPE_RECIPES.switch.inset);
  const far = (size: ControlSize) => roleDp(SHAPE_RECIPES.switch.width[size]) - rim - roleDp(SHAPE_RECIPES.switch.thumbWidth[size]);
  for (const size of CONTROL_SIZES) {
    const off = await edges(`switch-${size}`);
    expect(off, `${size} unchecked, left to right`).toEqual({ left: rim, right: far(size) });
    await page.getByTestId(`switch-${size}`).evaluate((element: HTMLInputElement) => { element.checked = true; });
    await expect.poll(() => edges(`switch-${size}`), `${size} checked, left to right`).toEqual({ left: far(size), right: rim });
  }
  const [off, on] = [await edges("switch-rtl-off"), await edges("switch-rtl-on")];
  expect(off).toEqual({ left: far("md"), right: rim });
  expect(on).toEqual({ left: rim, right: far("md") });
});
