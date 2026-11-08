import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as entry from "../index";
import { INVENTORY } from "../inventory";
import { FormField } from "../primitives/field/FormField";
import { Floating } from "../primitives/float/Floating";
import { iconSize } from "../primitives/Icon.css";
import { CONTROL_SIZES, STATUSES } from "../tokens";
import { Select } from "./Select";
import { controlSize } from "../primitives/control/Control.css";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const button = (name: string) => screen.getByRole("combobox", { name });
const nativeOf = (name: string) => button(name).parentElement!.querySelector("select")!;
const list = () => screen.getByRole("listbox");
const key = (name: string, key: string, init: Record<string, unknown> = {}) => fireEvent.keyDown(button(name), { key, ...init });
const pointed = (name: string) => {
  const id = button(name).getAttribute("aria-activedescendant");
  return id === null ? null : document.getElementById(id)!.textContent;
};
const isOpen = (name: string) => button(name).getAttribute("aria-expanded") === "true";

const choices = (
  <>
    <Select.Option value="">선택하세요</Select.Option>
    <Select.Option value="a">A</Select.Option>
  </>
);

describe("Select", () => {
  it("[atoms.select.native-form] [atoms.select.listbox] [atoms.contract.axes] renders Option and Group in its native select, and its list draws the same options and a named group", () => {
    render(
      <Select aria-label="선택">
        <Select.Option value="">선택하세요</Select.Option>
        <Select.Group label="추가 옵션">
          <Select.Option value="a">옵션 A</Select.Option>
          <Select.Option value="b" disabled>옵션 B</Select.Option>
        </Select.Group>
      </Select>,
    );
    const native = nativeOf("선택");
    expect([...native.options].map((option) => option.value)).toEqual(["", "a", "b"]);
    expect(native.querySelector("optgroup")!.label).toBe("추가 옵션");
    expect(native.getAttribute("aria-hidden")).toBe("true");
    expect(native.tabIndex).toBe(-1);

    fireEvent.click(button("선택"));
    expect(within(list()).getAllByRole("option").map((option) => option.textContent)).toEqual(["선택하세요", "옵션 A", "옵션 B"]);
    expect(within(list()).getByRole("group", { name: "추가 옵션" })).toBeTruthy();
    expect(within(list()).getByRole("option", { name: "옵션 B" }).getAttribute("aria-disabled")).toBe("true");
    expect(within(list()).getByRole("option", { name: "옵션 B" }).hasAttribute("data-disabled")).toBe(true);
  });

  it("[atoms.select.native-form] gives ref and form attributes to the native select and className and style to the wrapper, and a choice is what the form reads", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<form aria-label="form"><Select ref={ref} name="choice" aria-label="choice" className="custom-select" style={{ width: 240 }} defaultValue="a">
      <Select.Option value="a">A</Select.Option>
      <Select.Option value="b">B</Select.Option>
    </Select></form>);
    const native = nativeOf("choice");
    expect(ref.current).toBe(native);
    expect(native.name).toBe("choice");
    expect(button("choice").parentElement!.classList.contains("custom-select")).toBe(true);
    expect(button("choice").parentElement!.style.width).toBe("240px");
    expect(button("choice").textContent).toBe("A");
    key("choice", "ArrowDown");
    key("choice", "ArrowDown");
    key("choice", "Enter");
    expect(native.value).toBe("b");
    expect(button("choice").textContent).toBe("B");
    expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("choice")).toBe("b");
    expect(button("choice").parentElement!.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("[atoms.select.native-form] says a choice with the native select's own events, input then change, and says nothing for the option it already holds", () => {
    const heard: string[] = [];
    render(<Select aria-label="events" defaultValue="a" onInput={(event) => heard.push(`input ${event.currentTarget.value}`)} onChange={(event) => heard.push(`change ${event.currentTarget.value}`)}>
      <Select.Option value="a">A</Select.Option>
      <Select.Option value="b">B</Select.Option>
    </Select>);
    fireEvent.click(button("events"));
    fireEvent.click(within(list()).getByRole("option", { name: "A" }));
    expect(heard).toEqual([]);
    fireEvent.click(button("events"));
    fireEvent.click(within(list()).getByRole("option", { name: "B" }));
    expect(heard).toEqual(["input b", "change b"]);
  });

  it("[atoms.select.native-form] follows a controlled value, and a choice the caller does not take leaves the value where it was", () => {
    const { rerender } = render(<Select aria-label="held" value="a" onChange={() => {}}><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option></Select>);
    fireEvent.click(button("held"));
    fireEvent.click(within(list()).getByRole("option", { name: "B" }));
    expect(button("held").textContent).toBe("A");
    expect(nativeOf("held").value).toBe("a");
    rerender(<Select aria-label="held" value="b" onChange={() => {}}><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option></Select>);
    expect(button("held").textContent).toBe("B");
  });

  it("[atoms.select.native-form] reads its value again when its form resets, and with no default shows the first option that can be chosen", () => {
    vi.useFakeTimers();
    render(<form aria-label="form"><Select aria-label="reset" defaultValue="b"><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option></Select>
      <Select aria-label="first"><Select.Option value="x" disabled>X</Select.Option><Select.Option value="y">Y</Select.Option></Select></form>);
    expect(button("first").textContent).toBe("Y");
    fireEvent.click(button("reset"));
    fireEvent.click(within(list()).getByRole("option", { name: "A" }));
    expect(button("reset").textContent).toBe("A");
    act(() => (screen.getByRole("form") as HTMLFormElement).reset());
    act(() => vi.runAllTimers());
    expect(button("reset").textContent).toBe("B");
  });

  it("[atoms.select.native-form] sends the focus a form gives its native select to the button", () => {
    render(<Select aria-label="focus" required>{choices}</Select>);
    act(() => nativeOf("focus").focus());
    expect(document.activeElement).toBe(button("focus"));
    expect(button("focus").getAttribute("aria-required")).toBe("true");
    expect(nativeOf("focus").required).toBe(true);
  });

  it("[atoms.select.native-form] puts data-testid on the wrapper and not on the button or the select", () => {
    render(<Select aria-label="id" data-testid="wrapped">{choices}</Select>);
    expect(screen.getByTestId("wrapped")).toBe(button("id").parentElement);
    expect(button("id").hasAttribute("data-testid")).toBe(false);
    expect(nativeOf("id").hasAttribute("data-testid")).toBe(false);
  });

  it("[atoms.select.native-form] forwards the ref of an Option and of a Group to their elements in the native select", () => {
    const option = createRef<HTMLOptionElement>();
    const group = createRef<HTMLOptGroupElement>();
    render(<Select aria-label="refs"><Select.Group ref={group} label="G"><Select.Option ref={option} value="a">A</Select.Option></Select.Group></Select>);
    expect(option.current).toBe(nativeOf("refs").querySelector("option"));
    expect(group.current).toBe(nativeOf("refs").querySelector("optgroup"));
  });

  it("[atoms.select.natural-width] keeps every option's words in the value's one cell: the chosen one seen, the others drawn unseen from an attribute", () => {
    render(<Select aria-label="width" defaultValue="b"><Select.Option value="a">Short</Select.Option><Select.Option value="b">B</Select.Option><Select.Option value="c">The longest</Select.Option></Select>);
    expect(button("width").textContent).toBe("B");
    const unseen = [...button("width").querySelectorAll("[data-label]")];
    expect(unseen.map((element) => element.getAttribute("data-label"))).toEqual(["Short", "The longest"]);
    for (const element of unseen) expect(element.getAttribute("aria-hidden")).toBe("true");
  });

  it("[atoms.select.listbox] [primitives.floating.role] is a combobox that opens a listbox and points into it, while the focus stays on it", () => {
    render(<Select aria-label="combo" defaultValue="b"><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option></Select>);
    expect(button("combo").getAttribute("aria-haspopup")).toBe("listbox");
    expect(isOpen("combo")).toBe(false);
    expect(button("combo").hasAttribute("aria-controls")).toBe(false);
    expect(button("combo").hasAttribute("aria-activedescendant")).toBe(false);
    fireEvent.click(button("combo"));
    expect(isOpen("combo")).toBe(true);
    expect(button("combo").getAttribute("aria-controls")).toBe(list().id);
    expect(pointed("combo")).toBe("B");
    expect(document.activeElement).toBe(button("combo"));
    expect(list().getAttribute("aria-label")).toBe("combo");
    expect(within(list()).getByRole("option", { name: "B" }).getAttribute("aria-selected")).toBe("true");
    expect(within(list()).getByRole("option", { name: "A" }).getAttribute("aria-selected")).toBe("false");
    expect(within(list()).getByRole("option", { name: "B" }).querySelector("svg")).not.toBeNull();
    expect(within(list()).getByRole("option", { name: "A" }).querySelector("svg")).toBeNull();
    expect(within(list()).getByRole("option", { name: "B" }).hasAttribute("data-focused")).toBe(true);
  });

  it("[atoms.select.listbox] names its list with the label of the field it stands in", () => {
    render(<FormField label="Fruit"><Select><Select.Option value="a">A</Select.Option></Select></FormField>);
    fireEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
    expect(list().getAttribute("aria-label")).toBe("Fruit");
  });

  it("[atoms.select.keyboard] opens on the arrows, Enter and Space at the chosen option, and on Home and End at the ends", () => {
    render(<Select aria-label="open" defaultValue="b"><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option><Select.Option value="c">C</Select.Option></Select>);
    for (const name of ["ArrowDown", "ArrowUp", "Enter", " "]) {
      expect(key("open", name), name).toBe(false);
      expect(isOpen("open"), name).toBe(true);
      expect(pointed("open"), name).toBe("B");
      key("open", "Escape");
    }
    key("open", "Home");
    expect(pointed("open")).toBe("A");
    key("open", "Escape");
    key("open", "End");
    expect(pointed("open")).toBe("C");
  });

  it("[atoms.select.keyboard] moves one option at a time without wrapping, passes over what cannot be chosen, and pages by ten", () => {
    const many = Array.from({ length: 25 }, (_, index) => <Select.Option key={index} value={String(index)} disabled={index === 2}>{`Item ${index}`}</Select.Option>);
    render(<Select aria-label="move" defaultValue="0">{many}</Select>);
    key("move", "ArrowDown");
    expect(pointed("move")).toBe("Item 0");
    key("move", "ArrowUp");
    expect(pointed("move")).toBe("Item 0");
    key("move", "ArrowDown");
    key("move", "ArrowDown");
    expect(pointed("move")).toBe("Item 3");
    key("move", "PageDown");
    expect(pointed("move")).toBe("Item 13");
    key("move", "End");
    key("move", "ArrowDown");
    expect(pointed("move")).toBe("Item 24");
    key("move", "PageUp");
    expect(pointed("move")).toBe("Item 14");
  });

  it("[atoms.select.keyboard] chooses with Enter, Space and Alt+ArrowUp; Escape and Tab close without choosing, and Escape stays with the list", () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={(event) => outer(event.key)}>
        <Select aria-label="keys" defaultValue="a"><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option><Select.Option value="c">C</Select.Option></Select>
      </div>,
    );
    for (const [chooser, init] of [["Enter", {}], [" ", {}], ["ArrowUp", { altKey: true }]] as const) {
      key("keys", "ArrowDown");
      key("keys", "ArrowDown");
      key("keys", chooser, init);
      expect(isOpen("keys"), chooser).toBe(false);
      expect(button("keys").textContent, chooser).not.toBe("A");
      fireEvent.click(button("keys"));
      fireEvent.click(within(list()).getByRole("option", { name: "A" }));
    }
    key("keys", "ArrowDown");
    key("keys", "ArrowDown");
    outer.mockClear();
    key("keys", "Escape");
    expect(isOpen("keys")).toBe(false);
    expect(button("keys").textContent).toBe("A");
    expect(outer).not.toHaveBeenCalled();
    key("keys", "ArrowDown");
    key("keys", "ArrowDown");
    expect(key("keys", "Tab")).toBe(true);
    expect(isOpen("keys")).toBe(false);
    expect(button("keys").textContent).toBe("A");
  });

  it("[atoms.select.keyboard] [primitives.floating.dismiss] closes the list and not the dialog it stands in on Escape", () => {
    const change = vi.fn();
    render(<Floating defaultOpen onOpenChange={change}>
      <Floating.Trigger>Open</Floating.Trigger>
      <Floating.Content presentation="modal" aria-label="Dialog">
        <Select aria-label="inside"><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option></Select>
      </Floating.Content>
    </Floating>);
    act(() => button("inside").focus());
    key("inside", "ArrowDown");
    expect(isOpen("inside")).toBe(true);
    key("inside", "Escape");
    expect(isOpen("inside")).toBe(false);
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Dialog" })).toBeTruthy();
  });

  it("[atoms.select.keyboard] types its way to an option: a word, a letter again to step through, a space inside a word, and a pause to start over", () => {
    vi.useFakeTimers();
    render(<Select aria-label="type" defaultValue="apple">
      {["Apple", "Avocado", "Banana", "Blueberry", "Blue sky", "Cherry"].map((label) => <Select.Option key={label} value={label.toLowerCase()}>{label}</Select.Option>)}
    </Select>);
    key("type", "b");
    expect(isOpen("type")).toBe(true);
    expect(pointed("type")).toBe("Banana");
    key("type", "b");
    expect(pointed("type")).toBe("Blueberry");
    act(() => vi.advanceTimersByTime(600));
    for (const letter of "blue s") key("type", letter);
    expect(pointed("type")).toBe("Blue sky");
    expect(isOpen("type")).toBe(true);
    act(() => vi.advanceTimersByTime(600));
    key("type", "c");
    expect(pointed("type")).toBe("Cherry");
    key("type", " ");
    expect(isOpen("type")).toBe(true);
    act(() => vi.advanceTimersByTime(600));
    key("type", " ");
    expect(isOpen("type")).toBe(false);
    expect(button("type").textContent).toBe("Cherry");
  });

  it("[atoms.select.pointer] opens and closes on a press of the button, chooses the option it presses, and keeps the focus on the button", () => {
    const heard: string[] = [];
    render(<Select aria-label="press" onChange={(event) => heard.push(event.currentTarget.value)}><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option></Select>);
    fireEvent.click(button("press"));
    expect(isOpen("press")).toBe(true);
    fireEvent.click(button("press"));
    expect(isOpen("press")).toBe(false);
    fireEvent.click(button("press"));
    const option = within(list()).getByRole("option", { name: "B" });
    expect(fireEvent.mouseDown(option)).toBe(false);
    fireEvent.click(option);
    expect(isOpen("press")).toBe(false);
    expect(heard).toEqual(["b"]);
    expect(document.activeElement).toBe(button("press"));
  });

  it("[atoms.select.pointer] points at the option under the pointer, never at one that cannot be chosen", () => {
    render(<Select aria-label="hover"><Select.Option value="a">A</Select.Option><Select.Option value="b" disabled>B</Select.Option><Select.Option value="c">C</Select.Option></Select>);
    fireEvent.click(button("hover"));
    fireEvent.pointerMove(within(list()).getByRole("option", { name: "C" }));
    expect(pointed("hover")).toBe("C");
    fireEvent.pointerMove(within(list()).getByRole("option", { name: "B" }));
    expect(pointed("hover")).toBe("C");
    fireEvent.click(within(list()).getByRole("option", { name: "B" }));
    expect(isOpen("hover")).toBe(true);
  });

  it("[atoms.select.pointer] closes without choosing when the pointer presses outside the list", () => {
    render(<><button>Outside</button><Select aria-label="away" defaultValue="a"><Select.Option value="a">A</Select.Option><Select.Option value="b">B</Select.Option></Select></>);
    fireEvent.click(button("away"));
    key("away", "ArrowDown");
    const outside = screen.getByText("Outside");
    fireEvent.pointerDown(outside);
    fireEvent.pointerUp(outside);
    fireEvent.click(outside);
    expect(isOpen("away")).toBe(false);
    expect(button("away").textContent).toBe("A");
  });

  it("[atoms.select.anatomy] reaches its option and group through Select alone: the entry exports neither under a name of its own", () => {
    expect(Select.Option).toBeTruthy();
    expect(Select.Group).toBeTruthy();
    for (const name of ["Option", "Group", "SelectOption", "SelectGroup"]) expect(name in entry, name).toBe(false);
    expect(INVENTORY.anatomy.Select).toEqual(["Option", "Group"]);
    expect(INVENTORY.atoms).not.toContain("Option");
  });

  it("[atoms.select.native-form] has no multiple: a select that lists its choices is a different control", () => {
    // @ts-expect-error a Select takes one value
    const many = <Select multiple aria-label="many">{choices}</Select>;
    expect(many).toBeTruthy();
  });

  it("[atoms.field.neutral-status] draws a status on the wrapper, and error also makes the select invalid", () => {
    render(<Select aria-label="neutral">{choices}</Select>);
    expect(screen.getByLabelText("neutral").parentElement!.hasAttribute("data-status")).toBe(false);
    expect(screen.getByLabelText("neutral").hasAttribute("aria-invalid")).toBe(false);
    cleanup();
    for (const status of STATUSES) {
      const { unmount } = render(<Select aria-label={status} status={status}>{choices}</Select>);
      const select = screen.getByLabelText(status);
      expect(select.parentElement!.getAttribute("data-status"), status).toBe(status);
      expect(select.getAttribute("aria-invalid"), status).toBe(status === "error" ? "true" : null);
      unmount();
    }
  });

  it("[atoms.field.neutral-status] takes its face from the fill prop, raised unless it is sunken", () => {
    const { rerender } = render(<Select aria-label="face">{choices}</Select>);
    const raised = screen.getByLabelText("face").parentElement!.className;
    rerender(<Select aria-label="face" fill="sunken">{choices}</Select>);
    expect(screen.getByLabelText("face").parentElement!.className).not.toBe(raised);
  });

  it("[atoms.focus.ring] [primitives.state.emitters] shows the keyboard's focus on the wrapper and not on the select", () => {
    render(<Select aria-label="ring">{choices}</Select>);
    const select = screen.getByLabelText("ring");
    fireEvent.keyDown(document.body, { key: "Tab" });
    act(() => select.focus());
    expect(select.parentElement!.getAttribute("data-focus-visible")).toBe("true");
    expect(select.hasAttribute("data-focus-visible")).toBe(false);
    act(() => select.blur());
    expect(select.parentElement!.hasAttribute("data-focus-visible")).toBe(false);
  });

  it("[atoms.field.frame] says disabled on the wrapper, which is where the stylesheet reads it", () => {
    render(<Select aria-label="off" disabled>{choices}</Select>);
    expect(screen.getByLabelText("off").parentElement!.hasAttribute("data-disabled")).toBe(true);
  });

  it("[atoms.select.native-form] draws its arrow as an Icon that reads the control's icon size", () => {
    for (const size of CONTROL_SIZES) {
      const { unmount } = render(<Select aria-label={size} size={size}>{choices}</Select>);
      const frame = screen.getByLabelText(size).parentElement!;
      expect(frame.classList.contains(controlSize[size]), size).toBe(true);
      for (const name of Object.values(iconSize)) expect(frame.querySelector("svg")!.classList.contains(name), size).toBe(false);
      unmount();
    }
  });

  it("[atoms.select.native-form] hides its arrow from assistive technology and keeps it out of the Tab order", () => {
    render(<Select aria-label="arrow">{choices}</Select>);
    const arrow = screen.getByLabelText("arrow").parentElement!.querySelector("svg")!;
    expect(arrow.getAttribute("aria-hidden")).toBe("true");
    expect(arrow.getAttribute("focusable")).toBe("false");
    expect(arrow.hasAttribute("tabindex")).toBe(false);
    expect(arrow.getAttribute("role")).toBeNull();
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });
});
