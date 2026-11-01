import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Text } from "../primitives/Text";
import { Marker } from "./Marker";

describe("Marker", () => {
  it("[atoms.marker.element] is a mark in the sentence, and takes a ref, a class and native attributes on that element", () => {
    const ref = createRef<HTMLElement>();
    render(<Text>다시 <Marker ref={ref} className="mine" title="강조" data-testid="m">이어서</Marker></Text>);
    const mark = screen.getByTestId("m");
    expect(mark.tagName).toBe("MARK");
    expect(ref.current).toBe(mark);
    expect(mark.classList.contains("mine")).toBe(true);
    expect(mark.getAttribute("title")).toBe("강조");
    expect(mark.parentElement?.tagName).toBe("P");
  });

  it("[atoms.marker.decoration] names no state and takes no focus", () => {
    render(<Marker data-testid="m">이어서</Marker>);
    const mark = screen.getByTestId("m");
    expect(mark.hasAttribute("tabindex")).toBe(false);
    expect(mark.hasAttribute("role")).toBe(false);
    expect(mark.getAttributeNames().filter((name) => name.startsWith("aria-") || name.startsWith("data-selected"))).toEqual([]);
  });
});
