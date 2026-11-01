import { createRef, forwardRef, useState, type ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Checkbox } from "../atoms/Checkbox";
import { Field } from "../atoms/Field";
import { Radio } from "../atoms/Radio";
import { Select } from "../atoms/Select";
import { Switch } from "../atoms/Switch";
import { Textarea } from "../atoms/Textarea";
import { textRoleClass } from "../styles/typography.css";
import { ScopeModeContext } from "../theme/context";
import { THEME_ATTRIBUTE } from "../tokens";
import { portalRoot } from "./a11y/Portal.css";
import { FormField, useFormField, useFormFieldControl } from "./field/FormField";
import { Floating } from "./float/Floating";
import { Icon } from "./Icon";
import { LiveRegion, announce, clearAnnouncements } from "./a11y/LiveRegion";
import { Portal } from "./a11y/Portal";
import { Pressable } from "./press/Pressable";
import { RovingFocus, useRovingFocusItem } from "./focus/RovingFocus";
import { VisuallyHidden } from "./a11y/VisuallyHidden";
import { mergeProps } from "./composition";
import { useFocusRing, useFocusWithin } from "./a11y/focus";
import { useRovingValues } from "./focus/RovingFocus";

const announcer = vi.hoisted(() => ({ announce: vi.fn(), clearAnnouncer: vi.fn() }));
vi.mock("@react-aria/live-announcer", () => announcer);

afterEach(() => {
  document.documentElement.removeAttribute("dir");
});

// A control that reads its field the way a custom control does.
function Control(props: Parameters<typeof useFormFieldControl>[0] & { label?: string }) {
  const { label = "control", ...options } = props;
  const { controlProps } = useFormFieldControl(options);
  return <input aria-label={label} {...controlProps} />;
}

describe("roving focus", () => {
  it("[primitives.roving-focus.tab-stop] [primitives.roving-focus.root-options] has one tab stop, skips disabled items and emits one change per arrow", () => {
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

  it("[primitives.roving-focus.tab-stop] [primitives.roving-focus.root-options] supports vertical orientation, RTL and wrapping without trapping Tab", () => {
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

  it("[primitives.roving-focus.item-hook] [primitives.roving-focus.root-options] honors caller cancellation and propagates group disabled through custom components", () => {
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

  it("[primitives.roving-focus.item-hook] does not intercept keys originating in a descendant input", () => {
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

describe("roving focus under an outside current value", () => {
  const group = (current: string, extra?: React.ReactNode) => (
    <>
      <button>Elsewhere</button>
      <RovingFocus aria-label="Group" currentValue={current}>
        <RovingFocus.Item value="a">A</RovingFocus.Item>
        <RovingFocus.Item value="b">B</RovingFocus.Item>
      </RovingFocus>
      {extra}
    </>
  );

  it("[primitives.roving-focus.external-current-keeps-focus] moves the Tab stop to the new value and leaves the focus where it was", () => {
    const { rerender } = render(group("a"));
    const [a, b] = [screen.getByText("A"), screen.getByText("B")];
    expect([a.tabIndex, b.tabIndex]).toEqual([0, -1]);
    act(() => screen.getByText("Elsewhere").focus());
    rerender(group("b"));
    expect([a.tabIndex, b.tabIndex]).toEqual([-1, 0]);
    expect(document.activeElement).toBe(screen.getByText("Elsewhere"));
  });

  it("[primitives.roving-focus.external-current-keeps-focus] does not pull focus out of an item when the value is set to another", () => {
    const { rerender } = render(group("a"));
    const a = screen.getByText("A");
    act(() => a.focus());
    rerender(group("b"));
    expect(document.activeElement).toBe(a);
    expect(screen.getByText("B").tabIndex).toBe(0);
  });
});

describe("roving registry and direction", () => {
  const Row = ({ values }: { values: string[] }) => <RovingFocus>{values.map((value, index) => <RovingFocus.Item key={index} value={value}>{`${value}${index}`}</RovingFocus.Item>)}</RovingFocus>;

  it("[primitives.roving-focus.direction] writes no dir attribute by default and reads the direction it inherits", () => {
    const view = render(<RovingFocus data-testid="group"><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>);
    expect(screen.getByTestId("group").hasAttribute("dir")).toBe(false);
    const arrow = () => {
      const a = screen.getByText("A");
      act(() => a.focus());
      fireEvent.keyDown(a, { key: "ArrowLeft" });
      return document.activeElement === screen.getByText("B");
    };
    expect(arrow()).toBe(false);
    view.unmount();
    render(<div dir="rtl"><RovingFocus><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus></div>);
    expect(arrow()).toBe(true);
    cleanup();
    document.documentElement.dir = "rtl";
    render(<RovingFocus><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>);
    expect(arrow()).toBe(true);
  });

  it("[primitives.roving-focus.direction] [primitives.roving-focus.root-options] writes dir when it is given, and an explicit dir beats an inherited one", () => {
    document.documentElement.dir = "rtl";
    render(<RovingFocus dir="ltr" data-testid="group"><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>);
    expect(screen.getByTestId("group").getAttribute("dir")).toBe("ltr");
    const a = screen.getByText("A");
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByText("B"));
  });

  it("[primitives.roving-focus.registry] refuses a second item with a value, tells it once and keeps one Tab stop", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const view = render(<Row values={["a", "b", "a"]} />);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]![0]).toBe("[paper-ui] RovingFocus value 'a' is registered twice.");
    const items = screen.getAllByRole("button");
    expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1]);
    act(() => items[0]!.focus());
    fireEvent.keyDown(items[0]!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(items[1]);
    view.rerender(<Row values={["a", "b"]} />);
    expect(screen.getAllByRole("button").filter((item) => item.tabIndex === 0)).toHaveLength(1);
    act(() => screen.getByText("a0").focus());
    fireEvent.keyDown(screen.getByText("a0"), { key: "End" });
    expect(document.activeElement).toBe(screen.getByText("b1"));
    error.mockRestore();
  });

  // Items that keep their identity across a render, so one leaving is not another changing its value.
  type Keyed = { key: string; value: string; disabled?: boolean };
  const Keyed = ({ items }: { items: Keyed[] }) => <RovingFocus>{items.map(({ key, ...item }) => <RovingFocus.Item key={key} {...item}>{key}</RovingFocus.Item>)}</RovingFocus>;

  it("[primitives.roving-focus.registry] gives the value to the refused item when the registered one leaves, with the Tab stop and the keys, and tells no second time", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const view = render(<Keyed items={[{ key: "first", value: "a" }, { key: "other", value: "b" }, { key: "second", value: "a" }]} />);
    expect(error).toHaveBeenCalledTimes(1);
    expect(screen.getByText("second").tabIndex).toBe(-1);
    view.rerender(<Keyed items={[{ key: "other", value: "b" }, { key: "second", value: "a" }]} />);
    // b comes first now, so the group's entry point is b, and the survivor is reachable by the keys.
    expect(screen.getAllByRole("button").filter((item) => item.tabIndex === 0)).toHaveLength(1);
    act(() => screen.getByText("other").focus());
    fireEvent.keyDown(screen.getByText("other"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByText("second"));
    expect(screen.getByText("second").tabIndex).toBe(0);
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it("[primitives.roving-focus.registry] keeps a group's one Tab stop when its only registered item with the value leaves", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const view = render(<Keyed items={[{ key: "first", value: "a" }, { key: "second", value: "a" }]} />);
    expect(screen.getAllByRole("button").map((item) => item.tabIndex)).toEqual([0, -1]);
    view.rerender(<Keyed items={[{ key: "second", value: "a" }]} />);
    expect(screen.getByText("second").tabIndex).toBe(0);
    error.mockRestore();
  });

  it("[primitives.roving-focus.registry] does not hand the value over when the registered item only changes: its disabled moves, and it keeps its place", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const view = render(<Keyed items={[{ key: "first", value: "a" }, { key: "other", value: "b" }, { key: "second", value: "a" }]} />);
    view.rerender(<Keyed items={[{ key: "first", value: "a", disabled: true }, { key: "other", value: "b" }, { key: "second", value: "a" }]} />);
    // The disabled first still holds the value, so the second stays refused and the stop moves on to b.
    expect(screen.getAllByRole("button").map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
    view.rerender(<Keyed items={[{ key: "first", value: "a" }, { key: "other", value: "b" }, { key: "second", value: "a" }]} />);
    expect(screen.getAllByRole("button").map((item) => item.tabIndex)).toEqual([0, -1, -1]);
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it("[primitives.roving-focus.registry] lists the values in document order for the group built on it, disabled ones included", () => {
    function Values() { return <output data-testid="values">{String(useRovingValues())}</output>; }
    render(<RovingFocus><Values /><RovingFocus.Item value="b">B</RovingFocus.Item><RovingFocus.Item value="a" disabled>A</RovingFocus.Item></RovingFocus>);
    expect(screen.getByTestId("values").textContent).toBe("b,a");
  });

  it("[primitives.roving-focus.registry] hands a children function the Tab stop and whether the group is disabled", () => {
    const group = (disabled: boolean) => <RovingFocus disabled={disabled}>{({ currentValue, isDisabled }) => <><p data-testid="state">{`${currentValue} ${isDisabled}`}</p><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></>}</RovingFocus>;
    const view = render(group(false));
    expect(screen.getByTestId("state").textContent).toBe("a false");
    view.rerender(group(true));
    expect(screen.getByTestId("state").textContent).toBe("undefined true");
  });

  it("[primitives.roving-focus.tab-stop] [primitives.target.exceptions] an item renders a button by default, and another tag as it is, without a role", () => {
    render(<RovingFocus><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item as="div" value="b" data-testid="div">B</RovingFocus.Item></RovingFocus>);
    expect(screen.getByText("A").tagName).toBe("BUTTON");
    expect(screen.getByText("A").getAttribute("type")).toBe("button");
    const div = screen.getByTestId("div");
    expect(div.tagName).toBe("DIV");
    expect(div.hasAttribute("role")).toBe(false);
    expect(div.hasAttribute("data-roving-item")).toBe(true);
  });
});

describe("field relationships", () => {
  it("[primitives.form-field.relations] associates labels, descriptions, errors and native state without dangling IDs", () => {
    const view = render(<FormField label="Email" description="Help" error="Wrong" required aria-describedby="external" invalid><Control /></FormField>);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual(["external", screen.getByText("Help").id, screen.getByText("Wrong").id]);
    const id = input.id;
    view.rerender(<FormField label="Email" disabled><Control /></FormField>);
    expect(input.id).toBe(id);
    expect(input.disabled).toBe(true);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(screen.queryByText("Wrong")).toBeNull();
  });

  it("[primitives.form-field.relations] generates distinct IDs for repeated fields and honors explicit IDs", () => {
    render(<><FormField label="First" id="first"><Control /></FormField><FormField label="Second"><Control /></FormField></>);
    expect(screen.getByLabelText("First").id).toBe("first");
    expect(screen.getByLabelText("Second").id).not.toBe("first");
  });
});

describe("field control", () => {
  const log = () => vi.spyOn(console, "error").mockImplementation(() => {});

  it("[primitives.form-field.control] [primitives.form-field.context] ties Field, Textarea, Select, Checkbox, Radio and Switch to the field's id, relationships and state", () => {
    const controls: Array<[string, ReactNode]> = [
      ["Field", <Field />], ["Textarea", <Textarea />],
      ["Select", <Select><Select.Option value="a">A</Select.Option></Select>],
      ["Checkbox", <Checkbox />], ["Radio", <Radio />], ["Switch", <Switch />],
    ];
    for (const [name, control] of controls) {
      const view = render(<FormField label={name} description="Help" required disabled id={`id-${name}`}>{control}</FormField>);
      const element = screen.getByLabelText(name) as HTMLInputElement;
      expect(element.id, name).toBe(`id-${name}`);
      expect(element.getAttribute("aria-describedby"), name).toBe(screen.getByText("Help").id);
      expect(element.required, name).toBe(true);
      expect(element.disabled, name).toBe(true);
      view.unmount();
    }
  });

  it("[primitives.form-field.control] adds disabled and required up, and puts the control's own describedby before the field's", () => {
    render(<FormField label="Name" description="Help" required><Control disabled aria-describedby="mine mine" /></FormField>);
    const input = screen.getByLabelText("control") as HTMLInputElement;
    expect([input.disabled, input.required]).toEqual([true, true]);
    expect(input.getAttribute("aria-describedby")).toBe(`mine ${screen.getByText("Help").id}`);
    expect(input.id).toBe((screen.getByText("Name") as HTMLLabelElement).htmlFor);
  });

  it("[primitives.form-field.invalid] [primitives.form-field.status-link] is invalid on error status alone, on the field being invalid alone, and not on neither", () => {
    const value = (field: ReactNode) => {
      const view = render(field);
      const invalid = screen.getByLabelText("control").getAttribute("aria-invalid");
      view.unmount();
      return invalid;
    };
    expect(value(<Control status="error" />)).toBe("true");
    expect(value(<FormField label="L" invalid><Control /></FormField>)).toBe("true");
    expect(value(<FormField label="L"><Control /></FormField>)).toBeNull();
    expect(value(<Control status="warning" />)).toBeNull();
    expect(value(<Field aria-label="control" status="error" />)).toBe("true");
    expect(value(<Textarea aria-label="control" status="error" />)).toBe("true");
    expect(value(<FormField label="L"><Field aria-label="control" status="error" /></FormField>)).toBe("true");
    expect(value(<FormField label="L"><Textarea aria-label="control" status="error" /></FormField>)).toBe("true");
  });

  it("[primitives.form-field.invalid] lets an explicit aria-invalid win over error status and the field", () => {
    const view = render(<FormField label="L" invalid><Control aria-invalid={false} status="error" /></FormField>);
    expect(screen.getByLabelText("control").getAttribute("aria-invalid")).toBe("false");
    view.unmount();
    render(<Control aria-invalid="grammar" />);
    expect(screen.getByLabelText("control").getAttribute("aria-invalid")).toBe("grammar");
  });

  it("[primitives.form-field.invalid] [primitives.hooks.attribute-table] [primitives.form-field.control-hook] [primitives.form-field.status-link] gives controlProps no undefined value, and tells isInvalid and visualStatus", () => {
    let seen: ReturnType<typeof useFormFieldControl> | undefined;
    function Probe(props: Parameters<typeof useFormFieldControl>[0]) {
      seen = useFormFieldControl(props);
      return null;
    }
    render(<Probe disabled={false} required={false} aria-invalid={undefined} />);
    expect(seen!.controlProps).toEqual({});
    expect(Object.values(seen!.controlProps).every((value) => value !== undefined)).toBe(true);
    expect([seen!.isInvalid, seen!.visualStatus, seen!.isInField]).toEqual([false, undefined, false]);
    cleanup();
    render(<Probe status="error" />);
    expect([seen!.isInvalid, seen!.visualStatus]).toEqual([true, "error"]);
    cleanup();
    render(<Probe status="warning" aria-invalid={false} />);
    expect([seen!.isInvalid, seen!.visualStatus]).toEqual([false, "warning"]);
    cleanup();
    // Each fills the other: an aria-invalid alone draws the error status.
    render(<Probe aria-invalid />);
    expect([seen!.isInvalid, seen!.visualStatus]).toEqual([true, "error"]);
    cleanup();
    render(<FormField label="L" invalid><Probe status="warning" /></FormField>);
    expect([seen!.isInvalid, seen!.visualStatus, seen!.isInField]).toEqual([true, "error", true]);
  });

  it("[primitives.form-field.control] is a developer error for two controls to share one field, and for a control to bring another id", () => {
    const error = log();
    render(<FormField label="L"><Control label="one" /><Control label="two" /></FormField>);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]![0]).toContain("[paper-ui] A FormField holds one control");
    cleanup();
    error.mockClear();
    render(<FormField label="L" id="field-id"><Control id="other" /></FormField>);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]![0]).toContain("[paper-ui] A control inside a FormField takes the field's id");
    expect(screen.getByLabelText("L").id).toBe("field-id");
    error.mockRestore();
  });

  it("[primitives.form-field.control] [primitives.floating.content-state] resets inside a Floating panel, so a control there has no relationship to the field", () => {
    render(<FormField label="Outer" description="Help" required disabled invalid>
      <Floating defaultOpen><Floating.Trigger>Open</Floating.Trigger><Floating.Content aria-label="Panel"><Field aria-label="inside" /></Floating.Content></Floating>
    </FormField>);
    const input = screen.getByLabelText("inside") as HTMLInputElement;
    expect(input.id).toBe("");
    expect([input.disabled, input.required]).toEqual([false, false]);
    for (const name of ["aria-describedby", "aria-invalid"]) expect(input.hasAttribute(name), name).toBe(false);
  });

  it("[primitives.form-field.control] stops at any Portal, and a field inside the Portal holds its own control", () => {
    render(<FormField label="Outer" required invalid>
      <Portal><Field aria-label="alone" /></Portal>
      <Portal><FormField label="Inner"><Field /></FormField></Portal>
      <Field aria-label="near" />
    </FormField>);
    const alone = screen.getByLabelText("alone") as HTMLInputElement;
    expect(alone.id).toBe("");
    expect(alone.required).toBe(false);
    expect(alone.hasAttribute("aria-invalid")).toBe(false);
    const inner = screen.getByLabelText("Inner") as HTMLInputElement;
    expect(inner.id).toBe((screen.getByText("Inner") as HTMLLabelElement).htmlFor);
    expect(inner.required).toBe(false);
    expect((screen.getByLabelText("near") as HTMLInputElement).required).toBe(true);
  });

  it("[primitives.form-field.snapshot] hands a children function the field's state and renders a plain child as it is", () => {
    const view = render(<FormField label="L" disabled required>{({ isDisabled, isInvalid, isRequired }) => <p>{`${isDisabled} ${isInvalid} ${isRequired}`}</p>}</FormField>);
    expect(screen.getByText("true false true")).toBeTruthy();
    view.rerender(<FormField label="L" invalid>{({ isInvalid }) => <Field aria-label="control" status={isInvalid ? "error" : undefined} />}</FormField>);
    expect(screen.getByLabelText("control").getAttribute("aria-invalid")).toBe("true");
    view.rerender(<FormField label="L"><span>Plain</span></FormField>);
    expect(screen.getByText("Plain")).toBeTruthy();
  });
});

describe("field hook", () => {
  it("[primitives.form-field.relations] [primitives.form-field.hook] useFormField gives the control, label, description and error props without rendering", () => {
    function Probe() {
      const field = useFormField({ id: "name", description: "Help", error: "Wrong", invalid: true, required: true });
      return <><label {...field.labelProps}>Name</label><input {...field.controlProps} /><p {...field.descriptionProps}>Help</p><p {...field.errorProps}>Wrong</p></>;
    }
    render(<Probe />);
    const input = screen.getByLabelText("Name");
    expect(input.id).toBe("name");
    expect(input.getAttribute("aria-describedby")).toBe("name-description name-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("[primitives.form-field.invalid] useFormField's controlProps holds only the keys that have a value", () => {
    let props: ReturnType<typeof useFormField>["controlProps"] | undefined;
    function Probe({ on }: { on: boolean }) { props = useFormField({ id: "x", disabled: on, required: on, invalid: on }).controlProps; return null; }
    render(<Probe on={false} />);
    expect(props).toEqual({ id: "x" });
    cleanup();
    render(<Probe on />);
    expect(props).toEqual({ id: "x", disabled: true, required: true, "aria-invalid": true });
  });

  it("[primitives.form-field.hook] [primitives.hooks.attribute-table] [primitives.state.emitters] marks the field's state on its wrapper", () => {
    render(<FormField label="Email" disabled required invalid data-testid="field"><Control /></FormField>);
    const field = screen.getByTestId("field");
    expect(["data-disabled", "data-invalid", "data-required"].map((name) => field.getAttribute(name))).toEqual(["true", "true", "true"]);
  });
});

describe("roving item hook", () => {
  it("[primitives.hooks.result-shape] [primitives.hooks.attribute-table] gives itemProps with the ref, the Tab stop and the marker, and says which item is current", () => {
    function Item({ value }: { value: string }) {
      const { itemProps, isCurrent } = useRovingFocusItem<HTMLButtonElement>({ value });
      return <button type="button" {...itemProps} data-current={isCurrent}>{value}</button>;
    }
    render(<RovingFocus><Item value="a" /><Item value="b" /></RovingFocus>);
    const a = screen.getByText("a");
    const b = screen.getByText("b");
    expect(a.getAttribute("data-roving-item")).toBe("a");
    expect([a.tabIndex, b.tabIndex]).toEqual([0, -1]);
    expect([a.dataset.current, b.dataset.current]).toEqual(["true", "false"]);
  });

  it("[primitives.composition.merge-props] keeps the item's ref when a forwardRef component was given none", () => {
    const Item = forwardRef<HTMLButtonElement, { value: string }>(function Item({ value }, forwardedRef) {
      const { itemProps } = useRovingFocusItem<HTMLButtonElement>({ value });
      return <button type="button" {...mergeProps(itemProps, { ref: forwardedRef })}>{value}</button>;
    });
    render(<RovingFocus><Item value="a" /><Item value="b" /></RovingFocus>);
    expect([screen.getByText("a").tabIndex, screen.getByText("b").tabIndex]).toEqual([0, -1]);
  });

  it("[primitives.roving-focus.item-hook] [primitives.errors.prefix] is a developer error outside a RovingFocus", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    function Lonely() { useRovingFocusItem({ value: "a" }); return null; }
    expect(() => render(<Lonely />)).toThrow("[paper-ui] useRovingFocusItem must be used inside <RovingFocus>.");
    log.mockRestore();
  });
});

describe("field parts", () => {
  it("[primitives.form-field.parts] draws the label, description and error with Text roles and names each part", () => {
    render(<FormField label="Email" description="Help" error="Wrong" invalid><Control /></FormField>);
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
  it("[primitives.visually-hidden.accessible] VisuallyHidden supplies an accessible name without aria-hidden", () => {
    render(<Pressable><Icon><path d="M1 1h2" /></Icon><VisuallyHidden>Create item</VisuallyHidden></Pressable>);
    expect(screen.getByRole("button", { name: "Create item" })).toBeTruthy();
    expect(screen.getByText("Create item").getAttribute("aria-hidden")).not.toBe("true");
  });

  it("[primitives.visually-hidden.accessible] VisuallyHidden forwards a ref to the element it renders, as the tag it is asked for", () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden as="div" ref={ref}>Skip</VisuallyHidden>);
    expect(ref.current).toBe(screen.getByText("Skip"));
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("[primitives.visually-hidden.accessible] VisuallyHidden focusable shows the content while it holds focus, and not otherwise", () => {
    render(<><VisuallyHidden>Plain</VisuallyHidden><VisuallyHidden focusable><a href="#main">Skip to content</a></VisuallyHidden></>);
    const hidden = screen.getByText("Plain");
    const wrapper = screen.getByText("Skip to content").parentElement as HTMLElement;
    expect(hidden.style.position).toBe("absolute");
    expect(wrapper.style.position).toBe("absolute");
    act(() => screen.getByText("Skip to content").focus());
    expect(wrapper.style.position).not.toBe("absolute");
    act(() => screen.getByText("Skip to content").blur());
    expect(wrapper.style.position).toBe("absolute");
  });

  it("[primitives.hooks.result-shape] [primitives.focus-ring.states] [primitives.hooks.attribute-table] useFocusRing marks focus and keyboard focus, and a text input shows its ring for every focus", () => {
    function Ring({ textInput }: { textInput?: boolean }) {
      const { focusProps, isFocusVisible } = useFocusRing({ textInput });
      return <input aria-label="Name" {...focusProps} data-visible={isFocusVisible} />;
    }
    render(<Ring textInput />);
    const input = screen.getByLabelText("Name");
    expect(input.hasAttribute("data-focused")).toBe(false);
    act(() => input.focus());
    expect(input.getAttribute("data-focused")).toBe("true");
    expect(input.getAttribute("data-focus-visible")).toBe("true");
    act(() => input.blur());
    expect(input.hasAttribute("data-focused")).toBe(false);
  });

  it("[primitives.focus-ring.states] [primitives.hooks.attribute-table] [primitives.state.emitters] focus-within stays active when focus moves between descendants, and its props say so with data-focus-within", () => {
    const change = vi.fn();
    function FocusGroup() {
      const { focusWithinProps, isFocusWithin } = useFocusWithin({ onFocusWithinChange: change });
      return <div {...focusWithinProps} data-testid="focus-group" data-within={isFocusWithin}><button type="button">First</button><button type="button">Second</button></div>;
    }
    render(<FocusGroup />);
    const group = screen.getByTestId("focus-group");
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    expect(group.hasAttribute("data-focus-within")).toBe(false);
    act(() => first.focus());
    expect(group.getAttribute("data-focus-within")).toBe("true");
    act(() => second.focus());
    expect(group.getAttribute("data-within")).toBe("true");
    expect(group.getAttribute("data-focus-within")).toBe("true");
    expect(change.mock.calls.map(([value]) => value)).toEqual([true]);
    act(() => second.blur());
    expect(change.mock.calls.map(([value]) => value)).toEqual([true, false]);
    expect(group.hasAttribute("data-focus-within")).toBe(false);
  });
});

describe("portal", () => {
  it("[primitives.portal.root] carries its children out of the tree into one display-contents root that holds the opener's mode", () => {
    render(
      <ScopeModeContext.Provider value="dark">
        <div data-testid="origin"><Portal><span>Inside</span></Portal></div>
      </ScopeModeContext.Provider>,
    );
    const child = screen.getByText("Inside");
    expect(screen.getByTestId("origin").contains(child)).toBe(false);
    const root = child.parentElement as HTMLElement;
    expect(root.parentElement).toBe(document.body);
    expect(root.classList.contains(portalRoot)).toBe(true);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("[primitives.portal.root] lands in the container it is given", () => {
    const container = document.createElement("div");
    document.body.append(container);
    render(<Portal container={container}><span>Inside</span></Portal>);
    expect(container.contains(screen.getByText("Inside"))).toBe(true);
    container.remove();
  });
});

describe("a portal's direction", () => {
  const items = <RovingFocus><RovingFocus.Item value="a">A</RovingFocus.Item><RovingFocus.Item value="b">B</RovingFocus.Item></RovingFocus>;
  const inSubtree = (dir: string) => {
    const element = document.createElement("div");
    element.dir = dir;
    const button = document.createElement("button");
    element.append(button);
    document.body.append(element);
    return button;
  };
  const rootOf = (name: string) => screen.getByText(name).closest(`.${portalRoot}`) as HTMLElement;
  // Whether a key moves the focus from the first item to the second, where the Portal's content reads its direction.
  const moves = (key: string) => {
    const a = screen.getByText("A");
    act(() => a.focus());
    fireEvent.keyDown(a, { key });
    return document.activeElement === screen.getByText("B");
  };

  it("[primitives.portal.direction] writes the direction of an opener in a right-to-left subtree on its root, and the keys inside follow it", () => {
    const opener = inSubtree("rtl");
    render(<Portal opener={() => opener}>{items}</Portal>);
    expect(rootOf("A").getAttribute("dir")).toBe("rtl");
    expect(moves("ArrowRight")).toBe(false);
    expect(moves("ArrowLeft")).toBe(true);
    opener.parentElement!.remove();
  });

  it("[primitives.portal.direction] takes the focused element as the opener when none is named, as the carry does", () => {
    const focused = inSubtree("rtl");
    focused.focus();
    render(<Portal><span>Inside</span></Portal>);
    expect(rootOf("Inside").getAttribute("dir")).toBe("rtl");
    focused.parentElement!.remove();
  });

  it("[primitives.portal.direction] writes a left-to-right opener's direction under a right-to-left page", () => {
    document.documentElement.dir = "rtl";
    const opener = inSubtree("ltr");
    render(<Portal opener={() => opener}>{items}</Portal>);
    expect(rootOf("A").getAttribute("dir")).toBe("ltr");
    expect(moves("ArrowRight")).toBe(true);
    opener.parentElement!.remove();
  });

  it("[primitives.portal.direction] writes no dir where the opener reads the same as the container, so the root keeps following the page", () => {
    const view = render(<Portal><span>Page</span></Portal>);
    expect(rootOf("Page").hasAttribute("dir")).toBe(false);
    view.unmount();
    const opener = inSubtree("rtl");
    const container = document.createElement("div");
    container.dir = "rtl";
    document.body.append(container);
    render(<Portal opener={() => opener} container={container}><span>Same</span></Portal>);
    expect(rootOf("Same").hasAttribute("dir")).toBe(false);
    opener.parentElement!.remove();
    container.remove();
  });

  it("[primitives.portal.direction] [primitives.floating.portal] gives a Floating opened in a right-to-left subtree the Trigger's direction", () => {
    render(<div dir="rtl"><Floating defaultOpen><Floating.Trigger>Open</Floating.Trigger><Floating.Content aria-label="Panel">{items}</Floating.Content></Floating></div>);
    expect(rootOf("A").getAttribute("dir")).toBe("rtl");
    expect(moves("ArrowLeft")).toBe(true);
  });
});

describe("live region", () => {
  it("[primitives.live-region.roles] is a status for a polite region and an alert for an assertive one, atomic unless told otherwise", () => {
    const ref = createRef<HTMLDivElement>();
    const view = render(<LiveRegion ref={ref} data-testid="region">Saved</LiveRegion>);
    const region = screen.getByTestId("region");
    expect(ref.current).toBe(region);
    expect([region.getAttribute("role"), region.getAttribute("aria-live"), region.getAttribute("aria-atomic")]).toEqual(["status", "polite", "true"]);
    view.rerender(<LiveRegion politeness="assertive" atomic={false} data-testid="region">Failed</LiveRegion>);
    expect([region.getAttribute("role"), region.getAttribute("aria-live"), region.getAttribute("aria-atomic")]).toEqual(["alert", "assertive", "false"]);
  });

  it("[primitives.live-region.roles] keeps the attributes it owns whatever the caller passes", () => {
    render(<LiveRegion data-testid="region" {...({ role: "log", "aria-live": "off" } as object)} />);
    expect([screen.getByTestId("region").getAttribute("role"), screen.getByTestId("region").getAttribute("aria-live")]).toEqual(["status", "polite"]);
  });

  it("[primitives.live-region.announce] announce hands the message to the announcer with its politeness and timeout", () => {
    announcer.announce.mockClear();
    announce("Saved");
    announce("Failed", { politeness: "assertive", timeout: 1000 });
    expect(announcer.announce.mock.calls).toEqual([["Saved", "polite", undefined], ["Failed", "assertive", 1000]]);
  });

  it("[primitives.live-region.announce] clearAnnouncements clears one politeness, or both when none is named", () => {
    announcer.clearAnnouncer.mockClear();
    clearAnnouncements("assertive");
    expect(announcer.clearAnnouncer.mock.calls).toEqual([["assertive"]]);
    announcer.clearAnnouncer.mockClear();
    clearAnnouncements();
    expect(announcer.clearAnnouncer.mock.calls).toEqual([["polite"], ["assertive"]]);
  });
});

describe("the options of a RovingFocus root", () => {
  const items = <>
    <RovingFocus.Item value="a">A</RovingFocus.Item>
    <RovingFocus.Item value="b">B</RovingFocus.Item>
    <RovingFocus.Item value="c">C</RovingFocus.Item>
  </>;
  const stops = () => ["A", "B", "C"].map((name) => screen.getByRole("button", { name }).tabIndex);

  it("[primitives.roving-focus.root-options] starts an uncontrolled entry point at defaultCurrentValue, which then follows the focus and tells each move", () => {
    const change = vi.fn();
    render(<RovingFocus defaultCurrentValue="b" onCurrentValueChange={change}>{items}</RovingFocus>);
    expect(stops()).toEqual([-1, 0, -1]);
    const b = screen.getByRole("button", { name: "B" });
    act(() => b.focus());
    change.mockClear();
    fireEvent.keyDown(b, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "C" }));
    expect(stops()).toEqual([-1, -1, 0]);
    expect(change.mock.calls).toEqual([["c"]]);
  });

  it("[primitives.roving-focus.root-options] takes the first enabled item when no value names one, or the one it names cannot take the stop", () => {
    const view = render(<RovingFocus>{items}</RovingFocus>);
    expect(stops()).toEqual([0, -1, -1]);
    view.unmount();
    render(<RovingFocus defaultCurrentValue="b">
      <RovingFocus.Item value="a" disabled>A</RovingFocus.Item>
      <RovingFocus.Item value="b" disabled>B</RovingFocus.Item>
      <RovingFocus.Item value="c">C</RovingFocus.Item>
    </RovingFocus>);
    expect(stops()).toEqual([-1, -1, 0]);
  });

  it("[primitives.roving-focus.root-options] moves on its own axis, and on both under orientation=both", () => {
    const horizontal = render(<RovingFocus>{items}</RovingFocus>);
    const a = screen.getByRole("button", { name: "A" });
    act(() => a.focus());
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(document.activeElement, "a horizontal group leaves the other axis alone").toBe(a);
    horizontal.unmount();
    render(<RovingFocus orientation="both">{items}</RovingFocus>);
    const first = screen.getByRole("button", { name: "A" });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowDown" });
    const second = screen.getByRole("button", { name: "B" });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "C" }));
  });

  it("[primitives.roving-focus.root-options] stops at the ends unless loop is on, and a disabled root disables its items", () => {
    const view = render(<RovingFocus>{items}</RovingFocus>);
    const c = screen.getByRole("button", { name: "C" });
    act(() => c.focus());
    fireEvent.keyDown(c, { key: "ArrowRight" });
    expect(document.activeElement).toBe(c);
    view.unmount();
    render(<RovingFocus disabled>{items}</RovingFocus>);
    for (const name of ["A", "B", "C"]) expect(screen.getByRole<HTMLButtonElement>("button", { name }).disabled, name).toBe(true);
  });
});

describe("a LiveRegion's element", () => {
  it("[primitives.live-region.element] is a div that forwards its ref and native attributes, whose changing content is what gets read", () => {
    const ref = createRef<HTMLDivElement>();
    const view = render(<LiveRegion ref={ref} data-probe="on" className="mine">First</LiveRegion>);
    expect(ref.current?.tagName).toBe("DIV");
    expect(ref.current?.getAttribute("data-probe")).toBe("on");
    expect(ref.current?.classList.contains("mine")).toBe(true);
    view.rerender(<LiveRegion ref={ref} data-probe="on" className="mine">Second</LiveRegion>);
    expect(ref.current?.textContent).toBe("Second");
  });
});

describe("focus within", () => {
  it("[primitives.focus-ring.states] tells a focus entering and a focus leaving with the events of each, once per crossing of the boundary", () => {
    const entered = vi.fn();
    const left = vi.fn();
    function Group() {
      const { focusWithinProps } = useFocusWithin({ onFocusWithin: entered, onBlurWithin: left });
      return <div {...focusWithinProps}><button type="button">First</button><button type="button">Second</button></div>;
    }
    render(<Group />);
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    act(() => first.focus());
    act(() => second.focus());
    expect(entered).toHaveBeenCalledTimes(1);
    expect(left).not.toHaveBeenCalled();
    act(() => second.blur());
    expect(left).toHaveBeenCalledTimes(1);
  });
});
