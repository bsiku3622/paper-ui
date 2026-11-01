import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { warnUnknownSourceVariables } from "./source-check";

// A document with these stylesheets. jsdom reads custom properties unevenly, so a rule is spelled as the CSSOM gives it.
const documentWith = (styleSheets: unknown[], adoptedStyleSheets?: unknown[]) => ({ styleSheets, adoptedStyleSheets }) as unknown as Document;
const style = (...names: string[]) => ({ style: names });
const sheet = (...cssRules: unknown[]) => ({ cssRules });
const crossOrigin = () => ({
  get cssRules(): never {
    throw new DOMException("Cannot access rules", "SecurityError");
  },
});

const warned = (doc: Document) => {
  warnUnknownSourceVariables(doc);
  return vi.mocked(console.warn).mock.calls.map(([message]) => String(message));
};

beforeEach(() => void vi.spyOn(console, "warn").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

describe("the check of a source override's plain CSS form", () => {
  it("[foundations.override.unknown-warning] tells each name the package does not emit once, in one English warning", () => {
    const messages = warned(documentWith([sheet(style("--pui-shape-nope", "color", "--pui-shape-nope"), style("--pui-layout-gutter"))]));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatch(/^\[paper-ui\] /);
    expect(messages[0]).toContain("--pui-layout-gutter, --pui-shape-nope");
  });

  it("[foundations.override.unknown-warning] reads inside group rules, nested rules, imported sheets and adopted sheets", () => {
    const messages = warned(documentWith(
      [sheet({ cssRules: [style("--pui-shape-in-layer"), { style: [], cssRules: [style("--pui-shape-nested")] }] }, { styleSheet: sheet(style("--pui-shape-imported")) })],
      [sheet(style("--pui-shape-adopted"))],
    ));
    for (const name of ["--pui-shape-in-layer", "--pui-shape-nested", "--pui-shape-imported", "--pui-shape-adopted"]) expect(messages[0]).toContain(name);
  });

  it("[foundations.override.unknown-warning] skips a sheet the browser will not let it read, reads the others and says nothing of what it skipped", () => {
    expect(warned(documentWith([crossOrigin(), sheet({ styleSheet: crossOrigin() })]))).toEqual([]);
    const messages = warned(documentWith([crossOrigin(), sheet(style("--pui-shape-readable"))]));
    expect(messages[0]).toContain("--pui-shape-readable");
  });

  it("[foundations.override.unknown-warning] stays quiet about the names the package emits and the names that are not a source's", () => {
    const names = ["--pui-shape-control-height-md", "--pui-layout-container-content", "--pui-layout-shadow-floating-0", "--pui-typography-palette-font-size-14", "--pui-color-ink-primary", "--pui-state-tint", "--mine"];
    expect(warned(documentWith([sheet(style(...names))]))).toEqual([]);
  });

  it("[foundations.override.unknown-warning] does not read an inline style: only stylesheets are walked", () => {
    const element = document.createElement("div");
    element.style.setProperty("--pui-shape-inline", "1px");
    document.body.append(element);
    expect(warned(document)).toEqual([]);
    element.remove();
  });
});
