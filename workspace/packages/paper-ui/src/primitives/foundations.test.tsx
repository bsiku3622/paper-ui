import { createRef, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Box, Pressable, RovingFocus, ToggleGroup, useToggleGroup, FormField, Overlay, mergeProps, mergeRefs, composeEventHandlers, useOverlay } from "./index";

describe("roving focus", () => {
  it("has one tab stop, skips disabled items and emits one change per arrow", () => {
    const change = vi.fn();
    render(<RovingFocus onCurrentValueChange={change}>
      <RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b" disabled>B</RovingFocus.Item><RovingFocus.Item value="c">C</RovingFocus.Item>
    </RovingFocus>);
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    const c = screen.getByRole("button", { name: "C" });
    expect([a.tabIndex, b.tabIndex, c.tabIndex]).toEqual([0, -1, -1]);
    act(() => a.focus());
    change.mockClear();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(c);
    expect([a.tabIndex, b.tabIndex, c.tabIndex]).toEqual([-1, -1, 0]);
    expect(change).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(c, { key: "Home" });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: "End" });
    expect(document.activeElement).toBe(c);
  });

  it("supports vertical orientation, RTL and wrapping without trapping Tab", () => {
    const view = render(<RovingFocus dir="rtl" loop><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>);
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(a);
    view.rerender(<RovingFocus orientation="vertical"><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>);
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(document.activeElement).toBe(b);
    expect(fireEvent.keyDown(b, { key: "Tab" })).toBe(true);
  });

  it("uses current DOM order after keyed items are reordered", () => {
    function Example() {
      const [keys, setKeys] = useState(["a", "b", "c"]);
      return <><button onClick={() => setKeys(["c", "a", "b"])}>Reorder</button><RovingFocus>{keys.map((value) => <RovingFocus.Item key={value} value={value}>{value}</RovingFocus.Item>)}</RovingFocus></>;
    }
    render(<Example />);
    fireEvent.click(screen.getByText("Reorder"));
    const a = screen.getByRole("button", { name: "a" });
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "Home" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "c" }));
  });

  it("moves focus to a surviving neighbor when the active item is removed", () => {
    function Example() {
      const [show, setShow] = useState(true);
      return <RovingFocus><RovingFocus.Item value="a">A</RovingFocus.Item>{show && <RovingFocus.Item value="b" onClick={() => setShow(false)}>Remove</RovingFocus.Item>}<RovingFocus.Item value="c">C</RovingFocus.Item></RovingFocus>;
    }
    render(<Example />);
    const button = screen.getByText("Remove");
    act(() => button.focus());
    fireEvent.click(button);
    expect(document.activeElement).toBe(screen.getByText("C"));
    expect(screen.getByText("C").tabIndex).toBe(0);
  });

  it("honors caller cancellation and propagates group disabled through custom components", () => {
    const ref = createRef<HTMLButtonElement>();
    const view = render(<RovingFocus><RovingFocus.Item value="a" onKeyDown={(event) => event.preventDefault()}>A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>);
    const a = screen.getByText("A");
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a);
    view.rerender(<RovingFocus disabled><RovingFocus.Item as={Pressable} ref={ref} value="a">A</RovingFocus.Item></RovingFocus>);
    expect(ref.current?.disabled).toBe(true);
    expect(ref.current?.tabIndex).toBe(-1);
  });

  it("does not intercept keys originating in a descendant input", () => {
    render(<RovingFocus><RovingFocus.Item as="div" value="a"><input aria-label="Edit" /></RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>);
    const input = screen.getByRole("textbox");
    act(() => input.focus());
    expect(fireEvent.keyDown(input, { key: "ArrowRight" })).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it("moves off a newly disabled item and does not steal focus after leaving the group", () => {
    const view = render(<><button>Outside</button><RovingFocus><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus></>);
    act(() => screen.getByText("A").focus());
    view.rerender(<><button>Outside</button><RovingFocus><RovingFocus.Item value="a" disabled>A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus></>);
    expect(document.activeElement).toBe(screen.getByText("B"));
    act(() => screen.getByText("Outside").focus());
    view.rerender(<><button>Outside</button><RovingFocus><RovingFocus.Item value="a" disabled>A</RovingFocus.Item></RovingFocus></>);
    expect(document.activeElement).toBe(screen.getByText("Outside"));
  });
});

describe("toggle groups", () => {
  it("shares exclusive selection and keeps arrow navigation independent of selection", () => {
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

  it("supports multiple selections, disabled items and removal cleanup", () => {
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

describe("field relationships", () => {
  it("associates labels, descriptions, errors and native state without dangling IDs", () => {
    const view = render(<FormField label="Email" description="Help" error="Wrong" required aria-describedby="external" invalid>{({ controlProps }) => <input {...controlProps} />}</FormField>);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual(["external", screen.getByText("Help").id, screen.getByText("Wrong").id]);
    const id = input.id;
    view.rerender(<FormField label="Email" disabled>{({ controlProps }) => <input {...controlProps} />}</FormField>);
    expect(input.id).toBe(id);
    expect(input.disabled).toBe(true);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(screen.queryByText("Wrong")).toBeNull();
  });

  it("generates distinct IDs for repeated fields and honors explicit IDs", () => {
    render(<><FormField label="First" id="first">{({ controlProps }) => <input {...controlProps} />}</FormField><FormField label="Second">{({ controlProps }) => <input {...controlProps} />}</FormField></>);
    expect(screen.getByLabelText("First").id).toBe("first");
    expect(screen.getByLabelText("Second").id).not.toBe("first");
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
