import { expect, test } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { accentProfile, itemProfile } from "../../packages/paper-ui/src/tokens/color-recipes";
import { openPlayground } from "../support/harness";
import { expectStyle } from "../support/style";

// The tint an item lays over its face, as the computed background image.
const tint = (color: string) => ({ backgroundImage: `linear-gradient(${color}, ${color})` });

test("[primitives.surface.item] a hoverable Surface tints under the pointer and when pressed, and a selected one keeps its own tint under hover", async ({ page }) => {
  await openPlayground(page, "surface", "Surface");
  const surface = page.getByTestId("surface-example");
  // Without hoverable the Surface is not an item: it has no tint to take.
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
  // Selecting sets the attribute only; the tint that answers it is the item's.
  await page.getByRole("switch", { name: "selected", exact: true }).check();
  await expect(surface).toHaveAttribute("data-selected", "true");
  await expectStyle(surface, tint(itemProfile.selectedTint));
  await page.mouse.move(0, 0);
  await expectStyle(surface, { ...tint(itemProfile.selectedTint), color: itemProfile.selectedInk });
});

test("[primitives.paint.selected] a selected ghost or hairline Paint wears its accent's soft face, and a hover over it adds a tint but no border", async ({ page }) => {
  await openPlayground(page, "paint", "Paint");
  const paint = page.getByTestId("paint-example");
  await page.getByRole("combobox", { name: "accent", exact: true }).selectOption("info");
  await page.getByRole("combobox", { name: "variant", exact: true }).selectOption("hairline");
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
  await expectStyle(paint, { backgroundColor: selected.face, color: selected.ink, borderTopColor: selected.border });
  await expect(paint).not.toHaveCSS("background-image", "none");
  await page.mouse.move(0, 0);
  await expectStyle(paint, { backgroundColor: selected.face, color: selected.ink, borderTopColor: selected.border, backgroundImage: "none" });
  // A variant with a face of its own has no selected look.
  await page.getByRole("combobox", { name: "variant", exact: true }).selectOption("solid");
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
  // A disabled item answers to the pointer no more: the tint stays what its selection gave it.
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
