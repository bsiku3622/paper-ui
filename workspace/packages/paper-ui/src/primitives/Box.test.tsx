import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Box } from "./Box";
import { tokens } from "../tokens";

describe("Box layout props", () => {
  it("named dimensions는 layout token으로 해석한다", () => {
    render(<Box data-testid="box" width="md" maxWidth="xl" height="sm" overflow="auto" />);
    const box = screen.getByTestId("box");
    expect(box.style.width).toBe(tokens.layout.width.md);
    expect(box.style.maxWidth).toBe(tokens.layout.width.xl);
    expect(box.style.height).toBe(tokens.layout.height.sm);
    expect(box.style.overflow).toBe("auto");
  });

  it("intent keyword와 앱 고유 CSS 길이도 받는다", () => {
    render(<Box data-testid="box" width="full" minWidth="fit" maxWidth="42ch" />);
    const box = screen.getByTestId("box");
    expect(box.style.width).toBe("100%");
    expect(box.style.minWidth).toBe("fit-content");
    expect(box.style.maxWidth).toBe("42ch");
  });
});
