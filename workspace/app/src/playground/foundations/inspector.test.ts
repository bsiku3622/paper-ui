// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { MOTION_CONSUMERS, MOTION_ROLES, STATE_TINT_PROPERTY } from "@studio-baeks/paper-ui/tokens";

import { COLOR_SELECTION, PALETTE_TOKENS } from "@paper-ui/inspect/color";
import { LOOP } from "@paper-ui/inspect/motion";
import { SHAPE_SOURCE } from "@paper-ui/inspect/shape";
import { TYPOGRAPHY_SOURCE } from "@paper-ui/inspect/typography";
import { GROUPS, ROLE_NOTES, formatPalettePath, hexAt, rolesOf, selectionAt } from "./color-roles";
import { LOOP_NOTES, MOTION_NOTES, TRANSITION_PROPERTIES, roleNote, roleRange } from "./motion-roles";
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

describe("Motion inspector", () => {
  it("notes every role the vocabulary has, in its order, and every loop", () => {
    expect(Object.keys(MOTION_NOTES)).toEqual([...MOTION_ROLES]);
    expect(Object.keys(LOOP_NOTES)).toEqual(Object.keys(LOOP));
    for (const role of MOTION_ROLES) expect(MOTION_NOTES[role].length, role).toBeGreaterThan(0);
  });

  it("follows a role's note with the components that use it", () => {
    for (const role of MOTION_ROLES) expect(roleNote(role), role).toBe([MOTION_NOTES[role], ...MOTION_CONSUMERS[role]].join(" · "));
  });

  it("composes only the roles that transition: press, hover and state", () => {
    for (const role of Object.keys(TRANSITION_PROPERTIES)) expect(MOTION_ROLES, role).toContain(role);
    expect(Object.keys(TRANSITION_PROPERTIES)).toEqual(["press", "hover", "state"]);
  });

  it("lists the properties each role drives in the package stylesheets", () => {
    const root = fileURLToPath(new URL("../../../../packages/paper-ui/src", import.meta.url));
    const driven: Record<string, string[]> = {};
    // A property is a quoted CSS name, or the registered tint property by its constant.
    const property = /"([^"]+)"|(STATE_TINT_PROPERTY)/g;
    for (const file of readdirSync(root, { recursive: true, encoding: "utf8" }).filter((name) => name.endsWith(".css.ts"))) {
      for (const [, role = "", properties = ""] of readFileSync(`${root}/${file}`, "utf8").matchAll(/\btransition\("(\w+)"((?:,\s*(?:"[^"]+"|STATE_TINT_PROPERTY))+)\)/g)) {
        for (const [, name = "", constant] of properties.matchAll(property)) (driven[role] ??= []).push(constant ? STATE_TINT_PROPERTY : name);
      }
    }
    expect(Object.keys(driven).sort()).toEqual(Object.keys(TRANSITION_PROPERTIES).sort());
    for (const [role, properties] of Object.entries(TRANSITION_PROPERTIES)) expect([...properties].sort(), role).toEqual([...new Set(driven[role])].sort());
  });

  it("writes the span of the role durations, the instant one left out", () => {
    expect(roleRange(["100ms", "130ms", "200ms", "0ms"])).toBe("100~200ms");
  });
});
