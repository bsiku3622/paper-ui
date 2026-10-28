import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderHook } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { PaperProvider } from "@studio-baeks/paper-ui";
import * as vocabulary from "@studio-baeks/paper-ui/tokens";

import { PLAYGROUND_NAV, slugOf } from "../../site/site-map";
import { REGISTRY, codeOf, initialState, normalized, stateFromCode, type Control, type Entry, type State } from ".";

const FILES = import.meta.glob("./entries/*.tsx", { eager: true });
const SOURCES = import.meta.glob<string>("./entries/*.tsx", { query: "?raw", import: "default", eager: true });

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
});

const wrapper = ({ children }: { children?: React.ReactNode }) => createElement(PaperProvider, null, children);
const harnesses = new Map<string, unknown>();
const harnessOf = (entry: Entry): unknown => {
  if (!harnesses.has(entry.slug)) harnesses.set(entry.slug, renderHook(() => entry.useHarness(), { wrapper }).result.current);
  return harnesses.get(entry.slug);
};

// useId's format depends on the tree position and the React version; two renders of one subject differ only there.
const IDS = /«[^»]*»|_r_[a-z0-9]+_|:r[a-z0-9]+:/gi;
const markup = (node: ReactElement) => renderToStaticMarkup(createElement(PaperProvider, null, node)).replace(IDS, "ID");

const base = (entry: Entry): State => normalized(entry, initialState(entry));
const withKey = (entry: Entry, key: string, value: string | boolean | undefined): State => normalized(entry, { ...base(entry), [key]: value });

const SAMPLE_TEXTS = ["샘플 text", 'a "quoted" {brace} <tag>', ""];
const valuesOf = (control: Control): (string | boolean | undefined)[] => {
  if (control.kind === "bool") return [true, false];
  if (control.kind === "enum") return control.required ? [...control.options] : [undefined, ...control.options];
  return SAMPLE_TEXTS;
};

const vocabularyOf = (name: string): readonly string[] => (vocabulary as unknown as Record<string, readonly string[]>)[name]!;
const enums = REGISTRY.flatMap((entry) => entry.controls.flatMap((control) => (control.kind === "enum" ? [{ entry, control }] : [])));

describe("REGISTRY", () => {
  const items = PLAYGROUND_NAV.filter((group) => group.id !== "foundations").flatMap((group) => group.sections.flatMap((section) => section.items));

  it("is the site map's Primitives, Utilities and Atoms one for one, in order", () => {
    expect(REGISTRY.map((entry) => entry.name)).toEqual(items.map((item) => item.name));
    expect(REGISTRY.map((entry) => entry.slug)).toEqual(items.map((item) => slugOf(item.name)));
  });

  it("has a file for each entry and no file without one", () => {
    expect(Object.keys(FILES).sort()).toEqual(REGISTRY.map((entry) => `./entries/${entry.slug}.tsx`).sort());
  });

  it("takes the group of each entry from the sidebar section it sits in", () => {
    const sections = PLAYGROUND_NAV.filter((group) => group.id !== "foundations").flatMap((group) => group.sections.map((section) => ({ group, section })));
    for (const entry of REGISTRY) {
      const home = sections.find(({ section }) => section.items.some((item) => item.slug === entry.slug))!;
      expect(entry.group, entry.name).toBe(home.section.label || "Atoms");
      expect(entry.part, entry.name).toBe(home.group.id);
    }
  });

  it("writes blurbs without digits", () => {
    for (const entry of REGISTRY) expect(entry.blurb, entry.name).toMatch(/^[^0-9]*$/);
  });

  it("gives each control one key per entry", () => {
    for (const entry of REGISTRY) {
      const keys = entry.controls.map((control) => control.key);
      expect(new Set(keys).size, entry.name).toBe(keys.length);
    }
  });

  it("leaves no hand-typed option list and no size ladder literal in the entries", () => {
    for (const [file, source] of Object.entries(SOURCES)) {
      expect(source, file).not.toMatch(/options:\s*\[/);
      expect(source, file).not.toMatch(/\[\s*"sm",\s*"md",\s*"lg"\s*\]/);
    }
  });
});

describe("enum options", () => {
  it("equal the vocabulary constant they are bound to", () => {
    for (const { entry, control } of enums) {
      if (control.kind !== "enum" || control.source.kind !== "vocabulary") continue;
      expect(control.options, `${entry.name}.${control.prop}`).toEqual(vocabularyOf(control.source.name));
    }
  });

  it("stay inside the vocabulary constant of a subset, and say why they leave values out", () => {
    for (const { entry, control } of enums) {
      if (control.kind !== "enum" || control.source.kind !== "subset") continue;
      const all = vocabularyOf(control.source.name);
      expect(control.options.length, `${entry.name}.${control.prop}`).toBeLessThan(all.length);
      for (const option of control.options) expect(all, `${entry.name}.${control.prop} ${option}`).toContain(option);
      expect(control.source.reason, `${entry.name}.${control.prop}`).not.toBe("");
    }
  });

  it("explain a component-local list or a sample, and name the stage that replaces a pending one", () => {
    for (const { entry, control } of enums) {
      if (control.kind !== "enum") continue;
      const label = `${entry.name}.${control.prop}`;
      if (control.source.kind === "local" || control.source.kind === "sample") expect(control.source.reason, label).not.toBe("");
      if (control.source.kind === "pending") {
        expect(control.source.stage, label).toMatch(/^S\d{2}$/);
        expect(control.source.becomes, label).not.toBe("");
      }
    }
  });

  it("repeat no option and keep the initial one among them", () => {
    for (const { entry, control } of enums) {
      if (control.kind !== "enum") continue;
      expect(new Set(control.options).size, `${entry.name}.${control.prop}`).toBe(control.options.length);
      if (control.initial !== undefined) expect(control.options, `${entry.name}.${control.prop}`).toContain(control.initial);
    }
  });
});

describe("code", () => {
  it("prints every entry's first view without a name missing", () => {
    for (const entry of REGISTRY) expect(codeOf(entry, base(entry), harnessOf(entry)).split("\n\n").at(-1), entry.name).toMatch(/^</);
  });

  it("reads back what it printed, for every control and every value", () => {
    let checked = 0;
    for (const entry of REGISTRY) {
      for (const control of entry.controls) {
        for (const value of valuesOf(control)) {
          const state = withKey(entry, control.key, value);
          const result = stateFromCode(entry, codeOf(entry, state, harnessOf(entry)), state);
          const label = `${entry.name}.${control.key}=${String(value)}`;
          expect("error" in result ? result.error : result.state, label).toEqual(state);
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(400);
  });

  it("prints a prop equal to the component's own default as no prop at all", () => {
    for (const { entry, control } of enums) {
      const own = entry.defaults[control.prop];
      if (own === undefined || control.kind !== "enum" || !control.options.includes(String(own))) continue;
      const state: State = { ...base(entry), [control.key]: String(own) };
      expect(codeOf(entry, state, harnessOf(entry)), `${entry.name}.${control.prop}`).not.toContain(`${control.prop}=`);
    }
  });

  it("refuses code it cannot read and tells which part", () => {
    const box = REGISTRY.find((entry) => entry.slug === "box")!;
    const button = REGISTRY.find((entry) => entry.slug === "button")!;
    expect(stateFromCode(box, "const x = 1;", base(box))).toEqual({ error: "Box JSX를 읽을 수 없습니다." });
    expect(stateFromCode(button, '<Button variant="bogus">x</Button>', base(button))).toHaveProperty("error");
    expect(stateFromCode(button, '<Button size={size}>x</Button>', base(button))).toHaveProperty("error");
  });

  it("reads a prop wherever it sits in the tag", () => {
    const button = REGISTRY.find((entry) => entry.slug === "button")!;
    const code = '<Button\n  accent="error"\n  onClick={() => { go("}"); }}\n  size="lg" loading disabled={false}>저장</Button>';
    const result = stateFromCode(button, code, base(button));
    expect(result).toEqual({ state: expect.objectContaining({ accent: "error", size: "lg", loading: true, disabled: false, children: "저장" }) });
  });
});

describe("defaults", () => {
  it("make no difference to the markup when a select states them", () => {
    for (const { entry, control } of enums) {
      const own = entry.defaults[control.prop];
      if (own === undefined || control.kind !== "enum") continue;
      const harness = harnessOf(entry);
      const omitted = { ...base(entry), [control.key]: undefined };
      const stated = { ...base(entry), [control.key]: String(own) };
      expect(markup(entry.subject(stated, harness)), `${entry.name}.${control.prop}`).toBe(markup(entry.subject(omitted, harness)));
    }
  });

  it("are a value the control offers", () => {
    for (const { entry, control } of enums) {
      const own = entry.defaults[control.prop];
      if (own !== undefined && control.kind === "enum") expect(control.options, `${entry.name}.${control.prop}`).toContain(String(own));
    }
  });

  it("leave every prop without a default changing the markup, option by option", () => {
    for (const entry of REGISTRY) {
      const harness = harnessOf(entry);
      for (const control of entry.controls) {
        if (control.kind === "text" || control.behaviorOnly || entry.defaults[control.prop] !== undefined || (control.kind === "enum" && control.required)) continue;
        const omitted = markup(entry.subject({ ...base(entry), [control.key]: control.kind === "bool" ? false : undefined }, harness));
        const values = control.kind === "bool" ? [true] : control.options;
        for (const value of values) {
          const state = { ...base(entry), [control.key]: value };
          expect(markup(entry.subject(state, harness)), `${entry.name}.${control.prop}=${String(value)}`).not.toBe(omitted);
        }
      }
    }
  });
});

describe("stage", () => {
  it("contains the subject's markup", () => {
    for (const entry of REGISTRY) {
      const { Stage } = entry;
      const harness = harnessOf(entry);
      const state = base(entry);
      const subject = entry.subject(state, harness);
      if (!Stage) continue;
      const staged = markup(createElement(Stage, { subject, state, harness }));
      if (entry.gated) {
        expect(entry.gated, entry.name).not.toBe("");
        continue;
      }
      expect(staged, entry.name).toContain(markup(subject));
    }
  });
});
