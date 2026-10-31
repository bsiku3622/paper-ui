// What the Atoms of one family say alike. The input family (Field, Textarea, Select) is one frame around one native
// control, and says the same about invalid, about where its attributes go and about the ring.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef, type ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormField } from "../primitives";
import { Field } from "./Field";
import { Select } from "./Select";
import { Textarea } from "./Textarea";

afterEach(cleanup);

const read = (path: string) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), path), "utf8");

type Control = { name: string; control: (props: { status?: "error" | "warning"; "aria-invalid"?: boolean }) => ReactElement; frame: (control: HTMLElement) => HTMLElement };
const own = (control: HTMLElement) => control;
const parent = (control: HTMLElement) => control.parentElement as HTMLElement;

const INPUTS: Control[] = [
  { name: "Field", control: (props) => <Field aria-label="control" {...props} />, frame: parent },
  { name: "Textarea", control: (props) => <Textarea aria-label="control" {...props} />, frame: own },
  { name: "Select", control: (props) => <Select aria-label="control" {...props}><Select.Option value="a">A</Select.Option></Select>, frame: parent },
];

// What a control says of itself, and what its frame says of it.
const stateOf = (input: Control, element: ReactElement) => {
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
    it(`[atoms.field.invalid] ${input.name} has one invalid contract: the field being invalid, the error status and an explicit word each reach aria-invalid and the frame`, () => {
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
