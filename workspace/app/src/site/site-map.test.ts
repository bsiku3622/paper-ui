import { describe, expect, it } from "vitest";

import { INVENTORY, PRIMITIVE_GROUPS } from "@studio-baeks/paper-ui";

import { DOC_GROUPS, FOUNDATIONS, PLAYGROUND_NAV, SITE_NAV, docFile, docSlug, slugOf } from "./site-map";

const unique = (values: readonly string[]) => values.filter((value, index) => values.indexOf(value) !== index);

describe("slugOf", () => {
  it("turns a PascalCase name into a kebab-case slug", () => {
    expect(slugOf("Box")).toBe("box");
    expect(slugOf("IconButton")).toBe("icon-button");
    expect(slugOf("ToggleGroup")).toBe("toggle-group");
    expect(slugOf("A11y")).toBe("a11y");
  });
});

describe("PLAYGROUND_NAV", () => {
  const items = PLAYGROUND_NAV.flatMap((group) => group.sections.flatMap((section) => section.items));

  it("runs Foundations, Primitives, Atoms", () => {
    expect(PLAYGROUND_NAV.map((group) => group.label)).toEqual(["Foundations", "Primitives", "Atoms"]);
  });

  it("maps every item to one slug", () => {
    expect(unique(items.map((item) => item.slug))).toEqual([]);
    expect(unique(items.map((item) => item.name))).toEqual([]);
  });

  it("lists the Foundations pages, then the primitive categories and Utilities, then the Atoms of the inventory in order", () => {
    const [foundations, primitives, atoms] = PLAYGROUND_NAV;
    expect(foundations?.sections.flatMap((section) => section.items.map((item) => item.slug))).toEqual(FOUNDATIONS.map(({ id }) => `foundations/${id}`));
    expect(primitives?.sections.map((section) => section.label)).toEqual([...PRIMITIVE_GROUPS, "Utilities"]);
    for (const group of PRIMITIVE_GROUPS) {
      expect(primitives?.sections.find((section) => section.label === group)?.items.map((item) => item.name)).toEqual([...INVENTORY.primitives[group].components]);
    }
    expect(atoms?.sections.flatMap((section) => section.items.map((item) => item.name))).toEqual([...INVENTORY.atoms]);
  });

  it("names Composition and Theme under Utilities, both known to the inventory", () => {
    const utilities = PLAYGROUND_NAV.flatMap((group) => group.sections).find((section) => section.label === "Utilities");
    expect(utilities?.items.map((item) => item.name)).toEqual(["Composition", "Theme"]);
    for (const { name } of utilities?.items ?? []) expect(Object.keys(INVENTORY.utilities), name).toContain(name);
  });

  it("derives every slug from the name", () => {
    for (const { name, slug } of items.filter((item) => !item.slug.startsWith("foundations/"))) expect(slug).toBe(slugOf(name));
  });
});

describe("DOC_GROUPS", () => {
  it("has unique group ids and unique doc ids in each group", () => {
    expect(unique(DOC_GROUPS.map((group) => group.id))).toEqual([]);
    for (const group of DOC_GROUPS) expect(unique(group.docs), group.id).toEqual([]);
  });

  it("has unique slugs and files across the groups", () => {
    const entries = DOC_GROUPS.flatMap((group) => group.docs.map((doc) => ({ slug: docSlug(group.id, doc), file: docFile(group.id, doc) })));
    expect(unique(entries.map((entry) => entry.slug))).toEqual([]);
    expect(unique(entries.map((entry) => entry.file))).toEqual([]);
  });

  it("gives every group a label for the sidebar and a Korean label for the docs map, except the top level", () => {
    for (const group of DOC_GROUPS.filter((entry) => entry.id !== "")) {
      expect(group.label, group.id).not.toBe("");
      expect(group.ko, group.id).not.toBe("");
    }
  });

  it("follows FOUNDATIONS for the Foundations docs and PRIMITIVE_GROUPS for the Primitives docs", () => {
    expect(DOC_GROUPS.find((group) => group.id === "foundations")?.docs).toEqual(["README", ...FOUNDATIONS.map(({ id }) => id)]);
    expect(DOC_GROUPS.find((group) => group.id === "primitives")?.docs).toEqual(["README", ...PRIMITIVE_GROUPS.map((group) => group.toLowerCase())]);
  });

  it("slugs the top-level README as the overview and a group README as the folder", () => {
    expect(docSlug("", "README")).toBe("");
    expect(docSlug("atoms", "README")).toBe("atoms");
    expect(docSlug("atoms", "states")).toBe("atoms/states");
    expect(docFile("", "README")).toBe("README.md");
    expect(docFile("atoms", "states")).toBe("atoms/states.md");
  });
});

describe("FOUNDATIONS and SITE_NAV", () => {
  it("lists the five Foundations systems once each, in the order they stack", () => {
    expect(FOUNDATIONS.map(({ id }) => id)).toEqual(["color", "typography", "shape", "layout", "motion"]);
    for (const foundation of FOUNDATIONS) expect(foundation.summary, foundation.id).not.toBe("");
  });

  it("lists each top-level route once", () => {
    expect(unique(SITE_NAV.map((entry) => entry.to))).toEqual([]);
  });
});
