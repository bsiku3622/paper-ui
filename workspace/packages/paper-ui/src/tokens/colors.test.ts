import { describe, expect, it } from "vitest";

import { ACCENT_LADDER, NEUTRAL_LADDER } from "./color-ladder";
import { COLOR_VALUES, COLOR_VALUES_DARK, STATUS, STATUS_PALETTE } from "./colors";
import { SURFACE_PALETTE } from "./palette";

describe("color layers", () => {
  it("maps every semantic status to one calibrated palette ladder", () => {
    for (const status of STATUS) {
      const palette = STATUS_PALETTE[status];
      expect(COLOR_VALUES.status[status].solid).toBe(ACCENT_LADDER.light[palette]["600"]);
      expect(COLOR_VALUES.status[status].mutedInk).toBe(ACCENT_LADDER.light[palette]["600"]);
      expect(COLOR_VALUES.status[status].ink).toBe(ACCENT_LADDER.light[palette]["700"]);
      expect(COLOR_VALUES_DARK.status[status].solid).toBe(ACCENT_LADDER.dark[palette]["600"]);
      expect(COLOR_VALUES_DARK.status[status].ink).toBe(ACCENT_LADDER.dark[palette]["700"]);
    }
  });

  it("keeps muted status visibly lighter than the normal status role", () => {
    for (const status of STATUS) {
      expect(COLOR_VALUES.status[status].wash).not.toBe(COLOR_VALUES.status[status].soft);
      expect(COLOR_VALUES.status[status].mutedInk).not.toBe(COLOR_VALUES.status[status].ink);
      expect(COLOR_VALUES_DARK.status[status].wash).not.toBe(COLOR_VALUES_DARK.status[status].soft);
      expect(COLOR_VALUES_DARK.status[status].mutedInk).not.toBe(COLOR_VALUES_DARK.status[status].ink);
    }
  });

  it("derives surface and action roles from the neutral ladder", () => {
    expect(NEUTRAL_LADDER).toEqual(SURFACE_PALETTE);
    expect(COLOR_VALUES.surface.raised).toBe(NEUTRAL_LADDER.light["950"]);
    expect(COLOR_VALUES.border.hover).toBe(NEUTRAL_LADDER.light["400"]);
    expect(COLOR_VALUES_DARK.action.primary.base).toBe(NEUTRAL_LADDER.dark["925"]);
    expect(COLOR_VALUES_DARK.action.primary.hover).toBe(NEUTRAL_LADDER.dark["900"]);
  });

  it("gives primary the same wash-to-ink muted ladder as status colors", () => {
    for (const values of [COLOR_VALUES, COLOR_VALUES_DARK]) {
      expect(values.action.primary.wash).toBe(values.surface.canvas);
      expect(values.action.primary.soft).toBe(values.surface.well);
      expect(values.action.primary.mutedInk).toBe(values.content.secondary);
      expect(values.action.primary.ink).toBe(values.content.primary);
      expect(values.action.primary.edge).toBe(values.border.base);
    }
  });
});
