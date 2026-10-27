import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Box, Grid, Stack, Inline, Text, Icon, Pressable, Toggleable, Hoverable, Draggable, VisuallyHidden, useToggle, useFocusWithin } from "./index";

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

  it("an externally labelled Icon stays in the accessibility tree", () => {
    render(<><Text as="span" id="icon-name">Project icon</Text><Icon aria-labelledby="icon-name"><path d="M1 1h2" /></Icon></>);
    expect(screen.getByLabelText("Project icon").getAttribute("aria-hidden")).not.toBe("true");
  });
});

describe("interaction primitives", () => {
  it("Pressable composes caller events and forwards the native button ref", () => {
    const press = vi.fn();
    const click = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(<Pressable ref={ref} onPress={press} onClick={click}>Run</Pressable>);
    const button = screen.getByRole("button", { name: "Run" });
    fireEvent.click(button);
    expect(press).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe(button);
    expect(ref.current?.type).toBe("button");
  });

  it("Toggleable owns uncontrolled state and never activates while disabled", () => {
    const change = vi.fn();
    const view = render(<Toggleable onSelectedChange={change}>Toggle</Toggleable>);
    const button = screen.getByRole("button", { name: "Toggle" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(change.mock.calls.map(([value]) => value)).toEqual([true, false]);
    view.rerender(<Toggleable disabled onSelectedChange={change}>Toggle</Toggleable>);
    fireEvent.click(button);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it("controlled selection requests change without overwriting its owner", () => {
    const change = vi.fn();
    const view = render(<Toggleable selected={false} onSelectedChange={change}>{({ isSelected }) => isSelected ? "On" : "Off"}</Toggleable>);
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
    view.rerender(<Toggleable selected onSelectedChange={change}>{({ isSelected }) => isSelected ? "On" : "Off"}</Toggleable>);
    expect(screen.getByRole("button", { name: "On" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("useToggle provides the same native state contract without a wrapper", () => {
    function CustomToggle() {
      const { toggleProps, isSelected } = useToggle();
      return <button {...toggleProps} type="button">{isSelected ? "On" : "Off"}</button>;
    }
    render(<CustomToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(screen.getByRole("button", { name: "On" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("Hoverable adds no button semantics or tab stop", () => {
    render(<Hoverable data-testid="hover">Hover</Hoverable>);
    const element = screen.getByTestId("hover");
    expect(element.hasAttribute("role")).toBe(false);
    expect(element.hasAttribute("tabindex")).toBe(false);
  });

  it("VisuallyHidden supplies an accessible name without aria-hidden", () => {
    render(<Pressable><Icon><path d="M1 1h2" /></Icon><VisuallyHidden>Create item</VisuallyHidden></Pressable>);
    expect(screen.getByRole("button", { name: "Create item" })).toBeTruthy();
    expect(screen.getByText("Create item").getAttribute("aria-hidden")).not.toBe("true");
  });

  it("controlled drag reports requested movement without taking ownership of position", () => {
    const change = vi.fn();
    render(<Draggable position={{ x: 10, y: 20 }} activation="handle" onPositionChange={change} data-testid="drag">
      <Draggable.Handle aria-label="Move">Grip</Draggable.Handle>
    </Draggable>);
    fireEvent.keyDown(screen.getByRole("button", { name: "Move" }), { key: "ArrowRight" });
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0]![0].x).toBeGreaterThan(10);
    expect(screen.getByTestId("drag").style.translate).toBe("10px 20px");
  });

  it("focus-within stays active when focus moves between descendants", () => {
    const change = vi.fn();
    function FocusGroup() {
      const { focusWithinProps, isFocusWithin } = useFocusWithin({ onFocusWithinChange: change });
      return <div {...focusWithinProps} data-testid="focus-group" data-within={isFocusWithin}><button type="button">First</button><button type="button">Second</button></div>;
    }
    render(<FocusGroup />);
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    act(() => first.focus());
    act(() => second.focus());
    expect(screen.getByTestId("focus-group").getAttribute("data-within")).toBe("true");
    expect(change.mock.calls.map(([value]) => value)).toEqual([true]);
    act(() => second.blur());
    expect(change.mock.calls.map(([value]) => value)).toEqual([true, false]);
  });
});
