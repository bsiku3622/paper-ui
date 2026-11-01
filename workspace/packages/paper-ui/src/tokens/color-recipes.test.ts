import { describe, expect, it } from "vitest";

import { contrast, over } from "../../../../tests/support/contrast";
import { paintClass } from "../primitives/paint/Paint";
import { accentVariantClass } from "../styles/color.css";
import { COLOR_MODES, type ColorMode } from "./color-modes";
import { ACCENTS, COLOR_VALUES_BY_MODE, STATUSES, STATUS_EXCEPTIONS, SYSTEM_COLORS } from "./colors";
import { SELECTABLE_VARIANTS, VARIANTS, VARIANT_RECIPE, accentProfile, itemProfile, markForcedProfile, markProfile, outlinedControlProfile, type Variant } from "./color-recipes";
import { pathToCssVar, walkValues } from "./helpers";
import { tokens } from "./index";

describe("accent profile", () => {
  it("[foundations.color.profile-fields] gives every accent × variant a face, an ink and a border", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const profile = accentProfile(accent, variant);
        expect(profile.face, `${accent} ${variant}`).toEqual(expect.any(String));
        expect(profile.ink, `${accent} ${variant}`).toEqual(expect.any(String));
        expect(profile.border, `${accent} ${variant}`).toEqual(expect.any(String));
      }
    }
  });

  it("[foundations.color.profile-shape] [foundations.color.profile-fields] carries exactly the fields the profile declares, with none of the dead hover fields", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const keys = Object.keys(accentProfile(accent, variant)).sort();
        expect(keys, `${accent} ${variant}`).toEqual((SELECTABLE_VARIANTS as readonly string[]).includes(variant) ? ["border", "face", "hover", "ink", "selected"] : ["border", "face", "hover", "ink"]);
      }
    }
  });

  it("[foundations.color.profile-shape] [foundations.color.profile-fields] gives each variant exactly one hover expression: a tint or a border", () => {
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
  it("[foundations.color.profile-shape] keeps the ghost surface and uses the selected accent's subtle tone", () => {
    for (const accent of ACCENTS) {
      const profile = accentProfile(accent, "muted");

      expect(profile.face).toBe("transparent");
      expect(profile.ink).toBe(tokens.color.accent[accent].subtle);
      expect(profile.border).toBe("transparent");
      expect(profile.hover).toEqual({ tint: tokens.color.interaction.bgHover.onSurface });
    }
  });

  it("[foundations.color.profile-shape] uses the shared form surface and neutral border for every hairline accent", () => {
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
  it("[foundations.color.variant-recipe] is the one table accentProfile reads", () => {
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

  it("[foundations.color.profile-shape] tints a solid face with the tint that reads against its own colour", () => {
    expect(accentProfile("primary", "solid").hover).toEqual({ tint: tokens.color.interaction.bgHover.onPrimarySolid });
    for (const accent of ACCENTS.filter((accent) => accent !== "primary")) {
      expect(accentProfile(accent, "solid").hover).toEqual({ tint: tokens.color.interaction.bgHover.onAccentSolid });
    }
  });

  it("[foundations.color.profile-shape] [foundations.color.profile-fields] gives a selected face to the selectable variants only, and it is the accent's soft face", () => {
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
  it("[foundations.color.profile-shape] [foundations.color.profile-fields] is a raised face, the primary ink, the base border and the border it rises to on hover", () => {
    const { color } = tokens;
    expect({ ...outlinedControlProfile, status: undefined }).toEqual({
      face: color.bg.raised, ink: color.ink.primary, border: color.border.base, hoverBorder: color.border.hover, status: undefined,
    });
  });

  it("[foundations.color.profile-fields] draws a status in that status's ink", () => {
    expect(Object.keys(outlinedControlProfile.status)).toEqual([...STATUSES]);
    for (const status of STATUSES) expect(outlinedControlProfile.status[status]).toBe(tokens.color.accent[status].ink);
  });
});

describe("item profile", () => {
  it("[foundations.color.profile-shape] [foundations.color.interaction-states] [foundations.color.profile-fields] tints a neutral item from the interaction roles and keeps its ink primary", () => {
    const { interaction, ink } = tokens.color;
    expect(itemProfile).toEqual({ hoverTint: interaction.bgHover.onSurface, activeTint: interaction.active, selectedTint: interaction.selected, selectedInk: ink.primary });
  });
});

describe("mark profile", () => {
  it("[foundations.color.profile-shape] [foundations.color.profile-fields] rings a resting mark in the tertiary ink and fills a checked one with the primary solid", () => {
    const { color } = tokens;
    expect(markProfile).toEqual({
      rest: { ring: color.ink.tertiary, knob: color.bg.raised, track: color.control.track },
      checked: { face: color.accent.primary.solid, ring: "transparent", mark: color.accent.primary.wash, knob: color.bg.raised },
      invalid: { ring: color.accent.error.ink },
    });
  });

  it("[foundations.color.profile-shape] [foundations.color.profile-fields] [foundations.color.forced-colors] asks the forced-colours mark for system colours and nothing else", () => {
    const names = new Set<string>(Object.values(SYSTEM_COLORS));
    const leaves: string[] = [];
    walkValues(markForcedProfile, [], (_path, value) => leaves.push(value));
    expect(leaves.length).toBeGreaterThan(0);
    for (const leaf of leaves) expect(names.has(leaf), leaf).toBe(true);
  });
});

describe("the accent × variant class map", () => {
  it("[foundations.color.profile-shape] [foundations.color.accent-class-map] holds one class for every accent × variant and nothing else, each distinct", () => {
    expect(Object.keys(accentVariantClass)).toEqual([...ACCENTS]);
    const classes: string[] = [];
    for (const accent of ACCENTS) {
      expect(Object.keys(accentVariantClass[accent]), accent).toEqual([...VARIANTS]);
      for (const variant of VARIANTS) classes.push(accentVariantClass[accent][variant]);
    }
    expect(classes.every((name) => name !== "")).toBe(true);
    expect(new Set(classes).size).toBe(ACCENTS.length * VARIANTS.length);
  });

  it("[foundations.color.profile-shape] [foundations.color.accent-class-map] is what paintClass picks, solid when the variant is left out and nothing when no accent is named", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) expect(paintClass({ accent, variant }).split(" "), `${accent} ${variant}`).toContain(accentVariantClass[accent][variant]);
      expect(paintClass({ accent }).split(" "), accent).toContain(accentVariantClass[accent].solid);
    }
    expect(paintClass({})).toBe("");
  });
});

// The text of an accent × variant, and what it stands on: its own face, or each surface of the mode when the face is
// transparent. A hovering variant also gets its tint laid over that ground. Each row is a contrast ratio with its place.
const readable = (accent: (typeof ACCENTS)[number], variant: Variant, mode: ColorMode) => {
  const values = new Map<string, string>();
  walkValues(COLOR_VALUES_BY_MODE[mode], ["color"], (path, value) => values.set(pathToCssVar(path), value));
  const resolve = (reference: string) => (reference === "transparent" ? reference : values.get(/^var\((--[\w-]+)\)$/.exec(reference)![1]!)!);
  const profile = accentProfile(accent, variant);
  const grounds = profile.face === "transparent" ? Object.entries(COLOR_VALUES_BY_MODE[mode].bg) : [["its face", resolve(profile.face)] as const];
  const ink = resolve(profile.ink);
  return grounds.flatMap(([name, ground]) => [
    { at: `${mode} ${accent} ${variant} on ${name}`, ratio: contrast(ink, ground) },
    ...("tint" in profile.hover ? [{ at: `${mode} ${accent} ${variant} on ${name}, hovered`, ratio: contrast(ink, over(resolve(profile.hover.tint), ground)) }] : []),
  ]);
};

// The documented exception: a status whose solid or wash the exception table replaces in a mode.
const excepted = (accent: (typeof ACCENTS)[number], mode: ColorMode) => mode in ((STATUS_EXCEPTIONS as Record<string, Record<string, object>>)[accent] ?? {});

// The one pair measured just under 4.5:1 that the documentation names: the dark error muted text with the hover tint
// over the raised surface. The tint is already the faintest step, and lifting the ink would change a Color role.
const NEAR_MISS = "dark error muted on raised, hovered";

const holds = (variant: Variant) => {
  for (const mode of COLOR_MODES) {
    for (const accent of ACCENTS) {
      if (variant === "solid" && excepted(accent, mode)) continue;
      for (const { at, ratio } of readable(accent, variant, mode)) if (at !== NEAR_MISS) expect(ratio, at).toBeGreaterThanOrEqual(4.5);
    }
  }
};

describe("the variants read in both themes, at rest and hovered", () => {
  it("[foundations.color.variant-solid] puts the wash on the solid face at 4.5:1 for every accent but the documented exception", () => holds("solid"));
  it("[foundations.color.variant-soft] puts the ink on the soft face at 4.5:1 for every accent", () => holds("soft"));
  it("[foundations.color.variant-hairline] puts the ink on the raised surface at 4.5:1 for every accent", () => holds("hairline"));
  it("[foundations.color.variant-ghost] puts the ink on every surface at 4.5:1 for every accent, and with the hover tint over it", () => holds("ghost"));
  it("[foundations.color.variant-muted] puts the subtle ink on every surface at 4.5:1 for every accent, and with the hover tint over it", () => holds("muted"));

  it("[foundations.color.variant-solid] [foundations.color.variant-soft] [foundations.color.variant-hairline] [foundations.color.variant-ghost] [foundations.color.variant-muted] leaves no accent × variant unexamined", () => {
    expect([...VARIANTS]).toEqual(["solid", "soft", "hairline", "ghost", "muted"]);
    for (const mode of COLOR_MODES) for (const accent of ACCENTS) for (const variant of VARIANTS) expect(readable(accent, variant, mode).length, `${mode} ${accent} ${variant}`).toBeGreaterThan(0);
  });

  it("[foundations.color.warning-solid-white-label] keeps the white label on the amber warning solid below 4.5:1 in light, a little better hovered, and nowhere else", () => {
    expect(Object.keys(STATUS_EXCEPTIONS)).toEqual(["warning"]);
    expect(Object.keys(STATUS_EXCEPTIONS.warning)).toEqual(["light"]);
    const [rest, hovered] = readable("warning", "solid", "light");
    expect(rest!.ratio).toBeLessThan(4.5);
    expect(hovered!.ratio).toBeGreaterThan(rest!.ratio);
    expect(hovered!.ratio).toBeLessThan(4.5);
    expect(COLOR_VALUES_BY_MODE.light.accent.warning.wash).toBe(COLOR_VALUES_BY_MODE.light.bg.raised);
    // Everything else, the dark warning solid included, reads.
    const below = COLOR_MODES.flatMap((mode) => ACCENTS.flatMap((accent) => VARIANTS.flatMap((variant) => readable(accent, variant, mode).filter(({ ratio }) => ratio < 4.5).map(({ at }) => at))));
    expect(below).toEqual(["light warning solid on its face", "light warning solid on its face, hovered", NEAR_MISS]);
  });

  it("[foundations.color.dark-error-muted-hover] reads at 4.5:1 at rest and falls only a hair short with the hover tint over the raised surface", () => {
    const rows = readable("error", "muted", "dark");
    const raised = rows.filter(({ at }) => at.includes("on raised"));
    expect(raised.map(({ at }) => at)).toEqual(["dark error muted on raised", NEAR_MISS]);
    expect(raised[0]!.ratio).toBeGreaterThanOrEqual(4.5);
    // Close enough to say so, and no further: the list of exceptions stays honest.
    expect(raised[1]!.ratio).toBeLessThan(4.5);
    expect(raised[1]!.ratio).toBeGreaterThan(4.4);
    // The other surfaces, hovered, read.
    for (const { at, ratio } of rows.filter(({ at }) => !at.includes("on raised"))) expect(ratio, at).toBeGreaterThanOrEqual(4.5);
  });
});
