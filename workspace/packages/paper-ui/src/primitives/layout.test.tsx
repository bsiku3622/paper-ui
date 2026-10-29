import { createRef, type ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Box, Grid, Stack, Inline, Text, Icon } from "./index";
import { boxOverflow, boxSize } from "./Box.css";
import { flexAlign, flexJustify, inlineRoot, inlineWrap, stackRoot } from "./flex.css";
import { gridAlign, gridJustify, gridJustifyItems, gridRoot } from "./Grid.css";
import { spaceClass } from "../styles/space.css";

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
    expect(ref.current?.classList.contains(spaceClass.gap.md)).toBe(true);
  });
});

// Never rendered: each line only has to compile.
const compiles = (...elements: ReactElement[]) => elements.length;

describe("Box layout props", () => {
  it("[primitives.box.named-size-class] turns every named size into a class and puts no inline style on the box", () => {
    render(<Box data-testid="box" width="md" minWidth="fit" maxWidth="measure.md" height="sm" minHeight="full" maxHeight="xl" />);
    const box = screen.getByTestId("box");
    for (const className of [
      boxSize.width.dimension.md, boxSize.minWidth.keyword.fit, boxSize.maxWidth.measure.md,
      boxSize.height.dimension.sm, boxSize.minHeight.keyword.full, boxSize.maxHeight.dimension.xl,
    ]) expect(box.classList.contains(className), className).toBe(true);
    expect(box.getAttribute("style")).toBeNull();
  });

  it("[primitives.box.named-size-class] reads the three width families and the keywords from their own maps", () => {
    render(<Box data-testid="box" maxWidth="container.content" width="max-content" minWidth="measure.xs" />);
    const box = screen.getByTestId("box");
    expect(box.classList.contains(boxSize.maxWidth.container.content)).toBe(true);
    expect(box.classList.contains(boxSize.width.keyword["max-content"])).toBe(true);
    expect(box.classList.contains(boxSize.minWidth.measure.xs)).toBe(true);
    // md is a dimension on its own and a measure only through its family.
    expect(boxSize.width.dimension.md).not.toBe(boxSize.width.measure.md);
    expect(box.getAttribute("style")).toBeNull();
  });

  it("[primitives.box.length-escape] sends a CSS length or a number inline, where a class cannot name it", () => {
    render(<Box data-testid="box" maxWidth="42ch" width={240} height="calc(100% - 2rem)" minWidth="constructor" />);
    const box = screen.getByTestId("box");
    expect(box.style.maxWidth).toBe("42ch");
    expect(box.style.width).toBe("240px");
    expect(box.style.height).toBe("calc(100% - 2rem)");
    // `constructor` is no name of any family, so it is a plain string and not a lookup on the map's prototype.
    expect(box.getAttribute("class") ?? "").toBe("");
  });

  it("[primitives.box.overflow-class] turns the overflow keywords into classes and leaves the style empty", () => {
    render(<Box data-testid="box" overflow="auto" overflowX="hidden" overflowY="clip" />);
    const box = screen.getByTestId("box");
    for (const className of [boxOverflow.overflow.auto, boxOverflow.overflowX.hidden, boxOverflow.overflowY.clip]) {
      expect(box.classList.contains(className), className).toBe(true);
    }
    expect(box.getAttribute("style")).toBeNull();
  });

  it("lets a caller's style beat a named size, the way it beats an escape length", () => {
    render(<Box data-testid="box" width="md" style={{ width: "50%" }} />);
    expect(screen.getByTestId("box").style.width).toBe("50%");
  });

  it("[primitives.layout.gap-family] gives gap to the containers that lay children out, and Box has none", () => {
    render(<>
      {/* @ts-expect-error Box does not lay children out, so it has no gap */}
      <Box data-testid="box" gap="md" />
      <Stack data-testid="stack" gap="md" />
      <Inline data-testid="inline" gap="sm" rowGap="lg" columnGap="xs" />
      <Grid data-testid="grid" gap="md" rowGap="xl" columnGap="2xl" />
    </>);
    expect(screen.getByTestId("box").classList.contains(spaceClass.gap.md)).toBe(false);
    expect(screen.getByTestId("stack").classList.contains(spaceClass.gap.md)).toBe(true);
    const inline = screen.getByTestId("inline");
    for (const className of [spaceClass.gap.sm, spaceClass.rowGap.lg, spaceClass.columnGap.xs]) expect(inline.classList.contains(className), className).toBe(true);
    const grid = screen.getByTestId("grid");
    for (const className of [spaceClass.gap.md, spaceClass.rowGap.xl, spaceClass.columnGap["2xl"]]) expect(grid.classList.contains(className), className).toBe(true);
  });
});

describe("Stack, Inline and Grid axes", () => {
  const classesOf = (testId: string) => screen.getByTestId(testId).getAttribute("class")?.split(" ") ?? [];

  it("[primitives.layout.axis-classes] keeps a default in the root and adds an alignment class only when a prop is given", () => {
    render(<>
      <Stack data-testid="stack" />
      <Inline data-testid="inline" />
      <Grid data-testid="grid" />
    </>);
    expect(classesOf("stack")).toEqual([stackRoot]);
    expect(classesOf("inline")).toEqual([inlineRoot]);
    expect(classesOf("grid")).toEqual([gridRoot]);
  });

  it("[primitives.layout.axis-classes] gives Stack a vertical distribution and Inline the gap family and wrap", () => {
    render(<>
      <Stack data-testid="stack" align="center" justify="between" />
      <Inline data-testid="inline" align="baseline" justify="end" wrap rowGap="md" columnGap="lg" />
    </>);
    expect(classesOf("stack")).toEqual([stackRoot, flexAlign.center, flexJustify.between]);
    expect(classesOf("inline")).toEqual([inlineRoot, spaceClass.rowGap.md, spaceClass.columnGap.lg, flexAlign.baseline, flexJustify.end, inlineWrap]);
  });

  it("[primitives.layout.axis-classes] keeps Grid's justify (the tracks) apart from justifyItems (the items in their cells)", () => {
    render(<>
      <Grid data-testid="tracks" align="baseline" justify="between" />
      <Grid data-testid="items" justifyItems="stretch" />
    </>);
    expect(classesOf("tracks")).toEqual([gridRoot, gridAlign.baseline, gridJustify.between]);
    expect(classesOf("items")).toEqual([gridRoot, gridJustifyItems.stretch]);
    expect(gridJustify.center).not.toBe(gridJustifyItems.center);
  });
});

describe("polymorphic props", () => {
  it("[primitives.polymorphic.own-props-win] keeps a native prop of the named element out of the primitive's own", () => {
    // td's native align takes left | center | right; Inline's own align takes the Align names.
    compiles(<Inline as="td" align="start" />, <Stack as="ul" align="end" justify="between" />, <Grid as="section" justify="center" justifyItems="end" />);
    const ref = createRef<HTMLTableCellElement>();
    render(<table><tbody><tr><Inline as="td" align="end" ref={ref} /></tr></tbody></table>);
    expect(ref.current?.tagName).toBe("TD");
  });
});
