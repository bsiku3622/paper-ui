import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Box, Pressable, Selectable, Draggable, SelectableGroup, useSelectableGroup, Floating, useFloating, useSelectable, usePressable, mergeProps, mergeRefs, composeEventHandlers } from "./index";
import { spaceClass } from "../styles/space.css";

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

  it("[primitives.selectable.input-paths] Selectable owns uncontrolled state and never activates while disabled", () => {
    const change = vi.fn();
    const view = render(<Selectable onSelectedChange={change}>Select</Selectable>);
    const button = screen.getByRole("button", { name: "Select" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(change.mock.calls.map(([value]) => value)).toEqual([true, false]);
    view.rerender(<Selectable disabled onSelectedChange={change}>Select</Selectable>);
    fireEvent.click(button);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it("controlled selection requests change without overwriting its owner", () => {
    const change = vi.fn();
    const view = render(<Selectable selected={false} onSelectedChange={change}>{({ isSelected }) => isSelected ? "On" : "Off"}</Selectable>);
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
    view.rerender(<Selectable selected onSelectedChange={change}>{({ isSelected }) => isSelected ? "On" : "Off"}</Selectable>);
    expect(screen.getByRole("button", { name: "On" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("[primitives.selectable.input-paths] useSelectable gives state and aria without a press, and the caller connects toggle to one", () => {
    function CustomSelectable() {
      const { selectProps, isSelected, toggle } = useSelectable();
      const { pressProps } = usePressable({ onPress: toggle });
      return <button {...pressProps} {...selectProps} type="button">{isSelected ? "On" : "Off"}</button>;
    }
    render(<CustomSelectable />);
    const button = screen.getByRole("button", { name: "Off" });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.hasAttribute("data-selected")).toBe(false);
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "On" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "On" }).hasAttribute("data-selected")).toBe(true);
  });

  it("[primitives.selectable.input-paths] useSelectable alone never toggles on a click", () => {
    function Bare() {
      const { selectProps, isSelected } = useSelectable();
      return <button {...selectProps} type="button">{isSelected ? "On" : "Off"}</button>;
    }
    render(<Bare />);
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(screen.getByRole("button", { name: "Off" })).toBeTruthy();
  });

  it("[primitives.selectable.input-paths] announces selection with exactly one aria attribute, chosen by the role", () => {
    const attributes = ["aria-pressed", "aria-checked", "aria-selected", "aria-current"] as const;
    const rows: Array<[string | undefined, (typeof attributes)[number]]> = [
      ["radio", "aria-checked"], ["checkbox", "aria-checked"], ["switch", "aria-checked"], ["menuitemradio", "aria-checked"], ["menuitemcheckbox", "aria-checked"],
      ["tab", "aria-selected"], ["option", "aria-selected"], ["gridcell", "aria-selected"], ["row", "aria-selected"], ["treeitem", "aria-selected"],
      ["button", "aria-pressed"], ["link", "aria-pressed"], [undefined, "aria-pressed"],
    ];
    for (const [role, attribute] of rows) {
      const view = render(<Selectable role={role} defaultSelected>Item</Selectable>);
      const item = screen.getByText("Item");
      expect(item.getAttribute(attribute), `${role} selected`).toBe("true");
      for (const other of attributes.filter((name) => name !== attribute)) expect(item.hasAttribute(other), `${role} has no ${other}`).toBe(false);
      expect(item.hasAttribute("data-selected"), `${role} data-selected`).toBe(true);
      fireEvent.click(item);
      expect(item.getAttribute(attribute), `${role} unselected`).toBe("false");
      expect(item.hasAttribute("data-selected"), `${role} data-selected off`).toBe(false);
      view.unmount();
    }
  });

  it("[primitives.selectable.input-paths] announces a current item with aria-current only", () => {
    const view = render(<Selectable role="tab" current="page" defaultSelected>Item</Selectable>);
    const item = screen.getByText("Item");
    expect(item.getAttribute("aria-current")).toBe("page");
    for (const other of ["aria-pressed", "aria-checked", "aria-selected"]) expect(item.hasAttribute(other), other).toBe(false);
    expect(item.hasAttribute("data-selected")).toBe(true);
    fireEvent.click(item);
    expect(item.hasAttribute("aria-current")).toBe(false);
    view.unmount();
    render(<Selectable current defaultSelected>Item</Selectable>);
    expect(screen.getByText("Item").getAttribute("aria-current")).toBe("true");
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

describe("selectable groups", () => {
  it("[primitives.selectable-group.single] shares exclusive selection and keeps arrow navigation independent of selection", () => {
    render(<SelectableGroup defaultSelectedValues={["a"]} selectionRequired><SelectableGroup.Item value="a">A</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item></SelectableGroup>);
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

  it("[primitives.selectable-group.single] passes role through to its items, so a radio item announces aria-checked", () => {
    render(<SelectableGroup role="radiogroup" aria-label="Pick" defaultSelectedValues={["a"]}>
      <SelectableGroup.Item role="radio" value="a">A</SelectableGroup.Item>
      <SelectableGroup.Item role="radio" value="b">B</SelectableGroup.Item>
    </SelectableGroup>);
    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    expect(a.getAttribute("aria-checked")).toBe("true");
    expect(b.getAttribute("aria-checked")).toBe("false");
    expect(a.hasAttribute("aria-pressed")).toBe(false);
    fireEvent.click(b);
    expect(a.getAttribute("aria-checked")).toBe("false");
    expect(b.getAttribute("aria-checked")).toBe("true");
  });

  it("[primitives.selectable-group.multiple] supports multiple selections, disabled items and removal cleanup", () => {
    const change = vi.fn();
    const view = render(<SelectableGroup selectionMode="multiple" onSelectedValuesChange={change}><SelectableGroup.Item value="a">A</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item><SelectableGroup.Item value="c" disabled>C</SelectableGroup.Item></SelectableGroup>);
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("B"));
    fireEvent.click(screen.getByText("C"));
    expect(change).toHaveBeenLastCalledWith(["a", "b"]);
    view.rerender(<SelectableGroup selectionMode="multiple" onSelectedValuesChange={change}><SelectableGroup.Item value="a">A</SelectableGroup.Item></SelectableGroup>);
    expect(change).toHaveBeenLastCalledWith(["a"]);
  });

  it("controlled groups request a change without taking ownership", () => {
    const change = vi.fn();
    render(<SelectableGroup selectedValues={["a"]} onSelectedValuesChange={change}><SelectableGroup.Item value="a">A</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item></SelectableGroup>);
    fireEvent.click(screen.getByText("B"));
    expect(change).toHaveBeenCalledWith(["b"]);
    expect(screen.getByText("A").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("B").getAttribute("aria-pressed")).toBe("false");
  });

  it("hook supports the same group state without component wrappers", () => {
    function Example() {
      const state = useSelectableGroup({ selectionMode: "multiple" });
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
    expect(a.current?.classList.contains(spaceClass.padding.md)).toBe(true);
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

describe("floating state", () => {
  it("supports controlled state requests without mutating the owner's state", () => {
    const change = vi.fn();
    function Example() {
      const state = useFloating({ open: false, onOpenChange: change });
      return <button onClick={state.toggle}>{String(state.isOpen)}</button>;
    }
    render(<Example />);
    fireEvent.click(screen.getByText("false"));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByText("false")).toBeTruthy();
  });

  it("exposes controlled trigger state without rendering closed content", () => {
    const change = vi.fn();
    render(<Floating open={false} onOpenChange={change}><Floating.Trigger>Open</Floating.Trigger><Floating.Content aria-label="Settings">Hidden</Floating.Content></Floating>);
    const trigger = screen.getByText("Open");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
    expect(screen.queryByText("Hidden")).toBeNull();
    fireEvent.click(trigger);
    expect(change).toHaveBeenCalledWith(true);
  });
});
