import { describe, expect, it } from "vitest";

import { walkValues, pathToCssVar } from "./helpers";
import { TYPOGRAPHY, TYPOGRAPHY_VALUES } from "./typography";

// The emitted palette strings, key by key. Renaming a variable must not change its value.
const PALETTE_FIXTURE = {
  "family.sans": "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "family.mono": "ui-monospace, SFMono-Regular, Menlo, Consolas, 'D2Coding', monospace",
  "fontSize.12": "0.75rem",
  "fontSize.13": "0.8125rem",
  "fontSize.14": "0.875rem",
  "fontSize.16": "1rem",
  "fontSize.20": "1.25rem",
  "fontSize.24": "1.5rem",
  "fontSize.32": "2rem",
  "weight.regular": "400",
  "weight.normal": "450",
  "weight.medium": "500",
  "weight.strong": "650",
  "weight.semibold": "600",
  "weight.bold": "700",
  "leading.16": "1rem",
  "leading.20": "1.25rem",
  "leading.24": "1.5rem",
  "leading.28": "1.75rem",
  "leading.32": "2rem",
  "leading.40": "2.5rem",
  "tracking.mono": "-0.04em",
  "tracking.tight": "-0.02em",
  "tracking.snug": "-0.01em",
  "tracking.normal": "0",
  "tracking.wide": "0.01em",
  "decoration.underlineOffset": "0.2em",
  "monoSizeScale": "0.95",
};

const emitted = new Map<string, string>();
walkValues(TYPOGRAPHY_VALUES, ["typography"], (path, value) => emitted.set(pathToCssVar(path), value));

describe("Typography source is data", () => {
  it("emits the palette values key by key", () => {
    const palette: Record<string, string> = {};
    walkValues(TYPOGRAPHY_VALUES.palette, [], (path, value) => {
      palette[path.join(".")] = value;
    });
    expect(palette).toEqual(PALETTE_FIXTURE);
  });

  it("names every palette variable under the typography prefix", () => {
    expect(emitted.size).toBe(Object.keys(PALETTE_FIXTURE).length);
    for (const name of emitted.keys()) expect(name).toMatch(/^--pui-typography-palette-/);
  });

  it("builds each role and preset from palette variables", () => {
    expect(TYPOGRAPHY.role.body.size).toBe("var(--pui-typography-palette-font-size-14)");
    const leaves: string[] = [];
    walkValues(TYPOGRAPHY.role, [], (_path, value) => leaves.push(value));
    walkValues(TYPOGRAPHY.preset, [], (_path, value) => leaves.push(value));
    expect(leaves).toHaveLength(80);
    for (const leaf of leaves) expect(emitted.has(leaf.slice("var(".length, -1)), leaf).toBe(true);
  });
});
