import { createRef, type ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Box } from "./Box";
import { Grid } from "./layout/Grid";
import { Stack } from "./layout/Stack";
import { Inline } from "./layout/Inline";
import { Text } from "./Text";
import { Icon } from "./Icon";
import { boxOverflow, boxSize } from "./Box.css";
import { flexAlign, flexJustify, inlineRoot, inlineWrap, stackRoot } from "./layout/flex.css";
import { gridAlign, gridJustify, gridJustifyItems, gridRoot } from "./layout/Grid.css";
import { spaceClass } from "../styles/space.css";
import { ALIGNS, CONTAINERS, DIMENSIONS, JUSTIFIES, JUSTIFY_ITEMS, MEASURES, SPACES } from "../tokens";
import { Surface } from "./paint/Surface";
import { Paint } from "./paint/Paint";

describe("primitive composition", () => {
  it("[primitives.polymorphic.target-and-ref] forwards refs and native props through layout and content primitives", () => {
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

  it("[primitives.grid.tracks] Grid sends its auto-flow to the same inline style as its tracks", () => {
    render(<Grid data-testid="grid" autoFlow="column" />);
    expect(screen.getByTestId("grid").style.gridAutoFlow).toBe("column");
  });

  it("[primitives.grid.tracks] Grid preserves Box props and supports explicit CSS tracks", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref} columns="minmax(0, 1fr) auto" rows={2} gap="md" padding="sm" data-testid="grid" />);
    expect(ref.current).toBe(screen.getByTestId("grid"));
    expect(ref.current?.style.gridTemplateColumns).toBe("minmax(0, 1fr) auto");
    expect(ref.current?.style.gridTemplateRows).toBe("repeat(2, minmax(0, 1fr))");
    expect(ref.current?.classList.contains(spaceClass.gap.md)).toBe(true);
    expect(ref.current?.classList.contains(spaceClass.padding.sm)).toBe(true);
  });

  it("[primitives.grid.tracks] [primitives.errors.prefix] Grid rejects a track count that is not a positive integer, as a prefixed RangeError", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const columns of [0, -1, 1.5]) expect(() => render(<Grid columns={columns} />)).toThrow(new RangeError("[paper-ui] Grid track count must be a positive integer."));
    log.mockRestore();
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

  it("[primitives.box.named-size-class] lets a caller's style beat a named size, the way it beats an escape length", () => {
    render(<Box data-testid="box" width="md" style={{ width: "50%" }} />);
    expect(screen.getByTestId("box").style.width).toBe("50%");
  });

  it("[primitives.box.prop-table] gives each row of its table a class per value: the inset steps, the size families and the overflow keywords", () => {
    const check = (element: ReactElement, classes: string[], label: string) => {
      const view = render(element);
      const { classList } = view.container.firstElementChild!;
      for (const className of classes) expect(classList.contains(className), label).toBe(true);
      view.unmount();
    };
    for (const space of SPACES) {
      check(<Box padding={space} paddingX={space} paddingY={space} />, [spaceClass.padding[space], spaceClass.paddingX[space], spaceClass.paddingY[space]], `padding ${space}`);
    }
    for (const axis of ["width", "minWidth", "maxWidth"] as const) {
      for (const name of DIMENSIONS) check(<Box {...{ [axis]: name }} />, [boxSize[axis].dimension[name]], `${axis} ${name}`);
      for (const name of MEASURES) check(<Box {...{ [axis]: `measure.${name}` }} />, [boxSize[axis].measure[name]], `${axis} measure.${name}`);
      for (const name of CONTAINERS) check(<Box {...{ [axis]: `container.${name}` }} />, [boxSize[axis].container[name]], `${axis} container.${name}`);
      for (const name of ["full", "fit", "min-content", "max-content"] as const) check(<Box {...{ [axis]: name }} />, [boxSize[axis].keyword[name]], `${axis} ${name}`);
    }
    for (const axis of ["height", "minHeight", "maxHeight"] as const) {
      for (const name of DIMENSIONS) check(<Box {...{ [axis]: name }} />, [boxSize[axis].dimension[name]], `${axis} ${name}`);
      for (const name of ["full", "fit", "min-content", "max-content"] as const) check(<Box {...{ [axis]: name }} />, [boxSize[axis].keyword[name]], `${axis} ${name}`);
    }
    for (const axis of ["overflow", "overflowX", "overflowY"] as const) {
      for (const keyword of ["visible", "hidden", "clip", "scroll", "auto"] as const) check(<Box {...{ [axis]: keyword }} />, [boxOverflow[axis][keyword]], `${axis} ${keyword}`);
    }
  });

  it("[primitives.box.prop-table] draws a div by default and opens no position or flex of its own", () => {
    render(<Box data-testid="box" />);
    expect(screen.getByTestId("box").tagName).toBe("DIV");
    compiles(
      // @ts-expect-error Box has no position
      <Box position="relative" />,
      // @ts-expect-error Box lays nothing out
      <Box display="flex" />,
    );
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

describe("the vocabulary of the axes", () => {
  const classesOf = (testId: string) => screen.getByTestId(testId).getAttribute("class")?.split(" ") ?? [];

  it("[primitives.layout.axis-classes] gives every value of align and justify a class of its own on Stack, Inline and Grid", () => {
    for (const [name, root, align, justify] of [["Stack", stackRoot, flexAlign, flexJustify], ["Inline", inlineRoot, flexAlign, flexJustify], ["Grid", gridRoot, gridAlign, gridJustify]] as const) {
      const Container = { Stack, Inline, Grid }[name] as unknown as (props: Record<string, unknown>) => ReactElement;
      // Stack lays out a column, where there is no baseline to align to.
      const aligns = name === "Stack" ? ALIGNS.filter((value) => value !== "baseline") : ALIGNS;
      for (const value of aligns) {
        const { unmount } = render(<Container data-testid="box" align={value} />);
        expect(classesOf("box"), `${name} align ${value}`).toEqual([root, align[value]]);
        unmount();
      }
      for (const value of JUSTIFIES) {
        const { unmount } = render(<Container data-testid="box" justify={value} />);
        expect(classesOf("box"), `${name} justify ${value}`).toEqual([root, justify[value]]);
        unmount();
      }
      expect(new Set(aligns.map((value) => align[value])).size, `${name} aligns are distinct`).toBe(aligns.length);
      expect(new Set(JUSTIFIES.map((value) => justify[value])).size, `${name} justifies are distinct`).toBe(JUSTIFIES.length);
    }
    for (const value of JUSTIFY_ITEMS) {
      const { unmount } = render(<Grid data-testid="grid" justifyItems={value} />);
      expect(classesOf("grid"), `Grid justifyItems ${value}`).toEqual([gridRoot, gridJustifyItems[value]]);
      unmount();
    }
    expect(new Set(JUSTIFY_ITEMS.map((value) => gridJustifyItems[value])).size).toBe(JUSTIFY_ITEMS.length);
  });

  it("[primitives.polymorphic.own-props-win] never lets a primitive's own prop reach the DOM as an attribute", () => {
    const own = {
      Box: ["padding", "paddingX", "paddingY", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "overflow", "overflowX", "overflowY"],
      Stack: ["gap", "align", "justify"],
      Inline: ["gap", "rowGap", "columnGap", "align", "justify", "wrap"],
      Grid: ["gap", "rowGap", "columnGap", "align", "justify", "justifyItems", "columns", "rows", "autoFlow"],
      Surface: ["fill", "border", "radius", "elevation", "theme", "hoverable", "selected"],
      Paint: ["accent", "variant", "hoverable", "selected"],
    } as const;
    const props: Record<keyof typeof own, Record<string, unknown>> = {
      Box: { padding: "md", paddingX: "sm", paddingY: "sm", width: "md", minWidth: "xs", maxWidth: "xl", height: "md", minHeight: "xs", maxHeight: "xl", overflow: "hidden", overflowX: "auto", overflowY: "auto" },
      Stack: { gap: "md", align: "center", justify: "between" },
      Inline: { gap: "md", rowGap: "sm", columnGap: "lg", align: "center", justify: "end", wrap: true },
      Grid: { gap: "md", rowGap: "sm", columnGap: "lg", align: "center", justify: "end", justifyItems: "stretch", columns: 2, rows: 2, autoFlow: "row" },
      Surface: { fill: "raised", border: true, radius: "md", elevation: "overlay", theme: "dark", hoverable: true, selected: true },
      Paint: { accent: "error", variant: "soft", hoverable: true, selected: true },
    };
    const components = { Box, Stack, Inline, Grid, Surface, Paint } as const;
    for (const name of Object.keys(own) as (keyof typeof own)[]) {
      const Component = components[name] as unknown as (props: Record<string, unknown>) => ReactElement;
      const { container, unmount } = render(<Component data-testid="box" {...props[name]} />);
      const attributes = screen.getByTestId("box").getAttributeNames();
      for (const key of own[name]) expect(attributes, `${name} ${key}`).not.toContain(key.toLowerCase());
      expect(container.querySelectorAll("[style]").length || 0, `${name} inline style`).toBeLessThanOrEqual(1);
      unmount();
    }
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
