import { expect, test } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { expectStyle } from "../support/style";

test("[atoms.link.target] the hero Buttons that are links carry no underline, and the demo link is a Link with an arrow icon that underlines under the pointer", async ({ page }) => {
  await page.goto("/");
  for (const name of ["문서 읽기", "Playground 살펴보기"]) await expect(page.getByRole("link", { name, exact: true })).toHaveCSS("text-decoration-line", "none");
  const demo = page.getByRole("link", { name: "데모 열기", exact: true });
  await page.mouse.move(0, 0);
  await expectStyle(demo, { color: tokens.color.interaction.link, textDecorationLine: "none" });
  await demo.hover();
  await expectStyle(demo, { textDecorationLine: "underline" });
});
