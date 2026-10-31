import { describe, expect, it } from "vitest";

import { documentTitle, resolveHandle } from "./handle";

const match = (handle: unknown, params: Record<string, string> = {}) => ({ handle, params });

describe("resolveHandle", () => {
  it("gives a route with no handle the site chrome in the content frame", () => {
    expect(resolveHandle([match(undefined)])).toEqual({ title: undefined, chrome: "site", sidebar: undefined, frame: "content" });
  });

  it("lets the deepest match win each field and keeps what a parent set", () => {
    const resolved = resolveHandle([match(undefined), match({ sidebar: "playground" }), match({ title: "Overview" })]);
    expect(resolved).toMatchObject({ sidebar: "playground", title: "Overview", chrome: "site" });
  });

  it("reads a title function with the params of its own match, and skips a name it does not know", () => {
    const title = (params: Record<string, string | undefined>) => ({ box: "Box" })[params.slug ?? ""];
    expect(resolveHandle([match({ title }, { slug: "box" })]).title).toBe("Box");
    expect(resolveHandle([match({ title: "Playground" }), match({ title }, { slug: "nope" })]).title).toBe("Playground");
  });

  it("carries chrome none and the full frame", () => {
    expect(resolveHandle([match({ chrome: "none", title: "데모" })])).toMatchObject({ chrome: "none", title: "데모" });
    expect(resolveHandle([match({ frame: "full" })]).frame).toBe("full");
  });
});

describe("documentTitle", () => {
  it("suffixes a page with the site name, and the home page is the name alone", () => {
    expect(documentTitle("Color")).toBe("Color — paper-ui");
    expect(documentTitle(undefined)).toBe("paper-ui");
  });
});
