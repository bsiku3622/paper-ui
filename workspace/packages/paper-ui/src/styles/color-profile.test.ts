import { describe, expect, it } from "vitest";

import { tokens } from "../tokens";
import { accentProfile } from "./color-profile";

describe("muted color profile", () => {
  it("uses the same slot mechanism for primary and status families", () => {
    for (const variant of ["softMuted", "outlineMuted", "hairlineMuted", "ghostMuted"] as const) {
      const primary = accentProfile("primary", variant);
      const warning = accentProfile("warning", variant);

      expect(Object.keys(warning).sort()).toEqual(Object.keys(primary).sort());
      expect(warning.hoverOverlay).toBe(tokens.color.interaction.hover);
      expect(warning.hoverBackground).toBeUndefined();
    }
  });

  it("uses the shared wash and solid slots for softMuted", () => {
    const profile = accentProfile("primary", "softMuted");

    expect(profile.background).toBe(tokens.color.accent.primary.wash);
    expect(profile.color).toBe(tokens.color.accent.primary.solid);
    expect(profile.hoverColor).toBeUndefined();
  });
});
