import { describe, expect, it } from "vitest";

import { docPath, resolveDocHref } from "./links";

describe("resolveDocHref", () => {
  it("keeps a link to a heading of the same doc as an anchor", () => {
    expect(resolveDocHref("atoms/states.md", "#우선순위")).toEqual({ kind: "anchor", hash: "우선순위" });
  });

  it("reads a sibling link from the folder of a group README", () => {
    expect(resolveDocHref("foundations/README.md", "color.md")).toEqual({ kind: "doc", slug: "foundations/color" });
    expect(resolveDocHref("foundations/README.md", "./shape.md")).toEqual({ kind: "doc", slug: "foundations/shape" });
  });

  it("walks ../ from the folder of the doc", () => {
    expect(resolveDocHref("atoms/states.md", "../foundations/color.md")).toEqual({ kind: "doc", slug: "foundations/color" });
    expect(resolveDocHref("README.md", "get-started/install.md")).toEqual({ kind: "doc", slug: "get-started/install" });
  });

  it("answers a group README with the folder name and the top README with the overview", () => {
    expect(resolveDocHref("README.md", "foundations/README.md")).toEqual({ kind: "doc", slug: "foundations" });
    expect(resolveDocHref("atoms/states.md", "README.md")).toEqual({ kind: "doc", slug: "atoms" });
    expect(resolveDocHref("atoms/README.md", "../README.md")).toEqual({ kind: "doc", slug: "" });
  });

  it("carries the hash of a .md link", () => {
    expect(resolveDocHref("atoms/README.md", "../foundations/color.md#accent--variant")).toEqual({ kind: "doc", slug: "foundations/color", hash: "accent--variant" });
    expect(resolveDocHref("atoms/README.md", "../get-started/install.md#%ED%8F%B0%ED%8A%B8")).toEqual({ kind: "doc", slug: "get-started/install", hash: "%ED%8F%B0%ED%8A%B8" });
    expect(resolveDocHref("atoms/README.md", "../get-started/install.md#")).toEqual({ kind: "doc", slug: "get-started/install" });
  });

  it("sends an absolute path to the app router", () => {
    expect(resolveDocHref("atoms/README.md", "/playground/button")).toEqual({ kind: "app", path: "/playground/button" });
    expect(resolveDocHref("README.md", "/playground/foundations/color#roles")).toEqual({ kind: "app", path: "/playground/foundations/color#roles" });
  });

  it("opens anything else as an external link", () => {
    for (const href of ["https://github.com/bsiku3622/paper-ui", "mailto:hello@example.com", "https://example.com/guide.md", "//cdn.example.com/a", "https://example.com/#top"]) {
      expect(resolveDocHref("README.md", href), href).toEqual({ kind: "external", href });
    }
  });
});

describe("docPath", () => {
  it("is /docs for the overview and /docs/<slug> for the rest", () => {
    expect(docPath("")).toBe("/docs");
    expect(docPath("atoms")).toBe("/docs/atoms");
    expect(docPath("foundations/color", "roles")).toBe("/docs/foundations/color#roles");
  });
});
