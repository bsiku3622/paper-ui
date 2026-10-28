import { describe, expect, it } from "vitest";

import { ACCENTS } from "./colors";
import { VARIANTS, accentProfile } from "./color-recipes";
import { tokens } from "./index";

describe("accent profile", () => {
  it("gives every accent × variant a background, a color and a border", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const profile = accentProfile(accent, variant);
        expect(profile.background, `${accent} ${variant}`).toEqual(expect.any(String));
        expect(profile.color, `${accent} ${variant}`).toEqual(expect.any(String));
        expect(profile.borderColor, `${accent} ${variant}`).toEqual(expect.any(String));
      }
    }
  });
});

describe("muted color profile", () => {
  it("keeps the ghost surface and uses the selected accent's subtle tone", () => {
    for (const accent of ACCENTS) {
      const profile = accentProfile(accent, "muted");

      expect(profile.background).toBe("transparent");
      expect(profile.color).toBe(tokens.color.accent[accent].subtle);
      expect(profile.borderColor).toBe("transparent");
      expect(profile.hoverOverlay).toBe(tokens.color.interaction.bgHover.onSurface);
      expect(profile.hoverBackground).toBeUndefined();
    }
  });

  it("uses the shared form surface and neutral border for every hairline accent", () => {
    for (const accent of ACCENTS) {
      const profile = accentProfile(accent, "hairline");
      expect(profile.background).toBe(tokens.color.bg.raised);
      expect(profile.borderColor).toBe(tokens.color.border.base);
      expect(profile.hoverBorderColor).toBe(tokens.color.border.hover);
      expect(profile.hoverOverlay).toBeUndefined();
      expect(profile.color).toBe(accent === "primary" ? tokens.color.ink.primary : tokens.color.accent[accent].ink);
    }
  });
});
