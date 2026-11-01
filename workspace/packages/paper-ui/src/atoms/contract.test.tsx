// What the Atoms say alike. Every Atom gives its ref and native attributes to the semantic element and its className, style
// and data-testid to the visible box. The input family (Field, Textarea, Select) is one frame around one native control, and
// says the same about invalid, about where its attributes go and about the ring; the selection marks (Checkbox, Radio,
// Switch) are their own frame and say the same about invalid.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef, type FocusEvent, type ReactElement } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { INVENTORY } from "../inventory";
import { FormField } from "../primitives/field/FormField";
import { Icon } from "../primitives/Icon";
import { Text } from "../primitives/Text";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Divider } from "./Divider";
import { Field } from "./Field";
import { IconButton } from "./IconButton";
import { Label } from "./Label";
import { Link } from "./Link";
import { Marker } from "./Marker";
import { Radio } from "./Radio";
import { Select } from "./Select";
import { Spinner } from "./Spinner";
import { Switch } from "./Switch";
import { Textarea } from "./Textarea";

// What ran, in order: a caller's handler writes here, and so does the focus judge an input control stands on, through this wrap.
const ran = vi.hoisted(() => ({ log: [] as string[] }));
vi.mock("../primitives/a11y/focus", async (importOriginal) => {
  const original = await importOriginal<typeof import("../primitives/a11y/focus")>();
  return {
    ...original,
    useFocusRing: (options?: Parameters<typeof original.useFocusRing>[0]) => {
      const ring = original.useFocusRing(options);
      const { onFocus, onBlur } = ring.focusProps;
      return {
        ...ring,
        focusProps: {
          ...ring.focusProps,
          onFocus: (event: FocusEvent<HTMLElement>) => { ran.log.push("judge:focus"); onFocus?.(event); },
          onBlur: (event: FocusEvent<HTMLElement>) => { ran.log.push("judge:blur"); onBlur?.(event); },
        },
      };
    },
  };
});

afterEach(cleanup);

const here = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(join(here, path), "utf8");

type Control = { name: string; control: (props: { status?: "error" | "warning"; "aria-invalid"?: boolean }) => ReactElement; frame: (control: HTMLElement) => HTMLElement };
const own = (control: HTMLElement) => control;
const parent = (control: HTMLElement) => control.parentElement as HTMLElement;

const INPUTS: Control[] = [
  { name: "Field", control: (props) => <Field aria-label="control" {...props} />, frame: parent },
  { name: "Textarea", control: (props) => <Textarea aria-label="control" {...props} />, frame: own },
  { name: "Select", control: (props) => <Select aria-label="control" {...props}><Select.Option value="a">A</Select.Option></Select>, frame: parent },
];

// What a control says of itself, and what its frame says of it.
const stateOf = (input: Pick<Control, "frame">, element: ReactElement) => {
  const view = render(element);
  const control = screen.getByLabelText("control");
  const frame = input.frame(control);
  const result = {
    ariaInvalid: control.getAttribute("aria-invalid"),
    status: frame.getAttribute("data-status"),
    invalid: frame.hasAttribute("data-invalid"),
  };
  view.unmount();
  return result;
};

describe("the input family", () => {
  for (const input of INPUTS) {
    it(`[atoms.field.invalid] [primitives.form-field.status-link] [atoms.states.atom-table] [primitives.state.emitters] ${input.name} has one invalid contract: the field being invalid, the error status and an explicit word each reach aria-invalid and the frame`, () => {
      // The field being invalid alone.
      expect(stateOf(input, <FormField label="L" invalid>{input.control({})}</FormField>)).toEqual({ ariaInvalid: "true", status: "error", invalid: true });
      // An error status alone, in a field that is not invalid (the regression of a status the field overwrote).
      expect(stateOf(input, <FormField label="L" invalid={false}>{input.control({ status: "error" })}</FormField>)).toEqual({ ariaInvalid: "true", status: "error", invalid: true });
      // Both.
      expect(stateOf(input, <FormField label="L" invalid>{input.control({ status: "error" })}</FormField>)).toEqual({ ariaInvalid: "true", status: "error", invalid: true });
      // Neither: no aria-invalid at all.
      expect(stateOf(input, <FormField label="L">{input.control({})}</FormField>)).toEqual({ ariaInvalid: null, status: null, invalid: false });
      expect(stateOf(input, input.control({}))).toEqual({ ariaInvalid: null, status: null, invalid: false });
      // A status that is not an error colours the frame and says nothing to assistive technology.
      expect(stateOf(input, input.control({ status: "warning" }))).toEqual({ ariaInvalid: null, status: "warning", invalid: false });
      // An explicit word wins over the status, and the frame still draws the status.
      expect(stateOf(input, input.control({ status: "error", "aria-invalid": false }))).toEqual({ ariaInvalid: "false", status: "error", invalid: false });
    });

    it(`[atoms.field.invalid] ${input.name} keeps the field's description and error ids where they were`, () => {
      render(<FormField label="L" invalid description="Help" error="Wrong">{input.control({})}</FormField>);
      const control = screen.getByLabelText("L");
      expect(control.getAttribute("aria-describedby")).toBe(`${screen.getByText("Help").id} ${screen.getByText("Wrong").id}`);
      expect(control.getAttribute("aria-invalid")).toBe("true");
    });

    it(`[atoms.field.target] ${input.name} gives ref and native attributes to its control, and className, style and data-testid to its frame`, () => {
      const ref = createRef<never>();
      const props = { name: "who", className: "mine", style: { width: 240 }, "data-testid": "frame", "aria-label": "control" };
      const element = input.name === "Field" ? <Field {...props} ref={ref} /> : input.name === "Textarea" ? <Textarea {...props} ref={ref} /> : <Select {...props} ref={ref}><Select.Option value="a">A</Select.Option></Select>;
      render(element);
      const control = screen.getByLabelText("control");
      const frame = screen.getByTestId("frame");
      expect(ref.current).toBe(control);
      expect(control.getAttribute("name")).toBe("who");
      expect(frame).toBe(input.frame(control));
      expect(frame.classList.contains("mine")).toBe(true);
      expect(frame.style.width).toBe("240px");
      if (frame !== control) {
        expect(control.hasAttribute("data-testid")).toBe(false);
        expect(control.classList.contains("mine")).toBe(false);
      }
    });
  }
});

describe("a caller's handlers on an input control", () => {
  type Handlers = { onFocus?: (event: FocusEvent<HTMLElement>) => void; onBlur?: (event: FocusEvent<HTMLElement>) => void };
  const CONTROLS: Array<[name: string, control: (handlers: Handlers) => ReactElement]> = [
    ["Field", (handlers) => <Field aria-label="control" {...handlers} />],
    ["Textarea", (handlers) => <Textarea aria-label="control" {...handlers} />],
    ["Select", (handlers) => <Select aria-label="control" {...handlers}><Select.Option value="a">A</Select.Option></Select>],
    ["Checkbox", (handlers) => <Checkbox aria-label="control" {...handlers} />],
    ["Radio", (handlers) => <Radio aria-label="control" {...handlers} />],
    ["Switch", (handlers) => <Switch aria-label="control" {...handlers} />],
    ["Link", (handlers) => <Link href="#" aria-label="control" {...handlers} />],
  ];
  const focusAndLeave = () => {
    const control = screen.getByLabelText("control");
    act(() => control.focus());
    act(() => control.blur());
  };

  for (const [name, control] of CONTROLS) {
    it(`[primitives.composition.compose-handlers] ${name} runs the caller's onFocus and onBlur before its own focus judge`, () => {
      ran.log.length = 0;
      render(control({ onFocus: () => ran.log.push("caller:focus"), onBlur: () => ran.log.push("caller:blur") }));
      focusAndLeave();
      expect(ran.log).toEqual(["caller:focus", "judge:focus", "caller:blur", "judge:blur"]);
    });

    it(`[primitives.composition.compose-handlers] ${name}'s focus judge runs even when the caller prevented the default: focus has already moved`, () => {
      ran.log.length = 0;
      render(control({ onFocus: (event) => event.preventDefault(), onBlur: (event) => event.preventDefault() }));
      focusAndLeave();
      expect(ran.log).toEqual(["judge:focus", "judge:blur"]);
    });
  }

  it("[primitives.composition.compose-handlers] Field runs the caller's onChange first, so what it tracks of its value is what the caller left", () => {
    const type = (element: ReactElement) => {
      const view = render(element);
      fireEvent.change(screen.getByLabelText("control"), { target: { value: "x" } });
      const shown = screen.queryByRole("button", { name: "Clear" }) !== null;
      view.unmount();
      return shown;
    };
    expect(type(<Field aria-label="control" clearable />)).toBe(true);
    expect(type(<Field aria-label="control" clearable onChange={(event) => { event.currentTarget.value = ""; }} />)).toBe(false);
  });
});

describe("the input family's stylesheets", () => {
  it("[atoms.field.frame] spell no hover, no keyboard-focus selector and no pointer-focus flag of their own: the states come from the frame's attributes and the paint tier", () => {
    for (const file of ["Field.css.ts", "Textarea.css.ts", "Select.css.ts", "recipes/input-frame.css.ts", "Field.tsx", "Textarea.tsx", "Select.tsx", "input-control.ts"]) {
      expect(read(file), file).not.toMatch(/:hover|:focus-visible|pointer-?focus|PointerFocus/i);
    }
  });

  it("[atoms.field.frame] hold geometry only: no colour, no opacity literal and no transition outside the frame's own", () => {
    for (const file of ["Field.css.ts", "Textarea.css.ts", "Select.css.ts", "recipes/input-frame.css.ts"]) {
      expect(read(file), file).not.toMatch(/tokens\.color\b|opacity\s*:|\b0\.[45]\b/);
    }
    for (const file of ["Textarea.css.ts", "Select.css.ts"]) expect(read(file), file).not.toMatch(/transition/);
  });
});

// Every Atom, and where it sends what a caller gives it. `semantic` is the element the ref and the native attributes reach; `visible`
// is the box that carries className, style and data-testid. They are one element for every Atom but Field and Select, whose
// visible box is the frame around the native control.
type Target = { name: string; element: (props: Record<string, unknown>) => ReactElement; semantic: (root: HTMLElement) => HTMLElement; visible: (semantic: HTMLElement) => HTMLElement };
const same = (semantic: HTMLElement) => semantic;
const TARGETS: Target[] = [
  { name: "Button", element: (props) => <Button {...props}>B</Button>, semantic: (root) => root.querySelector("button")!, visible: same },
  { name: "IconButton", element: (props) => <IconButton aria-label="i" {...props}><Icon><path d="M4 12h16" /></Icon></IconButton>, semantic: (root) => root.querySelector("button")!, visible: same },
  { name: "Link", element: (props) => <Link href="#x" {...props}>L</Link>, semantic: (root) => root.querySelector("a")!, visible: same },
  { name: "Field", element: (props) => <Field aria-label="f" {...props} />, semantic: (root) => root.querySelector("input")!, visible: parent },
  { name: "Textarea", element: (props) => <Textarea aria-label="t" {...props} />, semantic: (root) => root.querySelector("textarea")!, visible: same },
  { name: "Select", element: (props) => <Select aria-label="s" {...props}><Select.Option value="a">A</Select.Option></Select>, semantic: (root) => root.querySelector("select")!, visible: parent },
  { name: "Checkbox", element: (props) => <Checkbox aria-label="c" {...props} />, semantic: (root) => root.querySelector("input")!, visible: same },
  { name: "Radio", element: (props) => <Radio aria-label="r" {...props} />, semantic: (root) => root.querySelector("input")!, visible: same },
  { name: "Switch", element: (props) => <Switch aria-label="w" {...props} />, semantic: (root) => root.querySelector("input")!, visible: same },
  { name: "Label", element: (props) => <Label {...props}>L</Label>, semantic: (root) => root.querySelector("label")!, visible: same },
  { name: "Badge", element: (props) => <Badge {...props}>B</Badge>, semantic: (root) => root.querySelector("span")!, visible: same },
  { name: "Spinner", element: (props) => <Spinner {...props} />, semantic: (root) => root.querySelector("span")!, visible: same },
  { name: "Divider", element: (props) => <Divider {...props} />, semantic: (root) => root.querySelector("hr")!, visible: same },
  { name: "Marker", element: (props) => <Marker {...props}>M</Marker>, semantic: (root) => root.querySelector("mark")!, visible: same },
];

// The axes an Atom names, with each at the default the table gives: the two draw the same classes.
const DEFAULTS: Array<[name: string, plain: ReactElement, explicit: ReactElement]> = [
  ["Button", <Button>x</Button>, <Button size="md" shape="rounded" accent="primary" variant="solid">x</Button>],
  ["IconButton", <IconButton aria-label="i"><Icon><path d="M4 12h16" /></Icon></IconButton>, <IconButton aria-label="i" size="md" shape="rounded" accent="primary" variant="solid"><Icon><path d="M4 12h16" /></Icon></IconButton>],
  ["Field", <Field aria-label="f" />, <Field aria-label="f" size="md" fill="raised" shape="rounded" />],
  ["Textarea", <Textarea aria-label="t" />, <Textarea aria-label="t" size="md" fill="raised" />],
  ["Select", <Select aria-label="s"><Select.Option value="a">A</Select.Option></Select>, <Select aria-label="s" size="md" fill="raised" shape="rounded"><Select.Option value="a">A</Select.Option></Select>],
  ["Checkbox", <Checkbox aria-label="c" />, <Checkbox aria-label="c" size="md" />],
  ["Radio", <Radio aria-label="r" />, <Radio aria-label="r" size="md" />],
  ["Switch", <Switch aria-label="w" />, <Switch aria-label="w" size="md" />],
  ["Badge", <Badge>x</Badge>, <Badge size="md" shape="rounded" accent="primary" variant="soft">x</Badge>],
];

// What each Atom stands on, as what its source names: the Primitives and hooks of the table, and where its colour comes from.
const STANDS_ON: Record<string, readonly string[]> = {
  "button-base.tsx": ["Pressable", 'motion="press"', "useSelectable", "paintClass"],
  "Link.tsx": ["useFocusRing", "linkPaint"],
  "Marker.tsx": ["markerPaint"],
  "Field.tsx": ["inputFrame", "fieldPaint", "<Icon", "<Pressable", "as={Selectable}"],
  "Textarea.tsx": ["inputFrame", "fieldPaint"],
  "Select.tsx": ["inputFrame", "fieldPaint", "<Icon"],
  "input-control.ts": ["useFormFieldControl", "useFocusRing"],
  "Checkbox.tsx": ["markPaint"],
  "Radio.tsx": ["markPaint"],
  "Switch.tsx": ["markPaint"],
  "Label.tsx": ["<Text"],
  "Badge.tsx": ["<Paint", 'as="span"'],
  "Divider.tsx": ["<Box", 'as="hr"', "linePaint"],
  "Spinner.tsx": ["<Box", 'as="span"', "spinnerPaint"],
  "Spinner.css.ts": ["loop.spin"],
};

describe("every Atom", () => {
  it("[atoms.contract.common-axes] leaves each shared axis at the default the table names", () => {
    for (const [name, plain, explicit] of DEFAULTS) {
      const classes = (element: ReactElement) => {
        const view = render(element);
        const box = view.container.firstElementChild!;
        const found = box.className;
        view.unmount();
        return found;
      };
      expect(classes(plain), name).toBe(classes(explicit));
    }
  });

  it("[foundations.shape.control-geometry] builds no size ladder in its stylesheet: the sizes come from controlGeometry", () => {
    const sheets = (dir: string) => readdirSync(join(here, dir)).filter((file) => file.endsWith(".css.ts")).map((file) => join(dir, file));
    const files = [...sheets("."), ...sheets("recipes")];
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(read(file), file).not.toMatch(/CONTROL_SIZES\s*\.\s*map|\bcontrolSizes\s*\(|styleVariants\(\s*geometry\./);
  });

  it("[atoms.contract.stands-on] stands on the Primitives its row names, and takes its colour from the paint tier", () => {
    for (const [file, names] of Object.entries(STANDS_ON)) for (const name of names) expect(read(file), `${file}: ${name}`).toContain(name);
    for (const file of ["Checkbox.tsx", "Radio.tsx", "Switch.tsx", "Field.tsx", "Textarea.tsx", "Select.tsx"]) expect(read(file), file).toMatch(/input-control/);
  });

  it("[primitives.selectable.native-widgets] leaves a native control's meaning to it: Checkbox, Radio and Switch take no useSelectable", () => {
    for (const file of ["Checkbox.tsx", "Radio.tsx", "Switch.tsx"]) expect(read(file), file).not.toMatch(/useSelectable/);
  });

  it("[atoms.contract.targets] [atoms.contract.target-table] is covered: the table names the Atoms of the inventory, once each", () => {
    expect(TARGETS.map((target) => target.name).sort()).toEqual([...INVENTORY.atoms].sort());
  });

  for (const target of TARGETS) {
    it(`[atoms.contract.targets] [atoms.contract.target-table] ${target.name} gives its ref, id, data-* and aria-describedby to the semantic element, and className, style and data-testid to the visible box`, () => {
      const ref = createRef<never>();
      const view = render(target.element({ ref, id: "the-id", "data-x": "x", "aria-describedby": "help", className: "mine", style: { width: 77 }, "data-testid": "box" }));
      const semantic = target.semantic(view.container);
      const visible = screen.getByTestId("box");
      expect(ref.current).toBe(semantic);
      expect(visible).toBe(target.visible(semantic));
      expect(semantic.id).toBe("the-id");
      expect(semantic.getAttribute("data-x")).toBe("x");
      expect(semantic.getAttribute("aria-describedby")).toContain("help");
      expect(visible.classList.contains("mine")).toBe(true);
      expect(visible.style.width).toBe("77px");
      if (visible !== semantic) {
        expect(semantic.hasAttribute("data-testid")).toBe(false);
        expect(semantic.classList.contains("mine")).toBe(false);
      }
    });
  }

  it("[atoms.contract.targets] [atoms.contract.target-table] Select.Option and Select.Group give their ref, attributes, className, style and data-testid to the option and the optgroup", () => {
    const option = createRef<HTMLOptionElement>();
    const group = createRef<HTMLOptGroupElement>();
    render(
      <Select aria-label="s">
        <Select.Group label="g" ref={group} data-x="group" id="group-id" className="mine-group" style={{ width: 77 }} data-testid="group">
          <Select.Option value="a" ref={option} data-x="option" id="option-id" className="mine-option" style={{ width: 88 }} data-testid="option">A</Select.Option>
        </Select.Group>
      </Select>,
    );
    expect(option.current?.tagName).toBe("OPTION");
    expect(option.current?.id).toBe("option-id");
    expect(option.current?.getAttribute("data-x")).toBe("option");
    expect(option.current?.classList.contains("mine-option")).toBe(true);
    expect(option.current?.style.width).toBe("88px");
    expect(option.current?.getAttribute("data-testid")).toBe("option");
    expect(group.current?.tagName).toBe("OPTGROUP");
    expect(group.current?.id).toBe("group-id");
    expect(group.current?.getAttribute("data-x")).toBe("group");
    expect(group.current?.classList.contains("mine-group")).toBe(true);
    expect(group.current?.style.width).toBe("77px");
    expect(group.current?.getAttribute("data-testid")).toBe("group");
  });

  it("[atoms.label.text-role] Label draws the same classes as the label role of Text, on a label element", () => {
    const view = render(<><Label data-testid="label">L</Label><Text as="label" variant="label" data-testid="text">T</Text></>);
    expect(view.getByTestId("label").tagName).toBe("LABEL");
    expect(view.getByTestId("label").className).toBe(view.getByTestId("text").className);
  });

  it("[atoms.divider.border] Divider forwards its native attributes to the hr and draws its line with a border", () => {
    const view = render(<Divider data-testid="line" id="rule" title="rule" aria-label="between" />);
    const line = view.getByTestId("line");
    expect(line.tagName).toBe("HR");
    expect(line.id).toBe("rule");
    expect(line.getAttribute("title")).toBe("rule");
    expect(line.getAttribute("aria-label")).toBe("between");
    expect(read("Divider.css.ts")).not.toMatch(/background/);
  });
});

// A selection mark is its own frame: what its status and the field around it say reaches the input and what the input shows.
type Mark = { name: string; control: (props: { status?: "error"; "aria-invalid"?: boolean }) => ReactElement };
const MARKS: Mark[] = [
  { name: "Checkbox", control: (props) => <Checkbox aria-label="control" {...props} /> },
  { name: "Radio", control: (props) => <Radio aria-label="control" {...props} /> },
  { name: "Switch", control: (props) => <Switch aria-label="control" {...props} /> },
];

describe("the selection marks", () => {
  for (const mark of MARKS) {
    const stateOfMark = (element: ReactElement) => stateOf({ frame: own }, element);

    it(`[atoms.mark.invalid] [primitives.form-field.status-link] ${mark.name} has the input family's invalid contract: the field being invalid, the error status and an explicit word each reach aria-invalid and the input`, () => {
      expect(stateOfMark(<FormField label="L" invalid>{mark.control({})}</FormField>)).toEqual({ ariaInvalid: "true", status: "error", invalid: true });
      expect(stateOfMark(<FormField label="L" invalid={false}>{mark.control({ status: "error" })}</FormField>)).toEqual({ ariaInvalid: "true", status: "error", invalid: true });
      expect(stateOfMark(<FormField label="L" invalid>{mark.control({ status: "error" })}</FormField>)).toEqual({ ariaInvalid: "true", status: "error", invalid: true });
      expect(stateOfMark(<FormField label="L">{mark.control({})}</FormField>)).toEqual({ ariaInvalid: null, status: null, invalid: false });
      expect(stateOfMark(mark.control({}))).toEqual({ ariaInvalid: null, status: null, invalid: false });
      expect(stateOfMark(mark.control({ status: "error", "aria-invalid": false }))).toEqual({ ariaInvalid: "false", status: "error", invalid: false });
    });

    it(`[atoms.mark.invalid] ${mark.name} keeps the field's description and error ids where they were`, () => {
      render(<FormField label="L" invalid description="Help" error="Wrong">{mark.control({})}</FormField>);
      const control = screen.getByLabelText("L");
      expect(control.getAttribute("aria-describedby")).toBe(`${screen.getByText("Help").id} ${screen.getByText("Wrong").id}`);
      expect(control.getAttribute("aria-invalid")).toBe("true");
    });

    it(`[atoms.mark.disabled] ${mark.name} tells its stylesheet it is disabled`, () => {
      render(mark.control({}));
      const control = screen.getByLabelText("control") as HTMLInputElement;
      expect(control.hasAttribute("data-disabled")).toBe(false);
      cleanup();
      render(<FormField label="L" disabled>{mark.control({})}</FormField>);
      const disabled = screen.getByLabelText("L") as HTMLInputElement;
      expect(disabled.disabled).toBe(true);
      expect(disabled.getAttribute("data-disabled")).toBe("true");
    });
  }

  it("[atoms.mark.paint] hold geometry only: no colour, no opacity literal, no state selector and no pointer-focus flag in the stylesheets and the Atoms", () => {
    for (const file of ["Checkbox.css.ts", "Radio.css.ts", "Switch.css.ts", "recipes/selection-control.css.ts", "Checkbox.tsx", "Radio.tsx", "Switch.tsx"]) {
      expect(read(file), file).not.toMatch(/tokens\.color\b|opacity\s*:|\b0\.[45]\b|:hover|:focus-visible|pointer-?focus|useHover/i);
    }
  });
});
