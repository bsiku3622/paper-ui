import { describe, expect, it } from "vitest";

import { walkValues, pathToCssVar } from "./helpers";
import { CODE_SPEC, CONTROL_PRESETS, FONT_STYLESHEETS, PRESET_SPEC, ROLE_SPEC, TEXT_INK, TYPOGRAPHY, TYPOGRAPHY_SOURCE, TYPOGRAPHY_VALUES } from "./typography";
import { PRESET_SINGLE_LINE, codeRule, emphasisRule, monoRule, presetRule, typographyRule } from "./typography-recipes";

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
  "fontSize.hero": "clamp(2.25rem, 6vw, 3.75rem)",
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
  "leading.hero": "1.04",
  "tracking.mono": "-0.04em",
  "tracking.tighter": "-0.035em",
  "tracking.tight": "-0.02em",
  "tracking.snug": "-0.01em",
  "tracking.normal": "0",
  "tracking.wide": "0.01em",
  "decoration.underlineOffset": "0.2em",
  "monoSizeScale": "0.95",
  "codeScale.inline": "0.85",
  "codeScale.compact": "0.8",
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
    expect(leaves).toHaveLength(87);
    for (const leaf of leaves) expect(emitted.has(leaf.slice("var(".length, -1)), leaf).toBe(true);
  });
});

const value = (ref: string) => {
  const name = ref.slice("var(".length, -1);
  return [...emitted].find(([key]) => key === name)?.[1];
};

describe("hero is the one fluid step", () => {
  it("grows with the viewport between two lengths and keeps a unitless leading", () => {
    expect(TYPOGRAPHY_SOURCE.fluid.hero).toEqual({ min: 36, vw: 6, max: 60, leading: 1.04 });
    expect(value(TYPOGRAPHY.role.hero.size)).toBe("clamp(2.25rem, 6vw, 3.75rem)");
    expect(value(TYPOGRAPHY.role.hero.leading)).toBe("1.04");
    expect(value(TYPOGRAPHY.role.hero.tracking)).toBe("-0.035em");
    expect(ROLE_SPEC.hero.weight).toBe("bold");
    expect(TEXT_INK.hero).toBe("primary");
  });

  it("leaves display where it was", () => {
    expect(value(TYPOGRAPHY.role.display.size)).toBe("2rem");
    expect(value(TYPOGRAPHY.role.display.leading)).toBe("2.5rem");
  });
});

describe("typographyRule", () => {
  it("spells a role from its palette variables and breaks sans between words", () => {
    expect(typographyRule("body")).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.sans,
      fontSize: TYPOGRAPHY.role.body.size,
      fontWeight: TYPOGRAPHY.role.body.weight,
      lineHeight: TYPOGRAPHY.role.body.leading,
      letterSpacing: TYPOGRAPHY.role.body.tracking,
      wordBreak: "keep-all",
      overflowWrap: "break-word",
    });
  });

  it("scales mono by monoSizeScale, swaps the tracking for tracking.mono, and breaks anywhere", () => {
    expect(typographyRule("heading", { family: "mono" })).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.mono,
      fontSize: `calc(${TYPOGRAPHY.role.heading.size} * ${TYPOGRAPHY.palette.monoSizeScale})`,
      fontWeight: TYPOGRAPHY.role.heading.weight,
      lineHeight: TYPOGRAPHY.role.heading.leading,
      letterSpacing: TYPOGRAPHY.palette.tracking.mono,
      wordBreak: "normal",
      overflowWrap: "anywhere",
    });
  });

  it("owns the breaking policy per family", () => {
    expect(TYPOGRAPHY_SOURCE.breaking).toEqual({
      sans: { wordBreak: "keep-all", overflowWrap: "break-word" },
      mono: { wordBreak: "normal", overflowWrap: "anywhere" },
    });
  });
});

describe("monoRule and codeRule", () => {
  it("shrinks inline mono relative to the surrounding text", () => {
    expect(monoRule()).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.mono,
      fontSize: `calc(100% * ${TYPOGRAPHY.palette.monoSizeScale})`,
      letterSpacing: TYPOGRAPHY.palette.tracking.mono,
      wordBreak: "normal",
      overflowWrap: "anywhere",
    });
  });

  it("scales inline and compact code from the surrounding text and sets no letter-spacing", () => {
    for (const kind of ["inline", "compact"] as const) {
      const rule = codeRule(kind);
      expect(rule.fontFamily, kind).toBe(TYPOGRAPHY.palette.family.mono);
      expect(rule.fontSize, kind).toBe(`calc(100% * ${TYPOGRAPHY.palette.codeScale[kind]})`);
      expect(rule, kind).not.toHaveProperty("letterSpacing");
      expect(rule, kind).not.toHaveProperty("lineHeight");
    }
    expect(value(TYPOGRAPHY.palette.codeScale.inline)).toBe("0.85");
    expect(value(TYPOGRAPHY.palette.codeScale.compact)).toBe("0.8");
  });

  it("draws a code block as mono 13 / 20 at the normal weight", () => {
    expect(CODE_SPEC.block).toEqual({ size: "13", weight: "normal", leading: "20" });
    expect(codeRule("block")).toEqual({
      fontFamily: TYPOGRAPHY.palette.family.mono,
      fontSize: TYPOGRAPHY.palette.fontSize["13"],
      fontWeight: TYPOGRAPHY.palette.weight.normal,
      lineHeight: TYPOGRAPHY.palette.leading["20"],
      wordBreak: "normal",
      overflowWrap: "anywhere",
    });
  });
});

describe("presetRule", () => {
  it("names the button weights after the palette", () => {
    expect(Object.keys(PRESET_SPEC.button)).toEqual(["medium", "strong"]);
    expect(presetRule("button", "md", "medium").fontWeight).toBe(TYPOGRAPHY.palette.weight.medium);
    expect(presetRule("button", "md", "strong").fontWeight).toBe(TYPOGRAPHY.palette.weight.strong);
  });

  it("keeps the label of a button or badge on one line and lets an input choose its own", () => {
    expect(PRESET_SINGLE_LINE).toEqual({ button: true, field: false, textarea: false, badge: true });
    expect(Object.keys(PRESET_SINGLE_LINE)).toEqual([...CONTROL_PRESETS]);
    expect(presetRule("button", "sm", "medium").whiteSpace).toBe("nowrap");
    expect(presetRule("badge").whiteSpace).toBe("nowrap");
    expect(presetRule("field", "md")).not.toHaveProperty("whiteSpace");
    expect(presetRule("textarea", "md")).not.toHaveProperty("whiteSpace");
  });

  it("gives a field the 16 glyph line and a 20 input line box", () => {
    expect(presetRule("field", "md").lineHeight).toBe(TYPOGRAPHY.palette.leading["16"]);
    for (const size of ["sm", "md", "lg"] as const) expect(TYPOGRAPHY.preset.field[size].inputLeading, size).toBe(TYPOGRAPHY.palette.leading["20"]);
    expect(presetRule("textarea", "md").lineHeight).toBe(TYPOGRAPHY.palette.leading["20"]);
  });

  it("builds every preset leaf, and the declaration carries no input line", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      for (const rule of [presetRule("button", size, "medium"), presetRule("button", size, "strong"), presetRule("field", size), presetRule("textarea", size)]) {
        expect(Object.keys(rule).sort()).toEqual(expect.arrayContaining(["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing"]));
        expect(rule).not.toHaveProperty("inputLeading");
      }
    }
  });
});

describe("emphasisRule", () => {
  it("is the palette weight of the same name, so regular is always 400", () => {
    expect(emphasisRule("regular")).toEqual({ fontWeight: TYPOGRAPHY.palette.weight.regular });
    expect(TYPOGRAPHY_SOURCE.weight.regular).toBe(400);
    expect(emphasisRule("bold")).toEqual({ fontWeight: TYPOGRAPHY.palette.weight.bold });
  });
});

describe("FONT_STYLESHEETS", () => {
  it("pins both stylesheets to a version", () => {
    expect(FONT_STYLESHEETS).toEqual({
      sans: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css",
      mono: "https://cdn.jsdelivr.net/gh/fonts-archive/D2Coding@5ac6fc6fada70f1d8a8561cec826722574c51a6e/D2Coding.css",
    });
  });
});
