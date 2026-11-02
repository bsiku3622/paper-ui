import { describe, expect, it } from "vitest";

// /demo is the system's own test: a screen says what it wants through Paper's parts and props, or it goes without and the
// gap shows. So its files hold no stylesheet, no className, no inline style and no element of their own.
const SOURCES = import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const ALLOWED = [/^@studio-baeks\/paper-ui(\/tokens)?$/, /^react$/, /^react-router-dom$/, /^\.\.\/\.\.\/compositions\/icons$/, /^\.\/parts$/];

describe("the demo's screens are Paper alone", () => {
  it("finds the screens", () => {
    expect(Object.keys(SOURCES).sort()).toEqual(["./DashboardScreen.tsx", "./Demo.tsx", "./LoginScreen.tsx", "./SettingsScreen.tsx", "./parts.tsx"]);
  });

  for (const [path, source] of Object.entries(SOURCES)) {
    const code = source.replace(/^\s*\/\/.*$/gm, "");
    it(`${path} imports only Paper, React, the router, the glyphs and its neighbours`, () => {
      const imports = [...code.matchAll(/from "([^"]+)"/g)].map((match) => match[1]!);
      for (const name of imports) expect(ALLOWED.some((rule) => rule.test(name)), name).toBe(true);
    });
    it(`${path} sets no className and no style`, () => {
      expect(code).not.toMatch(/\bclassName\b/);
      expect(code).not.toMatch(/\bstyle=/);
      expect(code).not.toMatch(/\.css["']/);
    });
    it(`${path} sizes nothing by hand: a width or a height is a name from Shape, and only a grid's tracks are the screen's own`, () => {
      expect(code).not.toMatch(/\b(?:width|height|minWidth|maxWidth|minHeight|maxHeight)="[\d.]+(?:rem|px|em)"/);
    });
    it(`${path} draws no element of its own`, () => {
      // A generic such as useState<string> follows a name; a tag never does.
      expect(code.match(/(?<![\w.])<[a-z][a-z0-9]*[\s/>]/g) ?? []).toEqual([]);
    });
  }
});
