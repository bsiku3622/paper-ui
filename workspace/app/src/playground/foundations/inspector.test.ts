import { describe, expect, it } from "vitest";

import { COLOR_SELECTION } from "../../../../packages/paper-ui/src/tokens/colors";
import { PALETTE_TOKENS } from "../../../../packages/paper-ui/src/tokens/palette";
import { SHAPE_SOURCE } from "../../../../packages/paper-ui/src/tokens/shape";
import { TYPOGRAPHY_SOURCE } from "../../../../packages/paper-ui/src/tokens/typography";
import { GROUPS, ROLE_NOTES, formatPalettePath, hexAt, rolesOf, selectionAt } from "./color-roles";
import { leafPaths } from "./paths";
import { TARGET_NOTES } from "./shape-roles";
import { CODE_SCALE_NOTES, PRESET_NOTES, PRESET_PATHS, SIZE_LEADING } from "./typography-roles";

const NON_ACCENT = Object.fromEntries(Object.entries(COLOR_SELECTION.light).filter(([branch]) => branch !== "accent")) as Omit<typeof COLOR_SELECTION.light, "accent">;
const THEMES = ["light", "dark"] as const;

// What the Color page used to do: find the first Palette Token whose HEX equals the role's.
const reverseLookup = (hex: string): string => {
  const visit = (value: unknown, path: string[]): string | undefined => {
    if (typeof value === "string") return value.toLowerCase() === hex.toLowerCase() ? path.join(".") : undefined;
    if (!value || typeof value !== "object") return undefined;
    for (const [key, child] of Object.entries(value)) {
      const match = visit(child, [...path, key]);
      if (match) return match;
    }
    return undefined;
  };
  return (visit(PALETTE_TOKENS, []) ?? "palette").replace(/^accent\./, "");
};

describe("Color inspector", () => {
  it("notes every role the selection table has, and only those", () => {
    const roles = leafPaths(NON_ACCENT);
    expect(Object.keys(ROLE_NOTES).sort()).toEqual([...roles].sort());
    for (const role of roles) expect(ROLE_NOTES[role].length, role).toBeGreaterThan(0);
  });

  it("shows every role in exactly one group, in selection order", () => {
    expect(GROUPS.flatMap((group) => rolesOf(group.branches))).toEqual(leafPaths(NON_ACCENT));
    expect(GROUPS.flatMap((group) => group.branches)).toEqual(Object.keys(NON_ACCENT));
  });

  it("names a role's Palette Token as the old reverse lookup of its HEX did, in both themes", () => {
    const roles = leafPaths(COLOR_SELECTION.light);
    expect(roles.length).toBeGreaterThan(Object.keys(ROLE_NOTES).length);
    for (const mode of THEMES) {
      for (const role of roles) {
        expect(formatPalettePath(selectionAt(mode, role)), `${mode} ${role}`).toBe(reverseLookup(hexAt(mode, role)));
      }
    }
  });
});

describe("Typography inspector", () => {
  it("pairs every font size with a leading, the fluid step with its own", () => {
    for (const size of Object.keys(TYPOGRAPHY_SOURCE.fontSize)) {
      expect(Object.keys(TYPOGRAPHY_SOURCE.leading), size).toContain(SIZE_LEADING[size as keyof typeof SIZE_LEADING]);
    }
    for (const size of Object.keys(TYPOGRAPHY_SOURCE.fluid)) expect(SIZE_LEADING[size as keyof typeof SIZE_LEADING], size).toBe(size);
  });

  it("notes every code scale the source has", () => {
    expect(Object.keys(CODE_SCALE_NOTES)).toEqual(Object.keys(TYPOGRAPHY_SOURCE.codeScale));
  });

  it("lists every preset once and notes each", () => {
    expect(PRESET_PATHS).toEqual(["button.medium", "button.strong", "field", "textarea", "badge"]);
    expect(Object.keys(PRESET_NOTES).sort()).toEqual([...PRESET_PATHS].sort());
  });
});

describe("Shape inspector", () => {
  it("notes every target value the source has, and only those", () => {
    expect(Object.keys(TARGET_NOTES)).toEqual(Object.keys(SHAPE_SOURCE.target));
    for (const [name, note] of Object.entries(TARGET_NOTES)) expect(note.length, name).toBeGreaterThan(0);
  });
});
