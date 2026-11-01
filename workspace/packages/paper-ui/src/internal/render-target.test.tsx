import { forwardRef, type AnchorHTMLAttributes, type ReactElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Floating } from "../primitives/float/Floating";
import { Paint } from "../primitives/paint/Paint";
import { Pressable } from "../primitives/press/Pressable";
import { Selectable } from "../primitives/select/Selectable";
import { registerAtom, registerPart, targetProps } from "./render-target";

// A Paper part, a pressable Atom and a foreign component, as targets.
const Part = registerPart(() => null);
const AtomTarget = registerAtom(() => null);
const Foreign = () => null;

const keys = (props: object) => Object.keys(props).sort();

describe("targetProps", () => {
  it("[primitives.target.projection] [primitives.target.table] projects a control: a button disables itself, anything else is told to be a button and says it is disabled", () => {
    expect(targetProps("button", { kind: "control" })).toEqual({ type: "button" });
    expect(targetProps("button", { kind: "control", type: "submit" })).toEqual({ type: "submit" });
    expect(targetProps("button", { kind: "control", disabled: true })).toEqual({ type: "button", disabled: true, "data-disabled": "true" });
    expect(targetProps("div", { kind: "control" })).toEqual({ role: "button", tabIndex: 0 });
    expect(targetProps("div", { kind: "control", disabled: true })).toMatchObject({ role: "button", tabIndex: -1, "aria-disabled": true, "data-disabled": "true" });
    expect(targetProps("a", { kind: "control", href: "/x" })).toEqual({ tabIndex: 0 });
    expect(targetProps("a", { kind: "control", href: "/x", disabled: true })).toMatchObject({ tabIndex: -1, "aria-disabled": true, "data-disabled": "true" });
    expect(targetProps("a", { kind: "control", href: "/x", disabled: true })).not.toHaveProperty("role");
    expect(targetProps("a", { kind: "control", disabled: true })).toHaveProperty("role", "button");
    for (const tag of ["input", "select", "textarea", "fieldset", "optgroup", "option"] as const) {
      expect(targetProps(tag, { kind: "control" }), tag).toEqual({});
      expect(targetProps(tag, { kind: "control", disabled: true }), tag).toEqual({ disabled: true, "data-disabled": "true" });
    }
  });

  it("[primitives.target.projection] [primitives.target.table] projects a control that is a Paper part or a foreign component", () => {
    expect(targetProps(Part, { kind: "control" })).toEqual({});
    expect(targetProps(Part, { kind: "control", type: "submit" })).toEqual({ type: "submit" });
    expect(targetProps(Part, { kind: "control", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps(Foreign, { kind: "control" })).toEqual({});
    expect(targetProps(Foreign, { kind: "control", disabled: true })).toMatchObject({ "aria-disabled": true, tabIndex: -1, "data-disabled": "true" });
    expect(targetProps(Foreign, { kind: "control", disabled: true })).not.toHaveProperty("disabled");
  });

  it("[primitives.target.projection] [primitives.target.table] projects a region: native tags and components are disabled, other tags only say so", () => {
    expect(targetProps("button", { kind: "region" })).toEqual({});
    expect(targetProps("button", { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps("input", { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps("span", { kind: "region" })).toEqual({});
    expect(targetProps("span", { kind: "region", disabled: true })).toEqual({ "data-disabled": "true" });
    expect(targetProps(Part, { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps(Foreign, { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    for (const tag of ["span", "div", "a"] as const) expect(keys(targetProps(tag, { kind: "region", disabled: true })), tag).toEqual(["data-disabled"]);
  });

  it("[primitives.target.projection] [primitives.target.focusable] blocks a middle click as well as a click, so a disabled link opens no new tab", () => {
    render(<a data-testid="link" href="#target" {...targetProps("a", { kind: "control", disabled: true, href: "#target" })}>Link</a>);
    const link = screen.getByTestId("link");
    expect(fireEvent(link, new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }))).toBe(false);
    expect(fireEvent.click(link)).toBe(false);
    const foreign = targetProps(Foreign, { kind: "control", disabled: true });
    expect(foreign.onAuxClickCapture).toBe(foreign.onClickCapture);
  });

  it("[primitives.target.projection] [primitives.target.focusable] keeps a focusable control in the Tab order, blocked by aria-disabled instead of the platform", () => {
    expect(targetProps("button", { kind: "control", disabled: true, focusable: true })).toMatchObject({ type: "button", "aria-disabled": true, "data-disabled": "true" });
    expect(targetProps("button", { kind: "control", disabled: true, focusable: true })).not.toHaveProperty("disabled");
    expect(targetProps("div", { kind: "control", disabled: true, focusable: true })).toMatchObject({ tabIndex: 0, "aria-disabled": true });
    expect(targetProps(Part, { kind: "control", disabled: true, focusable: true })).toMatchObject({ "aria-disabled": true, "data-disabled": "true" });
    expect(targetProps(Part, { kind: "control", disabled: true, focusable: true })).not.toHaveProperty("disabled");
    expect(targetProps(Part, { kind: "control", disabled: true, focusable: true })).not.toHaveProperty("focusable");
    expect(targetProps(Foreign, { kind: "control", disabled: true, focusable: true })).toMatchObject({ tabIndex: 0, "aria-disabled": true });
    // A native input has no Tab stop to keep apart from its disabled state.
    for (const tag of ["input", "select"] as const) expect(targetProps(tag, { kind: "control", disabled: true, focusable: true }), tag).toEqual({ disabled: true, "data-disabled": "true" });
  });

  it("[primitives.target.projection] [primitives.target.table] projects a pressable Atom like a Paper part", () => {
    // Asking for an Atom's projection is the mistake the next describe pins, so the message is not wanted here.
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(targetProps(AtomTarget, { kind: "control", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps(AtomTarget, { kind: "control", disabled: true, focusable: true })).toMatchObject({ "aria-disabled": true, "data-disabled": "true" });
    error.mockRestore();
  });

  it("[primitives.target.projection] [primitives.target.own-keys] gives a button's keys only to a tag that stands in for one, only when asked and only while enabled", () => {
    const key = { kind: "control", activateOnKey: true } as const;
    expect(targetProps("div", key).onKeyDown).toBeTypeOf("function");
    expect(targetProps("a", key).onKeyDown).toBeTypeOf("function");
    expect(targetProps("div", { kind: "control" })).not.toHaveProperty("onKeyDown");
    expect(targetProps("div", { ...key, disabled: true })).not.toHaveProperty("onKeyDown");
    expect(targetProps("a", { ...key, href: "/x" })).not.toHaveProperty("onKeyDown");
    for (const tag of ["button", "input", Part, Foreign] as const) expect(targetProps(tag, key), String(tag)).not.toHaveProperty("onKeyDown");
  });

  it("[primitives.target.projection] carries no key without a value", () => {
    const cases = [targetProps("button", { kind: "control" }), targetProps("div", { kind: "control", disabled: true }), targetProps(Part, { kind: "control" }), targetProps(Foreign, { kind: "region" })];
    for (const props of cases) expect(Object.values(props).every((value) => value !== undefined)).toBe(true);
  });
});

describe("an Atom as a target", () => {
  it("[primitives.target.projection] [primitives.target.focusable] tells a developer once that a behaviour was given an Atom, and that the Atom takes the part instead", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const Pressed = registerAtom(forwardRef<HTMLButtonElement, { children?: string }>(function Pressed({ children }, ref) { return <button ref={ref}>{children}</button>; }));
    const view = render(<Floating><Floating.Trigger as={Pressed}>Open</Floating.Trigger></Floating>);
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[0])).toBe("[paper-ui] An Atom is not a target for a behaviour. Give the Atom the part instead: <Button as={Floating.Trigger}>, not <Floating.Trigger as={Button}>.");
    view.rerender(<Floating><Floating.Trigger as={Pressed}>Open</Floating.Trigger></Floating>);
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it("[primitives.target.projection] says nothing of a part given a part, a tag or a foreign component", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<><Pressable as={Selectable}>a</Pressable><Pressable as="div">b</Pressable><Pressable as={Foreign}>c</Pressable></>);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});

describe("a Pressable over each target", () => {
  const ForeignLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function ForeignLink({ onClick, ...rest }, ref) {
    return <a ref={ref} href="/there" {...rest} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) { event.preventDefault(); navigate(); } }} />;
  });
  const navigate = vi.fn();

  it("[primitives.target.projection] [primitives.target.table] renders a native button, a link, a div, an input, a Paper part and a foreign component, enabled and disabled", () => {
    const rows: Array<[string, (disabled: boolean) => ReactElement, string, (element: HTMLElement) => boolean]> = [
      ["button", (disabled) => <Pressable disabled={disabled}>x</Pressable>, "BUTTON", (element) => (element as HTMLButtonElement).disabled],
      ["a[href]", (disabled) => <Pressable as="a" href="/x" disabled={disabled}>x</Pressable>, "A", (element) => element.getAttribute("aria-disabled") === "true"],
      ["div", (disabled) => <Pressable as="div" disabled={disabled}>x</Pressable>, "DIV", (element) => element.getAttribute("aria-disabled") === "true"],
      ["input", (disabled) => <Pressable as="input" aria-label="x" disabled={disabled} />, "INPUT", (element) => (element as HTMLInputElement).disabled],
      ["Paper part", (disabled) => <Pressable as={Selectable} disabled={disabled}>x</Pressable>, "BUTTON", (element) => (element as HTMLButtonElement).disabled],
      ["foreign", (disabled) => <Pressable as={ForeignLink} disabled={disabled}>x</Pressable>, "A", (element) => element.getAttribute("aria-disabled") === "true"],
    ];
    for (const [name, element, tag, isDisabled] of rows) {
      const enabled = render(element(false));
      const on = enabled.container.firstElementChild as HTMLElement;
      expect(on.tagName, name).toBe(tag);
      expect(isDisabled(on), `${name} enabled`).toBe(false);
      expect(on.hasAttribute("data-disabled"), `${name} enabled`).toBe(false);
      enabled.unmount();
      const disabled = render(element(true));
      const off = disabled.container.firstElementChild as HTMLElement;
      expect(isDisabled(off), `${name} disabled`).toBe(true);
      expect(off.getAttribute("data-disabled"), `${name} disabled`).toBe("true");
      disabled.unmount();
    }
  });

  it("[primitives.target.projection] makes a div a button that is a Tab stop, and takes a disabled one out of the order", () => {
    const view = render(<Pressable as="div">Go</Pressable>);
    const div = screen.getByText("Go");
    expect([div.getAttribute("role"), div.tabIndex, div.hasAttribute("aria-disabled")]).toEqual(["button", 0, false]);
    view.rerender(<Pressable as="div" disabled>Go</Pressable>);
    expect([div.getAttribute("role"), div.tabIndex, div.getAttribute("aria-disabled")]).toEqual(["button", -1, "true"]);
  });

  it("[primitives.target.projection] [primitives.target.focusable] does not navigate through a disabled foreign link, and takes it out of the Tab order", () => {
    navigate.mockClear();
    const view = render(<Pressable as={ForeignLink} disabled>Go</Pressable>);
    const link = screen.getByText("Go");
    expect([link.getAttribute("aria-disabled"), link.tabIndex, link.getAttribute("data-disabled")]).toEqual(["true", -1, "true"]);
    fireEvent.click(link);
    expect(navigate).not.toHaveBeenCalled();
    view.rerender(<Pressable as={ForeignLink}>Go</Pressable>);
    fireEvent.click(screen.getByText("Go"));
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("[primitives.target.projection] [primitives.target.focusable] runs neither a click handler nor a press on a disabled element that is not a button", () => {
    const click = vi.fn();
    const press = vi.fn();
    render(<Pressable as="div" disabled onClick={click} onPress={press}>Go</Pressable>);
    fireEvent.click(screen.getByText("Go"));
    expect(click).not.toHaveBeenCalled();
    expect(press).not.toHaveBeenCalled();
  });

  it("[primitives.target.projection] renders <Paint as={Pressable} disabled> as a disabled button, which hover does not reach", () => {
    render(<Paint as={Pressable} accent="primary" hoverable disabled>Go</Paint>);
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "Go" });
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("data-disabled")).toBe("true");
    expect(button.getAttribute("type")).toBe("button");
  });
});
