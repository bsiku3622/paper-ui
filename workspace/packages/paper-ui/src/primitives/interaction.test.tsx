import { createRef, useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Box } from "./Box";
import { Icon } from "./Icon";
import { Surface } from "./paint/Surface";
import { Pressable, type PressableState } from "./press/Pressable";
import { Selectable } from "./select/Selectable";
import { Draggable } from "./drag/Draggable";
import { Droppable } from "./drag/Droppable";
import { RovingFocus } from "./focus/RovingFocus";
import { SelectableGroup, useSelectableGroup } from "./select/SelectableGroup";
import { VisuallyHidden } from "./a11y/VisuallyHidden";
import { Floating, useFloating, useFloatingContext } from "./float/Floating";
import { useSelectable } from "./select/useSelectable";
import { usePressable } from "./press/usePressable";
import { useFocusRing } from "./a11y/focus";
import { useDraggable } from "./drag/useDraggable";
import { useDroppable } from "./drag/useDroppable";
import { mergeProps, mergeRefs, composeEventHandlers } from "./composition";
import { useAnchoredPosition } from "../internal/aria/overlay";
import { stepProbe } from "../internal/measure.css";
import { spaceClass } from "../styles/space.css";
import { ELEVATION_NEST_LIMIT, THEME_ATTRIBUTE } from "../tokens";
import * as floatingStyles from "./float/Floating.css";
import { pressMotion } from "./press/press.css";
import { scrimPaint } from "./paint/recipes.css";
import { nestElevation, type FloatingElevation, type FloatingPresentation } from "./float/nestElevation";

// The adapter that places a popover is wrapped, so a test reads the distances it was given.
vi.mock("../internal/aria/overlay", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../internal/aria/overlay")>();
  return { ...actual, useAnchoredPosition: vi.fn(actual.useAnchoredPosition) };
});

describe("interaction primitives", () => {
  it("[primitives.pressable.one-click] Enter and Space each run the target's onClick once", () => {
    const click = vi.fn();
    render(<Pressable onClick={click}>Go</Pressable>);
    const button = screen.getByRole("button", { name: "Go" });
    for (const key of [" ", "Enter"]) {
      click.mockClear();
      fireEvent.keyDown(button, { key });
      fireEvent.keyUp(button, { key });
      expect(click, JSON.stringify(key)).toHaveBeenCalledTimes(1);
    }
  });

  it("[primitives.pressable.one-click] Enter on a plain button is kept from the browser, so the click follows the press; a submit button keeps its own", () => {
    const platform = vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    render(<><Pressable>Plain</Pressable><Pressable type="submit">Send</Pressable></>);
    const plain = screen.getByRole("button", { name: "Plain" });
    expect(fireEvent.keyDown(plain, { key: "Enter" })).toBe(false);
    fireEvent.keyUp(plain, { key: "Enter" });
    expect(fireEvent.keyDown(screen.getByRole("button", { name: "Send" }), { key: "Enter" })).toBe(true);
    expect(fireEvent.keyDown(plain, { key: "Enter", ctrlKey: true })).toBe(true);
    platform.mockRestore();
  });

  it("[primitives.draggable.input-paths] [primitives.draggable.handle] a transfer handle switched off by itself takes no drag input", () => {
    render(<Draggable mode="transfer" activation="handle" getItems={() => []}>
      <Draggable.Handle aria-label="live" data-testid="live" />
      <Draggable.Handle aria-label="off" data-testid="off" disabled />
    </Draggable>);
    expect(screen.getByTestId("live").getAttribute("draggable")).toBe("true");
    expect(screen.getByTestId("off").getAttribute("draggable")).toBeNull();
    expect(screen.getByTestId("off").getAttribute("data-disabled")).toBe("true");
  });

  it("[primitives.pressable.target] Pressable composes caller events and forwards the native button ref", () => {
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

  it("[primitives.hooks.result-shape] [primitives.hooks.attribute-table] [primitives.pressable.state] [primitives.state.active-not-pressed] Pressable marks a press with data-active, and the children function reads isActive", () => {
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

  it("[primitives.pressable.motion] motion=\"press\" gives the target the class of the one-stroke press, and the default gives it none", () => {
    function Hook() {
      const { pressProps } = usePressable({ motion: "press" });
      return <button type="button" {...pressProps}>Hook</button>;
    }
    render(<><Pressable>None</Pressable><Pressable motion="none">Also none</Pressable><Pressable motion="press">Press</Pressable><Hook /></>);
    expect(screen.getByRole("button", { name: "None" }).classList.contains(pressMotion)).toBe(false);
    expect(screen.getByRole("button", { name: "Also none" }).classList.contains(pressMotion)).toBe(false);
    expect(screen.getByRole("button", { name: "Press" }).classList.contains(pressMotion)).toBe(true);
    expect(screen.getByRole("button", { name: "Hook" }).classList.contains(pressMotion)).toBe(true);
  });

  it("[primitives.pressable.motion] keeps the class of the motion beside the caller's own and the part's", () => {
    render(<Pressable as={Selectable} motion="press" className="mine">Both</Pressable>);
    const classes = screen.getByRole("button", { name: "Both" }).classList;
    expect([classes.contains(pressMotion), classes.contains("mine")]).toEqual([true, true]);
  });

  it("[primitives.pressable.input-paths] [primitives.pressable.focusable-disabled] a focusable disabled Pressable stays in the Tab order, says aria-disabled and runs no press or click", () => {
    const press = vi.fn();
    const click = vi.fn();
    render(<Pressable disabled focusable onPress={press} onClick={click}>Busy</Pressable>);
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "Busy" });
    expect([button.disabled, button.getAttribute("aria-disabled"), button.getAttribute("data-disabled")]).toEqual([false, "true", "true"]);
    act(() => button.focus());
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyUp(button, { key: "Enter" });
    expect(press).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
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

  it("[primitives.composition.compose-handlers] [primitives.selectable.hook-result] Selectable runs the caller's onClick before it asks for the change, and a preventDefault keeps it from toggling", () => {
    const calls: string[] = [];
    const view = render(<Selectable onClick={() => calls.push("click")} onSelectedChange={() => calls.push("change")}>Pick</Selectable>);
    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(calls).toEqual(["click", "change"]);
    view.rerender(<Selectable onClick={(event) => { calls.push("cancel"); event.preventDefault(); }} onSelectedChange={() => calls.push("change")}>Pick</Selectable>);
    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(calls).toEqual(["click", "change", "cancel"]);
    expect(screen.getByRole("button", { name: "Pick" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("[primitives.selectable.input-paths] [primitives.selectable.pressable] <Pressable as={Selectable}> is one native button that toggles once, and a disabled one renders disabled and stays", () => {
    const press = vi.fn();
    const change = vi.fn();
    const view = render(<Pressable as={Selectable} onPress={press} onSelectedChange={change}>Pick</Pressable>);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    const button = screen.getByRole("button", { name: "Pick" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(change.mock.calls).toEqual([[true]]);
    expect(press).toHaveBeenCalledTimes(1);
    view.rerender(<Pressable as={Selectable} disabled onPress={press} onSelectedChange={change}>Pick</Pressable>);
    const disabled = screen.getByRole<HTMLButtonElement>("button", { name: "Pick" });
    expect(disabled.disabled).toBe(true);
    expect(disabled.getAttribute("data-disabled")).toBe("true");
    fireEvent.click(disabled);
    expect(change).toHaveBeenCalledTimes(1);
    expect(press).toHaveBeenCalledTimes(1);
  });

  it("[primitives.floating.focus-restore] a bare Floating.Trigger focuses itself on click, and the caller's preventDefault keeps it closed", () => {
    const change = vi.fn();
    render(<Floating open={false} onOpenChange={change}><Floating.Trigger>Open</Floating.Trigger></Floating>);
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.getAttribute("type")).toBe("button");
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(trigger);
    expect(change).toHaveBeenCalledWith(true);
    cleanup();
    const stay = vi.fn();
    render(<Floating onOpenChange={stay}><Floating.Trigger onClick={(event) => event.preventDefault()}>Open</Floating.Trigger></Floating>);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(stay).not.toHaveBeenCalled();
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

  it("[primitives.selectable.input-paths] controlled selection requests change without overwriting its owner", () => {
    const change = vi.fn();
    const view = render(<Selectable selected={false} onSelectedChange={change}>{({ isSelected }) => isSelected ? "On" : "Off"}</Selectable>);
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
    view.rerender(<Selectable selected onSelectedChange={change}>{({ isSelected }) => isSelected ? "On" : "Off"}</Selectable>);
    expect(screen.getByRole("button", { name: "On" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("[primitives.selectable.click-only] a bare Selectable takes a click and nothing of a press: no data-active while it is held down", () => {
    render(<Selectable aria-label="Bare">Bare</Selectable>);
    const control = screen.getByLabelText("Bare");
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: "mouse", button: 0 });
    fireEvent.mouseDown(control);
    expect(control.hasAttribute("data-active")).toBe(false);
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: "mouse", button: 0 });
    fireEvent.mouseUp(control);
    fireEvent.click(control);
    expect(control.getAttribute("aria-pressed")).toBe("true");
    // @ts-expect-error onPress belongs to Pressable: the bare button has only onClick
    render(<Selectable onPress={() => {}}>Typed</Selectable>);
  });

  it("[primitives.selectable.input-paths] [primitives.hooks.attribute-table] [primitives.selectable.hook-result] useSelectable gives state and aria without a press, and the caller connects toggle to one", () => {
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

  it("[primitives.selectable.input-paths] [primitives.selectable.hook-result] toggle reads the latest value: twice in one handler returns to the start, and a held toggle keeps flipping", () => {
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

  it("[primitives.selectable.input-paths] [primitives.selectable.hook-result] useSelectable alone never toggles on a click", () => {
    function Bare() {
      const { selectProps, isSelected } = useSelectable();
      return <button {...selectProps} type="button">{isSelected ? "On" : "Off"}</button>;
    }
    render(<Bare />);
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(screen.getByRole("button", { name: "Off" })).toBeTruthy();
  });

  it("[primitives.selectable.input-paths] [primitives.selectable.role-aria] announces selection with exactly one aria attribute, chosen by the role", () => {
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

  it("[primitives.selectable.input-paths] [primitives.selectable.role-aria] announces a current item with aria-current only", () => {
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

  it("[primitives.draggable.controlled] controlled drag reports requested movement without taking ownership of position", () => {
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

// How each primitive that takes `as` shows it is disabled, over each kind of target (SI Target rule).
describe("disabled targets", () => {
  type Row = [name: string, element: (disabled: boolean) => ReactElement, how: "native" | "aria"];
  const rows: Row[] = [
    ["Pressable", (disabled) => <Pressable disabled={disabled}>x</Pressable>, "native"],
    ["Pressable as div", (disabled) => <Pressable as="div" disabled={disabled}>x</Pressable>, "aria"],
    ["Selectable", (disabled) => <Selectable disabled={disabled}>x</Selectable>, "native"],
    ["Selectable as div", (disabled) => <Selectable as="div" disabled={disabled}>x</Selectable>, "aria"],
    ["Selectable as Pressable", (disabled) => <Selectable as={Pressable} disabled={disabled}>x</Selectable>, "native"],
    ["Pressable as Selectable", (disabled) => <Pressable as={Selectable} disabled={disabled}>x</Pressable>, "native"],
    ["SelectableGroup.Item", (disabled) => <SelectableGroup><SelectableGroup.Item value="a" disabled={disabled}>x</SelectableGroup.Item></SelectableGroup>, "native"],
    ["SelectableGroup.Item as div", (disabled) => <SelectableGroup><SelectableGroup.Item as="div" value="a" disabled={disabled}>x</SelectableGroup.Item></SelectableGroup>, "aria"],
    ["RovingFocus.Item", (disabled) => <RovingFocus><RovingFocus.Item value="a" disabled={disabled}>x</RovingFocus.Item></RovingFocus>, "native"],
    ["RovingFocus.Item as div", (disabled) => <RovingFocus><RovingFocus.Item as="div" value="a" disabled={disabled}>x</RovingFocus.Item></RovingFocus>, "aria"],
    ["RovingFocus.Item as Pressable", (disabled) => <RovingFocus><RovingFocus.Item as={Pressable} value="a" disabled={disabled}>x</RovingFocus.Item></RovingFocus>, "native"],
    ["Floating.Trigger", (disabled) => <Floating><Floating.Trigger disabled={disabled}>x</Floating.Trigger></Floating>, "native"],
    ["Floating.Trigger as div", (disabled) => <Floating><Floating.Trigger as="div" disabled={disabled}>x</Floating.Trigger></Floating>, "aria"],
    ["Floating.Close", (disabled) => <Floating><Floating.Close disabled={disabled}>x</Floating.Close></Floating>, "native"],
    ["Floating.Close as div", (disabled) => <Floating><Floating.Close as="div" disabled={disabled}>x</Floating.Close></Floating>, "aria"],
    ["Draggable", (disabled) => <Draggable disabled={disabled}>x</Draggable>, "aria"],
    ["Draggable as section", (disabled) => <Draggable as="section" disabled={disabled}>x</Draggable>, "aria"],
    ["Draggable as button", (disabled) => <Draggable as="button" disabled={disabled}>x</Draggable>, "native"],
    ["Draggable as Pressable", (disabled) => <Draggable as={Pressable} disabled={disabled}>x</Draggable>, "native"],
    ["Draggable transfer as button", (disabled) => <Draggable as="button" mode="transfer" getItems={() => []} disabled={disabled}>x</Draggable>, "native"],
    ["Draggable.Handle", (disabled) => <Draggable activation="handle"><Draggable.Handle aria-label="Move" disabled={disabled}>x</Draggable.Handle></Draggable>, "native"],
    ["Draggable.Handle as div", (disabled) => <Draggable activation="handle"><Draggable.Handle as="div" aria-label="Move" disabled={disabled}>x</Draggable.Handle></Draggable>, "aria"],
    ["Draggable.Handle transfer", (disabled) => <Draggable mode="transfer" activation="handle" getItems={() => []} disabled={disabled}><Draggable.Handle aria-label="Move">x</Draggable.Handle></Draggable>, "native"],
    ["Droppable", (disabled) => <Droppable disabled={disabled}>x</Droppable>, "aria"],
    ["Droppable as button", (disabled) => <Droppable as="button" disabled={disabled}>x</Droppable>, "native"],
    ["Droppable as Pressable", (disabled) => <Droppable as={Pressable} disabled={disabled}>x</Droppable>, "native"],
  ];
  // The element that carries the state: the last one of the tree that says what it is.
  const target = (view: { container: HTMLElement }) => [...view.container.querySelectorAll<HTMLElement>("button, div, section")].reverse().find((element) => element.textContent === "x")!;

  it("[primitives.target.projection] [primitives.polymorphic.default-tags] marks every disabled target with data-disabled and disables it the way its element allows", () => {
    for (const [name, element, how] of rows) {
      const enabled = render(element(false));
      const on = target(enabled);
      expect(on.hasAttribute("data-disabled"), `${name} enabled`).toBe(false);
      expect(on.hasAttribute("aria-disabled") && on.getAttribute("aria-disabled") !== "false", `${name} enabled`).toBe(false);
      expect((on as HTMLButtonElement).disabled === true, `${name} enabled`).toBe(false);
      enabled.unmount();
      const disabled = render(element(true));
      const off = target(disabled);
      expect(off.getAttribute("data-disabled"), name).toBe("true");
      if (how === "native") {
        expect((off as HTMLButtonElement).disabled, name).toBe(true);
        expect(off.hasAttribute("aria-disabled"), name).toBe(false);
      } else expect(off.getAttribute("aria-disabled"), name).toBe("true");
      disabled.unmount();
    }
  });

  it("[primitives.target.projection] [primitives.selectable.target] gives <Selectable as='div'> the role of a button, a place in the Tab order and the aria that announces its state", () => {
    render(<Selectable as="div">Pick</Selectable>);
    const div = screen.getByText("Pick");
    expect([div.getAttribute("role"), div.tabIndex, div.getAttribute("aria-pressed")]).toEqual(["button", 0, "false"]);
    fireEvent.click(div);
    expect(div.getAttribute("aria-pressed")).toBe("true");
  });

  it("[primitives.target.projection] [primitives.target.own-keys] gives a Selectable and a SelectableGroup.Item over a div the keys of a button", () => {
    render(<>
      <Selectable as="div">pick</Selectable>
      <SelectableGroup selectionMode="multiple"><SelectableGroup.Item as="div" value="a">item</SelectableGroup.Item></SelectableGroup>
    </>);
    for (const name of ["pick", "item"]) {
      const element = screen.getByText(name);
      expect(fireEvent.keyDown(element, { key: "Enter" }), name).toBe(false);
      expect(element.getAttribute("aria-pressed"), name).toBe("true");
      expect(fireEvent.keyDown(element, { key: " " }), name).toBe(false);
      expect(element.getAttribute("aria-pressed"), name).toBe("false");
      expect(fireEvent.keyDown(element, { key: "Enter", repeat: true }), name).toBe(false);
      expect(element.getAttribute("aria-pressed"), `${name} after a held key`).toBe("false");
      expect(fireEvent.keyDown(element, { key: "a" }), name).toBe(true);
      expect(element.getAttribute("aria-pressed"), name).toBe("false");
    }
  });

  it("[primitives.target.projection] [primitives.target.own-keys] opens a Floating from a Trigger over a div on Enter, and closes it from a Close over a div on Space", () => {
    render(<Floating>
      <Floating.Trigger as="div">open</Floating.Trigger>
      <Floating.Content aria-label="Panel"><Floating.Close as="div">close</Floating.Close></Floating.Content>
    </Floating>);
    fireEvent.keyDown(screen.getByText("open"), { key: "Enter" });
    expect(screen.getByRole("dialog", { name: "Panel" })).toBeTruthy();
    fireEvent.keyDown(screen.getByText("close"), { key: " " });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("[primitives.target.projection] [primitives.target.own-keys] leaves the keys alone on a disabled target, on what is inside the target, and when the caller prevents them", () => {
    const change = vi.fn();
    const open = vi.fn();
    render(<>
      <Selectable as="div" disabled onSelectedChange={change}>off</Selectable>
      <Selectable as="div" onSelectedChange={change}><input aria-label="Edit" /></Selectable>
      <Selectable as="div" onSelectedChange={change} onKeyDown={(event) => event.preventDefault()}>kept</Selectable>
      <Floating onOpenChange={open}><Floating.Trigger as="div" disabled>closed</Floating.Trigger></Floating>
    </>);
    for (const key of ["Enter", " "]) {
      expect(fireEvent.keyDown(screen.getByText("off"), { key }), key).toBe(true);
      expect(fireEvent.keyDown(screen.getByLabelText("Edit"), { key }), key).toBe(true);
      fireEvent.keyDown(screen.getByText("kept"), { key });
      expect(fireEvent.keyDown(screen.getByText("closed"), { key }), key).toBe(true);
    }
    expect(change).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it("[primitives.target.projection] [primitives.target.own-keys] keeps Enter on a Pressable or a Draggable.Handle over a div to its own machinery, one activation and no second click", () => {
    const click = vi.fn();
    const press = vi.fn();
    render(<Pressable as="div" onClick={click} onPress={press}>press</Pressable>);
    fireEvent.keyDown(screen.getByText("press"), { key: "Enter" });
    fireEvent.keyUp(screen.getByText("press"), { key: "Enter" });
    expect([press.mock.calls.length, click.mock.calls.length]).toEqual([1, 1]);
    click.mockClear();
    render(<Draggable activation="handle"><Draggable.Handle as="div" aria-label="Move" onClick={click}>grip</Draggable.Handle></Draggable>);
    fireEvent.keyDown(screen.getByText("grip"), { key: "Enter" });
    expect(click).not.toHaveBeenCalled();
  });

  it("[primitives.target.projection] [primitives.selectable.target] keeps a disabled Selectable, Trigger and Close from acting, over a div as over a button", () => {
    const change = vi.fn();
    const open = vi.fn();
    render(<>
      <Selectable as="div" disabled onSelectedChange={change}>pick</Selectable>
      <Floating onOpenChange={open}><Floating.Trigger as="div" disabled onClick={() => open("click")}>trigger</Floating.Trigger></Floating>
    </>);
    fireEvent.click(screen.getByText("pick"));
    fireEvent.click(screen.getByText("trigger"));
    expect(change).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it("[primitives.target.projection] [primitives.draggable.disabled] [primitives.target.exceptions] leaves a disabled Draggable's content live and its Tab stop to the drag it starts", () => {
    const click = vi.fn();
    render(<Draggable disabled data-testid="drag"><button type="button" onClick={click}>inner</button></Draggable>);
    fireEvent.click(screen.getByText("inner"));
    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("drag").hasAttribute("tabindex")).toBe(false);
    cleanup();
    render(<Draggable data-testid="drag">x</Draggable>);
    expect([screen.getByTestId("drag").getAttribute("role"), screen.getByTestId("drag").tabIndex]).toEqual(["group", 0]);
  });

  it("[primitives.target.projection] [primitives.target.exceptions] leaves a disabled Droppable's content live: it takes no drop and nothing else", () => {
    const click = vi.fn();
    render(<Droppable disabled data-testid="drop"><button type="button" onClick={click}>inner</button></Droppable>);
    fireEvent.click(screen.getByText("inner"));
    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("drop").getAttribute("aria-disabled")).toBe("true");
  });

  it("[primitives.target.projection] [primitives.hooks.disabled] leaves aria-disabled on the props of useDraggable and useDroppable, for the element a hook's user builds", () => {
    function Probe() {
      const { dragProps, handleProps } = useDraggable({ disabled: true, activation: "handle" });
      const { dropProps } = useDroppable({ disabled: true });
      return <><button type="button" {...dragProps}>drag</button><button type="button" {...dropProps}>drop</button><button type="button" {...handleProps}>handle</button></>;
    }
    render(<Probe />);
    for (const name of ["drag", "drop"]) expect(screen.getByText(name).getAttribute("aria-disabled"), name).toBe("true");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "handle" }).disabled).toBe(true);
  });

  it("[primitives.target.projection] disables a VisuallyHidden as a region: a button natively, a span only by data-disabled", () => {
    render(<><VisuallyHidden as="button" disabled>native</VisuallyHidden><VisuallyHidden disabled>plain</VisuallyHidden></>);
    const native = screen.getByText("native") as HTMLButtonElement;
    expect([native.disabled, native.getAttribute("data-disabled")]).toEqual([true, "true"]);
    const plain = screen.getByText("plain");
    expect(plain.getAttribute("data-disabled")).toBe("true");
    for (const attribute of ["disabled", "role", "tabindex", "aria-disabled"]) expect(plain.hasAttribute(attribute), attribute).toBe(false);
  });
});

describe("children snapshots", () => {
  it("[primitives.snapshots.children] hands Draggable and Droppable children whether they are disabled", () => {
    render(<>
      <Draggable disabled>{({ isDisabled, isDragging }) => `drag ${isDisabled} ${isDragging}`}</Draggable>
      <Droppable>{({ isDisabled, isDropTarget }) => `drop ${isDisabled} ${isDropTarget}`}</Droppable>
      <Droppable disabled>{({ isDisabled }) => `drop ${isDisabled}`}</Droppable>
    </>);
    expect(screen.getByText("drag true false")).toBeTruthy();
    expect(screen.getByText("drop false false")).toBeTruthy();
    expect(screen.getByText("drop true")).toBeTruthy();
  });

  it("[primitives.snapshots.children] [primitives.selectable-group.items] hands a SelectableGroup's children its selection and whether it is disabled", () => {
    const group = (disabled: boolean) => <SelectableGroup defaultSelectedValues={["b"]} disabled={disabled}>
      {({ selectedValues, isDisabled }) => <><p>{`${selectedValues.join(",")} ${isDisabled}`}</p><SelectableGroup.Item value="a">A</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item></>}
    </SelectableGroup>;
    const view = render(group(false));
    expect(screen.getByText("b false")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(screen.getByText("a false")).toBeTruthy();
    view.rerender(group(true));
    expect(screen.getByText("a true")).toBeTruthy();
  });

  it("[primitives.snapshots.children] [primitives.floating.content-state] hands Floating.Content children the panel's state, and a part inside closes it with useFloatingContext", () => {
    const seen: unknown[] = [];
    function CloseIt() {
      const { close } = useFloatingContext();
      return <button type="button" onClick={close}>Close it</button>;
    }
    render(<Floating defaultOpen>
      <Floating.Trigger>Open</Floating.Trigger>
      <Floating.Content aria-label="Panel">
        {(state) => { seen.push(state); return <CloseIt />; }}
      </Floating.Content>
    </Floating>);
    expect(seen.at(-1)).toMatchObject({ isOpen: true, presentation: "popover", placement: expect.stringMatching(/^(top|bottom|start|end)$/), elevation: { tier: "overlay", rank: 0 } });
    fireEvent.click(screen.getByText("Close it"));
    expect(screen.queryByText("Close it")).toBeNull();
    cleanup();
    seen.length = 0;
    render(<Floating defaultOpen><Floating.Content presentation="modal" aria-label="Dialog">{(state) => { seen.push(state); return "dialog"; }}</Floating.Content></Floating>);
    expect(seen[0]).toEqual({ isOpen: true, presentation: "modal", placement: undefined, elevation: { tier: "modal", rank: 0 } });
  });
});

describe("selectable groups", () => {
  it("[primitives.selectable-group.single] [primitives.selectable-group.items] shares exclusive selection and keeps arrow navigation independent of selection", () => {
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

  it("[primitives.selectable-group.single] [primitives.selectable-group.items] passes role through to its items, so a radio item announces aria-checked", () => {
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

  it("[primitives.selectable-group.multiple] [primitives.selectable-group.disabled] supports multiple selections, disabled items and removal cleanup", () => {
    const change = vi.fn();
    const view = render(<SelectableGroup selectionMode="multiple" onSelectedValuesChange={change}><SelectableGroup.Item value="a">A</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item><SelectableGroup.Item value="c" disabled>C</SelectableGroup.Item></SelectableGroup>);
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("B"));
    fireEvent.click(screen.getByText("C"));
    expect(change).toHaveBeenLastCalledWith(["a", "b"]);
    view.rerender(<SelectableGroup selectionMode="multiple" onSelectedValuesChange={change}><SelectableGroup.Item value="a">A</SelectableGroup.Item></SelectableGroup>);
    expect(change).toHaveBeenLastCalledWith(["a"]);
  });

  it("[primitives.roving-focus.registry] [primitives.selectable-group.items] refuses a duplicate value in a group, and removing it keeps the original's selection and place in the Tab order", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const group = (duplicate: boolean) => <SelectableGroup defaultSelectedValues={["a"]}>
      <SelectableGroup.Item value="a">first</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item>{duplicate && <SelectableGroup.Item value="a">second</SelectableGroup.Item>}
    </SelectableGroup>;
    const view = render(group(true));
    expect(error).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button").filter((item) => item.tabIndex === 0)).toHaveLength(1);
    view.rerender(group(false));
    const first = screen.getByText("first");
    expect(first.getAttribute("aria-pressed")).toBe("true");
    expect(first.tabIndex).toBe(0);
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByText("B"));
    error.mockRestore();
  });

  it("[primitives.selectable-group.state] controlled groups request a change without taking ownership", () => {
    const change = vi.fn();
    render(<SelectableGroup selectedValues={["a"]} onSelectedValuesChange={change}><SelectableGroup.Item value="a">A</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item></SelectableGroup>);
    fireEvent.click(screen.getByText("B"));
    expect(change).toHaveBeenCalledWith(["b"]);
    expect(screen.getByText("A").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("B").getAttribute("aria-pressed")).toBe("false");
  });

  it("[primitives.selectable-group.state] hook supports the same group state without component wrappers", () => {
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
  it("[primitives.hooks.result-shape] [primitives.hooks.attribute-table] useDraggable gives props that carry the ref and the state, and no separate target or handle ref", () => {
    let result: ReturnType<typeof useDraggable> | undefined;
    function Probe() { result = useDraggable({ activation: "handle" }); return <div {...result.dragProps}>Panel</div>; }
    render(<Probe />);
    expect(Object.keys(result!).sort()).toEqual(["cancel", "dragProps", "handleProps", "isDragging", "position"]);
    expect(typeof result!.dragProps.ref).toBe("function");
    expect(result!.dragProps["data-dragging"]).toBeUndefined();
  });

  it("[primitives.hooks.result-shape] [primitives.hooks.attribute-table] [primitives.droppable.options] useDroppable gives dropProps with its ref and no ref argument, field or dropButtonProps", () => {
    let result: ReturnType<typeof useDroppable> | undefined;
    function Probe() { result = useDroppable({ disabled: true }); return <div {...result.dropProps}>Target</div>; }
    render(<Probe />);
    expect(Object.keys(result!).sort()).toEqual(["dropProps", "isDropTarget"]);
    expect(result!.dropProps["data-disabled"]).toBe("true");
    expect(screen.getByText("Target").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Target").hasAttribute("data-drop-target")).toBe(false);
  });

  it("[primitives.draggable.refs] Droppable and Draggable forward their refs to their element", () => {
    const drop = createRef<HTMLDivElement>();
    const drag = createRef<HTMLDivElement>();
    render(<><Droppable ref={drop}>Drop</Droppable><Draggable ref={drag}>Drag</Draggable></>);
    expect(drop.current).toBe(screen.getByText("Drop"));
    expect(drag.current).toBe(screen.getByText("Drag"));
  });

  it("[primitives.draggable.disabled] marks a disabled Draggable with data-disabled", () => {
    render(<Draggable disabled data-testid="drag">Drag</Draggable>);
    expect(screen.getByTestId("drag").getAttribute("data-disabled")).toBe("true");
    expect(screen.getByTestId("drag").getAttribute("aria-disabled")).toBe("true");
  });
});

describe("a move drag that is cancelled", () => {
  function Panel({ events }: { events: string[] }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    return (
      <Draggable
        aria-label="Panel" position={position} onPositionChange={setPosition} data-x={position.x}
        onDragStart={() => events.push("start")} onDragMove={() => events.push("move")} onDragEnd={() => events.push("end")} onDragCancel={() => events.push("cancel")}
      >
        Panel
      </Draggable>
    );
  }
  const pointer = { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 };

  it("[primitives.draggable.input-paths] [primitives.draggable.controlled] Escape during a pointer move calls onDragCancel instead of onDragEnd and puts the box back where it began", () => {
    const events: string[] = [];
    render(<Panel events={events} />);
    const panel = screen.getByLabelText("Panel");
    fireEvent.pointerDown(panel, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 40, clientY: 10 });
    expect(panel.getAttribute("data-x")).toBe("30");
    expect(panel.getAttribute("data-dragging")).toBe("true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(panel.getAttribute("data-x")).toBe("0");
    expect(panel.getAttribute("data-dragging")).toBeNull();
    expect(events).toEqual(["start", "move", "cancel"]);
  });

  it("[primitives.draggable.input-paths] [primitives.draggable.controlled] a move that is let go ends with onDragEnd where it stands, and Escape after it does nothing", () => {
    const events: string[] = [];
    render(<Panel events={events} />);
    const panel = screen.getByLabelText("Panel");
    fireEvent.pointerDown(panel, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 40, clientY: 10 });
    fireEvent.pointerUp(window, { ...pointer, clientX: 40, clientY: 10 });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(panel.getAttribute("data-x")).toBe("30");
    expect(events).toEqual(["start", "move", "end"]);
  });

  it("[primitives.draggable.input-paths] [primitives.draggable.controlled] switching a Draggable off in the middle of a move cancels it", () => {
    const events: string[] = [];
    const view = render(<Draggable aria-label="Panel" onDragCancel={() => events.push("cancel")} onDragStart={() => events.push("start")}>Panel</Draggable>);
    fireEvent.pointerDown(screen.getByLabelText("Panel"), { ...pointer, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 5, clientY: 0 });
    view.rerender(<Draggable aria-label="Panel" disabled onDragCancel={() => events.push("cancel")} onDragStart={() => events.push("start")}>Panel</Draggable>);
    expect(events).toEqual(["start", "cancel"]);
  });
});

describe("developer errors", () => {
  const silently = (render: () => void) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try { render(); } finally { log.mockRestore(); }
  };

  it("[primitives.errors.prefix] [primitives.draggable.handle] prefix every message and name the part that was used outside its parent", () => {
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
  it("[primitives.floating.state] supports controlled state requests without mutating the owner's state", () => {
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

  it("[primitives.floating.state] ignores a request for the state it is already in", () => {
    const change = vi.fn();
    function Example() {
      const state = useFloating({ onOpenChange: change });
      return <><button onClick={state.open}>Open</button><button onClick={state.close}>Close</button></>;
    }
    render(<Example />);
    fireEvent.click(screen.getByText("Close"));
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Open"));
    expect(change).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Open"));
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("[primitives.floating.state] lets a custom part open and close the Floating it stands in", () => {
    function Toggle() {
      const { isOpen, toggle } = useFloatingContext();
      return <button onClick={toggle}>{isOpen ? "Hide" : "Show"}</button>;
    }
    render(<Floating><Toggle /><Floating.Trigger>Anchor</Floating.Trigger><Floating.Content aria-label="Panel">Body</Floating.Content></Floating>);
    expect(screen.queryByText("Body")).toBeNull();
    fireEvent.click(screen.getByText("Show"));
    expect(screen.getByText("Body")).toBeTruthy();
    fireEvent.click(screen.getByText("Hide"));
    expect(screen.queryByText("Body")).toBeNull();
  });

  it("[primitives.floating.state] exposes controlled trigger state without rendering closed content", () => {
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
  it.each([{ presentation: "modal" as const }, { presentation: "popover" as const }])("[primitives.floating.content-options] closes on focus leaving only when asked to ($presentation)", ({ presentation }) => {
    const ask = (closeOnBlur: boolean) => {
      const change = vi.fn();
      const view = render(<>
        <button>Outside</button>
        <Floating open onOpenChange={change}>
          <Floating.Trigger>Anchor</Floating.Trigger>
          <Floating.Content aria-label="Panel" presentation={presentation} closeOnBlur={closeOnBlur}><button>Inside</button></Floating.Content>
        </Floating>
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

describe("floating options", () => {
  const closes = (props: Record<string, unknown>, presentation: "popover" | "modal", act2: () => void) => {
    const change = vi.fn();
    render(
      <>
        <button>Outside</button>
        <Floating open onOpenChange={change}>
          <Floating.Trigger>Anchor</Floating.Trigger>
          <Floating.Content aria-label="Panel" presentation={presentation} {...props}><button>Inside</button></Floating.Content>
        </Floating>
      </>,
    );
    act2();
    cleanup();
    return change;
  };
  const escape = () => fireEvent.keyDown(screen.getByRole("dialog", { name: "Panel" }), { key: "Escape" });

  it.each(["popover", "modal"] as const)("[primitives.floating.dismiss] keyboardDismissDisabled keeps Escape from closing the %s, and without it Escape closes", (presentation) => {
    expect(closes({}, presentation, escape)).toHaveBeenCalledWith(false);
    expect(closes({ keyboardDismissDisabled: true }, presentation, escape)).not.toHaveBeenCalled();
  });

  it("[primitives.floating.dismiss] dismissable and Escape are independent: a popover that ignores outside presses still closes on Escape", () => {
    const outside = () => {
      fireEvent.pointerDown(screen.getByText("Outside"));
      fireEvent.pointerUp(screen.getByText("Outside"));
      fireEvent.click(screen.getByText("Outside"));
    };
    expect(closes({}, "popover", outside)).toHaveBeenCalledWith(false);
    expect(closes({ dismissable: false }, "popover", outside)).not.toHaveBeenCalled();
    expect(closes({ dismissable: false }, "popover", escape)).toHaveBeenCalledWith(false);
  });

  it.each(["popover", "modal"] as const)("[primitives.floating.focus-restore] autoFocus={false} moves no focus into the %s when it opens, and the default does", (presentation) => {
    const open = (props: Record<string, unknown>) => {
      const view = render(
        <>
          <button>Before</button>
          <Floating defaultOpen={false}>
            <Floating.Trigger>Anchor</Floating.Trigger>
            <Floating.Content aria-label="Panel" presentation={presentation} {...props}><button>Inside</button></Floating.Content>
          </Floating>
        </>,
      );
      act(() => screen.getByText("Before").focus());
      fireEvent.click(screen.getByText("Anchor"));
      const inside = screen.getByRole("dialog", { name: "Panel" }).contains(document.activeElement);
      view.unmount();
      return inside;
    };
    expect(open({})).toBe(true);
    expect(open({ autoFocus: false })).toBe(false);
  });

  it.each(["popover", "modal"] as const)("[primitives.floating.presentation] [primitives.floating.role] the %s is a dialog by default and an alertdialog when asked, named by its label", (presentation) => {
    const { rerender } = render(<Floating defaultOpen><Floating.Trigger>Anchor</Floating.Trigger><Floating.Content presentation={presentation} aria-label="Panel">Body</Floating.Content></Floating>);
    expect(screen.getByRole("dialog", { name: "Panel" }).getAttribute("aria-modal")).toBe(presentation === "modal" ? "true" : null);
    rerender(<Floating defaultOpen><Floating.Trigger>Anchor</Floating.Trigger><Floating.Content presentation={presentation} role="alertdialog" aria-label="Panel">Body</Floating.Content></Floating>);
    expect(screen.getByRole("alertdialog", { name: "Panel" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Panel" })).toBeNull();
  });

  it("[primitives.floating.presentation] underlayClassName lands on the modal's scrim beside the scrim's own paint, and a popover has no scrim to take it", () => {
    render(<Floating defaultOpen><Floating.Content presentation="modal" underlayClassName="app-scrim" aria-label="Dialog">Body</Floating.Content></Floating>);
    const scrim = screen.getByRole("dialog", { name: "Dialog" }).parentElement!;
    expect(scrim.classList.contains("app-scrim")).toBe(true);
    expect(scrim.classList.contains(scrimPaint)).toBe(true);
    cleanup();
    // @ts-expect-error a popover has no scrim, so the type refuses the class
    render(<Floating defaultOpen><Floating.Trigger>Anchor</Floating.Trigger><Floating.Content underlayClassName="app-scrim" aria-label="Popover">Body</Floating.Content></Floating>);
    expect(document.querySelector(".app-scrim")).toBeNull();
  });

  it("[primitives.floating.dismiss] [primitives.floating.nesting] a modal opened inside a popover stands above it, and Escape closes the modal first and the popover next", () => {
    const changes: boolean[] = [];
    const tiers: Record<string, string> = {};
    render(
      <Floating defaultOpen>
        <Floating.Trigger>Outer anchor</Floating.Trigger>
        <Floating.Content aria-label="Outer">
          {(outer) => {
            tiers.outer = `${outer.elevation.tier} ${outer.elevation.rank}`;
            return (
              <Floating defaultOpen onOpenChange={(open) => changes.push(open)}>
                <Floating.Trigger>Inner anchor</Floating.Trigger>
                <Floating.Content presentation="modal" aria-label="Inner">
                  {(inner) => {
                    tiers.inner = `${inner.elevation.tier} ${inner.elevation.rank}`;
                    return <button>Inside the modal</button>;
                  }}
                </Floating.Content>
              </Floating>
            );
          }}
        </Floating.Content>
      </Floating>,
    );
    const outer = screen.getByRole("dialog", { name: "Outer", hidden: true });
    const inner = screen.getByRole("dialog", { name: "Inner" });
    expect(inner.getAttribute("aria-modal")).toBe("true");
    expect(outer.getAttribute("aria-modal")).toBeNull();
    // The modal stands on its own, higher tier, over the popover's panel.
    expect(tiers).toEqual({ outer: "overlay 0", inner: "modal 0" });
    fireEvent.keyDown(inner, { key: "Escape" });
    expect(changes).toEqual([false]);
    expect(screen.queryByRole("dialog", { name: "Inner" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "Outer" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Outer" }), { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Outer" })).toBeNull();
  });
});

describe("floating elevation", () => {
  type Own = FloatingPresentation;
  const stand = (own: Own, parent?: FloatingElevation) => nestElevation(parent, own);

  it("[primitives.floating.nesting] rises one rank inside the same tier and starts a higher tier at rank 0", () => {
    expect(stand("popover")).toEqual({ tier: "overlay", rank: 0 });
    expect(stand("modal")).toEqual({ tier: "modal", rank: 0 });
    expect(stand("popover", { tier: "overlay", rank: 0 })).toEqual({ tier: "overlay", rank: 1 });
    expect(stand("popover", { tier: "modal", rank: 2 })).toEqual({ tier: "modal", rank: 3 });
    expect(stand("modal", { tier: "overlay", rank: 4 })).toEqual({ tier: "modal", rank: 0 });
    expect(stand("modal", { tier: "modal", rank: 0 })).toEqual({ tier: "modal", rank: 1 });
  });

  it("[primitives.floating.nesting] holds a deep chain at the limit its tier allows", () => {
    for (const [presentation, tier] of [["popover", "overlay"], ["modal", "modal"]] as const) {
      const chain = Array.from({ length: 12 }).reduce<FloatingElevation | undefined>((parent) => stand(presentation, parent), undefined) as FloatingElevation;
      expect(chain).toEqual({ tier, rank: ELEVATION_NEST_LIMIT });
    }
  });

  it("[primitives.floating.nesting] draws each panel's tier on the panel itself and the stack on its backdrop", () => {
    render(
      <Floating defaultOpen>
        <Floating.Trigger>outer</Floating.Trigger>
        <Floating.Content aria-label="popover">
          <Floating defaultOpen>
            <Floating.Trigger>inner</Floating.Trigger>
            <Floating.Content presentation="modal" aria-label="dialog">Inner</Floating.Content>
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
      <Floating defaultOpen>
        <Floating.Trigger>outer</Floating.Trigger>
        <Floating.Content presentation="modal" aria-label="first">
          <Floating defaultOpen>
            <Floating.Trigger>inner</Floating.Trigger>
            <Floating.Content presentation="modal" aria-label="second">Inner</Floating.Content>
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

// jsdom lays nothing out, so a measuring probe reads the width the step it stands for would have in a browser.
const WIDTHS: Record<string, number> = { [stepProbe.xs]: 4, [stepProbe.sm]: 8, [stepProbe.md]: 12, [stepProbe.lg]: 16, [stepProbe.gutter]: 16 };
function layOutProbes() {
  const rect = (width: number) => ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, width, height: 0, toJSON: () => ({}) }) as DOMRect;
  return vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    return rect(WIDTHS[this.className] ?? 0);
  });
}

describe("floating presentation", () => {
  it("[primitives.floating.presentation] a popover needs a Trigger or an anchorRef: without either it logs once and renders nothing", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const view = render(<Floating defaultOpen><Floating.Content aria-label="Lone">Body</Floating.Content></Floating>);
    expect(screen.queryByText("Body")).toBeNull();
    view.rerender(<Floating defaultOpen><Floating.Content aria-label="Lone">Body</Floating.Content></Floating>);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]![0]).toBe("[paper-ui] Floating.Content (popover) needs Floating.Trigger or anchorRef.");
    error.mockRestore();
  });

  it("[primitives.floating.presentation] [primitives.hooks.attribute-table] a popover stands beside its anchorRef without a Trigger, and says what it is and where it settled", () => {
    const anchor = createRef<HTMLButtonElement>();
    render(<>
      <button ref={anchor}>Anchor</button>
      <Floating defaultOpen><Floating.Content aria-label="Beside" anchorRef={anchor}>Body</Floating.Content></Floating>
    </>);
    const panel = screen.getByRole("dialog", { name: "Beside" });
    expect(panel.getAttribute("data-presentation")).toBe("popover");
    expect(panel.getAttribute("data-placement")).toMatch(/^(top|bottom|start|end)$/);
    expect(panel.hasAttribute("aria-modal")).toBe(false);
    expect(panel.parentElement!.classList.contains(scrimPaint)).toBe(false);
  });

  it("[primitives.floating.presentation] a Trigger written below its Content still anchors the popover", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Floating defaultOpen><Floating.Content aria-label="Above">Body</Floating.Content><Floating.Trigger>Below</Floating.Trigger></Floating>);
    expect(screen.getByRole("dialog", { name: "Above" }).getAttribute("data-placement")).toMatch(/^(top|bottom|start|end)$/);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("[primitives.floating.presentation] an anchor mounted with the opening and written below the Content still anchors the popover", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    function Example() {
      const anchor = useRef<HTMLSpanElement>(null);
      const [open, setOpen] = useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Open</button>
        <Floating open={open}><Floating.Content aria-label="Late" anchorRef={anchor}>Body</Floating.Content></Floating>
        {open && <span ref={anchor}>Anchor</span>}
      </>;
    }
    render(<Example />);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("dialog", { name: "Late" }).getAttribute("data-placement")).toMatch(/^(top|bottom|start|end)$/);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("[primitives.floating.presentation] [primitives.floating.role] a modal sets aria-modal, renders the scrim and has no anchor to place against", () => {
    render(<Floating defaultOpen><Floating.Content presentation="modal" aria-label="Dialog">Body</Floating.Content></Floating>);
    const panel = screen.getByRole("dialog", { name: "Dialog" });
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("data-presentation")).toBe("modal");
    expect(panel.hasAttribute("data-placement")).toBe(false);
    expect(panel.parentElement!.classList.contains(scrimPaint)).toBe(true);
  });

  it("[primitives.floating.presentation] a Floating inside a popover or a modal builds its elevation on the panel it stands in, not on its Root", () => {
    render(
      <Floating defaultOpen>
        <Floating.Trigger>outer</Floating.Trigger>
        <Floating.Content aria-label="first">
          <Floating defaultOpen>
            <Floating.Trigger>inner</Floating.Trigger>
            <Floating.Content presentation="modal" aria-label="second">{(state) => `${state.elevation.tier} ${state.elevation.rank}`}</Floating.Content>
          </Floating>
        </Floating.Content>
      </Floating>,
    );
    expect(screen.getByRole("dialog", { name: "second", hidden: true }).textContent).toBe("modal 0");
  });
});

describe("floating geometry", () => {
  const position = vi.mocked(useAnchoredPosition);
  let rect: ReturnType<typeof layOutProbes>;
  beforeEach(() => {
    rect = layOutProbes();
    position.mockClear();
  });
  afterEach(() => rect.mockRestore());

  const open = (offset?: "none" | "xs" | "sm" | "md" | "lg") => render(
    <Floating defaultOpen>
      <Floating.Trigger>Open</Floating.Trigger>
      <Floating.Content aria-label="Panel" offset={offset}>Body</Floating.Content>
    </Floating>,
  );

  it("[primitives.floating.geometry] gives the adapter the step of the gap scale as the pixels it measures, sm unless told otherwise, and the gutter as the viewport padding", () => {
    open();
    expect(position.mock.lastCall![0]).toMatchObject({ offsetPx: 8, crossOffsetPx: 0, containerPaddingPx: 16 });
    cleanup();
    open("md");
    expect(position.mock.lastCall![0]).toMatchObject({ offsetPx: 12 });
    cleanup();
    open("none");
    expect(position.mock.lastCall![0]).toMatchObject({ offsetPx: 0 });
  });

  it("[primitives.floating.geometry] [primitives.floating.content-options] measures a crossOffset the way it measures an offset, along the other axis", () => {
    render(<Floating defaultOpen><Floating.Trigger>Open</Floating.Trigger><Floating.Content aria-label="Panel" crossOffset="md">Body</Floating.Content></Floating>);
    expect(position.mock.lastCall![0]).toMatchObject({ offsetPx: 8, crossOffsetPx: 12 });
  });

  it("[primitives.floating.geometry] measures a step where the panel stands, so a subtree that overrides the scale moves it", () => {
    const parents: Array<string | null> = [];
    rect.mockImplementation(function (this: Element) {
      if (this.className in WIDTHS) parents.push(this.parentElement!.getAttribute("role"));
      const width = WIDTHS[this.className] ?? 0;
      return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, width, height: 0, toJSON: () => ({}) } as DOMRect;
    });
    open();
    expect(parents.length).toBeGreaterThan(0);
    expect(new Set(parents)).toEqual(new Set(["dialog"]));
  });

  it("[primitives.draggable.keyboard-step] moves a Draggable by a step of the gap scale per arrow key, sm unless told otherwise", () => {
    const change = vi.fn();
    const { rerender } = render(<Draggable defaultPosition={{ x: 0, y: 0 }} activation="handle" onPositionChange={change}><Draggable.Handle aria-label="Move">Grip</Draggable.Handle></Draggable>);
    const handle = screen.getByRole("button", { name: "Move" });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    fireEvent.keyUp(handle, { key: "ArrowRight" });
    expect(change).toHaveBeenLastCalledWith({ x: 8, y: 0 });
    rerender(<Draggable defaultPosition={{ x: 0, y: 0 }} keyboardStep="md" activation="handle" onPositionChange={change}><Draggable.Handle aria-label="Move">Grip</Draggable.Handle></Draggable>);
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyUp(handle, { key: "ArrowDown" });
    expect(change).toHaveBeenLastCalledWith({ x: 8, y: 12 });
  });
});

describe("floating presence", () => {
  // jsdom has no animations. Where a test needs one, an element reports an animation that runs until the test lets it finish.
  const getAnimations = vi.fn((): unknown[] => []);
  const hold = () => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => { finish = resolve; });
    getAnimations.mockImplementation(() => [{ playState: "running", finished }]);
    return () => act(async () => { finish(); await finished; });
  };
  beforeEach(() => {
    vi.stubGlobal("CSSTransition", class {});
    getAnimations.mockImplementation(() => []);
    Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: getAnimations });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(Element.prototype, "getAnimations");
  });

  const panelOf = () => document.querySelector<HTMLElement>("[data-presentation]")!;
  const popover = () => (
    <Floating>
      <Floating.Trigger>Open</Floating.Trigger>
      <Floating.Content aria-label="Panel">Body</Floating.Content>
    </Floating>
  );

  it("[primitives.floating.presence] [primitives.hooks.attribute-table] marks the panel entering until its animation ends, and carries no mark while it stands", async () => {
    const settle = hold();
    render(popover());
    fireEvent.click(screen.getByText("Open"));
    expect(panelOf().getAttribute("data-presence")).toBe("entering");
    await settle();
    expect(panelOf().hasAttribute("data-presence")).toBe(false);
  });

  it("[primitives.floating.presence] keeps a closing panel mounted but inert and hidden from assistive technology, and removes it once the exit has played", async () => {
    render(popover());
    fireEvent.click(screen.getByText("Open"));
    await act(async () => {});
    const settle = hold();
    fireEvent.click(screen.getByText("Open"));
    const panel = panelOf();
    expect(panel.getAttribute("data-presence")).toBe("exiting");
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect(panel.closest("[inert]")).not.toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    await settle();
    expect(document.querySelector("[data-presentation]")).toBeNull();
  });

  it("[primitives.floating.presence] puts the exit on the scrim and the panel of a modal and hides the whole dialog at once", async () => {
    render(<Floating><Floating.Trigger>Open</Floating.Trigger><Floating.Content presentation="modal" aria-label="Dialog">Body</Floating.Content></Floating>);
    fireEvent.click(screen.getByText("Open"));
    await act(async () => {});
    const settle = hold();
    fireEvent.click(screen.getByText("Open"));
    const panel = panelOf();
    const scrim = panel.parentElement!;
    expect([scrim.getAttribute("data-presence"), panel.getAttribute("data-presence")]).toEqual(["exiting", "exiting"]);
    expect(scrim.getAttribute("aria-hidden")).toBe("true");
    expect(scrim.hasAttribute("inert")).toBe(true);
    await settle();
    expect(document.querySelector("[data-presentation]")).toBeNull();
  });

  it("[primitives.floating.presence] a panel reopened while it is leaving is a new one: shown again, entering, no longer inert", async () => {
    render(popover());
    fireEvent.click(screen.getByText("Open"));
    await act(async () => {});
    const settle = hold();
    fireEvent.click(screen.getByText("Open"));
    const leaving = panelOf();
    expect(leaving.getAttribute("data-presence")).toBe("exiting");
    fireEvent.click(screen.getByText("Open"));
    const again = panelOf();
    expect(again).not.toBe(leaving);
    expect(leaving.isConnected).toBe(false);
    expect(again.getAttribute("data-presence")).toBe("entering");
    expect(again.hasAttribute("aria-hidden")).toBe(false);
    expect(again.closest("[inert]")).toBeNull();
    await settle();
    expect(panelOf().hasAttribute("data-presence")).toBe(false);
  });

  it("[primitives.floating.presence] unmounts at once where nothing animates", () => {
    Reflect.deleteProperty(Element.prototype, "getAnimations");
    render(popover());
    fireEvent.click(screen.getByText("Open"));
    expect(panelOf()).not.toBeNull();
    fireEvent.click(screen.getByText("Open"));
    expect(document.querySelector("[data-presentation]")).toBeNull();
  });
});

describe("what each part draws", () => {
  // Each part alone and with `as`, its default tag, and how many elements it takes in all: its parent's and its own, with no wrapper.
  const rows: Array<[name: string, plain: ReactElement, other: ReactElement, tag: string, elements: number]> = [
    ["Pressable", <Pressable>x</Pressable>, <Pressable as="section">x</Pressable>, "BUTTON", 1],
    ["Selectable", <Selectable>x</Selectable>, <Selectable as="section">x</Selectable>, "BUTTON", 1],
    ["SelectableGroup.Item", <SelectableGroup><SelectableGroup.Item value="a">x</SelectableGroup.Item></SelectableGroup>, <SelectableGroup><SelectableGroup.Item as="section" value="a">x</SelectableGroup.Item></SelectableGroup>, "BUTTON", 2],
    ["Floating.Trigger", <Floating><Floating.Trigger>x</Floating.Trigger></Floating>, <Floating><Floating.Trigger as="section">x</Floating.Trigger></Floating>, "BUTTON", 1],
    ["Floating.Close", <Floating><Floating.Close>x</Floating.Close></Floating>, <Floating><Floating.Close as="section">x</Floating.Close></Floating>, "BUTTON", 1],
    ["RovingFocus.Item", <RovingFocus><RovingFocus.Item value="a">x</RovingFocus.Item></RovingFocus>, <RovingFocus><RovingFocus.Item as="section" value="a">x</RovingFocus.Item></RovingFocus>, "BUTTON", 2],
    ["Draggable", <Draggable>x</Draggable>, <Draggable as="section">x</Draggable>, "DIV", 1],
    ["Draggable.Handle", <Draggable activation="handle"><Draggable.Handle aria-label="Move">x</Draggable.Handle></Draggable>, <Draggable activation="handle"><Draggable.Handle as="section" aria-label="Move">x</Draggable.Handle></Draggable>, "BUTTON", 2],
    ["Droppable", <Droppable>x</Droppable>, <Droppable as="section">x</Droppable>, "DIV", 1],
    ["VisuallyHidden", <VisuallyHidden>x</VisuallyHidden>, <VisuallyHidden as="section">x</VisuallyHidden>, "SPAN", 1],
  ];

  it("[primitives.polymorphic.default-tags] gives each part its default tag and another one by `as`, and adds no wrapper", () => {
    for (const [name, plain, other, tag, elements] of rows) {
      const first = render(plain);
      expect(screen.getByText("x").tagName, name).toBe(tag);
      expect(first.container.querySelectorAll("*"), `${name} alone`).toHaveLength(elements);
      first.unmount();
      const second = render(other);
      expect(screen.getByText("x").tagName, `${name} as section`).toBe("SECTION");
      expect(second.container.querySelectorAll("*"), `${name} as section`).toHaveLength(elements);
      second.unmount();
    }
  });

  it("[primitives.polymorphic.default-tags] takes a part as the target of a Pressable, and forwards an Icon's ref and native attributes to its svg", () => {
    render(<Pressable as={Selectable}>part</Pressable>);
    expect(screen.getByRole("button", { name: "part" }).getAttribute("aria-pressed")).toBe("false");
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<Icon ref={ref} data-probe="on" />);
    expect(ref.current?.tagName.toLowerCase()).toBe("svg");
    expect(ref.current?.getAttribute("data-probe")).toBe("on");
    expect(container.children).toHaveLength(1);
  });
});

describe("the callers' own attributes", () => {
  it("[primitives.target.focusable] lets a caller's role and tabIndex win over the projection", () => {
    render(<Pressable as="div" role="link" tabIndex={3}>Go</Pressable>);
    const target = screen.getByText("Go");
    expect([target.getAttribute("role"), target.tabIndex]).toEqual(["link", 3]);
  });

  it("[primitives.target.focusable] stops a disabled target's click before the target and its ancestors hear it", () => {
    const own = vi.fn();
    const outer = vi.fn();
    render(<div role="presentation" onClick={outer}><Pressable as="div" disabled onClick={own}>Go</Pressable></div>);
    fireEvent.click(screen.getByText("Go"));
    fireEvent(screen.getByText("Go"), new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }));
    expect(own).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
  });

  it("[primitives.hooks.disabled] stops a usePressable press and says data-disabled, and leaves blocking the element to the hook's user", () => {
    const press = vi.fn();
    function Hooked() {
      const { pressProps } = usePressable({ disabled: true, onPress: press });
      return <button type="button" {...pressProps}>Go</button>;
    }
    render(<Hooked />);
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "Go" });
    expect(button.getAttribute("data-disabled")).toBe("true");
    expect(button.disabled).toBe(false);
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(button);
    expect(press).not.toHaveBeenCalled();
  });

  it("[primitives.target.exceptions] lets activation decide a Draggable's role and Tab stop: a surface is the Tab stop, a handle takes it, and a transfer surface is a button", () => {
    const view = render(<Draggable data-testid="drag">x</Draggable>);
    expect([screen.getByTestId("drag").getAttribute("role"), screen.getByTestId("drag").tabIndex]).toEqual(["group", 0]);
    view.rerender(<Draggable data-testid="drag" activation="handle">x</Draggable>);
    expect([screen.getByTestId("drag").getAttribute("role"), screen.getByTestId("drag").hasAttribute("tabindex")]).toEqual(["group", false]);
    view.rerender(<Draggable data-testid="drag" mode="transfer" getItems={() => []}>x</Draggable>);
    expect(screen.getByTestId("drag").getAttribute("role")).toBe("button");
  });
});

describe("the state attributes each primitive writes", () => {
  const pointer = { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 };

  it("[primitives.state.emitters] says data-active while a Pressable or usePressable is pressed, and is absent otherwise", () => {
    function Hooked() {
      const { pressProps } = usePressable();
      return <button type="button" {...pressProps}>Hook</button>;
    }
    render(<><Pressable>Part</Pressable><Hooked /></>);
    for (const name of ["Part", "Hook"]) {
      const button = screen.getByRole("button", { name });
      expect(button.hasAttribute("data-active"), name).toBe(false);
      fireEvent.keyDown(button, { key: " " });
      expect(button.getAttribute("data-active"), name).toBe("true");
      fireEvent.keyUp(button, { key: " " });
      expect(button.hasAttribute("data-active"), name).toBe(false);
    }
  });

  it("[primitives.state.emitters] says data-focused and data-focus-visible on a Pressable while the keyboard's focus is on it", () => {
    render(<Pressable>Go</Pressable>);
    const button = screen.getByRole("button", { name: "Go" });
    fireEvent.keyDown(document.body, { key: "Tab" });
    act(() => button.focus());
    expect(button.getAttribute("data-focused")).toBe("true");
    expect(button.getAttribute("data-focus-visible")).toBe("true");
    act(() => button.blur());
    expect(button.hasAttribute("data-focused")).toBe(false);
    expect(button.hasAttribute("data-focus-visible")).toBe(false);
  });

  it("[primitives.state.emitters] says data-selected on a Selectable, a SelectableGroup.Item and useSelectable while selected", () => {
    function Hooked() {
      const { selectProps } = useSelectable({ defaultSelected: true });
      return <button type="button" {...selectProps}>Hook</button>;
    }
    render(<>
      <Selectable defaultSelected>Part</Selectable>
      <SelectableGroup defaultSelectedValues={["a"]}><SelectableGroup.Item value="a">Item</SelectableGroup.Item><SelectableGroup.Item value="b">Other</SelectableGroup.Item></SelectableGroup>
      <Hooked />
    </>);
    for (const name of ["Part", "Item", "Hook"]) expect(screen.getByRole("button", { name }).getAttribute("data-selected"), name).toBe("true");
    expect(screen.getByRole("button", { name: "Other" }).hasAttribute("data-selected")).toBe(false);
  });

  it("[primitives.state.emitters] says data-dragging on a Draggable, its Handle and useDraggable's props only while a drag is held", () => {
    render(<Draggable activation="handle" data-testid="panel"><Draggable.Handle aria-label="Move">Grip</Draggable.Handle></Draggable>);
    const panel = screen.getByTestId("panel");
    const handle = screen.getByRole("button", { name: "Move" });
    expect(panel.hasAttribute("data-dragging")).toBe(false);
    expect(handle.hasAttribute("data-dragging")).toBe(false);
    fireEvent.pointerDown(handle, { ...pointer, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 10, clientY: 0 });
    expect(panel.getAttribute("data-dragging")).toBe("true");
    expect(handle.getAttribute("data-dragging")).toBe("true");
    fireEvent.pointerUp(window, { ...pointer, clientX: 10, clientY: 0 });
    expect(panel.hasAttribute("data-dragging")).toBe(false);
    expect(handle.hasAttribute("data-dragging")).toBe(false);
  });

  it("[primitives.state.emitters] says data-disabled on what the projection covers and on usePressable, useDraggable and useDroppable", () => {
    function Hooks() {
      const { pressProps } = usePressable({ disabled: true });
      const { dragProps, handleProps } = useDraggable({ disabled: true });
      const { dropProps } = useDroppable({ disabled: true });
      return <><button type="button" {...pressProps}>press</button><div {...dragProps}>drag</div><button type="button" {...handleProps}>handle</button><div {...dropProps}>drop</div></>;
    }
    render(<><Hooks /><VisuallyHidden disabled>hidden</VisuallyHidden><Pressable disabled>part</Pressable></>);
    for (const name of ["press", "drag", "handle", "drop", "hidden", "part"]) expect(screen.getByText(name).getAttribute("data-disabled"), name).toBe("true");
  });
});

describe("a Pressable's own state", () => {
  it("[primitives.pressable.state] hands its children function whether it is active, focused, shown focused and disabled, and writes the same on the element", () => {
    const seen: PressableState[] = [];
    const view = render(<Pressable>{(state) => { seen.push(state); return "Go"; }}</Pressable>);
    const button = screen.getByRole("button", { name: "Go" });
    expect(seen.at(-1)).toEqual({ isActive: false, isFocused: false, isFocusVisible: false, isDisabled: false });
    fireEvent.keyDown(document.body, { key: "Tab" });
    act(() => button.focus());
    expect(seen.at(-1)).toMatchObject({ isFocused: true, isFocusVisible: true });
    fireEvent.keyDown(button, { key: " " });
    expect(seen.at(-1)).toMatchObject({ isActive: true });
    fireEvent.keyUp(button, { key: " " });
    view.rerender(<Pressable disabled>{(state) => { seen.push(state); return "Go"; }}</Pressable>);
    expect(seen.at(-1)).toMatchObject({ isDisabled: true });
  });

  it("[primitives.pressable.state] writes no attribute for a hover, and no `pressed` of its own", () => {
    render(<Pressable>Go</Pressable>);
    const button = screen.getByRole("button", { name: "Go" });
    fireEvent.pointerEnter(button, { pointerType: "mouse" });
    fireEvent.mouseEnter(button);
    expect(button.getAttributeNames().filter((name) => /hover|pressed/.test(name))).toEqual([]);
  });

  it("[primitives.pressable.hook-bare] gives no tag's defaults: a hook's props hold no type, role or label of their own", () => {
    let props: ReturnType<typeof usePressable>["pressProps"] | undefined;
    function Hooked() {
      props = usePressable().pressProps;
      return <div {...props}>Go</div>;
    }
    render(<Hooked />);
    for (const attribute of ["type", "role", "aria-label", "disabled"]) expect(screen.getByText("Go").hasAttribute(attribute), attribute).toBe(false);
  });

  it("[primitives.selectable.pressable] hands the function child of <Pressable as={Selectable}> the press state alone, and takes the selection from the attributes", () => {
    const seen: object[] = [];
    render(<Pressable as={Selectable} defaultSelected>{(state) => { seen.push(state); return "Pick"; }}</Pressable>);
    expect(Object.keys(seen.at(-1)!).sort()).toEqual(["isActive", "isDisabled", "isFocusVisible", "isFocused"]);
    const button = screen.getByRole("button", { name: "Pick" });
    expect([button.getAttribute("data-selected"), button.getAttribute("aria-pressed")]).toEqual(["true", "true"]);
  });
});

describe("what a selection promises", () => {
  it("[primitives.selectable.hook-result] gives a children function the selection and whether it is disabled, and useSelectable a setter beside its toggle", () => {
    const view = render(<Selectable defaultSelected>{({ isSelected, isDisabled }) => `${isSelected} ${isDisabled}`}</Selectable>);
    expect(screen.getByRole("button", { name: "true false" })).toBeTruthy();
    view.rerender(<Selectable disabled defaultSelected>{({ isSelected, isDisabled }) => `${isSelected} ${isDisabled}`}</Selectable>);
    expect(screen.getByRole("button", { name: "true true" })).toBeTruthy();
    cleanup();
    const change = vi.fn();
    function Hooked() {
      const { isSelected, setSelected } = useSelectable({ onSelectedChange: change });
      return <button type="button" onClick={() => setSelected(true)}>{String(isSelected)}</button>;
    }
    render(<Hooked />);
    fireEvent.click(screen.getByRole("button", { name: "false" }));
    expect(change.mock.calls).toEqual([[true]]);
    expect(screen.getByRole("button", { name: "true" })).toBeTruthy();
  });

  it("[primitives.selectable.hook-result] says aria-current only while it is selected, and no aria-current without `current`", () => {
    const view = render(<Selectable current="page">Item</Selectable>);
    expect(screen.getByText("Item").hasAttribute("aria-current")).toBe(false);
    view.rerender(<Selectable current="page" selected>Item</Selectable>);
    expect(screen.getByText("Item").getAttribute("aria-current")).toBe("page");
    view.rerender(<Selectable selected>Item</Selectable>);
    expect(screen.getByText("Item").hasAttribute("aria-current")).toBe(false);
  });

  it("[primitives.selectable.native-widgets] changes no role by itself and brings no widget's keys: the caller names the role, and an arrow key does nothing here", () => {
    let props: ReturnType<typeof useSelectable>["selectProps"] | undefined;
    function Hooked() {
      props = useSelectable({ role: "tab" }).selectProps;
      return <button type="button" {...props}>Home</button>;
    }
    render(<><Hooked /><Selectable role="tab">Tab</Selectable></>);
    expect(Object.keys(props!)).not.toContain("role");
    const tab = screen.getByRole("tab", { name: "Tab" });
    act(() => tab.focus());
    fireEvent.keyDown(tab, { key: "ArrowRight" });
    expect(document.activeElement).toBe(tab);
    expect(tab.getAttribute("aria-selected")).toBe("false");
  });

  it("[primitives.selectable-group.items] takes one Tab stop and leaves the arrow keys to the focus, and a press to the selection", () => {
    const change = vi.fn();
    render(<SelectableGroup onSelectedValuesChange={change}><SelectableGroup.Item value="a">A</SelectableGroup.Item><SelectableGroup.Item value="b">B</SelectableGroup.Item></SelectableGroup>);
    const [a, b] = [screen.getByRole("button", { name: "A" }), screen.getByRole("button", { name: "B" })];
    expect([a.tabIndex, b.tabIndex]).toEqual([0, -1]);
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(b);
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(b);
    expect(change.mock.calls).toEqual([[["b"]]]);
  });
});

describe("what a Draggable's input is", () => {
  const pointer = { pointerId: 1, pointerType: "mouse", button: 0, buttons: 1 };

  it("[primitives.draggable.modes] moves by default, with a translate, and a transfer asks for its items and has no position to translate", () => {
    const view = render(<Draggable data-testid="drag" defaultPosition={{ x: 3, y: 4 }}>x</Draggable>);
    expect(screen.getByTestId("drag").style.translate).toBe("3px 4px");
    view.rerender(<Draggable data-testid="drag" mode="transfer" getItems={() => []}>x</Draggable>);
    expect(screen.getByTestId("drag").style.translate).toBe("");
    // @ts-expect-error a transfer has to say what it carries
    render(<Draggable mode="transfer">y</Draggable>);
  });

  it("[primitives.draggable.handle] names the part outside its parent, and asks for a name", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Draggable.Handle aria-label="Move" />)).toThrow("[paper-ui] Draggable.Handle must be used inside <Draggable>.");
    log.mockRestore();
    // @ts-expect-error a handle has to be named
    render(<Draggable activation="handle"><Draggable.Handle>x</Draggable.Handle></Draggable>);
  });

  it("[primitives.draggable.handle] starts no move on a child control or a marked child, and a surface moves from anywhere else", () => {
    const start = vi.fn();
    render(<Draggable data-testid="surface" onDragStart={start}>
      <span>open</span>
      <button type="button">button</button>
      <input aria-label="input" />
      <textarea aria-label="textarea" />
      <select aria-label="select" />
      <a href="#x">link</a>
      <div contentEditable suppressContentEditableWarning>editable</div>
      <div data-drag-ignore>ignored</div>
    </Draggable>);
    const press = (target: Element) => {
      fireEvent.pointerDown(target, { ...pointer, clientX: 0, clientY: 0 });
      fireEvent.pointerMove(window, { ...pointer, clientX: 8, clientY: 0 });
      fireEvent.pointerUp(window, { ...pointer, clientX: 8, clientY: 0 });
    };
    for (const child of [screen.getByText("button"), screen.getByLabelText("input"), screen.getByLabelText("textarea"), screen.getByLabelText("select"), screen.getByText("link"), screen.getByText("editable"), screen.getByText("ignored")]) press(child);
    expect(start).not.toHaveBeenCalled();
    press(screen.getByText("open"));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("[primitives.draggable.handle] leaves an arrow key in a child input to that input", () => {
    const change = vi.fn();
    render(<Draggable onPositionChange={change}><input aria-label="input" /></Draggable>);
    fireEvent.keyDown(screen.getByLabelText("input"), { key: "ArrowRight" });
    expect(change).not.toHaveBeenCalled();
  });

  it("[primitives.draggable.transfer] previews the whole box, whichever handle the drag starts from, and offers what getItems returns", () => {
    render(<Draggable mode="transfer" activation="handle" data-testid="box" getItems={() => [{ "text/plain": "item" }]}><Draggable.Handle aria-label="Send">x</Draggable.Handle></Draggable>);
    const setDragImage = vi.fn();
    const setData = vi.fn();
    fireEvent.dragStart(screen.getByRole("button", { name: "Send" }), { dataTransfer: { setDragImage, setData, items: { add: vi.fn() }, types: [], effectAllowed: "" } });
    expect(setDragImage).toHaveBeenCalledWith(screen.getByTestId("box"), 0, 0);
  });
});

describe("what the root of a Floating takes", () => {
  const position = vi.mocked(useAnchoredPosition);
  const pressOutside = () => {
    fireEvent.pointerDown(screen.getByText("Outside"));
    fireEvent.pointerUp(screen.getByText("Outside"));
    fireEvent.click(screen.getByText("Outside"));
  };

  it.each(["popover", "modal"] as const)("[primitives.floating.content-options] [primitives.floating.portal-container] portalContainer places the %s in that element, whose root keeps the opener's theme and source", (presentation) => {
    const host = document.createElement("section");
    document.body.append(host);
    const carried = { "--pui-shape-control-height-md": "40px" } as CSSProperties;
    const view = render(<Surface theme="dark">
      <Floating defaultOpen>
        <Floating.Trigger style={carried}>Anchor</Floating.Trigger>
        <Floating.Content aria-label="Panel" presentation={presentation} portalContainer={host}>Body</Floating.Content>
      </Floating>
    </Surface>);
    const panel = screen.getByRole("dialog", { name: "Panel" });
    expect(host.contains(panel)).toBe(true);
    const root = host.firstElementChild as HTMLElement;
    expect(root.contains(panel)).toBe(true);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(root.style.getPropertyValue("--pui-shape-control-height-md")).toBe("40px");
    view.unmount();
    expect(host.children).toHaveLength(0);
    host.remove();
  });

  it.each(["popover", "modal"] as const)("[primitives.floating.content-options] closeOnInteractOutside decides whether a press outside the %s closes it, and is asked about what was pressed", (presentation) => {
    const open = (closeOnInteractOutside?: (element: Element) => boolean) => {
      const change = vi.fn();
      const view = render(<>
        <button type="button">Outside</button>
        <Floating open onOpenChange={change}>
          <Floating.Trigger>Anchor</Floating.Trigger>
          <Floating.Content aria-label="Panel" presentation={presentation} closeOnInteractOutside={closeOnInteractOutside}>Body</Floating.Content>
        </Floating>
      </>);
      pressOutside();
      const outside = screen.getByText("Outside");
      view.unmount();
      return { change, outside };
    };
    const keep = vi.fn(() => false);
    const kept = open(keep);
    expect(kept.change).not.toHaveBeenCalled();
    expect(keep).toHaveBeenCalledWith(kept.outside);
    expect(open(() => true).change).toHaveBeenCalledWith(false);
    expect(open().change).toHaveBeenCalledWith(false);
  });

  it("[primitives.floating.content-options] gives the placement, the cross offset and the flip it is given to the adapter, and bottom start, none and a flip by default", () => {
    position.mockClear();
    const view = render(<Floating defaultOpen><Floating.Trigger>Anchor</Floating.Trigger><Floating.Content aria-label="Panel">Body</Floating.Content></Floating>);
    expect(position.mock.lastCall![0]).toMatchObject({ placement: "bottom start", crossOffsetPx: 0, flip: true });
    view.unmount();
    position.mockClear();
    render(<Floating defaultOpen><Floating.Trigger>Anchor</Floating.Trigger><Floating.Content aria-label="Panel" placement="top end" flip={false}>Body</Floating.Content></Floating>);
    expect(position.mock.lastCall![0]).toMatchObject({ placement: "top end", flip: false });
  });

  it.each(["popover", "modal"] as const)("[primitives.floating.content-options] [primitives.floating.initial-focus] moves the first focus of the %s to initialFocusRef, else the first target inside, else the panel itself", (presentation) => {
    function Open({ withRef, withTarget }: { withRef: boolean; withTarget: boolean }) {
      const ref = useRef<HTMLButtonElement>(null);
      return <Floating defaultOpen={false}>
        <Floating.Trigger>Anchor</Floating.Trigger>
        <Floating.Content aria-label="Panel" presentation={presentation} initialFocusRef={withRef ? ref : undefined}>
          {withTarget ? <><button type="button">First</button><button type="button" ref={ref}>Second</button></> : "Body"}
        </Floating.Content>
      </Floating>;
    }
    const opened = (props: { withRef: boolean; withTarget: boolean }) => {
      const view = render(<Open {...props} />);
      fireEvent.click(screen.getByText("Anchor"));
      const focused = document.activeElement;
      const name = focused?.getAttribute("role") === "dialog" ? "panel" : focused?.textContent;
      view.unmount();
      return name;
    };
    expect(opened({ withRef: true, withTarget: true })).toBe("Second");
    expect(opened({ withRef: false, withTarget: true })).toBe("First");
    expect(opened({ withRef: false, withTarget: false })).toBe("panel");
  });

  it.each(["popover", "modal"] as const)("[primitives.floating.content-options] restores the focus to the Trigger when the %s closes, unless restoreFocus says not to", async (presentation) => {
    const closed = async (restoreFocus?: boolean) => {
      const view = render(<Floating defaultOpen={false}>
        <Floating.Trigger>Anchor</Floating.Trigger>
        <Floating.Content aria-label="Panel" presentation={presentation} restoreFocus={restoreFocus}><Floating.Close>Close</Floating.Close></Floating.Content>
      </Floating>);
      const anchor = screen.getByText("Anchor");
      fireEvent.click(anchor);
      fireEvent.click(screen.getByText("Close"));
      // React Aria gives the focus back on the frame after the panel has gone.
      await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
      await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
      const restored = document.activeElement === anchor;
      view.unmount();
      return restored;
    };
    expect(await closed()).toBe(true);
    expect(await closed(false)).toBe(false);
  });

  it("[primitives.floating.open-from-start] stands after the page has committed, so a parent's first effect finds no panel and the page finds it before it paints", () => {
    let atEffect: Element | null | undefined;
    function Parent() {
      useEffect(() => { atEffect = document.querySelector("[role=dialog]"); }, []);
      return <Floating defaultOpen><Floating.Trigger>Anchor</Floating.Trigger><Floating.Content aria-label="Panel">Body</Floating.Content></Floating>;
    }
    render(<Parent />);
    expect(atEffect).toBeNull();
    expect(screen.getByRole("dialog", { name: "Panel" })).toBeTruthy();
  });
});
