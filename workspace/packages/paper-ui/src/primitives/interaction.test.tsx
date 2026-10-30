import { createRef, type ReactNode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Box, Pressable, Selectable, Draggable, Droppable, SelectableGroup, useSelectableGroup, Floating, useFloating, useFloatingContext, useSelectable, usePressable, useFocusRing, useDrag, useDrop, mergeProps, mergeRefs, composeEventHandlers } from "./index";
import { spaceClass } from "../styles/space.css";
import { ELEVATION_NEST_LIMIT } from "../tokens";
import * as floatingStyles from "./float/Floating.css";
import { nestElevation, type FloatingElevation } from "./float/nestElevation";

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

  it("[primitives.hooks.result-shape] Pressable marks a press with data-active, and the children function reads isActive", () => {
    render(<Pressable>{({ isActive }) => isActive ? "Pressing" : "Idle"}</Pressable>);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("data-active")).toBe(false);
    fireEvent.keyDown(button, { key: " " });
    expect(button.getAttribute("data-active")).toBe("true");
    expect(button.textContent).toBe("Pressing");
    fireEvent.keyUp(button, { key: " " });
    expect(button.hasAttribute("data-active")).toBe(false);
    expect(button.hasAttribute("data-pressed")).toBe(false);
  });

  it("[primitives.pressable.input-paths] a mouse press leaves focus on the pressed button, unless the caller keeps it off", () => {
    render(<><Pressable>Takes</Pressable><Pressable preventFocusOnPress>Keeps off</Pressable></>);
    const pointer = { pointerType: "mouse", pointerId: 1, button: 0, width: 1, height: 1, isPrimary: true };
    const press = (button: HTMLElement) => { fireEvent.pointerDown(button, pointer); fireEvent.mouseDown(button); fireEvent.pointerUp(button, pointer); fireEvent.mouseUp(button); fireEvent.click(button, { detail: 1 }); };
    const takes = screen.getByRole("button", { name: "Takes" });
    const keeps = screen.getByRole("button", { name: "Keeps off" });
    press(takes);
    expect(document.activeElement).toBe(takes);
    press(keeps);
    expect(document.activeElement).not.toBe(keeps);
  });

  it("[primitives.pressable.input-paths] a press stops at the element that handles it, unless the handler lets the parent have it", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    function Outer({ children }: { children: ReactNode }) {
      const { pressProps } = usePressable({ onPress: outer });
      return <div role="group" {...pressProps}>{children}</div>;
    }
    const view = render(<Outer><Pressable onPress={inner}>Inner</Pressable></Outer>);
    fireEvent.click(screen.getByText("Inner"));
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    view.unmount();
    render(<Outer><Pressable onPress={(event) => event.continuePropagation()}>Inner</Pressable></Outer>);
    fireEvent.click(screen.getByText("Inner"));
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it("[primitives.pressable.input-paths] Pressable marks a disabled button with data-disabled and runs no press", () => {
    const press = vi.fn();
    render(<Pressable disabled onPress={press}>Run</Pressable>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-disabled")).toBe("true");
    fireEvent.click(button);
    expect(press).not.toHaveBeenCalled();
  });

  it("[primitives.hooks.result-shape] a hook-composed button carries its state attributes without writing them by hand", () => {
    const press = vi.fn();
    function Composed() {
      const { pressProps } = usePressable({ onPress: press });
      const { focusProps } = useFocusRing();
      return <button type="button" {...mergeProps(pressProps, focusProps)}>Hook</button>;
    }
    render(<Composed />);
    const button = screen.getByRole("button", { name: "Hook" });
    fireEvent.keyDown(button, { key: "Enter" });
    expect(button.getAttribute("data-active")).toBe("true");
    fireEvent.keyUp(button, { key: "Enter" });
    expect(press).toHaveBeenCalledTimes(1);
    expect(button.hasAttribute("data-active")).toBe(false);
    act(() => button.focus());
    expect(button.getAttribute("data-focused")).toBe("true");
  });

  it("[primitives.hooks.result-shape] usePressable and useSelectable need no ref argument: the press props carry their own ref", () => {
    let pressProps: ReturnType<typeof usePressable>["pressProps"] | undefined;
    function Custom() {
      const press = usePressable({});
      const select = useSelectable();
      pressProps = press.pressProps;
      return <button type="button" {...press.pressProps} {...select.selectProps}>Both</button>;
    }
    render(<Custom />);
    expect(screen.getByRole("button", { name: "Both" })).toBeTruthy();
    expect(typeof pressProps!.ref).toBe("function");
  });

  it("[primitives.composition.compose-handlers] Selectable runs the caller's onPress before it asks for the change", () => {
    const calls: string[] = [];
    render(<Selectable onPress={() => calls.push("press")} onSelectedChange={() => calls.push("change")}>Pick</Selectable>);
    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(calls).toEqual(["press", "change"]);
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

  it("[primitives.selectable.input-paths] toggle reads the latest value: twice in one handler returns to the start, and a held toggle keeps flipping", () => {
    const change = vi.fn();
    const held: { toggle?: () => void } = {};
    function Harness() {
      const { selectProps, toggle } = useSelectable({ onSelectedChange: change });
      held.toggle ??= toggle;
      return <button type="button" {...selectProps} onClick={() => { toggle(); toggle(); }}>twice</button>;
    }
    render(<Harness />);
    const button = screen.getByRole("button", { name: "twice" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(change.mock.calls).toEqual([[true], [false]]);
    act(() => held.toggle?.());
    act(() => held.toggle?.());
    expect(change.mock.calls.slice(2)).toEqual([[true], [false]]);
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
      return <button onClick={() => state.toggleValue("a")}>{state.selectedValues.join(",") || "Empty"}</button>;
    }
    render(<Example />);
    fireEvent.click(screen.getByText("Empty"));
    expect(screen.getByText("a")).toBeTruthy();
    fireEvent.click(screen.getByText("a"));
    expect(screen.getByText("Empty")).toBeTruthy();
  });
});

describe("drag and drop hooks", () => {
  it("[primitives.hooks.result-shape] useDrag gives props that carry the ref and the state, and no separate target or handle ref", () => {
    let result: ReturnType<typeof useDrag> | undefined;
    function Probe() { result = useDrag({ activation: "handle" }); return <div {...result.dragProps}>Panel</div>; }
    render(<Probe />);
    expect(Object.keys(result!).sort()).toEqual(["cancel", "dragProps", "handleProps", "isDragging", "position"]);
    expect(typeof result!.dragProps.ref).toBe("function");
    expect(result!.dragProps["data-dragging"]).toBeUndefined();
  });

  it("[primitives.hooks.result-shape] useDrop gives dropProps with its ref and no ref argument, field or dropButtonProps", () => {
    let result: ReturnType<typeof useDrop> | undefined;
    function Probe() { result = useDrop({ disabled: true }); return <div {...result.dropProps}>Target</div>; }
    render(<Probe />);
    expect(Object.keys(result!).sort()).toEqual(["dropProps", "isDropTarget"]);
    expect(result!.dropProps["data-disabled"]).toBe("true");
    expect(screen.getByText("Target").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Target").hasAttribute("data-drop-target")).toBe(false);
  });

  it("Droppable and Draggable forward their refs to their element", () => {
    const drop = createRef<HTMLDivElement>();
    const drag = createRef<HTMLDivElement>();
    render(<><Droppable ref={drop}>Drop</Droppable><Draggable ref={drag}>Drag</Draggable></>);
    expect(drop.current).toBe(screen.getByText("Drop"));
    expect(drag.current).toBe(screen.getByText("Drag"));
  });

  it("marks a disabled Draggable with data-disabled", () => {
    render(<Draggable disabled data-testid="drag">Drag</Draggable>);
    expect(screen.getByTestId("drag").getAttribute("data-disabled")).toBe("true");
    expect(screen.getByTestId("drag").getAttribute("aria-disabled")).toBe("true");
  });
});

describe("developer errors", () => {
  const silently = (render: () => void) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try { render(); } finally { log.mockRestore(); }
  };

  it("prefix every message and name the part that was used outside its parent", () => {
    silently(() => {
      expect(() => render(<Floating.Trigger>Open</Floating.Trigger>)).toThrow("[paper-ui] Floating parts must be used inside <Floating>.");
      expect(() => render(<Draggable.Handle aria-label="Move" />)).toThrow("[paper-ui] Draggable.Handle must be used inside <Draggable>.");
      expect(() => render(<SelectableGroup.Item value="a">A</SelectableGroup.Item>)).toThrow("[paper-ui] SelectableGroup.Item must be used inside <SelectableGroup>.");
    });
  });
});

describe("composition contracts", () => {
  it("[primitives.composition.merge-props] merges handlers additively and refs onto a single native node", () => {
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

  it("[primitives.composition.compose-handlers] cancellable composition runs the caller before internal behavior", () => {
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

  it("lets a custom part open and close the Floating it stands in", () => {
    function Toggle() {
      const { isOpen, toggle } = useFloatingContext();
      return <button onClick={toggle}>{isOpen ? "Hide" : "Show"}</button>;
    }
    render(<Floating><Toggle /><Floating.Content aria-label="Panel" anchored={false}>Body</Floating.Content></Floating>);
    expect(screen.queryByText("Body")).toBeNull();
    fireEvent.click(screen.getByText("Show"));
    expect(screen.getByText("Body")).toBeTruthy();
    fireEvent.click(screen.getByText("Hide"));
    expect(screen.queryByText("Body")).toBeNull();
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

describe("floating dismissal", () => {
  it.each([{ modal: true }, { modal: false }])("closes on focus leaving only when asked to (modal: $modal)", ({ modal }) => {
    const ask = (closeOnBlur: boolean) => {
      const change = vi.fn();
      const view = render(<>
        <button>Outside</button>
        <Floating open modal={modal} onOpenChange={change}><Floating.Content aria-label="Panel" anchored={false} closeOnBlur={closeOnBlur}><button>Inside</button></Floating.Content></Floating>
      </>);
      act(() => screen.getByText("Inside").focus());
      act(() => screen.getByText("Outside").focus());
      view.unmount();
      return change;
    };
    expect(ask(false)).not.toHaveBeenCalled();
    expect(ask(true)).toHaveBeenCalledWith(false);
  });
});

describe("floating elevation", () => {
  type Own = FloatingElevation["tier"];
  const stand = (own: Own, parent?: FloatingElevation) => nestElevation(parent, own);

  it("[primitives.floating.nesting] rises one rank inside the same tier and starts a higher tier at rank 0", () => {
    expect(stand("overlay")).toEqual({ tier: "overlay", rank: 0 });
    expect(stand("modal")).toEqual({ tier: "modal", rank: 0 });
    expect(stand("overlay", { tier: "overlay", rank: 0 })).toEqual({ tier: "overlay", rank: 1 });
    expect(stand("overlay", { tier: "modal", rank: 2 })).toEqual({ tier: "modal", rank: 3 });
    expect(stand("modal", { tier: "overlay", rank: 4 })).toEqual({ tier: "modal", rank: 0 });
    expect(stand("modal", { tier: "modal", rank: 0 })).toEqual({ tier: "modal", rank: 1 });
  });

  it("[primitives.floating.nesting] holds a deep chain at the limit its tier allows", () => {
    for (const tier of ["overlay", "modal"] as const) {
      const chain = Array.from({ length: 12 }).reduce<FloatingElevation | undefined>((parent) => stand(tier, parent), undefined) as FloatingElevation;
      expect(chain).toEqual({ tier, rank: ELEVATION_NEST_LIMIT });
    }
  });

  it("[primitives.floating.nesting] draws each panel's tier on the panel itself and the stack on its backdrop", () => {
    render(
      <Floating defaultOpen>
        <Floating.Trigger>outer</Floating.Trigger>
        <Floating.Content aria-label="popover" anchored={false}>
          <Floating defaultOpen modal>
            <Floating.Trigger>inner</Floating.Trigger>
            <Floating.Content aria-label="dialog">Inner</Floating.Content>
          </Floating>
        </Floating.Content>
      </Floating>,
    );
    const popover = screen.getByRole("dialog", { name: "popover", hidden: true });
    const dialog = screen.getByRole("dialog", { name: "dialog", hidden: true });
    const { stack, cast, rankProperty } = floatingStyles;
    expect(popover.classList.contains(stack.overlay)).toBe(true);
    expect(popover.classList.contains(cast.overlay)).toBe(true);
    // A modal's panel casts its shadow; its backdrop, which carries the stack, is the panel's parent.
    expect(dialog.classList.contains(cast.modal)).toBe(true);
    expect(dialog.classList.contains(stack.modal)).toBe(false);
    expect(dialog.parentElement!.classList.contains(stack.modal)).toBe(true);
    // React Aria's own z never reaches the panel, and the rank is written as the custom property the stack reads.
    expect(popover.style.zIndex).toBe("");
    expect(popover.style.getPropertyValue(rankProperty)).toBe("0");
    expect(dialog.parentElement!.style.getPropertyValue(rankProperty)).toBe("0");
  });

  it("[primitives.floating.nesting] writes the rank of a panel nested inside its own tier", () => {
    render(
      <Floating defaultOpen modal>
        <Floating.Trigger>outer</Floating.Trigger>
        <Floating.Content aria-label="first">
          <Floating defaultOpen modal>
            <Floating.Trigger>inner</Floating.Trigger>
            <Floating.Content aria-label="second">Inner</Floating.Content>
          </Floating>
        </Floating.Content>
      </Floating>,
    );
    const { rankProperty } = floatingStyles;
    const backdrop = (name: string) => screen.getByRole("dialog", { name, hidden: true }).parentElement!;
    expect(backdrop("first").style.getPropertyValue(rankProperty)).toBe("0");
    expect(backdrop("second").style.getPropertyValue(rankProperty)).toBe("1");
  });
});
