import { expect, test } from "@playwright/test";

import { tokens } from "../../packages/paper-ui/src/tokens";
import { COLOR_VALUES_BY_MODE } from "../../packages/paper-ui/src/tokens/colors";
import { contrast } from "../support/contrast";
import { openHarness } from "../support/harness";
import { expectStyle } from "../support/style";

// The highlighter in a sentence. It is drawn in the marks case, in a narrow line so that it wraps.

test.beforeEach(async ({ page }) => {
  await openHarness(page, "marks");
});

for (const scheme of ["light", "dark"] as const) {
  test(`[foundations.color.marker] the ink on the marker stays dark and reads at 4.5:1 (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const values = COLOR_VALUES_BY_MODE[scheme].marker;
    expect(contrast(values.ink, values.fill)).toBeGreaterThanOrEqual(4.5);
    await expectStyle(page.getByTestId("marker"), { color: tokens.color.marker.ink });
  });
}

test("[atoms.marker.band] the pigment is a stripe through the line box, and the sentence's own type stays", async ({ page }) => {
  const marker = page.getByTestId("marker");
  const line = page.getByTestId("marker-line");
  const read = await marker.evaluate((element) => {
    const style = getComputedStyle(element);
    const parent = getComputedStyle(element.parentElement!);
    return { image: style.backgroundImage, color: style.backgroundColor, repeat: style.backgroundRepeat, font: style.fontSize, weight: style.fontWeight, parentFont: parent.fontSize, parentWeight: parent.fontWeight };
  });
  expect(read.image).toMatch(/^linear-gradient/);
  expect(read.color).toBe("rgba(0, 0, 0, 0)");
  expect(read.repeat).toBe("no-repeat");
  expect([read.font, read.weight]).toEqual([read.parentFont, read.parentWeight]);
  await expect(line).toBeVisible();
});

test("[atoms.marker.band] a phrase that wraps keeps a stripe on each line, and the words stay where the sentence put them", async ({ page }) => {
  const marker = page.getByTestId("marker");
  const lines = await marker.evaluate((element) => element.getClientRects().length);
  expect(lines).toBeGreaterThan(1);
  const { breaking, padding, margin } = await marker.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      // WebKit knows the property only by its prefixed name.
      breaking: style.boxDecorationBreak || style.getPropertyValue("-webkit-box-decoration-break"),
      padding: parseFloat(style.paddingInlineStart),
      margin: parseFloat(style.marginInlineStart),
    };
  });
  expect(breaking).toBe("clone");
  expect(padding).toBeGreaterThan(0);
  expect(margin).toBeCloseTo(-padding, 2);
});
