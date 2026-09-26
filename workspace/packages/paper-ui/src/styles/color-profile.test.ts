import { describe, expect, it } from "vitest";

import { tokens } from "../tokens";
import { accentProfile } from "./color-profile";

describe("muted color profile", () => {
  it("keeps the ghost surface and uses the selected accent's subtle tone", () => {
    for (const accent of ["primary", "info", "success", "warning", "error"] as const) {
      const profile = accentProfile(accent, "muted");

      expect(profile.background).toBe("transparent");
      expect(profile.color).toBe(tokens.color.accent[accent].subtle);
      expect(profile.borderColor).toBe("transparent");
      expect(profile.hoverOverlay).toBe(tokens.color.interaction.bgHover.onSurface);
      expect(profile.hoverBackground).toBeUndefined();
    }
  });

  it("uses the shared soft tone for every hairline accent border", () => {
    for (const accent of ["primary", "info", "success", "warning", "error"] as const) {
      expect(accentProfile(accent, "hairline").borderColor).toBe(tokens.color.accent[accent].soft);
    }
  });
});
