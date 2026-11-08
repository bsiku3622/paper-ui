import { expect, test, type Locator, type Page } from "@playwright/test";

import { INVENTORY } from "../../packages/paper-ui/src/inventory";
import { accentProfile } from "../../packages/paper-ui/src/tokens/color-recipes";
import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape";
import { TYPOGRAPHY } from "../../packages/paper-ui/src/tokens/typography";
import {
  tokens, CHOICE_STATUSES, CONTROL_SIZES, INPUT_VARIANTS, SEGMENT_VARIANTS, STATUSES, SURFACE_FILLS, TEXT_VARIANTS, VARIANTS, type ControlSize, type TextVariant,
} from "../../packages/paper-ui/src/tokens";
import { pageErrors } from "../support/console";
import { roleDp } from "../support/geometry";
import { chooseOption } from "../support/select";
import { expectStyle, profile, type Style } from "../support/style";

const role = (variant: TextVariant) => {
  const spec = tokens.typography.role[variant];
  return { fontSize: spec.size, fontWeight: spec.weight, lineHeight: spec.leading, letterSpacing: spec.tracking };
};
const radius = (value: string): Style => ({ borderTopLeftRadius: value, borderTopRightRadius: value, borderBottomLeftRadius: value, borderBottomRightRadius: value });
const height = (size: ControlSize): Style => ({ height: tokens.shape.control.height[size] });
const px = (value: string) => `${parseFloat(value)}px`;

const boxStyle = async (control: Locator, expected: Style) => expectStyle(control.locator("xpath=self::*[not(self::select or self::input or @role='combobox')] | self::select/.. | self::input/.. | self::*[@role='combobox']/.."), expected);
const edgeInset = (target: Locator) => target.evaluate((element) => { const s = getComputedStyle(element); return parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth); });

const open = async (page: Page) => {
  const errors = pageErrors(page);
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
  return errors;
};

const MONO_ROWS = ["title", "body"] as const;

const SECTIONS = ["Type scale", "Color", "Surface · 면", "Atoms", "정렬 · 조합", "그 밖의 Atom"];

const BOARDS = {
  Button: { slug: "button", rows: VARIANTS.length },
  IconButton: { slug: "icon-button", rows: VARIANTS.length },
  Badge: { slug: "badge", rows: VARIANTS.length },
  Field: { slug: "field", rows: INPUT_VARIANTS.length },
  Select: { slug: "select", rows: INPUT_VARIANTS.length },
  Textarea: { slug: "textarea", rows: INPUT_VARIANTS.length },
  Checkbox: { slug: "checkbox", rows: 3 },
  Radio: { slug: "radio", rows: 2 },
  Switch: { slug: "switch", rows: 2 },
  SegmentControl: { slug: "segment-control", rows: SEGMENT_VARIANTS.length },
  Slider: { slug: "slider", rows: CHOICE_STATUSES.length + 1 },
  Spinner: { slug: "spinner", rows: 1 },
} as const;
const SIZELESS = ["Label", "Divider", "Link", "Marker"];

const board = (page: Page, name: keyof typeof BOARDS) => page.getByTestId(`board-${BOARDS[name].slug}`);
const cell = (page: Page, name: keyof typeof BOARDS, key: string) => board(page, name).locator(`[data-cell="${key}"]`);
const choose = (page: Page, name: keyof typeof BOARDS, state: string) => board(page, name).getByRole("radiogroup", { name: `${name} 상태` }).getByRole("radio", { name: state, exact: true }).click();
const tint = (color: string): Style => ({ backgroundImage: `linear-gradient(${color}, ${color})` });
const hoverTint = (variant: "solid" | "soft") => {
  const { hover } = accentProfile("primary", variant);
  if (!("tint" in hover)) throw new Error(`${variant} answers a hover by its border`);
  return hover.tint;
};
const ring: Style = { outlineStyle: "solid", outlineColor: tokens.color.interaction.focus, outlineWidth: tokens.shape.focus.width };

test("[app.playground.overview-boards] gives every Atom with a size a board: its name, every value of its axis against every size, and the way to its page", async ({ page }) => {
  await open(page);
  expect(Object.keys(BOARDS).sort()).toEqual(INVENTORY.atoms.filter((atom) => !SIZELESS.includes(atom)).sort());
  await expect(page.locator("[data-testid^=board-]")).toHaveCount(Object.keys(BOARDS).length);
  for (const [name, { slug, rows }] of Object.entries(BOARDS) as [keyof typeof BOARDS, (typeof BOARDS)[keyof typeof BOARDS]][]) {
    const here = board(page, name);
    await expect(here.getByRole("heading", { level: 3, name, exact: true })).toBeVisible();
    await expect(here.locator("[data-cell]"), name).toHaveCount(rows * CONTROL_SIZES.length);
    await expect(here.getByRole("link", { name: `${name} 쪽에서 만지기` })).toHaveAttribute("href", `/playground/${slug}`);
  }
  for (const size of CONTROL_SIZES) {
    await expectStyle(cell(page, "Button", `rest solid ${size}`).getByRole("button"), { height: tokens.shape.control.height[size] });
    await expectStyle(cell(page, "Field", `rest hairline ${size}`).locator("input").locator("xpath=.."), { height: tokens.shape.control.height[size] });
  }
});

test("[app.playground.overview-boards] draws every cell in the state its segment chooses, and lays the crossing out once per state on request", async ({ page }) => {
  await open(page);
  const solid = (state: string) => cell(page, "Button", `${state} solid md`).getByRole("button");
  await expectStyle(solid("rest"), { ...profile("primary", "solid"), ...tint("transparent"), transform: "none", outlineStyle: "none" });
  await choose(page, "Button", "hover");
  await expectStyle(solid("hover"), tint(hoverTint("solid")));
  await expectStyle(cell(page, "Button", "hover hairline md").getByRole("button"), { borderTopColor: tokens.color.border.hover });
  await choose(page, "Button", "눌림");
  await expectStyle(solid("active"), { transform: `translateY(${tokens.motion.role.press.offset})`, ...tint(hoverTint("solid")) });
  await choose(page, "Button", "포커스");
  await expectStyle(solid("focus"), ring);
  await choose(page, "Button", "꺼짐");
  await expect(solid("disabled")).toBeDisabled();
  await expectStyle(solid("disabled"), { opacity: tokens.color.opacity.disabled });
  await board(page, "Button").getByRole("switch", { name: "모든 상태 펼치기" }).check();
  await expect(board(page, "Button").locator("[data-board-sheet]")).toHaveCount(5);
  await expect(board(page, "Button").locator("[data-cell]")).toHaveCount(5 * VARIANTS.length * CONTROL_SIZES.length);
  await expectStyle(solid("hover"), tint(hoverTint("solid")));
  await expectStyle(solid("rest"), tint("transparent"));

  await expect(board(page, "Checkbox").getByRole("radio", { name: "hover", exact: true })).toHaveCount(0);
  await choose(page, "Checkbox", "눌림");
  const { focus } = tokens.shape;
  await expectStyle(cell(page, "Checkbox", "active off md").getByRole("checkbox"), { outlineStyle: "solid", outlineWidth: `calc(${focus.width} + ${focus.offset})`, outlineColor: tokens.color.interaction.active });
  await choose(page, "Field", "hover");
  await expectStyle(cell(page, "Field", "hover hairline md").locator("input").locator("xpath=.."), { borderTopColor: tokens.color.border.hover });
  await choose(page, "Field", "포커스");
  await expectStyle(cell(page, "Field", "focus hairline md").locator("input").locator("xpath=.."), ring);
  await choose(page, "SegmentControl", "포커스");
  const segments = cell(page, "SegmentControl", "focus track md");
  await expectStyle(segments.getByRole("radio", { name: "7일" }), ring);
  await expectStyle(segments.getByRole("radio", { name: "1일" }), { outlineStyle: "none" });
  for (const name of ["Badge", "Spinner"] as const) {
    await expect(board(page, name).getByRole("radiogroup", { name: `${name} 상태` })).toHaveCount(0);
    await expect(board(page, name)).toContainText(`${name}는 표시용이라 상태가 없습니다.`);
  }
});

test("[app.playground.overview-boards] moves every cell with the props on its panel", async ({ page }) => {
  await open(page);
  await chooseOption(board(page, "Button").getByRole("combobox", { name: "accent" }), "error");
  for (const size of CONTROL_SIZES) await expectStyle(cell(page, "Button", `rest solid ${size}`).getByRole("button"), profile("error", "solid"));
  await board(page, "Button").getByRole("radiogroup", { name: "shape" }).getByRole("radio", { name: "rounded" }).click();
  await expectStyle(cell(page, "Button", "rest solid md").getByRole("button"), { borderTopLeftRadius: tokens.shape.radius.control.md });
  await chooseOption(board(page, "Field").getByRole("combobox", { name: "status" }), "error");
  await expectStyle(cell(page, "Field", "rest hairline md").locator("input").locator("xpath=.."), { borderTopColor: tokens.color.accent.error.ink });
});

test("[app.playground.overview-boards] keeps every drawing live: the pointer hovers it, a mark turns on, and each control is named by its place", async ({ page }) => {
  await open(page);
  const soft = cell(page, "Button", "rest soft md").getByRole("button");
  await soft.hover();
  await expectStyle(soft, tint(hoverTint("soft")));
  await page.mouse.move(0, 0);
  const off = board(page, "Checkbox").getByRole("checkbox", { name: "Checkbox off md", exact: true });
  await expect(off).not.toBeChecked();
  await off.click();
  await expect(off).toBeChecked();
  const field = board(page, "Field").getByRole("textbox", { name: "Field hairline md", exact: true });
  await field.fill("값");
  await expect(field).toHaveValue("값");
  await expect(board(page, "Select").getByRole("combobox", { name: "Select ghost lg", exact: true })).toBeVisible();
  await board(page, "Switch").getByRole("switch", { name: "모든 상태 펼치기" }).check();
  await expect(board(page, "Switch").getByRole("switch", { name: "Switch on xs 꺼짐", exact: true })).toBeDisabled();
});

test("every section of the Overview is a heading with specimens under it and renders without an error", async ({ page }) => {
  const errors = await open(page);
  for (const [index, title] of SECTIONS.entries()) {
    const heading = page.getByRole("heading", { level: 2, name: title, exact: true });
    await expect(heading).toBeVisible();
    const section = page.locator("section").filter({ has: heading });
    expect(await section.locator("[data-testid]").count(), title).toBeGreaterThan(index === 0 ? 5 : 1);
  }
  expect(errors).toEqual([]);
});

test("the Type scale shows each text role as its role", async ({ page }) => {
  await open(page);
  for (const variant of TEXT_VARIANTS) await expectStyle(page.getByTestId(`text-${variant}`), role(variant));
  for (const variant of MONO_ROWS) {
    const { fontWeight, lineHeight } = role(variant);
    await expectStyle(page.getByTestId(`text-${variant}-mono`), { fontWeight, lineHeight, fontFamily: TYPOGRAPHY.palette.family.mono });
  }
});

test("the Type scale names under each role what its specimen is drawn at: size / line · weight", async ({ page }) => {
  await open(page);
  for (const id of [...TEXT_VARIANTS, ...MONO_ROWS.map((variant) => `${variant}-mono`)]) {
    const drawn = await page.getByTestId(`text-${id}`).evaluate((element) => {
      const style = getComputedStyle(element);
      return `${Math.round(parseFloat(style.fontSize))} / ${Math.round(parseFloat(style.lineHeight))} · ${style.fontWeight}`;
    });
    await expect(page.getByTestId(`drawn-${id}`), id).toHaveText(drawn);
  }
  const weights = await Promise.all(["hero", "headline", "display", "title", "heading", "subheading"].map((variant) => page.getByTestId(`text-${variant}`).evaluate((element) => getComputedStyle(element).fontWeight)));
  expect(new Set(weights).size).toBe(1);
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

test("the Field specimens show their adornments and the password toggle", async ({ page }) => {
  await open(page);
  const clearable = page.getByTestId("field-clearable");
  await expect(clearable.locator("input")).toHaveValue("지울 값");
  await clearable.getByRole("button").click();
  await expect(clearable.locator("input")).toHaveValue("");

  const password = page.getByTestId("field-password");
  await expect(password.locator("input")).toHaveAttribute("type", "password");
  await password.getByRole("button").click();
  await expect(password.locator("input")).toHaveAttribute("type", "text");

  const full = page.getByTestId("btn-fullwidth");
  expect(await full.evaluate((element) => element.getBoundingClientRect().width)).toBe(await full.evaluate((element) => element.parentElement!.getBoundingClientRect().width));
});

test("Field, Select and Button of one size share the ladder's height", async ({ page }) => {
  await open(page);
  for (const size of CONTROL_SIZES) {
    const group = page.getByTestId(`spec-size-${size}`);
    await boxStyle(group.getByLabel(`field ${size}`), height(size));
    await boxStyle(group.getByLabel(`select ${size}`), height(size));
    await expectStyle(group.getByRole("button", { name: "Button" }), height(size));
  }
  await boxStyle(page.getByTestId("spec-size-md").getByLabel("field md"), radius(tokens.shape.radius.control.md));
});

test("the controls of the base row share one corner and each its own inset", async ({ page }) => {
  await open(page);
  const row = page.getByTestId("spec-control-base");
  const corner = radius(tokens.shape.radius.control.md);
  await expectStyle(row.getByTestId("base-button"), corner);
  expect(await edgeInset(row.getByTestId("base-button"))).toBe(roleDp(tokens.shape.control.inset.button.md));
  await expectStyle(row.getByTestId("base-field"), corner);
  expect(await edgeInset(row.getByTestId("base-field"))).toBe(roleDp(tokens.shape.control.inset.input.md));
  await boxStyle(row.getByTestId("base-select"), corner);
  const selectFrame = row.getByTestId("base-select");
  const frameLine = await selectFrame.evaluate((element) => parseFloat(getComputedStyle(element).borderLeftWidth));
  expect(await edgeInset(selectFrame.getByRole("combobox")) + frameLine).toBe(roleDp(tokens.shape.control.inset.input.md));
  await expectStyle(row.getByTestId("base-textarea"), corner);
});

test("the pill row draws the Field, the Select and the Button with one full curve", async ({ page }) => {
  await open(page);
  const row = page.getByTestId("spec-pill-row");
  const pill = radius(tokens.shape.radius.pill);
  await expectStyle(row.getByTestId("field-pill"), pill);
  await boxStyle(row.getByTestId("select-pill"), pill);
  await expectStyle(row.getByTestId("button-pill-row"), pill);
});

test("the marks stand at their boundaries and sizes, the off ones in the base line", async ({ page }) => {
  await open(page);
  const marks = page.getByTestId("spec-marks");
  await expectStyle(marks.getByTestId("mark-checkbox"), { backgroundColor: tokens.color.accent.primary.solid });
  await expectStyle(marks.getByTestId("mark-checkbox-off"), { borderTopColor: tokens.color.border.base });
  await expectStyle(marks.getByTestId("mark-radio"), { backgroundColor: tokens.color.accent.primary.solid });
  await expectStyle(marks.getByTestId("mark-radio-off"), { borderTopColor: tokens.color.border.base });
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

test("the Link takes the link role and the Icon the body artboard", async ({ page }) => {
  await open(page);
  await expectStyle(page.getByTestId("link"), { color: tokens.color.interaction.link });
  await expectStyle(page.getByTestId("icon"), { width: tokens.shape.icon.size.body, height: tokens.shape.icon.size.body });
});

test("the specimen groups name their members", async ({ page }) => {
  await open(page);
  for (const [group, members] of Object.entries({
    "spec-marks": ["mark-checkbox", "mark-checkbox-off", "mark-radio", "mark-radio-off", "mark-switch", "mark-icon", "mark-spinner", "mark-badge", "mark-button"],
    "spec-align": ["align-field", "align-button"],
  })) {
    for (const member of members) await expect(page.getByTestId(group).getByTestId(member), `${group} ${member}`).toHaveCount(1);
  }
});


test("every testid on the Overview is one the tests above bind to a value", async ({ page }) => {
  await open(page);
  const bound = [
    ...TEXT_VARIANTS.flatMap((variant) => [`text-${variant}`, `drawn-${variant}`]), ...MONO_ROWS.flatMap((variant) => [`text-${variant}-mono`, `drawn-${variant}-mono`]),
    ...SURFACE_FILLS.map((surface) => `swatch-paper-${surface}`),
    ...STATUSES.flatMap((status) => [`dot-${status}`, `ink-${status}`]),
    "surface-border", "spec-layout-radius", "radius-small", "radius-card", "radius-large",
    ...Object.values(BOARDS).map((board) => `board-${board.slug}`),
    ...CONTROL_SIZES.map((size) => `spec-size-${size}`),
    "spec-align", "align-field", "align-button",
    "field-clearable", "field-password", "btn-fullwidth",
    "spec-control-base", "base-button", "base-field", "base-select", "base-textarea",
    "spec-pill-row", "field-pill", "select-pill", "button-pill-row",
    "spec-marks", "mark-checkbox", "mark-checkbox-off", "mark-radio", "mark-radio-off", "mark-switch", "mark-icon", "mark-spinner", "mark-badge", "mark-button",
    "formfield-field",
    "link", "icon",
  ];
  const present = await page.locator("[data-testid]").evaluateAll((elements) => [...new Set(elements.map((element) => element.getAttribute("data-testid")!))]);
  expect(present.sort()).toEqual([...new Set(bound)].sort());
});
