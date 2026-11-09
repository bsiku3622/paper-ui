import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { CONTROL_ANATOMIES, CONTROL_SHAPES, CONTROL_SIZES } from "../tokens";
import { Control, controlClass } from "./control/Control";
import { controlAlign, controlAnatomy, controlGap, controlIconSize, controlJustify, controlShape, controlSize } from "./control/Control.css";

describe("Control", () => {
  const classes = (value: string) => value.split(" ");

  it("[primitives.control.class] stands at md as a label by default", () => {
    const list = classes(controlClass());
    for (const name of [controlSize.md, controlAnatomy.label]) expect(list).toContain(name);
    for (const name of Object.values(controlShape)) expect(list).not.toContain(name);
  });

  it("[primitives.control.class] takes one class for a size and one for an anatomy, whichever the pair", () => {
    for (const size of CONTROL_SIZES) {
      for (const anatomy of CONTROL_ANATOMIES) {
        const list = classes(controlClass({ size, anatomy }));
        expect(list, `${size} ${anatomy}`).toContain(controlSize[size]);
        expect(list, `${size} ${anatomy}`).toContain(controlAnatomy[anatomy]);
      }
    }
  });

  it("[primitives.control.class] swaps the corner for a pill, and adds what it is told", () => {
    const list = classes(controlClass({ shape: "pill", gap: "lg", align: "end", justify: "start", iconSize: "label" }));
    expect(list).toContain(controlShape.pill);
    expect(list).toContain(controlGap.lg);
    expect(list).toContain(controlAlign.end);
    expect(list).toContain(controlJustify.start);
    expect(list).toContain(controlIconSize.label);
  });

  it("[foundations.shape.control-shapes] gives sharp, small and pill a class of their own and rounded none, since rounded is the corner every size sets", () => {
    for (const shape of CONTROL_SHAPES) {
      const list = classes(controlClass({ shape }));
      for (const [name, value] of Object.entries(controlShape)) expect(list.includes(value), `${shape} → ${name}`).toBe(name === shape);
    }
  });

  it("[primitives.control.class] picks a text preset only for an anatomy that holds text", () => {
    const count = (anatomy: (typeof CONTROL_ANATOMIES)[number]) => classes(controlClass({ anatomy })).length;
    for (const anatomy of ["mark", "track", "spinner"] as const) expect(count(anatomy), anatomy).toBe(2);
    for (const anatomy of ["label", "icon", "input", "frame", "area", "badge"] as const) expect(count(anatomy), anatomy).toBe(3);
  });

  it("[primitives.control.class] is one element that takes `as`, a ref and the Box props, and keeps its own props off the DOM", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<Control as="span" ref={ref} data-testid="control" size="sm" anatomy="icon" shape="pill" fontSize="label" strong={false} gap="lg" align="end" justify="end" iconSize="body" padding="md" />);
    expect(container.querySelectorAll("*")).toHaveLength(1);
    const element = screen.getByTestId("control");
    expect(element.tagName).toBe("SPAN");
    expect(ref.current).toBe(element);
    for (const name of ["size", "anatomy", "shape", "fontsize", "strong", "gap", "align", "justify", "iconsize"]) expect(element.hasAttribute(name), name).toBe(false);
    expect(element.classList.contains(controlSize.sm)).toBe(true);
  });
});
