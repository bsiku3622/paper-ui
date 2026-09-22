import { describe, expect, it } from "vitest";

import { tokens } from "../tokens";
import { colorProfile } from "./color-profile";

describe("muted color profile", () => {
  it("uses the same slot mechanism for primary and status families", () => {
    for (const variant of ["softMuted", "outlineMuted", "hairlineMuted", "ghostMuted"] as const) {
      const primary = colorProfile("primary", variant);
      const warning = colorProfile("warning", variant);

      expect(Object.keys(warning).sort()).toEqual(Object.keys(primary).sort());
      expect(warning.hoverOverlay).toBe(tokens.color.interaction.hover);
      expect(warning.hoverBackground).toBeUndefined();
    }
  });

  it("uses primary wash rather than its soft surface for softMuted", () => {
    const profile = colorProfile("primary", "softMuted");

    expect(profile.background).toBe(tokens.color.action.primary.wash);
    expect(profile.color).toBe(tokens.color.action.primary.mutedInk);
    expect(profile.hoverColor).toBe(tokens.color.action.primary.ink);
  });
});
