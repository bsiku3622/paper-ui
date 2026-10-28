import { describe, expect, it } from "vitest";

import { ACCENTS } from "./colors";
import { SELECTABLE_VARIANTS, VARIANTS, VARIANT_RECIPE, accentProfile } from "./color-recipes";
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
      expect(profile.hoverTint).toBe(tokens.color.interaction.bgHover.onSurface);
      expect(profile.hoverBackground).toBeUndefined();
    }
  });

  it("uses the shared form surface and neutral border for every hairline accent", () => {
    for (const accent of ACCENTS) {
      const profile = accentProfile(accent, "hairline");
      expect(profile.background).toBe(tokens.color.bg.raised);
      expect(profile.borderColor).toBe(tokens.color.border.base);
      expect(profile.hoverBorderColor).toBe(tokens.color.border.hover);
      expect(profile.hoverTint).toBeUndefined();
      expect(profile.color).toBe(accent === "primary" ? tokens.color.ink.primary : tokens.color.accent[accent].ink);
    }
  });
});

describe("variant recipe", () => {
  it("is the one table accentProfile reads", () => {
    const color = tokens.color;
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const recipe = VARIANT_RECIPE[variant];
        const profile = accentProfile(accent, variant);
        const face = recipe.face === "none" ? "transparent" : recipe.face === "raised" ? color.bg.raised : color.accent[accent][recipe.face];
        expect(profile.background, `${accent} ${variant} face`).toBe(face);
        const ink = recipe.face === "raised" && accent === "primary" ? color.ink.primary : color.accent[accent][recipe.ink];
        expect(profile.color, `${accent} ${variant} ink`).toBe(ink);
        expect(profile.borderColor, `${accent} ${variant} border`).toBe(recipe.border === "none" ? "transparent" : color.border.base);
        expect(recipe.hover === "border" ? profile.hoverBorderColor : profile.hoverTint, `${accent} ${variant} hover`).toEqual(expect.any(String));
      }
    }
  });

  it("tints a solid face with the tint that reads against its own colour", () => {
    expect(accentProfile("primary", "solid").hoverTint).toBe(tokens.color.interaction.bgHover.onPrimarySolid);
    for (const accent of ACCENTS.filter((accent) => accent !== "primary")) {
      expect(accentProfile(accent, "solid").hoverTint).toBe(tokens.color.interaction.bgHover.onAccentSolid);
    }
  });

  it("gives a selected face to the selectable variants only", () => {
    expect(SELECTABLE_VARIANTS).toEqual(["hairline", "ghost", "muted"]);
    expect(Object.keys(VARIANT_RECIPE)).toEqual([...VARIANTS]);
    for (const variant of VARIANTS) {
      expect("selected" in VARIANT_RECIPE[variant], variant).toBe((SELECTABLE_VARIANTS as readonly string[]).includes(variant));
    }
  });
});
