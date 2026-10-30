import { expect, test, type Locator, type Page } from "@playwright/test";

import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { tokens, CONTROL_SIZES, STATUSES, SURFACE_FILLS, TEXT_VARIANTS, VARIANTS, type ControlSize, type TextVariant } from "../../packages/paper-ui/src/tokens";
import { pageErrors } from "../support/console";
import { expectStyle, profile, type Style } from "../support/style";

// The Overview is the index of specimens: every kept testid is bound here to the computed value its
// specimen has to show. Expected values come from the token references and the recipes, which a probe
// element placed beside the specimen resolves to the same computed value the specimen's own rule yields.

const role = (variant: TextVariant) => {
  const spec = tokens.typography.role[variant];
  return { fontSize: spec.size, fontWeight: spec.weight, lineHeight: spec.leading, letterSpacing: spec.tracking };
};
const radius = (value: string): Style => ({ borderTopLeftRadius: value, borderTopRightRadius: value, borderBottomLeftRadius: value, borderBottomRightRadius: value });
const height = (size: ControlSize): Style => ({ height: tokens.shape.control.height[size] });
const px = (value: string) => `${parseFloat(value)}px`;

// A field-like control stands in a wrapper: the style of an input or a select is the style of its parent.
const boxStyle = async (control: Locator, expected: Style) => expectStyle(control.locator("xpath=self::*[not(self::select or self::input)] | self::select/.. | self::input/.."), expected);

const open = async (page: Page) => {
  const errors = pageErrors(page);
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1, name: "Playground" })).toBeVisible();
  return errors;
};

const SECTIONS = ["Type scale", "Color", "Surface · 면", "Button", "Field · Label · Select · Checkbox", "Badge · Divider · Link · Icon"];

test("every section of the Overview is a heading with specimens under it and renders without an error", async ({ page }) => {
  const errors = await open(page);
  for (const [index, title] of SECTIONS.entries()) {
    const heading = page.getByRole("heading", { level: 2, name: title, exact: true });
    await expect(heading).toBeVisible();
    const section = page.locator("section").filter({ has: heading });
    expect(await section.locator("[data-testid]").count(), title).toBeGreaterThan(index === 0 ? 5 : 2);
  }
  expect(errors).toEqual([]);
});

test("the Type scale shows each text role as its role", async ({ page }) => {
  await open(page);
  for (const variant of TEXT_VARIANTS) await expectStyle(page.getByTestId(`text-${variant}`), role(variant));
  const { fontWeight, lineHeight } = role("body");
  await expectStyle(page.getByTestId("text-mono"), { fontWeight, lineHeight, fontFamily: tokens.typography.palette.family.mono });
});

test("the Color section shows each surface and each accent's solid and ink", async ({ page }) => {
  await open(page);
  for (const surface of SURFACE_FILLS) await expectStyle(page.getByTestId(`swatch-paper-${surface}`), { backgroundColor: tokens.color.bg[surface] });
  for (const accent of STATUSES) {
    await expectStyle(page.getByTestId(`dot-${accent}`), { backgroundColor: tokens.color.accent[accent].solid, ...radius(tokens.shape.radius.full) });
    await expectStyle(page.getByTestId(`ink-${accent}`), { color: tokens.color.accent[accent].ink });
  }
});

test("the Surface section draws the hairline and the three surface radii from the tokens", async ({ page }) => {
  await open(page);
  await expectStyle(page.getByTestId("surface-border"), { borderTopStyle: "solid", borderTopWidth: tokens.shape.stroke.border, borderTopColor: tokens.color.border.base });
  const radii = { small: tokens.shape.radius.surface.sm, card: tokens.shape.radius.surface.md, large: tokens.shape.radius.surface.lg };
  const group = page.getByTestId("spec-layout-radius");
  await expect(group.locator("[data-testid^=radius-]")).toHaveCount(3);
  for (const [name, value] of Object.entries(radii)) {
    const specimen = page.getByTestId(`radius-${name}`);
    await expectStyle(specimen, radius(value));
    const drawn = px(await specimen.evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
    await expect(specimen).toHaveText(`${drawn} · ${name}`);
    await expect(group).toContainText(`${drawn}`);
  }
});

test("the Button section shows each variant, accent, size, state and shape as the recipes and the ladder say", async ({ page }) => {
  await open(page);
  const variants = page.getByTestId("spec-button-variants");
  await expect(variants.getByRole("button")).toHaveCount(VARIANTS.length);
  for (const variant of VARIANTS) await expectStyle(page.getByTestId(`btn-${variant}`), profile("primary", variant));
  await expectStyle(page.getByTestId("btn-danger"), profile("error", "solid"));
  await expectStyle(page.getByTestId("btn-soft-success"), profile("success", "soft"));
  await expectStyle(page.getByTestId("btn-soft-warning"), profile("warning", "soft"));

  const sizes = page.getByTestId("spec-button-sizes");
  await expect(sizes.getByRole("button")).toHaveCount(CONTROL_SIZES.length);
  for (const size of CONTROL_SIZES) {
    await expectStyle(page.getByTestId(`btn-${size}`), { ...height(size), ...radius(tokens.shape.radius.control), paddingLeft: tokens.shape.control.inset.button[size] });
  }

  const disabled = page.getByTestId("btn-disabled");
  await expect(disabled).toBeDisabled();
  await expectStyle(disabled, { cursor: "not-allowed" });
  const loading = page.getByTestId("btn-loading");
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveAttribute("aria-busy", "true");
  expect(await loading.locator("[aria-hidden]").evaluate((element) => getComputedStyle(element).animationName)).not.toBe("none");
  await expectStyle(page.getByTestId("btn-icononly"), { width: tokens.shape.control.height.md, ...height("md") });
  const full = page.getByTestId("btn-fullwidth");
  expect(await full.evaluate((element) => element.getBoundingClientRect().width)).toBe(await full.evaluate((element) => element.parentElement!.getBoundingClientRect().width));

  await expect(page.getByTestId("spec-button-shape").getByRole("button")).toHaveCount(4);
  await expectStyle(page.getByTestId("btn-shape-default"), radius(tokens.shape.radius.control));
  await expectStyle(page.getByTestId("btn-shape-pill"), radius(tokens.shape.radius.full));
});

test("a Field and a Button side by side share one height and one centre line", async ({ page }) => {
  await open(page);
  const group = page.getByTestId("spec-align");
  const field = group.getByTestId("align-field");
  const button = group.getByTestId("align-button");
  await expectStyle(field, height("md"));
  await expectStyle(button, height("md"));
  const centre = (target: Locator) => target.evaluate((element) => element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2);
  expect(await centre(field)).toBeCloseTo(await centre(button), 0);
});

test("the Field specimens show their status, their adornments and the password toggle", async ({ page }) => {
  await open(page);
  await expectStyle(page.getByTestId("field-default"), { borderTopColor: tokens.color.border.base });
  await expectStyle(page.getByTestId("field-invalid"), { borderTopColor: tokens.color.accent.error.ink });
  await expect(page.getByTestId("field-invalid").locator("input")).toHaveAttribute("aria-invalid", "true");

  const clearable = page.getByTestId("field-clearable");
  await expect(clearable.locator("input")).toHaveValue("지울 값");
  await clearable.getByRole("button").click();
  await expect(clearable.locator("input")).toHaveValue("");

  const password = page.getByTestId("field-password");
  await expect(password.locator("input")).toHaveAttribute("type", "password");
  await password.getByRole("button").click();
  await expect(password.locator("input")).toHaveAttribute("type", "text");

  const select = page.getByTestId("select");
  expect(await select.evaluate((element) => element.tagName)).toBe("SELECT");
  expect(await select.locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))).toEqual(["", "a", "b"]);
});

test("Field, Select and Button of one size share the ladder's height", async ({ page }) => {
  await open(page);
  for (const size of CONTROL_SIZES) {
    const group = page.getByTestId(`spec-size-${size}`);
    await boxStyle(group.getByLabel(`field ${size}`), height(size));
    await boxStyle(group.getByLabel(`select ${size}`), height(size));
    await expectStyle(group.getByRole("button", { name: "Button" }), height(size));
  }
  await boxStyle(page.getByTestId("spec-size-md").getByLabel("field md"), radius(tokens.shape.radius.control));
});

test("the controls of the base row share one corner and each its own inset", async ({ page }) => {
  await open(page);
  const row = page.getByTestId("spec-control-base");
  const corner = radius(tokens.shape.radius.control);
  await expectStyle(row.getByTestId("base-button"), { ...corner, paddingLeft: tokens.shape.control.inset.button.md });
  await expectStyle(row.getByTestId("base-field"), { ...corner, paddingLeft: tokens.shape.control.inset.input.md });
  await boxStyle(row.getByTestId("base-select"), { ...corner, paddingLeft: tokens.shape.control.inset.input.md });
  await expectStyle(row.getByTestId("base-textarea"), corner);
});

test("the pill row draws the Field, the Select and the Button with one full curve", async ({ page }) => {
  await open(page);
  const row = page.getByTestId("spec-pill-row");
  const pill = radius(tokens.shape.radius.full);
  await expectStyle(row.getByTestId("field-pill"), pill);
  await boxStyle(row.getByTestId("select-pill"), pill);
  await expectStyle(row.getByTestId("button-pill-row"), pill);
});

test("the Checkbox specimen follows its checked state from the surface to the primary solid", async ({ page }) => {
  await open(page);
  const checkbox = page.getByTestId("checkbox");
  await expect(checkbox).toBeChecked();
  await expectStyle(checkbox, { backgroundColor: tokens.color.accent.primary.solid });
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();
  await expectStyle(checkbox, { backgroundColor: tokens.color.bg.raised, borderTopColor: tokens.color.border.strong });
});

test("the marks stand at their boundaries and sizes, the off ones on the strong border", async ({ page }) => {
  await open(page);
  const marks = page.getByTestId("spec-marks");
  await expectStyle(marks.getByTestId("mark-checkbox"), { backgroundColor: tokens.color.accent.primary.solid });
  await expectStyle(marks.getByTestId("mark-checkbox-off"), { backgroundColor: tokens.color.bg.raised, borderTopColor: tokens.color.border.strong });
  await expectStyle(marks.getByTestId("mark-radio"), { borderTopColor: tokens.color.accent.primary.solid });
  await expectStyle(marks.getByTestId("mark-radio-off"), { borderTopColor: tokens.color.border.strong });
  await expectStyle(marks.getByTestId("mark-switch"), { backgroundColor: tokens.color.accent.primary.solid });
  await expectStyle(marks.getByTestId("mark-icon"), { width: tokens.shape.icon.size.body, height: tokens.shape.icon.size.body });
  await expectStyle(marks.getByTestId("mark-spinner"), { width: tokens.shape.control.icon.md, height: tokens.shape.control.icon.md });
  expect(await marks.getByTestId("mark-badge").evaluate((element) => getComputedStyle(element).height)).toBe(`${SHAPE_SOURCE.anatomy.badge.height.md}px`);
  await expectStyle(marks.getByTestId("mark-button"), height("sm"));
});

test("a Label points at its Field", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("formfield-field").locator("input")).toHaveAccessibleName("이름");
});

test("the Badge section shows each status in the soft recipe, the sizes by height and the shapes by curve", async ({ page }) => {
  await open(page);
  for (const status of STATUSES) await expectStyle(page.getByTestId(`badge-${status}`), profile(status, "soft"));
  await expectStyle(page.getByTestId("badge-neutral"), profile("primary", "soft"));

  const sizes = page.getByTestId("spec-badge-size");
  await expect(sizes.locator("[data-testid^=badge-]")).toHaveCount(CONTROL_SIZES.length);
  for (const size of CONTROL_SIZES) {
    await expectStyle(page.getByTestId(`badge-${size}`), { height: `${SHAPE_SOURCE.anatomy.badge.height[size]}px`, fontSize: tokens.typography.preset.badge.size });
  }

  await expect(page.getByTestId("spec-badge-shape").locator("[data-testid^=badge-shape-]")).toHaveCount(2);
  await expectStyle(page.getByTestId("badge-shape-default"), radius(tokens.shape.radius.control));
  await expectStyle(page.getByTestId("badge-shape-pill"), radius(tokens.shape.radius.full));
});

test("the Link takes the link role and the Icon the body artboard", async ({ page }) => {
  await open(page);
  await expectStyle(page.getByTestId("link"), { color: tokens.color.interaction.link });
  await expectStyle(page.getByTestId("icon"), { width: tokens.shape.icon.size.body, height: tokens.shape.icon.size.body });
});

test("the specimen groups name their members", async ({ page }) => {
  await open(page);
  for (const [group, members] of Object.entries({
    "spec-button-sizes": CONTROL_SIZES.map((size) => `btn-${size}`),
    "spec-badge-size": CONTROL_SIZES.map((size) => `badge-${size}`),
    "spec-marks": ["mark-checkbox", "mark-checkbox-off", "mark-radio", "mark-radio-off", "mark-switch", "mark-icon", "mark-spinner", "mark-badge", "mark-button"],
    "spec-align": ["align-field", "align-button"],
  })) {
    for (const member of members) await expect(page.getByTestId(group).getByTestId(member), `${group} ${member}`).toHaveCount(1);
  }
});


test("every testid on the Overview is one the tests above bind to a value", async ({ page }) => {
  await open(page);
  const bound = [
    ...TEXT_VARIANTS.map((variant) => `text-${variant}`), "text-mono",
    ...SURFACE_FILLS.map((surface) => `swatch-paper-${surface}`),
    ...STATUSES.flatMap((status) => [`dot-${status}`, `ink-${status}`, `badge-${status}`]),
    "surface-border", "spec-layout-radius", "radius-small", "radius-card", "radius-large",
    "spec-button-variants", ...VARIANTS.map((variant) => `btn-${variant}`), "btn-danger", "btn-soft-success", "btn-soft-warning",
    "spec-button-sizes", ...CONTROL_SIZES.flatMap((size) => [`btn-${size}`, `spec-size-${size}`, `badge-${size}`]),
    "btn-disabled", "btn-loading", "btn-icononly", "btn-fullwidth", "spec-button-shape", "btn-shape-default", "btn-shape-pill",
    "spec-align", "align-field", "align-button",
    "field-default", "field-invalid", "field-clearable", "field-password", "select",
    "spec-control-base", "base-button", "base-field", "base-select", "base-textarea",
    "spec-pill-row", "field-pill", "select-pill", "button-pill-row",
    "checkbox",
    "spec-marks", "mark-checkbox", "mark-checkbox-off", "mark-radio", "mark-radio-off", "mark-switch", "mark-icon", "mark-spinner", "mark-badge", "mark-button",
    "formfield-field",
    "badge-neutral", "spec-badge-size", "spec-badge-shape", "badge-shape-default", "badge-shape-pill",
    "link", "icon",
  ];
  const present = await page.locator("[data-testid]").evaluateAll((elements) => [...new Set(elements.map((element) => element.getAttribute("data-testid")!))]);
  expect(present.sort()).toEqual([...new Set(bound)].sort());
});
