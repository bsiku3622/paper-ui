import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { Field } from "../atoms/Field";
import { SegmentControl } from "../atoms/SegmentControl";
import { Select } from "../atoms/Select";
import { Textarea } from "../atoms/Textarea";
import { PaperProvider } from "../theme/PaperProvider";
import type { ControlShape } from "../tokens";
import { controlShape } from "./control/Control.css";

const shapeOf = (element: Element): ControlShape =>
  (Object.keys(controlShape) as (keyof typeof controlShape)[]).find((shape) => element.classList.contains(controlShape[shape])) ?? "rounded";

const Parts = () => (
  <>
    <Button data-testid="button">Button</Button>
    <Badge data-testid="badge">Badge</Badge>
    <SegmentControl aria-label="segment" data-testid="segment" defaultValue="a"><SegmentControl.Item value="a">A</SegmentControl.Item></SegmentControl>
    <Field aria-label="field" data-testid="field" />
    <Select aria-label="select" data-testid="select"><Select.Option value="a">A</Select.Option></Select>
    <Textarea aria-label="textarea" />
  </>
);

const shapes = () => ({
  button: shapeOf(screen.getByTestId("button")),
  badge: shapeOf(screen.getByTestId("badge")),
  segment: shapeOf(screen.getByTestId("segment")),
  field: shapeOf(screen.getByTestId("field")),
  select: shapeOf(screen.getByTestId("select")),
  textarea: shapeOf(screen.getByLabelText("textarea")),
});

describe("controlShape", () => {
  it("[foundations.shape.app-shape] keeps each part's own default when nothing asks for a shape", () => {
    render(<Parts />);
    expect(shapes()).toEqual({ button: "pill", badge: "pill", segment: "pill", field: "rounded", select: "rounded", textarea: "rounded" });
  });

  it("[foundations.shape.app-shape] takes every control's shape from PaperProvider, lets a shape given to the control win, and passes it to a Provider inside", () => {
    render(
      <PaperProvider storageKey={null} controlShape="small">
        <Parts />
        <Button shape="pill" data-testid="own">Own</Button>
        <PaperProvider storageKey={null}><Button data-testid="inner">Inner</Button></PaperProvider>
      </PaperProvider>,
    );
    expect(shapes()).toEqual({ button: "small", badge: "small", segment: "small", field: "small", select: "small", textarea: "small" });
    expect(shapeOf(screen.getByTestId("own"))).toBe("pill");
    expect(shapeOf(screen.getByTestId("inner"))).toBe("small");
  });

  it("[foundations.shape.app-shape] stands a Textarea rounded under an app that asks for pill", () => {
    render(<PaperProvider storageKey={null} controlShape="pill"><Parts /></PaperProvider>);
    expect(shapes()).toEqual({ button: "pill", badge: "pill", segment: "pill", field: "pill", select: "pill", textarea: "rounded" });
  });
});
