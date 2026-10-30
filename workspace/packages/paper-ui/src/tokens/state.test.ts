import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import * as publicEntry from "./public";
import {
  ENABLED_SELECTOR, MARKER_ATTRIBUTE, SELECTED_SELECTOR, STATE_ATTRIBUTE, STATE_NAMES, VALUE_ATTRIBUTE, stateAttributes, stateSelector,
  type StateName,
} from "./state";

describe("state vocabulary", () => {
  it("names the nine states, with no hover and no 'pressed'", () => {
    expect([...STATE_NAMES]).toEqual(["active", "focused", "focusVisible", "selected", "disabled", "invalid", "required", "dragging", "dropTarget"]);
    expect(STATE_NAMES).not.toContain("hovered");
    expect(STATE_NAMES).not.toContain("pressed");
    expect(Object.values(STATE_ATTRIBUTE).every((attribute) => attribute.startsWith("data-"))).toBe(true);
    expect(Object.values(STATE_ATTRIBUTE).some((attribute) => attribute.startsWith("data-pui-"))).toBe(false);
  });

  it("selects a state by its attribute", () => {
    expect(stateSelector("focusVisible")).toBe("[data-focus-visible]");
    expect(stateSelector("active")).toBe("[data-active]");
    for (const name of STATE_NAMES) expect(stateSelector(name)).toBe(`[${STATE_ATTRIBUTE[name]}]`);
  });

  it("maps a snapshot to attributes: 'true' while a state holds, undefined otherwise", () => {
    expect(stateAttributes({ active: true, focusVisible: false, disabled: undefined })).toEqual({
      "data-active": "true", "data-focus-visible": undefined, "data-disabled": undefined,
    });
    expect(stateAttributes({})).toEqual({});
    const attributes = stateAttributes({ selected: true });
    expectTypeOf(attributes).toEqualTypeOf<{ "data-selected"?: "true" }>();
  });

  it("spells the selected and enabled selectors from the state attributes", () => {
    expect(SELECTED_SELECTOR).toBe(":is([data-selected], [aria-current]:not([aria-current=false]))");
    expect(ENABLED_SELECTOR).toBe(":not(:disabled):not([aria-disabled=true]):not([data-disabled])");
  });

  it("keeps the value and marker attributes apart from the states", () => {
    const states = new Set<string>(Object.values(STATE_ATTRIBUTE));
    for (const attribute of [...Object.values(VALUE_ATTRIBUTE), ...Object.values(MARKER_ATTRIBUTE)]) {
      expect(attribute.startsWith("data-")).toBe(true);
      expect(states.has(attribute), attribute).toBe(false);
    }
    expect(VALUE_ATTRIBUTE.orientation).toBe("data-orientation");
    expect(MARKER_ATTRIBUTE.rovingItem).toBe("data-roving-item");
  });

  it("reaches the /tokens entry as the vocabulary and the state selector, and nothing more", () => {
    expect((publicEntry as Record<string, unknown>).STATE_NAMES).toBe(STATE_NAMES);
    expect(typeof (publicEntry as Record<string, unknown>).stateSelector).toBe("function");
    expectTypeOf<StateName>().toEqualTypeOf<keyof typeof STATE_ATTRIBUTE>();
    for (const internal of ["STATE_ATTRIBUTE", "stateAttributes", "SELECTED_SELECTOR", "ENABLED_SELECTOR", "VALUE_ATTRIBUTE", "MARKER_ATTRIBUTE"]) {
      expect(internal in publicEntry, internal).toBe(false);
    }
  });
});

describe("attribute spelling", () => {
  // Only tokens/state.ts spells these attributes; the primitives take them from it. Stylesheets outside the
  // primitives and the app are not scanned here.
  const primitives = join(dirname(dirname(fileURLToPath(import.meta.url))), "primitives");
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
  const sources = walk(primitives).filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file));
  const spells = (code: string, attribute: string) => new RegExp(`(?<![\\w-])${attribute}(?![\\w-])`).test(code);

  it("reads an attribute however it is spelled, and only that attribute", () => {
    for (const code of ["<button data-active={isActive}>", `{ "data-active": "true" }`, "`[data-active]`", "`[data-active=true]`"]) expect(spells(code, "data-active"), code).toBe(true);
    for (const code of ["data-active-item", "x-data-active", "isActive"]) expect(spells(code, "data-active"), code).toBe(false);
  });

  it("leaves no state, value or marker attribute spelled in a primitive", () => {
    const attributes = [...Object.values(STATE_ATTRIBUTE), ...Object.values(VALUE_ATTRIBUTE), ...Object.values(MARKER_ATTRIBUTE)];
    expect(sources.length).toBeGreaterThan(0);
    const spelled = sources.flatMap((file) => {
      const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      return attributes.filter((attribute) => spells(code, attribute)).map((attribute) => `${relative(primitives, file)}: ${attribute}`);
    });
    expect(spelled).toEqual([]);
  });
});
