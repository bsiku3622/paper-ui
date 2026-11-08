import { expect, test } from "@playwright/test";

import { STATE_TINT_PROPERTY, SURFACE_FILLS, VARIANTS, restingCast, tokens } from "../../packages/paper-ui/src/tokens";
import { roleDp } from "../support/geometry";
import { accentProfile, itemProfile } from "../../packages/paper-ui/src/tokens/color-recipes";
import { MOTION } from "../../packages/paper-ui/src/tokens/motion-recipes";
import { chooseProp, openHarness, openPlayground } from "../support/harness";
import { chooseOption } from "../support/select";
import { expectStyle } from "../support/style";

const tint = (color: string) => ({ backgroundImage: `linear-gradient(${color}, ${color})` });

test("[primitives.surface.prop-table] each prop of a Surface comes from the role the table names: fill from bg, border from the border role and stroke, radius from the surface family and the pill", async ({ page }) => {
  await openHarness(page, "layout");
  for (const fill of SURFACE_FILLS) await expectStyle(page.getByTestId(`fill-${fill}`), { backgroundColor: tokens.color.bg[fill] });
  await expectStyle(page.getByTestId("surface-border"), { borderTopColor: tokens.color.border.base, borderTopWidth: tokens.shape.stroke.border, borderTopStyle: "solid" });
  for (const step of ["sm", "md", "lg"] as const) await expectStyle(page.getByTestId(`radius-${step}`), { borderTopLeftRadius: tokens.shape.radius.surface[step] });
  await expectStyle(page.getByTestId("radius-full"), { borderTopLeftRadius: tokens.shape.radius.full });
});

test("[primitives.surface.sticky-top] [primitives.surface.shadow] a sticky Surface stops at its top, stays inside the window and takes a resting shadow; another tier reads no top", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 640 });
  await openHarness(page, "layout");
  const lg = roleDp(tokens.layout.gap.lg);
  const sticky = page.getByTestId("sticky-top");
  await expect(sticky).toHaveCSS("position", "sticky");
  await expect(sticky).toHaveCSS("top", `${lg}px`);
  await expect(sticky).toHaveCSS("max-height", `${640 - lg - lg}px`);
  await expectStyle(sticky, { boxShadow: restingCast.boxShadow });
  const none = page.getByTestId("sticky-none");
  await expect(none).toHaveCSS("top", "0px");
  await expect(none).toHaveCSS("max-height", "640px");
  await expect(none).toHaveCSS("box-shadow", "none");
  await expect(page.getByTestId("top-unread")).toHaveCSS("max-height", "none");
});

test("[primitives.surface.item] a hoverable Surface fades its tint over the hover role", async ({ page }) => {
  await openPlayground(page, "surface", "Surface");
  await page.getByRole("switch", { name: "hoverable", exact: true }).check();
  const surface = page.getByTestId("surface-example");
  await expect(surface).toHaveCSS("transition-property", STATE_TINT_PROPERTY);
  await expect(surface).toHaveCSS("transition-duration", `${parseFloat(MOTION.hover.duration) / 1000}s`);
});

test("[primitives.surface.item] [atoms.states.hover-table] a hoverable Surface tints under the pointer and when pressed, and a selected one keeps its own tint under hover", async ({ page }) => {
  await openPlayground(page, "surface", "Surface");
  const surface = page.getByTestId("surface-example");
  await surface.hover();
  await expect(surface).toHaveCSS("background-image", "none");
  await page.getByRole("switch", { name: "hoverable", exact: true }).check();
  await page.mouse.move(0, 0);
  await expectStyle(surface, tint("transparent"));
  await surface.hover();
  await expectStyle(surface, tint(itemProfile.hoverTint));
  await page.mouse.down();
  await expectStyle(surface, tint(itemProfile.activeTint));
  await page.mouse.up();
  await page.getByRole("switch", { name: "selected", exact: true }).check();
  await expect(surface).toHaveAttribute("data-selected", "true");
  await expectStyle(surface, tint(itemProfile.selectedTint));
  await page.mouse.move(0, 0);
  await expectStyle(surface, { ...tint(itemProfile.selectedTint), color: itemProfile.selectedInk });
});

test("[primitives.paint.frame] every variant keeps one frame, so changing the variant does not move the box", async ({ page }) => {
  await openPlayground(page, "paint", "Paint");
  const paint = page.getByTestId("paint-example");
  const variant = page.getByRole("combobox", { name: "variant", exact: true });
  const sizes = new Set<string>();
  for (const name of VARIANTS) {
    await chooseOption(variant, name);
    await expectStyle(paint, { borderTopWidth: tokens.shape.stroke.border, borderTopStyle: name === "dashed" ? "dashed" : "solid" });
    const box = await paint.boundingBox();
    sizes.add(`${box?.width} x ${box?.height}`);
  }
  expect([...sizes]).toHaveLength(1);
});

test("[primitives.paint.selected] a selected ghost or hairline Paint wears its accent's soft face, and a hover over it adds a tint but no border", async ({ page }) => {
  await openPlayground(page, "paint", "Paint");
  const paint = page.getByTestId("paint-example");
  await chooseProp(page, "accent", "info");
  await chooseProp(page, "variant", "hairline");
  await page.getByRole("switch", { name: "hoverable", exact: true }).check();
  const rest = accentProfile("info", "hairline");
  await page.mouse.move(0, 0);
  await expectStyle(paint, { backgroundColor: rest.face, borderTopColor: rest.border });
  await paint.hover();
  if (!("border" in rest.hover)) throw new Error("a hairline rises by its border");
  await expectStyle(paint, { borderTopColor: rest.hover.border });
  await page.getByRole("switch", { name: "selected", exact: true }).check();
  await expect(paint).toHaveAttribute("data-selected", "true");
  const selected = rest.selected!;
  await paint.hover();
  await expectStyle(paint, { backgroundColor: selected.face, color: selected.ink, borderTopColor: selected.border, ...tint(itemProfile.hoverTint) });
  await page.mouse.move(0, 0);
  await expectStyle(paint, { backgroundColor: selected.face, color: selected.ink, borderTopColor: selected.border, ...tint("transparent") });
  await chooseProp(page, "variant", "solid");
  const solid = accentProfile("info", "solid");
  await expectStyle(paint, { backgroundColor: solid.face, color: solid.ink });
});

test("[foundations.state.recipes] the example control of the Playground answers hover, press, selection and disabled from the item recipe, at control geometry", async ({ page }) => {
  await openPlayground(page, "selectable", "Selectable");
  const control = page.getByTestId("select-example");
  await expectStyle(control, { height: tokens.shape.control.height.md, paddingInlineStart: tokens.shape.control.inset.button.md });
  await expectStyle(control, tint("transparent"));
  await control.hover();
  await expectStyle(control, tint(itemProfile.hoverTint));
  await page.mouse.down();
  await expectStyle(control, tint(itemProfile.activeTint));
  await page.mouse.up();
  await expect(control).toHaveAttribute("data-selected", "true");
  await expectStyle(control, tint(itemProfile.selectedTint));
  await page.getByRole("switch", { name: "disabled", exact: true }).check();
  await expect(control).toHaveAttribute("data-disabled", "true");
  await expectStyle(control, { opacity: tokens.color.opacity.disabled, cursor: "not-allowed" });
  await control.hover({ force: true });
  await expectStyle(control, tint(itemProfile.selectedTint));
});

test("[foundations.state.recipes] a label too long for one line grows the example control instead of crossing its borders", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPlayground(page, "composition", "Composition");
  const control = page.getByRole("button", { name: "Hook으로 조립한 버튼", exact: true });
  await expect(control).toBeVisible();
  const { clientHeight, scrollHeight } = await control.evaluate((element) => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  expect(scrollHeight).toBeLessThanOrEqual(clientHeight);
});

test("[primitives.surface.border-side] a side draws its line alone, and true goes all the way round in the one grey", async ({ page }) => {
  await openHarness(page, "layout");
  const bottom = page.getByTestId("border-bottom");
  await expect(bottom).toHaveCSS("border-bottom-width", "1px");
  await expect(bottom).toHaveCSS("border-bottom-style", "solid");
  await expect(bottom).toHaveCSS("border-top-width", "0px");
  const all = page.getByTestId("border-all");
  for (const side of ["top", "right", "bottom", "left"]) await expect(all, side).toHaveCSS(`border-${side}-width`, "1px");
  await expectStyle(bottom, { borderBottomColor: tokens.color.border.base });
});
