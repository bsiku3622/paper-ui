import { createRef, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { textRoleClass } from "../styles/typography.css";
import { Icon, Pressable, RovingFocus, FormField, VisuallyHidden, useFocusWithin } from "./index";

describe("roving focus", () => {
  it("[primitives.roving-focus.tab-stop] has one tab stop, skips disabled items and emits one change per arrow", () => {
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

  it("[primitives.roving-focus.tab-stop] supports vertical orientation, RTL and wrapping without trapping Tab", () => {
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

  it("[primitives.roving-focus.keys] uses current DOM order after keyed items are reordered", () => {
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

  it("[primitives.roving-focus.removal] moves focus to a surviving neighbor when the active item is removed", () => {
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

  it("[primitives.roving-focus.removal] moves off a newly disabled item and does not steal focus after leaving the group", () => {
    const view = render(<><button>Outside</button><RovingFocus><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus></>);
    act(() => screen.getByText("A").focus());
    view.rerender(<><button>Outside</button><RovingFocus><RovingFocus.Item value="a" disabled>A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus></>);
    expect(document.activeElement).toBe(screen.getByText("B"));
    act(() => screen.getByText("Outside").focus());
    view.rerender(<><button>Outside</button><RovingFocus><RovingFocus.Item value="a" disabled>A</RovingFocus.Item></RovingFocus></>);
    expect(document.activeElement).toBe(screen.getByText("Outside"));
  });
});

describe("field relationships", () => {
  it("[primitives.form-field.relations] associates labels, descriptions, errors and native state without dangling IDs", () => {
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

  it("[primitives.form-field.relations] generates distinct IDs for repeated fields and honors explicit IDs", () => {
    render(<><FormField label="First" id="first">{({ controlProps }) => <input {...controlProps} />}</FormField><FormField label="Second">{({ controlProps }) => <input {...controlProps} />}</FormField></>);
    expect(screen.getByLabelText("First").id).toBe("first");
    expect(screen.getByLabelText("Second").id).not.toBe("first");
  });
});

describe("field parts", () => {
  it("[primitives.form-field.parts] draws the label, description and error with Text roles and names each part", () => {
    render(<FormField label="Email" description="Help" error="Wrong" invalid>{({ controlProps }) => <input {...controlProps} />}</FormField>);
    const label = screen.getByText("Email");
    const description = screen.getByText("Help");
    const error = screen.getByText("Wrong");
    expect(label.tagName).toBe("LABEL");
    expect([label, description, error].map((part) => part.getAttribute("data-part"))).toEqual(["label", "description", "error"]);
    expect(label.classList.contains(textRoleClass.label)).toBe(true);
    expect(description.classList.contains(textRoleClass.caption)).toBe(true);
    expect(error.classList.contains(textRoleClass.caption)).toBe(true);
    expect(error.className).not.toBe(description.className);
  });
});

describe("hidden content and focus within", () => {
  it("VisuallyHidden supplies an accessible name without aria-hidden", () => {
    render(<Pressable><Icon><path d="M1 1h2" /></Icon><VisuallyHidden>Create item</VisuallyHidden></Pressable>);
    expect(screen.getByRole("button", { name: "Create item" })).toBeTruthy();
    expect(screen.getByText("Create item").getAttribute("aria-hidden")).not.toBe("true");
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
