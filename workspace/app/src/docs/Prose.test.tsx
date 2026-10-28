import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { Prose } from "./Prose";

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
    const table = container.querySelector(".md > .md-table > table");
    expect(table?.querySelectorAll("tr")).toHaveLength(2);
    expect(container.querySelectorAll("table")).toHaveLength(1);
  });
});
