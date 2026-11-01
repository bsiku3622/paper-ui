import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import { itemProfile, outlinedControlProfile } from "./color-recipes";
import { STATUSES, SYSTEM_COLORS } from "./colors";
import { tokens } from "./index";
import * as publicEntry from "./public";
import { strokeRing } from "./shape-recipes";
import { STATE_TINT, STATE_TINT_PROPERTY, focusRing, linkStyle, stateStyle } from "./state-recipes";
import { TYPOGRAPHY } from "./typography";
import {
  ENABLED_SELECTOR, MARKER_ATTRIBUTE, SELECTED_SELECTOR, STATE_ATTRIBUTE, STATE_NAMES, VALUE_ATTRIBUTE, stateAttributes, stateSelector,
  type StateName,
} from "./state";

describe("state vocabulary", () => {
  it("[primitives.state.active-not-pressed] [atoms.states.names] [atoms.states.vocabulary] names the ten states, with no hover and no 'pressed'", () => {
    expect([...STATE_NAMES]).toEqual(["active", "focused", "focusVisible", "focusWithin", "selected", "disabled", "invalid", "required", "dragging", "dropTarget"]);
    expect(STATE_NAMES).not.toContain("hovered");
    expect(STATE_NAMES).not.toContain("pressed");
    expect(Object.values(STATE_ATTRIBUTE).every((attribute) => attribute.startsWith("data-"))).toBe(true);
    expect(Object.values(STATE_ATTRIBUTE).some((attribute) => attribute.startsWith("data-pui-"))).toBe(false);
  });

  it("[atoms.states.names] writes each state of the table under its attribute", () => {
    expect(STATE_ATTRIBUTE).toEqual({
      active: "data-active", focused: "data-focused", focusVisible: "data-focus-visible", focusWithin: "data-focus-within", selected: "data-selected", disabled: "data-disabled",
      invalid: "data-invalid", required: "data-required", dragging: "data-dragging", dropTarget: "data-drop-target",
    });
  });

  it("[atoms.states.vocabulary] selects a state by its attribute", () => {
    expect(stateSelector("focusVisible")).toBe("[data-focus-visible]");
    expect(stateSelector("active")).toBe("[data-active]");
    for (const name of STATE_NAMES) expect(stateSelector(name)).toBe(`[${STATE_ATTRIBUTE[name]}]`);
  });

  it("[primitives.state.attributes] [atoms.states.vocabulary] maps a snapshot to attributes: 'true' while a state holds, undefined otherwise", () => {
    expect(stateAttributes({ active: true, focusVisible: false, disabled: undefined })).toEqual({
      "data-active": "true", "data-focus-visible": undefined, "data-disabled": undefined,
    });
    expect(stateAttributes({})).toEqual({});
    const attributes = stateAttributes({ selected: true });
    expectTypeOf(attributes).toEqualTypeOf<{ "data-selected"?: "true" }>();
  });

  it("[atoms.states.value-attributes] spells the selected and enabled selectors from the state attributes", () => {
    expect(SELECTED_SELECTOR).toBe(":is([data-selected], [aria-current]:not([aria-current=false]))");
    expect(ENABLED_SELECTOR).toBe(":not(:disabled):not([aria-disabled=true]):not([data-disabled])");
  });

  it("[atoms.states.value-attributes] keeps the value and marker attributes apart from the states", () => {
    const states = new Set<string>(Object.values(STATE_ATTRIBUTE));
    for (const attribute of [...Object.values(VALUE_ATTRIBUTE), ...Object.values(MARKER_ATTRIBUTE)]) {
      expect(attribute.startsWith("data-")).toBe(true);
      expect(states.has(attribute), attribute).toBe(false);
    }
    expect(Object.values(VALUE_ATTRIBUTE).sort()).toEqual(["data-orientation", "data-part", "data-placement", "data-presence", "data-presentation", "data-status"]);
    expect(Object.values(MARKER_ATTRIBUTE).sort()).toEqual(["data-drag-ignore", "data-roving-item"]);
  });

  it("[atoms.states.vocabulary] reaches the /tokens entry as the vocabulary and the state selector, and nothing more", () => {
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

  it("[primitives.state.attributes] [atoms.states.vocabulary] leaves no state, value or marker attribute spelled in a primitive", () => {
    const attributes = [...Object.values(STATE_ATTRIBUTE), ...Object.values(VALUE_ATTRIBUTE), ...Object.values(MARKER_ATTRIBUTE)];
    expect(sources.length).toBeGreaterThan(0);
    const spelled = sources.flatMap((file) => {
      const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      return attributes.filter((attribute) => spells(code, attribute)).map((attribute) => `${relative(primitives, file)}: ${attribute}`);
    });
    expect(spelled).toEqual([]);
  });
});

describe("state recipes", () => {
  type Fragment = { [key: string]: unknown };
  const at = (fragment: unknown, ...path: string[]): Fragment => path.reduce((node, key) => (node as Fragment)[key], fragment) as Fragment;
  const { color, shape, motion } = tokens;
  const ENABLED = ENABLED_SELECTOR;
  const forced = (fragment: unknown) => (fragment as Fragment)["@media"] as Fragment;

  // Every value under a key, anywhere below a fragment.
  const valuesOf = (node: unknown, key: string): unknown[] =>
    node && typeof node === "object" ? Object.entries(node).flatMap(([name, value]) => (name === key ? [value] : valuesOf(value, key))) : [];

  it("[foundations.state.recipes] registers one tint property and names it the way the stylesheet reads it", () => {
    expect(STATE_TINT_PROPERTY).toBe("--pui-state-tint");
    expect(STATE_TINT).toBe("var(--pui-state-tint)");
    expect(stateStyle.tinted).toEqual({ backgroundImage: "linear-gradient(var(--pui-state-tint), var(--pui-state-tint))" });
  });

  it("[foundations.state.recipes] [foundations.state.fragments] draws the ring from the Shape geometry and the focus colour", () => {
    expect(focusRing).toEqual({ outline: `${shape.focus.width} solid ${color.interaction.focus}`, outlineOffset: shape.focus.offset });
  });

  it("[foundations.state.recipes] [foundations.state.fragments] lets the ring owner draw the ring on the keyboard state, with the native outline off", () => {
    const { focusVisible } = stateStyle;
    expect(focusVisible.outline).toBe("none");
    expect(at(focusVisible, "selectors")["&[data-focus-visible]"]).toEqual(focusRing);
    expect(at(forced(focusVisible), "(forced-colors: active)", "selectors")["&[data-focus-visible]"]).toEqual({ outlineColor: SYSTEM_COLORS.highlight });
  });

  it("[foundations.state.recipes] [foundations.state.fragments] fades a disabled target by the opacity role and gives it the not-allowed cursor", () => {
    expect(at(stateStyle.disabled, "selectors")["&[data-disabled]"]).toEqual({ opacity: color.opacity.disabled, cursor: "not-allowed" });
    expect(at(stateStyle.disabledCursor, "selectors")["&[data-disabled]"]).toEqual({ cursor: "not-allowed" });
    expect(at(forced(stateStyle.disabled), "(forced-colors: active)", "selectors")["&[data-disabled]"]).toEqual({ opacity: 1, color: SYSTEM_COLORS.grayText, borderColor: SYSTEM_COLORS.grayText });
  });

  it("[foundations.state.recipes] [foundations.state.fragments] presses one stroke down under the pointer or data-active, while the target is enabled", () => {
    expect(at(stateStyle.press, "selectors")[`&:is(:active, [data-active])${ENABLED}`]).toEqual({ transform: `translateY(${motion.role.press.offset})` });
  });

  it("[foundations.state.recipes] [atoms.states.priority] [foundations.state.fragments] tints a neutral item: pressed over selected over hover, and a disabled item answers to neither the pointer nor the press", () => {
    const { item } = stateStyle;
    const selectors = at(item, "selectors");
    const selected = `&${SELECTED_SELECTOR}`;
    const pressing = `&:is(:active, [data-active])${ENABLED}`;
    expect(Object.keys(selectors)).toEqual([selected, pressing]);
    expect(at(selectors, selected)).toEqual({ vars: { [STATE_TINT_PROPERTY]: itemProfile.selectedTint }, color: itemProfile.selectedInk });
    expect(at(selectors, pressing)).toEqual({ vars: { [STATE_TINT_PROPERTY]: itemProfile.activeTint }, color: itemProfile.selectedInk });
    // Hover adds no specificity, so the two above outrank it; it is also the only one that waits for a pointer that can hover.
    const hover = at(item, "@media", "(hover: hover)", "selectors");
    expect(Object.keys(hover)).toEqual([`&:where(:hover${ENABLED})`]);
    expect(hover[`&:where(:hover${ENABLED})`]).toEqual({ vars: { [STATE_TINT_PROPERTY]: itemProfile.hoverTint } });
    expect(item.backgroundImage).toBe(stateStyle.tinted.backgroundImage);
  });

  it("[foundations.state.recipes] hands a selected item the system colours under forced colours, and an ink hairline under increased contrast", () => {
    const { item } = stateStyle;
    const selected = `&${SELECTED_SELECTOR}`;
    expect(at(item, "@media", "(forced-colors: active)", "selectors")[selected]).toEqual({
      forcedColorAdjust: "none", backgroundColor: SYSTEM_COLORS.highlight, backgroundImage: "none", color: SYSTEM_COLORS.highlightText,
    });
    expect(at(item, "@media", "(hover: hover) and (forced-colors: active)", "selectors")[`&:hover${ENABLED}`]).toEqual({ borderColor: SYSTEM_COLORS.highlight });
    expect(at(item, "@media", "(prefers-contrast: more)", "selectors")[selected]).toEqual({ boxShadow: strokeRing(color.ink.primary) });
  });

  it("[foundations.state.recipes] [foundations.state.fragments] gives an outlined control a border per status, and a rising border on hover only while it has none", () => {
    const { field } = stateStyle;
    expect(Object.keys(at(field, "selectors"))).toEqual(STATUSES.map((status) => `&[data-status="${status}"]`));
    for (const status of STATUSES) expect(at(field, "selectors")[`&[data-status="${status}"]`]).toEqual({ borderColor: outlinedControlProfile.status[status] });
    expect(at(field, "@media", "(hover: hover)", "selectors")[`&:hover${ENABLED}:not([data-status])`]).toEqual({ borderColor: outlinedControlProfile.hoverBorder });
    // A forced palette reverts the rule above, so the Highlight rule has to match its specificity too.
    const forcedHover = at(field, "@media", "(hover: hover) and (forced-colors: active)", "selectors");
    for (const selector of [`&:hover${ENABLED}`, `&:hover${ENABLED}:not([data-status])`]) expect(forcedHover[selector]).toEqual({ borderColor: SYSTEM_COLORS.highlight });
  });

  it("[foundations.state.recipes] [foundations.state.fragments] turns the border of a drop target to where the input is going", () => {
    expect(at(stateStyle.dropTarget, "selectors")["&[data-drop-target]"]).toEqual({ borderColor: color.interaction.focus });
    expect(at(forced(stateStyle.dropTarget), "(forced-colors: active)", "selectors")["&[data-drop-target]"]).toEqual({ borderColor: SYSTEM_COLORS.highlight });
  });

  it("[foundations.state.recipes] [foundations.state.fragments] underlines only under a pointer that can hover, while the target is enabled", () => {
    const { hoverUnderline } = stateStyle;
    expect(hoverUnderline.textDecorationLine).toBe("none");
    expect(at(hoverUnderline, "@media", "(hover: hover)", "selectors")[`&:hover${ENABLED}`]).toEqual({ textDecorationLine: "underline" });
  });

  it("[foundations.state.recipes] asks the system colours alone for anything it paints under forced colours", () => {
    const names = new Set<string>(Object.values(SYSTEM_COLORS));
    for (const fragment of Object.values(stateStyle)) {
      for (const [query, block] of Object.entries((fragment as Fragment)["@media"] ?? {})) {
        if (!query.includes("forced-colors")) continue;
        for (const key of ["outlineColor", "color", "borderColor", "backgroundColor"]) {
          for (const value of valuesOf(block, key)) expect(names.has(value as string), `${query} ${key}: ${String(value)}`).toBe(true);
        }
      }
    }
  });

  it("[foundations.state.recipes] [foundations.state.fragments] never sets a transition, and leaves a link as flat declarations", () => {
    for (const [name, fragment] of Object.entries(stateStyle)) expect(valuesOf(fragment, "transition"), name).toEqual([]);
    expect(linkStyle).toEqual({ color: color.interaction.link, textDecorationLine: "underline", textUnderlineOffset: TYPOGRAPHY.palette.decoration.underlineOffset });
  });

  it("[foundations.state.recipes] spells no state attribute itself: every selector is built from tokens/state.ts", () => {
    const file = join(dirname(fileURLToPath(import.meta.url)), "state-recipes.ts");
    const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/["'`][^"'`\n]*(?<![\w-])(?:data|aria)-[a-z]/);
  });

  it("[foundations.state.recipes] reaches the /tokens entry as plain objects", () => {
    for (const name of ["focusRing", "stateStyle", "linkStyle", "STATE_TINT", "STATE_TINT_PROPERTY"]) expect(name in publicEntry, name).toBe(true);
    expect((publicEntry as Record<string, unknown>).stateStyle).toBe(stateStyle);
  });
});
