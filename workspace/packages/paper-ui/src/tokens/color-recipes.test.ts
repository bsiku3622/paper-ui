import { describe, expect, it } from "vitest";

import { ACCENTS, STATUSES, SYSTEM_COLORS } from "./colors";
import { SELECTABLE_VARIANTS, VARIANTS, VARIANT_RECIPE, accentProfile, itemProfile, markForcedProfile, markProfile, outlinedControlProfile } from "./color-recipes";
import { walkValues } from "./helpers";
import { tokens } from "./index";

describe("accent profile", () => {
  it("gives every accent × variant a face, an ink and a border", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const profile = accentProfile(accent, variant);
        expect(profile.face, `${accent} ${variant}`).toEqual(expect.any(String));
        expect(profile.ink, `${accent} ${variant}`).toEqual(expect.any(String));
        expect(profile.border, `${accent} ${variant}`).toEqual(expect.any(String));
      }
    }
  });

  it("[foundations.color.profile-shape] carries exactly the fields the profile declares, with none of the dead hover fields", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const keys = Object.keys(accentProfile(accent, variant)).sort();
        expect(keys, `${accent} ${variant}`).toEqual((SELECTABLE_VARIANTS as readonly string[]).includes(variant) ? ["border", "face", "hover", "ink", "selected"] : ["border", "face", "hover", "ink"]);
      }
    }
  });

  it("[foundations.color.profile-shape] gives each variant exactly one hover expression: a tint or a border", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const { hover } = accentProfile(accent, variant);
        expect(Object.keys(hover), `${accent} ${variant}`).toHaveLength(1);
        expect("tint" in hover !== "border" in hover, `${accent} ${variant}`).toBe(true);
        expect("tint" in hover, `${accent} ${variant}`).toBe(VARIANT_RECIPE[variant].hover === "tint");
      }
    }
  });
});

describe("muted color profile", () => {
  it("keeps the ghost surface and uses the selected accent's subtle tone", () => {
    for (const accent of ACCENTS) {
      const profile = accentProfile(accent, "muted");

      expect(profile.face).toBe("transparent");
      expect(profile.ink).toBe(tokens.color.accent[accent].subtle);
      expect(profile.border).toBe("transparent");
      expect(profile.hover).toEqual({ tint: tokens.color.interaction.bgHover.onSurface });
    }
  });

  it("uses the shared form surface and neutral border for every hairline accent", () => {
    for (const accent of ACCENTS) {
      const profile = accentProfile(accent, "hairline");
      expect(profile.face).toBe(tokens.color.bg.raised);
      expect(profile.border).toBe(tokens.color.border.base);
      expect(profile.hover).toEqual({ border: tokens.color.border.hover });
      expect(profile.ink).toBe(accent === "primary" ? tokens.color.ink.primary : tokens.color.accent[accent].ink);
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
        expect(profile.face, `${accent} ${variant} face`).toBe(face);
        const ink = recipe.face === "raised" && accent === "primary" ? color.ink.primary : color.accent[accent][recipe.ink];
        expect(profile.ink, `${accent} ${variant} ink`).toBe(ink);
        expect(profile.border, `${accent} ${variant} border`).toBe(recipe.border === "none" ? "transparent" : color.border.base);
        expect(recipe.hover === "border" ? "border" in profile.hover : "tint" in profile.hover, `${accent} ${variant} hover`).toBe(true);
      }
    }
  });

  it("tints a solid face with the tint that reads against its own colour", () => {
    expect(accentProfile("primary", "solid").hover).toEqual({ tint: tokens.color.interaction.bgHover.onPrimarySolid });
    for (const accent of ACCENTS.filter((accent) => accent !== "primary")) {
      expect(accentProfile(accent, "solid").hover).toEqual({ tint: tokens.color.interaction.bgHover.onAccentSolid });
    }
  });

  it("[foundations.color.profile-shape] gives a selected face to the selectable variants only, and it is the accent's soft face", () => {
    expect(SELECTABLE_VARIANTS).toEqual(["hairline", "ghost", "muted"]);
    expect(Object.keys(VARIANT_RECIPE)).toEqual([...VARIANTS]);
    for (const variant of VARIANTS) {
      expect("selected" in VARIANT_RECIPE[variant], variant).toBe((SELECTABLE_VARIANTS as readonly string[]).includes(variant));
      for (const accent of ACCENTS) {
        const { selected } = accentProfile(accent, variant);
        const tones = tokens.color.accent[accent];
        if ((SELECTABLE_VARIANTS as readonly string[]).includes(variant)) expect(selected, `${accent} ${variant}`).toEqual({ face: tones.soft, ink: tones.ink, border: "transparent" });
        else expect(selected, `${accent} ${variant}`).toBeUndefined();
      }
    }
  });
});

describe("outlined control profile", () => {
  it("[foundations.color.profile-shape] is a raised face, the primary ink, the base border and the border it rises to on hover", () => {
    const { color } = tokens;
    expect({ ...outlinedControlProfile, status: undefined }).toEqual({
      face: color.bg.raised, ink: color.ink.primary, border: color.border.base, hoverBorder: color.border.hover, status: undefined,
    });
  });

  it("draws a status in that status's ink", () => {
    expect(Object.keys(outlinedControlProfile.status)).toEqual([...STATUSES]);
    for (const status of STATUSES) expect(outlinedControlProfile.status[status]).toBe(tokens.color.accent[status].ink);
  });
});

describe("item profile", () => {
  it("[foundations.color.profile-shape] tints a neutral item from the interaction roles and keeps its ink primary", () => {
    const { interaction, ink } = tokens.color;
    expect(itemProfile).toEqual({ hoverTint: interaction.bgHover.onSurface, activeTint: interaction.active, selectedTint: interaction.selected, selectedInk: ink.primary });
  });
});

describe("mark profile", () => {
  it("[foundations.color.profile-shape] rings a resting mark in the tertiary ink and fills a checked one with the primary solid", () => {
    const { color } = tokens;
    expect(markProfile).toEqual({
      rest: { ring: color.ink.tertiary, knob: color.bg.raised, track: color.control.track },
      checked: { face: color.accent.primary.solid, ring: "transparent", mark: color.accent.primary.wash, knob: color.bg.raised },
      invalid: { ring: color.accent.error.ink },
    });
  });

  it("[foundations.color.profile-shape] asks the forced-colours mark for system colours and nothing else", () => {
    const names = new Set<string>(Object.values(SYSTEM_COLORS));
    const leaves: string[] = [];
    walkValues(markForcedProfile, [], (_path, value) => leaves.push(value));
    expect(leaves.length).toBeGreaterThan(0);
    for (const leaf of leaves) expect(names.has(leaf), leaf).toBe(true);
  });
});
