import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Box, Grid, Stack, Inline, Text, Icon } from "./index";
import { tokens } from "../tokens";

describe("primitive composition", () => {
  it("forwards refs and native props through layout and content primitives", () => {
    const box = createRef<HTMLButtonElement>();
    const stack = createRef<HTMLDivElement>();
    const inline = createRef<HTMLDivElement>();
    const text = createRef<HTMLSpanElement>();
    const icon = createRef<SVGSVGElement>();
    render(<Stack ref={stack}><Inline ref={inline}>
      <Box as="button" ref={box} type="submit" disabled>Submit</Box>
      <Text as="span" ref={text}>Text</Text><Icon ref={icon} aria-label="mark"><path d="M1 1h2" /></Icon>
    </Inline></Stack>);
    expect(box.current?.tagName).toBe("BUTTON");
    expect(box.current?.type).toBe("submit");
    expect(box.current?.disabled).toBe(true);
    expect(stack.current?.contains(inline.current)).toBe(true);
    expect(text.current?.tagName).toBe("SPAN");
    expect(icon.current?.getAttribute("aria-label")).toBe("mark");
  });

  it("Grid preserves Box props and supports explicit CSS tracks", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref} columns="minmax(0, 1fr) auto" rows={2} gap="md" border data-testid="grid" />);
    expect(ref.current).toBe(screen.getByTestId("grid"));
    expect(ref.current?.style.gridTemplateColumns).toBe("minmax(0, 1fr) auto");
    expect(ref.current?.style.gridTemplateRows).toBe("repeat(2, minmax(0, 1fr))");
    expect(ref.current?.className).toContain("pui-gap-md");
  });
});

describe("Box layout props", () => {
  it("named dimensions는 Shape sizing token으로 해석한다", () => {
    render(<Box data-testid="box" width="md" maxWidth="xl" height="sm" overflow="auto" />);
    const box = screen.getByTestId("box");
    expect(box.style.width).toBe(tokens.shape.dimension.width.md);
    expect(box.style.maxWidth).toBe(tokens.shape.dimension.width.xl);
    expect(box.style.height).toBe(tokens.shape.dimension.height.sm);
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
