import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { parseDoc } from "./parse";
import { Prose } from "./Prose";

const DOCS_DIR = join(import.meta.dirname, "../../../../docs");
const DOC_FILES = readdirSync(DOCS_DIR, { recursive: true, encoding: "utf-8" }).filter((path) => path.endsWith(".md")).map((path) => path.split("\\").join("/")).sort();

const SOURCE = `## Links

[same doc](#links) · [sibling](states.md) · [up and over](../foundations/color.md#accent--variant) · [app](/playground/button) · [outside](https://example.com/guide)

| name | role |
| --- | --- |
| Button | action |
`;

const renderProse = () => render(<MemoryRouter><Prose file="atoms/README.md">{SOURCE}</Prose></MemoryRouter>);

describe("Prose", () => {
  it("sends each link where resolveDocHref says", () => {
    renderProse();
    const href = (name: string) => screen.getByRole("link", { name }).getAttribute("href");
    expect(href("same doc")).toBe("#links");
    expect(href("sibling")).toBe("/docs/atoms/states");
    expect(href("up and over")).toBe("/docs/foundations/color#accent--variant");
    expect(href("app")).toBe("/playground/button");
    expect(href("outside")).toBe("https://example.com/guide");
  });

  it("opens only the outside link in a new tab", () => {
    renderProse();
    const outside = screen.getByRole("link", { name: "outside" });
    expect(outside.getAttribute("target")).toBe("_blank");
    expect(outside.getAttribute("rel")).toBe("noreferrer");
    for (const name of ["same doc", "sibling", "up and over", "app"]) expect(screen.getByRole("link", { name }).getAttribute("target"), name).toBeNull();
  });

  it("gives headings an id and keeps each table in a scroll wrapper", () => {
    const { container } = renderProse();
    expect(screen.getByRole("heading", { name: "Links" }).id).toBe("links");
    const table = container.querySelector("[data-testid=prose] > [data-testid=prose-table] > table");
    expect(table?.querySelectorAll("tr")).toHaveLength(2);
    expect(container.querySelectorAll("table")).toHaveLength(1);
  });

  it("keeps the comments that mark a generated block out of the page", () => {
    const { container } = render(<MemoryRouter><Prose file="atoms/README.md">{"before <!-- generated:x --><!-- note -->inside<!-- /generated:x --> after\n\n<!-- generated:y -->\n| a |\n| - |\n| b |\n<!-- /generated:y -->\n"}</Prose></MemoryRouter>);
    expect(container.innerHTML).not.toMatch(/<!--|&lt;|generated|note/);
    expect(container.querySelector("p")?.textContent).toBe("before inside after");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
  });

  it.each(DOC_FILES)("shows no HTML comment from %s", (file) => {
    const body = parseDoc(readFileSync(join(DOCS_DIR, file), "utf-8")).body;
    const { container } = render(<MemoryRouter><Prose file={file}>{body}</Prose></MemoryRouter>);
    expect(container.innerHTML).not.toMatch(/<!--|&lt;!--/);
    expect(container.textContent).not.toContain("generated:");
  });
});
