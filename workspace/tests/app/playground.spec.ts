import { expect, test, type Page } from "@playwright/test";

import { INVENTORY, PRIMITIVE_GROUPS } from "../../packages/paper-ui/src/inventory";
import { FOUNDATIONS } from "../../app/src/site/site-core";
import { COLOR_VALUES_BY_MODE } from "../../packages/paper-ui/src/tokens/colors";
import { ACCENTS, ALIGNS, CONTROL_SIZES, LINE_SIDES, SURFACE_RADII, SURFACE_THEMES, ICON_SIZES, JUSTIFIES, JUSTIFY_ITEMS, SPACES, VARIANTS } from "../../packages/paper-ui/src/tokens/vocabulary";
import { tokens } from "../../packages/paper-ui/src/tokens";
import { pageErrors } from "../support/console";
import { roleDp } from "../support/geometry";
import { openPlayground } from "../support/harness";
import { chooseOption, nativeSelect, optionValues } from "../support/select";

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// The names the sidebar lists, in order: the Foundations, the primitive categories, Utilities, the Atoms.
const EXPECTED = [
  ...FOUNDATIONS.map(({ label }) => label),
  ...PRIMITIVE_GROUPS.flatMap((group) => INVENTORY.primitives[group].components),
  "Composition",
  "Theme",
  ...INVENTORY.atoms,
];

const sidebar = (page: Page) => page.getByRole("navigation", { name: "플레이그라운드" });

// What a Props Select offers and holds, read from the native select its form would send.
const optionsOf = optionValues;
const control = (page: Page, name: string) => page.getByRole("combobox", { name, exact: true });
// A short choice whose resting value is one of its items is a segment instead of a select: a radio group named by the prop.
const segment = (page: Page, name: string) => page.getByRole("radiogroup", { name, exact: true });
const item = (page: Page, name: string, option: string) => segment(page, name).getByRole("radio", { name: option, exact: true });

test("the sidebar lists the Playground in the inventory's order, with Utilities between the primitives and the Atoms", async ({ page }) => {
  await page.goto("/playground");
  const nav = sidebar(page);
  await expect(nav.getByRole("link")).toHaveText(["Overview", ...EXPECTED]);
  const text = (await nav.innerText()).split("\n");
  // The headings are the three groups and Utilities: the section names stay on the pages, and the two orders have none.
  expect(text.filter((line) => !["Overview", ...EXPECTED].includes(line) && line !== "").sort()).toEqual(["Atoms", "Foundations", "Primitives", "Utilities"]);
  // What parts the orders is a wider gap than the one between two rows of an order.
  const row = async (name: string) => (await nav.getByRole("link", { name, exact: true }).boundingBox())!;
  const [liveRegion, surface, paint] = [await row("LiveRegion"), await row("Surface"), await row("Paint")];
  expect(surface.y - (liveRegion.y + liveRegion.height)).toBeGreaterThan(paint.y - (surface.y + surface.height));
  expect(text.indexOf("Utilities")).toBeGreaterThan(text.indexOf("Grid"));
  expect(text.indexOf("Utilities")).toBeLessThan(text.indexOf("Atoms"));
});

test("a page far down the list opens with its row in view, and a row is a small control tall", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto("/playground/textarea");
  const row = sidebar(page).getByRole("link", { name: "Textarea", exact: true });
  await expect(row).toHaveAttribute("aria-current", "page");
  await expect(row).toBeInViewport();
  const { height } = (await row.boundingBox())!;
  expect(height).toBe(roleDp(tokens.shape.control.height.sm));
});

test("a component page titles its sections with headings, like the Overview and the Foundations pages", async ({ page }) => {
  await page.goto("/playground/button");
  for (const name of ["코드", "Props"]) await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
});

test("every sidebar page opens on its own name and marks itself current, without an error", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = pageErrors(page);
  await page.goto("/playground");
  const names = await sidebar(page).getByRole("link").allInnerTexts();
  for (const name of names.filter((entry) => entry !== "Overview")) {
    await sidebar(page).getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name, exact: true }), name).toBeVisible();
    await expect(sidebar(page).getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "page");
  }
  expect(errors).toEqual([]);
});

test("a component slug is its name in kebab case, and the old IconButton URL redirects to it", async ({ page }) => {
  await page.goto("/playground/iconbutton");
  await expect(page).toHaveURL(/\/playground\/icon-button$/);
  await expect(page.getByRole("heading", { level: 1, name: "IconButton", exact: true })).toBeVisible();
  await page.goto("/playground");
  await expect(sidebar(page).getByRole("link")).toHaveCount(EXPECTED.length + 1);
  const hrefs = await sidebar(page).getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const name of EXPECTED.slice(FOUNDATIONS.length)) expect(hrefs).toContain(`/playground/${kebab(name)}`);
});

test("the selects offer every value of their axis, among them the ones the hand lists used to miss", async ({ page }) => {
  await openPlayground(page, "stack", "Stack");
  expect(await optionsOf(control(page, "gap"))).toEqual(["__pui_default__", ...SPACES]);
  await openPlayground(page, "text", "Text");
  expect(await optionsOf(control(page, "ink"))).toContain("inherit");
  await openPlayground(page, "icon", "Icon");
  expect(await optionsOf(control(page, "ink"))).toContain("inherit");
  expect(await optionsOf(control(page, "size"))).toEqual(["__pui_default__", ...ICON_SIZES]);
});

test("the knobs that props already had now have controls", async ({ page }) => {
  await openPlayground(page, "icon-button", "IconButton");
  await expect(segment(page, "shape")).toBeVisible();
  await openPlayground(page, "spinner", "Spinner");
  await expect(page.getByRole("textbox", { name: "label", exact: true })).toBeVisible();
  await openPlayground(page, "button", "Button");
  expect(await segment(page, "as").getByRole("radio").allTextContents()).toEqual(["button", "a"]);
  await expect(item(page, "as", "button"), "the resting value is the item that shows").toBeChecked();
  await openPlayground(page, "divider", "Divider");
  await expect(segment(page, "orientation")).toBeVisible();
  await expect(segment(page, "level")).toBeVisible();
  await openPlayground(page, "box", "Box");
  for (const axis of ["padding", "paddingX", "paddingY", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "overflow", "overflowX", "overflowY"]) {
    await expect(control(page, axis), axis).toBeVisible();
  }
  await expect(control(page, "gap"), "Box does not lay children out").toHaveCount(0);
  for (const axis of ["fill", "theme", "elevation", "radius"]) await expect(control(page, axis), `Box has no ${axis}`).toHaveCount(0);
  await expect(control(page, "border"), "Box has no border").toHaveCount(0);
  expect(await optionsOf(control(page, "width"))).toEqual(expect.arrayContaining(["md", "measure.md", "container.content", "fit"]));
  expect(await optionsOf(control(page, "overflow"))).toEqual(["__pui_default__", "visible", "hidden", "clip", "scroll", "auto"]);
  await openPlayground(page, "surface", "Surface");
  for (const axis of ["fill", "theme", "elevation", "radius"]) await expect(control(page, axis), axis).toBeVisible();
  expect(await optionsOf(control(page, "border"))).toEqual(["__pui_default__", "true", ...LINE_SIDES]);
  await expect(page.getByRole("switch", { name: "inverse", exact: true })).toHaveCount(0);
  expect(await optionsOf(control(page, "radius"))).toEqual(["__pui_default__", ...SURFACE_RADII]);
  expect(await optionsOf(control(page, "theme"))).toEqual(["__pui_default__", ...SURFACE_THEMES]);
  expect(await optionsOf(control(page, "fill"))).not.toContain("none");
});

test("the layout primitives offer one alignment vocabulary, and Grid tells its tracks from its items", async ({ page }) => {
  await openPlayground(page, "stack", "Stack");
  expect(await optionsOf(control(page, "justify"))).toEqual(["__pui_default__", ...JUSTIFIES]);
  await openPlayground(page, "inline", "Inline");
  // Inline's root already aligns to the centre, so the default is one of the choices and there is no extra item for it.
  expect(await optionsOf(control(page, "align"))).toEqual([...ALIGNS]);
  expect(await optionsOf(control(page, "rowGap"))).toEqual(["__pui_default__", ...SPACES]);
  expect(await optionsOf(control(page, "columnGap"))).toEqual(["__pui_default__", ...SPACES]);
  await openPlayground(page, "grid", "Grid");
  expect(await optionsOf(control(page, "align"))).toEqual(["__pui_default__", ...ALIGNS]);
  expect(await optionsOf(control(page, "justify"))).toEqual(["__pui_default__", ...JUSTIFIES]);
  expect(await optionsOf(control(page, "justifyItems"))).toEqual(["__pui_default__", ...JUSTIFY_ITEMS]);
  expect(await optionsOf(control(page, "rowGap"))).toEqual(["__pui_default__", ...SPACES]);
  expect(await optionsOf(control(page, "columnGap"))).toEqual(["__pui_default__", ...SPACES]);
});

test("a select names the component's real default, a segment leaves the prop out when its default is picked, and the code prints the subject that is drawn", async ({ page }) => {
  const code = page.getByTestId("code-block").locator("pre");
  await openPlayground(page, "grid", "Grid");
  await expect(item(page, "columns", "3")).toBeChecked();
  await expect(code).toContainText("columns=");
  await item(page, "columns", "1").click();
  await expect(item(page, "columns", "1")).toBeChecked();
  await expect(code).not.toContainText("columns=");
  await openPlayground(page, "draggable", "Draggable");
  await expect(code).toContainText("activation=");
  await item(page, "activation", "surface").click();
  await expect(code).not.toContainText("activation=");
  await openPlayground(page, "inline", "Inline");
  await expect(nativeSelect(control(page, "align")).locator('option[value="center"]')).toHaveText("center (default)");
  await expect(control(page, "align")).toHaveText("center (default)");
  await expect(page.getByTestId("code-block").locator("pre")).not.toContainText("align=");
  await openPlayground(page, "surface", "Surface");
  await expect(page.getByTestId("code-block").locator("pre")).toContainText('<Surface fill="raised" radius="md" padding="md" width="md">');
  await openPlayground(page, "field", "Field");
  await page.getByRole("switch", { name: "leading(검색 아이콘)", exact: true }).check();
  await expect(page.getByTestId("code-block").locator("pre")).toContainText('<circle cx="11" cy="11" r="7" />');
});

test("editing the code moves the controls, and code that cannot be read says so", async ({ page }) => {
  await openPlayground(page, "checkbox", "Checkbox");
  await page.getByRole("button", { name: "코드 편집" }).click();
  const editor = page.getByRole("textbox", { name: "컴포넌트 코드 편집" });
  await expect(editor).toContainText("<Checkbox checked");
  await editor.fill('<Inline as="label" gap="sm" align="center">\n  <Checkbox size="lg" />\n  <Text variant="body" as="span">저장</Text>\n</Inline>');
  await expect(nativeSelect(control(page, "size"))).toHaveValue("lg");
  await expect(page.getByRole("switch", { name: "checked", exact: true })).not.toBeChecked();
  await expect(page.getByRole("textbox", { name: "label", exact: true })).toHaveValue("저장");
  await editor.fill('<Inline><Checkbox size="huge" /></Inline>');
  await expect(page.getByText(/size: "huge"/)).toBeVisible();
  await expect(nativeSelect(control(page, "size"))).toHaveValue("lg");

  await openPlayground(page, "grid", "Grid");
  await page.getByRole("button", { name: "코드 편집" }).click();
  await page.getByRole("textbox", { name: "컴포넌트 코드 편집" }).fill('<Grid columns={2} gap="sm" width="full"></Grid>');
  await expect(item(page, "columns", "2")).toBeChecked();
});

test("the preview background switch is one group with one choice", async ({ page }) => {
  await openPlayground(page, "button", "Button");
  const group = page.getByRole("group", { name: "미리보기 배경" });
  await expect(group.getByRole("button", { pressed: true })).toHaveCount(1);
  await group.getByRole("button", { name: "sunken background" }).click();
  await expect(page.locator("[data-preview-background]")).toHaveAttribute("data-preview-background", "sunken");
  await expect(group.getByRole("button", { name: "sunken background" })).toHaveAttribute("aria-pressed", "true");
  await expect(group.getByRole("button", { pressed: true })).toHaveCount(1);
});

test("the preview background swatches draw their ring from Pressable: for the keyboard and not for the pointer", async ({ page }) => {
  await openPlayground(page, "button", "Button");
  const group = page.getByRole("group", { name: "미리보기 배경" });
  const sunken = group.getByRole("button", { name: "sunken background" });
  await sunken.click();
  await expect(sunken).toBeFocused();
  await expect(sunken).not.toHaveAttribute("data-focus-visible", /.*/);
  await expect(sunken).toHaveCSS("outline-style", "none");
  await page.keyboard.press("ArrowRight");
  const track = group.getByRole("button", { name: "track background" });
  await expect(track).toBeFocused();
  await expect(track).toHaveAttribute("data-focus-visible", "true");
  await expect(track).toHaveCSS("outline-style", "solid");
});

test("the Theme page shows the hooks: the scope's resolved theme and the page's own", async ({ page }) => {
  await openPlayground(page, "theme", "Theme");
  await expect(page.getByText("useResolvedTheme(): dark", { exact: true })).toBeVisible();
  await expect(page.getByText(/^useTheme\(\): theme=.*, resolved=light$/)).toBeVisible();
  await item(page, "theme", "light").click();
  await expect(page.getByText("useResolvedTheme(): light", { exact: true })).toBeVisible();
  await expect(page.getByTestId("code-block").locator("pre")).toContainText('<Surface theme="light"');
  await expect(page.getByTestId("code-block").locator("pre")).toContainText("const resolved = useResolvedTheme();");
});

test("a Surface theme prints in the code, and a themed Surface without a fill paints the theme's canvas", async ({ page }) => {
  await openPlayground(page, "surface", "Surface");
  await chooseOption(control(page, "theme"), "dark");
  await expect(page.getByTestId("code-block").locator("pre")).toContainText('theme="dark"');
  await chooseOption(control(page, "fill"), "__pui_default__");
  const box = page.getByText("fill=none", { exact: true }).locator("..");
  await expect(box).toHaveAttribute("data-pui-theme", "dark");
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(COLOR_VALUES_BY_MODE.dark.bg.canvas.slice(at, at + 2), 16));
  await expect(box).toHaveCSS("background-color", `rgb(${r}, ${g}, ${b})`);
});

test("the Motion page lists the theme role as instant, with a Surface that swaps theme", async ({ page }) => {
  await openPlayground(page, "foundations/motion", "Motion");
  const row = page.getByText("motion.role.theme", { exact: true }).locator("xpath=ancestor::div[2]");
  await expect(row).toContainText("0ms");
  await expect(row).toContainText("linear");
  await expect(row.locator("[data-pui-theme]")).toHaveCount(0);
  await row.getByRole("button", { name: "전환" }).click();
  await expect(row.locator("[data-pui-theme]")).toHaveCount(1);
});

test("[atoms.segment.radiogroup] keeps its chip over the chosen item when its variant goes to outline and back to the track", async ({ page }) => {
  await openPlayground(page, "segment-control", "SegmentControl");
  const preview = page.getByRole("radiogroup", { name: "기간", exact: true });
  const chip = preview.locator(":scope > span[aria-hidden=true]");
  const chosen = preview.getByRole("radio", { name: "7일", exact: true });
  await item(page, "variant", "outline").click();
  await expect(chip).toHaveCount(0);
  await item(page, "variant", "track").click();
  await expect(chip).toHaveCount(1);
  await expect(async () => {
    const [a, b] = [await chip.boundingBox(), await chosen.boundingBox()];
    expect(Math.abs(a!.x - b!.x), "left").toBeLessThan(1);
    expect(Math.abs(a!.width - b!.width), "width").toBeLessThan(1);
  }).toPass();
});

test("[app.playground.reference] an Atom page sets out its props with their types and defaults, and every crossing of its axes as a picture on the preview's ground", async ({ page }) => {
  await openPlayground(page, "button", "Button");
  await expect(page.getByRole("heading", { level: 2, name: "Props 표", exact: true })).toBeVisible();
  // A row of the table: the prop, its values and its default.
  const row = (prop: string) => page.getByRole("main").locator("code").filter({ hasText: new RegExp(`^${prop}$`) }).locator("xpath=../..");
  await expect(row("variant")).toContainText(VARIANTS.join(" · "));
  await expect(row("variant")).toContainText("solid");
  await expect(row("loading")).toContainText("boolean");
  await expect(row("badge")).toContainText("ReactNode");
  // The crossing is accent by variant, and the strips move size, shape and fill one at a time.
  await expect(page.getByRole("heading", { level: 2, name: "모든 조합", exact: true })).toBeVisible();
  const sheet = page.getByTestId("variant-sheet");
  await expect(sheet.locator("[data-sheet=matrix] button")).toHaveCount(ACCENTS.length * VARIANTS.length);
  await expect(sheet.locator("[data-sheet=strip]")).toHaveCount(3);
  await expect(sheet.locator("[data-sheet=strip]").first().locator("button")).toHaveCount(CONTROL_SIZES.length);
  await expect(sheet).toContainText("solid (default)");
  // A picture: nothing in it takes focus or a press, and assistive technology reads the preview's button only.
  await expect(sheet).toHaveAttribute("inert", "");
  await expect(sheet).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("button", { name: "버튼", exact: true })).toHaveCount(1);
  // It stands on the ground the preview stands on.
  await page.getByRole("group", { name: "미리보기 배경" }).getByRole("button", { name: "sunken background" }).click();
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(COLOR_VALUES_BY_MODE.light.bg.sunken.slice(at, at + 2), 16));
  await expect(sheet).toHaveCSS("background-color", `rgb(${r}, ${g}, ${b})`);
  // A Primitive page has neither.
  await openPlayground(page, "box", "Box");
  await expect(page.getByRole("heading", { level: 2, name: "Props 표", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("variant-sheet")).toHaveCount(0);
});

test("[app.playground.code-panel] the code panel copies what it prints, applies an edit to the controls, and a reset puts the defaults and their code back", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openPlayground(page, "checkbox", "Checkbox");
  const printed = page.getByTestId("code-block").locator("pre");
  const initial = await printed.innerText();
  // Copy: the button says it has, and the clipboard holds the printed code.
  await page.getByRole("button", { name: "복사", exact: true }).click();
  await expect(page.getByRole("button", { name: "복사됨", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(initial);
  // Edit and apply: code that can be read moves the controls and the preview with it.
  await page.getByRole("button", { name: "코드 편집" }).click();
  await page.getByRole("textbox", { name: "컴포넌트 코드 편집" }).fill('<Inline as="label" gap="sm" align="center">\n  <Checkbox size="lg" />\n  <Text variant="body" as="span">저장</Text>\n</Inline>');
  await expect(nativeSelect(control(page, "size"))).toHaveValue("lg");
  // Reset: the controls are the defaults again, and so is the printed code.
  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(control(page, "size")).toHaveText(/ \(default\)$/);
  await page.getByRole("button", { name: "코드 편집 닫기" }).click();
  await expect(printed).toHaveText(initial);
  // The default is marked on the option that is what the component does without a prop.
  expect((await nativeSelect(control(page, "size")).locator("option").allTextContents()).filter((label) => label.endsWith(" (default)"))).toHaveLength(1);
});
