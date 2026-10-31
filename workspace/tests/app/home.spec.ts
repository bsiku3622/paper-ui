import { expect, test } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { tab } from "../support/keyboard";
import { expectStyle, profile } from "../support/style";

test("[atoms.link.target] the hero Buttons that are links carry no underline, and the demo link is a Link with an arrow icon that underlines under the pointer", async ({ page }) => {
  await page.goto("/");
  for (const name of ["문서 읽기", "Playground 살펴보기"]) await expect(page.getByRole("link", { name, exact: true })).toHaveCSS("text-decoration-line", "none");
  const demo = page.getByRole("link", { name: "데모 열기", exact: true });
  await page.mouse.move(0, 0);
  await expectStyle(demo, { color: tokens.color.interaction.link, textDecorationLine: "none" });
  await demo.hover();
  await expectStyle(demo, { textDecorationLine: "underline" });
});

// The landing page draws its own parts from roles: the brand label is not a status, the mockup's mark is a wash on the
// primary solid, its current item rests on the selected face, and its filter is the roving group the Demo has.
test("the brand label is a neutral badge, and the mockup's mark and current item are drawn from roles", async ({ page }) => {
  await page.goto("/");
  const brand = page.getByText("Studio Baeks", { exact: true }).first();
  await expectStyle(brand, profile("primary", "soft"));
  await expectStyle(brand, { backgroundColor: tokens.color.accent.primary.soft });

  const side = page.getByTestId("home-mockup-side");
  const mark = side.getByText("S", { exact: true });
  await expectStyle(mark.locator(".."), { backgroundColor: tokens.color.accent.primary.solid, color: tokens.color.accent.primary.wash });
  await expectStyle(mark, { color: tokens.color.accent.primary.wash, fontWeight: tokens.typography.palette.weight.bold });

  const current = side.locator("[data-selected]");
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText("이슈");
  await expectStyle(current, { backgroundColor: tokens.color.interaction.selected, color: tokens.color.ink.primary, fontWeight: tokens.typography.palette.weight.medium });
  await expectStyle(side.getByText("보드", { exact: true }), { fontWeight: tokens.typography.palette.weight.regular, color: tokens.color.ink.secondary });
});

test("the mockup's filter is a roving group: one tab stop, arrow keys move focus, and aria-pressed says which is selected", async ({ page }) => {
  await page.goto("/");
  const group = page.getByRole("group", { name: "이슈 필터" });
  const buttons = group.getByRole("button");
  await expect(buttons).toHaveCount(3);
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  expect(await buttons.evaluateAll((items) => items.map((item) => item.getAttribute("tabindex")))).toEqual(["0", "-1", "-1"]);
  await buttons.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("button", { name: "열림" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(group.getByRole("button", { name: "열림" })).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "false");
  await tab(page);
  await expect(group.locator(":focus")).toHaveCount(0);
});
