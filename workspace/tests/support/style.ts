import { expect, type Locator } from "@playwright/test";

import { accentProfile } from "../../packages/paper-ui/src/tokens/color-recipes";
import type { Accent, Variant } from "../../packages/paper-ui/src/tokens";

export type Style = Record<string, string>;

// A specimen's computed style against what its tokens resolve to: a probe element placed beside the
// specimen takes the expected references as inline style, and the browser resolves both the same way.
export const expectStyle = async (target: Locator, expected: Style) => {
  const keys = Object.keys(expected);
  // Controls transition between states, so a value read right after a click can still be on its way.
  await expect
    .poll(
      () =>
        target.evaluate((element, expected) => {
          const probe = document.createElement("span");
          element.parentElement!.append(probe);
          Object.assign(probe.style, expected);
          const own = getComputedStyle(element) as unknown as Record<string, string>;
          const reference = getComputedStyle(probe) as unknown as Record<string, string>;
          const result = Object.keys(expected).map((key) => ({ key, own: own[key], reference: reference[key] })).filter((row) => row.own !== row.reference);
          probe.remove();
          return result;
        }, expected),
      { message: JSON.stringify(keys) },
    )
    .toEqual([]);
};

// What an accent × variant control paints, as computed style.
export const profile = (accent: Accent, variant: Variant): Style => {
  const spec = accentProfile(accent, variant);
  return { backgroundColor: spec.face, color: spec.ink, borderTopColor: spec.border };
};

// The contrast ratio of two computed colours, as WCAG defines it.
const luminance = (color: string) => {
  const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map((channel) => {
    const value = Number(channel) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

export const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
};

export const colors = (target: Locator) => target.evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }));
