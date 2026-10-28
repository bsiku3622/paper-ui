import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Box, Pressable, Toggleable, Hoverable, Draggable, ToggleGroup, useToggleGroup, Overlay, useOverlay, useToggle, mergeProps, mergeRefs, composeEventHandlers } from "./index";

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

  it("[primitives.toggleable.input-paths] Toggleable owns uncontrolled state and never activates while disabled", () => {
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
});

describe("toggle groups", () => {
  it("[primitives.toggle-group.single] shares exclusive selection and keeps arrow navigation independent of selection", () => {
    render(<ToggleGroup defaultSelectedValues={["a"]} selectionRequired><ToggleGroup.Item value="a">A</ToggleGroup.Item><ToggleGroup.Item value="b">B</ToggleGroup.Item></ToggleGroup>);
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    fireEvent.click(a);
    expect(a.getAttribute("aria-pressed")).toBe("true");
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(b);
    expect(a.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(b);
    expect(a.getAttribute("aria-pressed")).toBe("false");
    expect(b.getAttribute("aria-pressed")).toBe("true");
  });

  it("[primitives.toggle-group.multiple] supports multiple selections, disabled items and removal cleanup", () => {
    const change = vi.fn();
    const view = render(<ToggleGroup selectionMode="multiple" onSelectedValuesChange={change}><ToggleGroup.Item value="a">A</ToggleGroup.Item><ToggleGroup.Item value="b">B</ToggleGroup.Item><ToggleGroup.Item value="c" disabled>C</ToggleGroup.Item></ToggleGroup>);
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("B"));
    fireEvent.click(screen.getByText("C"));
    expect(change).toHaveBeenLastCalledWith(["a", "b"]);
    view.rerender(<ToggleGroup selectionMode="multiple" onSelectedValuesChange={change}><ToggleGroup.Item value="a">A</ToggleGroup.Item></ToggleGroup>);
    expect(change).toHaveBeenLastCalledWith(["a"]);
  });

  it("controlled groups request a change without taking ownership", () => {
    const change = vi.fn();
    render(<ToggleGroup selectedValues={["a"]} onSelectedValuesChange={change}><ToggleGroup.Item value="a">A</ToggleGroup.Item><ToggleGroup.Item value="b">B</ToggleGroup.Item></ToggleGroup>);
    fireEvent.click(screen.getByText("B"));
    expect(change).toHaveBeenCalledWith(["b"]);
    expect(screen.getByText("A").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("B").getAttribute("aria-pressed")).toBe("false");
  });

  it("hook supports the same group state without component wrappers", () => {
    function Example() {
      const state = useToggleGroup({ selectionMode: "multiple" });
      return <button onClick={() => state.toggle("a")}>{state.selectedValues.join(",") || "Empty"}</button>;
    }
    render(<Example />);
    fireEvent.click(screen.getByText("Empty"));
    expect(screen.getByText("a")).toBeTruthy();
    fireEvent.click(screen.getByText("a"));
    expect(screen.getByText("Empty")).toBeTruthy();
  });
});

describe("composition contracts", () => {
  it("merges handlers additively and refs onto a single native node", () => {
    const first = vi.fn();
    const second = vi.fn();
    const a = createRef<HTMLButtonElement>();
    const b = vi.fn();
    const view = render(<Box as={Pressable} padding="md" {...mergeProps({ onClick: first }, { onClick: second })} ref={mergeRefs(a, b)}>Run</Box>);
    fireEvent.click(screen.getByText("Run"));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(a.current).toBe(screen.getByText("Run"));
    expect(b).toHaveBeenLastCalledWith(a.current);
    expect(a.current?.className).toContain("pui-p-md");
    view.unmount();
    expect(a.current).toBeNull();
    expect(b).toHaveBeenLastCalledWith(null);
  });

  it("cancellable composition runs the caller before internal behavior", () => {
    const internal = vi.fn();
    render(<button onClick={composeEventHandlers((event) => event.preventDefault(), internal)}>Cancel</button>);
    fireEvent.click(screen.getByText("Cancel"));
    expect(internal).not.toHaveBeenCalled();
  });
});

describe("overlay state", () => {
  it("supports controlled state requests without mutating the owner's state", () => {
    const change = vi.fn();
    function Example() {
      const state = useOverlay({ open: false, onOpenChange: change });
      return <button onClick={state.toggle}>{String(state.isOpen)}</button>;
    }
    render(<Example />);
    fireEvent.click(screen.getByText("false"));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByText("false")).toBeTruthy();
  });

  it("exposes controlled trigger state without rendering closed content", () => {
    const change = vi.fn();
    render(<Overlay open={false} onOpenChange={change}><Overlay.Trigger>Open</Overlay.Trigger><Overlay.Content aria-label="Settings">Hidden</Overlay.Content></Overlay>);
    const trigger = screen.getByText("Open");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
    expect(screen.queryByText("Hidden")).toBeNull();
    fireEvent.click(trigger);
    expect(change).toHaveBeenCalledWith(true);
  });
});
