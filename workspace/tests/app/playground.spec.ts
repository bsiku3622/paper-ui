import { expect, test, type Locator, type Page } from "@playwright/test";

import { INVENTORY, PRIMITIVE_GROUPS, PRIMITIVE_ORDERS } from "../../packages/paper-ui/src/inventory";
import { FOUNDATIONS, PRIMITIVE_ORDER_LABELS } from "../../app/src/site/site-core";
import { COLOR_VALUES_BY_MODE } from "../../packages/paper-ui/src/tokens/colors";
import { ALIGNS, SURFACE_RADII, SURFACE_THEMES, ICON_SIZES, JUSTIFIES, JUSTIFY_ITEMS, SPACES } from "../../packages/paper-ui/src/tokens/vocabulary";
import { pageErrors } from "../support/console";
import { openPlayground } from "../support/harness";

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

const optionsOf = (select: Locator) => select.locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
const control = (page: Page, name: string) => page.getByRole("combobox", { name, exact: true });

test("the sidebar lists the Playground in the inventory's order, with Utilities between the primitives and the Atoms", async ({ page }) => {
  await page.goto("/playground");
  const nav = sidebar(page);
  await expect(nav.getByRole("link")).toHaveText(["Overview", ...EXPECTED]);
  const text = (await nav.innerText()).split("\n");
  for (const heading of ["Foundations", "Primitives", ...Object.values(PRIMITIVE_ORDER_LABELS), ...PRIMITIVE_GROUPS, "Utilities", "Atoms"]) expect(text, heading).toContain(heading);
  // Each order's heading stands above its groups: the first order's three, then the second order's eight.
  const [first, second] = [PRIMITIVE_ORDER_LABELS.first, PRIMITIVE_ORDER_LABELS.second].map((heading) => text.indexOf(heading));
  expect(first).toBeLessThan(text.indexOf("Element"));
  expect(text.indexOf("A11y")).toBeLessThan(second!);
  expect(second).toBeLessThan(text.indexOf("Paint"));
  expect(text.indexOf("Utilities")).toBeGreaterThan(text.lastIndexOf(PRIMITIVE_ORDERS.second.at(-1)!));
  expect(text.indexOf("Utilities")).toBeLessThan(text.indexOf("Atoms"));
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
  await expect(control(page, "shape")).toBeVisible();
  await openPlayground(page, "spinner", "Spinner");
  await expect(page.getByRole("textbox", { name: "label", exact: true })).toBeVisible();
  await openPlayground(page, "button", "Button");
  expect(await optionsOf(control(page, "as"))).toEqual(["__pui_default__", "button", "a"]);
  await openPlayground(page, "divider", "Divider");
  await expect(control(page, "orientation")).toBeVisible();
  await expect(control(page, "level")).toBeVisible();
  await openPlayground(page, "box", "Box");
  for (const axis of ["padding", "paddingX", "paddingY", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "overflow", "overflowX", "overflowY"]) {
    await expect(control(page, axis), axis).toBeVisible();
  }
  await expect(control(page, "gap"), "Box does not lay children out").toHaveCount(0);
  for (const axis of ["fill", "theme", "elevation", "radius"]) await expect(control(page, axis), `Box has no ${axis}`).toHaveCount(0);
  await expect(page.getByRole("switch", { name: "border", exact: true }), "Box has no border").toHaveCount(0);
  expect(await optionsOf(control(page, "width"))).toEqual(expect.arrayContaining(["md", "measure.md", "container.content", "fit"]));
  expect(await optionsOf(control(page, "overflow"))).toEqual(["__pui_default__", "visible", "hidden", "clip", "scroll", "auto"]);
  await openPlayground(page, "surface", "Surface");
  for (const axis of ["fill", "theme", "elevation", "radius"]) await expect(control(page, axis), axis).toBeVisible();
  await expect(page.getByRole("switch", { name: "border", exact: true })).toBeVisible();
  await expect(page.getByRole("switch", { name: "inverse", exact: true })).toHaveCount(0);
  expect(await optionsOf(control(page, "radius"))).toEqual(["__pui_default__", ...SURFACE_RADII]);
  expect(await optionsOf(control(page, "theme"))).toEqual(["__pui_default__", ...SURFACE_THEMES]);
  expect(await optionsOf(control(page, "fill"))).not.toContain("none");
});

test("the layout primitives offer one alignment vocabulary, and Grid tells its tracks from its items", async ({ page }) => {
  await openPlayground(page, "stack", "Stack");
  expect(await optionsOf(control(page, "justify"))).toEqual(["__pui_default__", ...JUSTIFIES]);
  await openPlayground(page, "inline", "Inline");
  expect(await optionsOf(control(page, "align"))).toEqual(["__pui_default__", ...ALIGNS]);
  expect(await optionsOf(control(page, "rowGap"))).toEqual(["__pui_default__", ...SPACES]);
  expect(await optionsOf(control(page, "columnGap"))).toEqual(["__pui_default__", ...SPACES]);
  await openPlayground(page, "grid", "Grid");
  expect(await optionsOf(control(page, "align"))).toEqual(["__pui_default__", ...ALIGNS]);
  expect(await optionsOf(control(page, "justify"))).toEqual(["__pui_default__", ...JUSTIFIES]);
  expect(await optionsOf(control(page, "justifyItems"))).toEqual(["__pui_default__", ...JUSTIFY_ITEMS]);
  expect(await optionsOf(control(page, "rowGap"))).toEqual(["__pui_default__", ...SPACES]);
  expect(await optionsOf(control(page, "columnGap"))).toEqual(["__pui_default__", ...SPACES]);
});

test("a select names the component's real default, and the code prints the subject that is drawn", async ({ page }) => {
  await openPlayground(page, "grid", "Grid");
  await expect(control(page, "columns").locator("option").first()).toHaveText("default (1)");
  await openPlayground(page, "draggable", "Draggable");
  await expect(control(page, "activation").locator("option").first()).toHaveText("default (surface)");
  await openPlayground(page, "inline", "Inline");
  await expect(control(page, "align").locator("option").first()).toHaveText("default (center)");
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
  await expect(control(page, "size")).toHaveValue("lg");
  await expect(page.getByRole("switch", { name: "checked", exact: true })).not.toBeChecked();
  await expect(page.getByRole("textbox", { name: "label", exact: true })).toHaveValue("저장");
  await editor.fill('<Inline><Checkbox size="huge" /></Inline>');
  await expect(page.getByText(/size: "huge"/)).toBeVisible();
  await expect(control(page, "size")).toHaveValue("lg");

  await openPlayground(page, "grid", "Grid");
  await page.getByRole("button", { name: "코드 편집" }).click();
  await page.getByRole("textbox", { name: "컴포넌트 코드 편집" }).fill('<Grid columns={2} gap="sm" width="full"></Grid>');
  await expect(control(page, "columns")).toHaveValue("2");
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
  await page.getByRole("combobox", { name: "theme", exact: true }).selectOption("light");
  await expect(page.getByText("useResolvedTheme(): light", { exact: true })).toBeVisible();
  await expect(page.getByTestId("code-block").locator("pre")).toContainText('<Surface theme="light"');
  await expect(page.getByTestId("code-block").locator("pre")).toContainText("const resolved = useResolvedTheme();");
});

test("a Surface theme prints in the code, and a themed Surface without a fill paints the theme's canvas", async ({ page }) => {
  await openPlayground(page, "surface", "Surface");
  await control(page, "theme").selectOption("dark");
  await expect(page.getByTestId("code-block").locator("pre")).toContainText('theme="dark"');
  await control(page, "fill").selectOption("__pui_default__");
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
  await expect(control(page, "size")).toHaveValue("lg");
  // Reset: the controls are the defaults again, and so is the printed code.
  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(control(page, "size")).toHaveValue("__pui_default__");
  await page.getByRole("button", { name: "코드 편집 닫기" }).click();
  await expect(printed).toHaveText(initial);
  // The default labels name what the component does without a prop.
  await expect(control(page, "size").locator("option").first()).toHaveText(/^default \(/);
});
