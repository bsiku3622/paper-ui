import { expect, test, type Locator, type Page } from "@playwright/test";

import { INVENTORY, PRIMITIVE_GROUPS } from "../../packages/paper-ui/src/inventory";
import { FOUNDATIONS } from "../../app/src/site/site-core";
import { ICON_SIZES, SPACES } from "../../packages/paper-ui/src/tokens/vocabulary";
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
  for (const heading of ["Foundations", "Primitives", ...PRIMITIVE_GROUPS, "Utilities", "Atoms"]) expect(text, heading).toContain(heading);
  expect(text.indexOf("Utilities")).toBeGreaterThan(text.indexOf("A11y"));
  expect(text.indexOf("Utilities")).toBeLessThan(text.indexOf("Atoms"));
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
  for (const axis of ["surface", "elevation", "radius", "padding", "paddingX", "paddingY", "gap", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "overflow", "overflowX", "overflowY"]) {
    await expect(control(page, axis), axis).toBeVisible();
  }
  for (const flag of ["border", "inverse"]) await expect(page.getByRole("switch", { name: flag, exact: true })).toBeVisible();
  expect(await optionsOf(control(page, "surface"))).not.toContain("none");
});

test("a select names the component's real default, and the code prints the subject that is drawn", async ({ page }) => {
  await openPlayground(page, "grid", "Grid");
  await expect(control(page, "columns").locator("option").first()).toHaveText("default (1)");
  await openPlayground(page, "draggable", "Draggable");
  await expect(control(page, "activation").locator("option").first()).toHaveText("default (surface)");
  await openPlayground(page, "box", "Box");
  await expect(page.locator(".code-block pre")).toContainText('<Box surface="raised" radius="md" width="md">');
  await openPlayground(page, "field", "Field");
  await page.getByRole("switch", { name: "leading(검색 아이콘)", exact: true }).check();
  await expect(page.locator(".code-block pre")).toContainText('<circle cx="11" cy="11" r="7" />');
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

test("the Theme page shows the hooks: the scope's resolved theme and the page's own", async ({ page }) => {
  await openPlayground(page, "theme", "Theme");
  await expect(page.getByText("useResolvedTheme(): dark", { exact: true })).toBeVisible();
  await expect(page.getByText(/^useTheme\(\): theme=.*, resolved=light$/)).toBeVisible();
  await page.getByRole("combobox", { name: "theme", exact: true }).selectOption("light");
  await expect(page.getByText("useResolvedTheme(): light", { exact: true })).toBeVisible();
  await expect(page.locator(".code-block pre")).toContainText('<ThemeScope theme="light">');
  await expect(page.locator(".code-block pre")).toContainText("const resolved = useResolvedTheme();");
});
