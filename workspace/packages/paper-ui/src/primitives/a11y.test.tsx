import { createRef, forwardRef, useState, type ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Checkbox, Field, Radio, Select, Switch, Textarea } from "../atoms";
import { textRoleClass } from "../styles/typography.css";
import { ScopeModeContext } from "../theme/context";
import { THEME_ATTRIBUTE } from "../tokens";
import { portalRoot } from "./a11y/Portal.css";
import {
  FormField, Floating, Icon, LiveRegion, Portal, Pressable, RovingFocus, VisuallyHidden, announce, clearAnnouncements, mergeProps,
  useFocusRing, useFocusWithin, useFormField, useFormFieldControl, useRovingFocusItem,
} from "./index";
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

  it("[primitives.roving-focus.direction] writes dir when it is given, and an explicit dir beats an inherited one", () => {
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

  it("an item renders a button by default, and another tag as it is, without a role", () => {
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

  it("[primitives.form-field.control] ties Field, Textarea, Select, Checkbox, Radio and Switch to the field's id, relationships and state", () => {
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

  it("[primitives.form-field.invalid] is invalid on error status alone, on the field being invalid alone, and not on neither", () => {
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

  it("[primitives.form-field.invalid] gives controlProps no undefined value, and tells isInvalid and visualStatus", () => {
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

  it("[primitives.form-field.control] resets inside a Floating panel, so a control there has no relationship to the field", () => {
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
  it("[primitives.form-field.relations] useFormField gives the control, label, description and error props without rendering", () => {
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

  it("marks the field's state on its wrapper", () => {
    render(<FormField label="Email" disabled required invalid data-testid="field"><Control /></FormField>);
    const field = screen.getByTestId("field");
    expect(["data-disabled", "data-invalid", "data-required"].map((name) => field.getAttribute(name))).toEqual(["true", "true", "true"]);
  });
});

describe("roving item hook", () => {
  it("[primitives.hooks.result-shape] gives itemProps with the ref, the Tab stop and the marker, and says which item is current", () => {
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

  it("is a developer error outside a RovingFocus", () => {
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
  it("VisuallyHidden supplies an accessible name without aria-hidden", () => {
    render(<Pressable><Icon><path d="M1 1h2" /></Icon><VisuallyHidden>Create item</VisuallyHidden></Pressable>);
    expect(screen.getByRole("button", { name: "Create item" })).toBeTruthy();
    expect(screen.getByText("Create item").getAttribute("aria-hidden")).not.toBe("true");
  });

  it("VisuallyHidden forwards a ref to the element it renders, as the tag it is asked for", () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden as="div" ref={ref}>Skip</VisuallyHidden>);
    expect(ref.current).toBe(screen.getByText("Skip"));
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("VisuallyHidden focusable shows the content while it holds focus, and not otherwise", () => {
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

  it("[primitives.hooks.result-shape] useFocusRing marks focus and keyboard focus, and a text input shows its ring for every focus", () => {
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
