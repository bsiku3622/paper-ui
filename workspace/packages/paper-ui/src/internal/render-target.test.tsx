import { forwardRef, type AnchorHTMLAttributes, type ReactElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Paint, Pressable, Selectable } from "../primitives";
import { registerPart, targetProps } from "./render-target";

// A Paper part and a foreign component, as targets.
const Part = registerPart(() => null);
const Foreign = () => null;

const keys = (props: object) => Object.keys(props).sort();

describe("targetProps", () => {
  it("[primitives.target.projection] projects a control: a button disables itself, anything else is told to be a button and says it is disabled", () => {
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

  it("[primitives.target.projection] projects a control that is a Paper part or a foreign component", () => {
    expect(targetProps(Part, { kind: "control" })).toEqual({});
    expect(targetProps(Part, { kind: "control", type: "submit" })).toEqual({ type: "submit" });
    expect(targetProps(Part, { kind: "control", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps(Foreign, { kind: "control" })).toEqual({});
    expect(targetProps(Foreign, { kind: "control", disabled: true })).toMatchObject({ "aria-disabled": true, tabIndex: -1, "data-disabled": "true" });
    expect(targetProps(Foreign, { kind: "control", disabled: true })).not.toHaveProperty("disabled");
  });

  it("[primitives.target.projection] projects a region: native tags and components are disabled, other tags only say so", () => {
    expect(targetProps("button", { kind: "region" })).toEqual({});
    expect(targetProps("button", { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps("input", { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps("span", { kind: "region" })).toEqual({});
    expect(targetProps("span", { kind: "region", disabled: true })).toEqual({ "data-disabled": "true" });
    expect(targetProps(Part, { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    expect(targetProps(Foreign, { kind: "region", disabled: true })).toEqual({ disabled: true, "data-disabled": "true" });
    for (const tag of ["span", "div", "a"] as const) expect(keys(targetProps(tag, { kind: "region", disabled: true })), tag).toEqual(["data-disabled"]);
  });

  it("[primitives.target.projection] keeps a focusable control in the Tab order, blocked by aria-disabled instead of the platform", () => {
    expect(targetProps("button", { kind: "control", disabled: true, focusable: true })).toMatchObject({ type: "button", "aria-disabled": true, "data-disabled": "true" });
    expect(targetProps("button", { kind: "control", disabled: true, focusable: true })).not.toHaveProperty("disabled");
    expect(targetProps("div", { kind: "control", disabled: true, focusable: true })).toMatchObject({ tabIndex: 0, "aria-disabled": true });
    expect(targetProps(Part, { kind: "control", disabled: true, focusable: true })).toEqual({ disabled: true, focusable: true, "data-disabled": "true" });
    expect(targetProps(Foreign, { kind: "control", disabled: true, focusable: true })).toMatchObject({ tabIndex: 0, "aria-disabled": true });
  });

  it("[primitives.target.projection] gives a button's keys only to a tag that stands in for one, only when asked and only while enabled", () => {
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

describe("a Pressable over each target", () => {
  const ForeignLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function ForeignLink({ onClick, ...rest }, ref) {
    return <a ref={ref} href="/there" {...rest} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) { event.preventDefault(); navigate(); } }} />;
  });
  const navigate = vi.fn();

  it("[primitives.target.projection] renders a native button, a link, a div, an input, a Paper part and a foreign component, enabled and disabled", () => {
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

  it("[primitives.target.projection] does not navigate through a disabled foreign link, and takes it out of the Tab order", () => {
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

  it("[primitives.target.projection] runs neither a click handler nor a press on a disabled element that is not a button", () => {
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
