import { describe, expect, it } from "vitest";

import { ACCENT_LADDER, ACCENT_STEPS, NEUTRAL_LADDER } from "./color-ladder";
import { COLOR_VALUES, COLOR_VALUES_DARK, STATUS, STATUS_PALETTE } from "./colors";
import { SURFACE_PALETTE } from "./palette";

describe("color layers", () => {
  it("maps every semantic status to one calibrated palette ladder", () => {
    for (const status of STATUS) {
      const palette = STATUS_PALETTE[status];
      expect(COLOR_VALUES.accent[status].solid).toBe(ACCENT_LADDER.light[palette]["600"]);
      expect(COLOR_VALUES.accent[status].wash).toBe(ACCENT_LADDER.light[palette]["50"]);
      expect(COLOR_VALUES.accent[status].soft).toBe(ACCENT_LADDER.light[palette]["100"]);
      expect(COLOR_VALUES.accent[status].edge).toBe(ACCENT_LADDER.light[palette]["200"]);
      expect(COLOR_VALUES.accent[status].edgeStrong).toBe(ACCENT_LADDER.light[palette]["400"]);
      expect(COLOR_VALUES_DARK.accent[status].solid).toBe(ACCENT_LADDER.dark[palette]["600"]);
    }
  });

  it("keeps a complete 11-step accent ladder", () => {
    expect(ACCENT_STEPS).toEqual(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]);
    for (const palette of Object.values(ACCENT_LADDER.light)) {
      expect(Object.keys(palette)).toEqual(ACCENT_STEPS);
    }
  });

  it("derives surface and primary accent roles from the neutral ladder", () => {
    expect(NEUTRAL_LADDER).toEqual(SURFACE_PALETTE);
    expect(COLOR_VALUES.surface.raised).toBe(NEUTRAL_LADDER.light["950"]);
    expect(COLOR_VALUES.border.hover).toBe(NEUTRAL_LADDER.light["400"]);
    expect(COLOR_VALUES_DARK.accent.primary.solid).toBe(NEUTRAL_LADDER.dark["925"]);
    expect(COLOR_VALUES_DARK.accent.primary.soft).toBe(NEUTRAL_LADDER.dark["200"]);
  });

  it("gives primary the same five-slot contract as status accents", () => {
    for (const values of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      expect(Object.keys(values.accent.primary)).toEqual(["solid", "wash", "soft", "edge", "edgeStrong"]);
    }
  });
});
