import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Checkbox } from "./Checkbox";
import { Field } from "./Field";
import { Label } from "./Label";

afterEach(cleanup);

describe("Label", () => {
  it("[atoms.label.text-role] [atoms.contract.axes] names the Field its htmlFor points at, and forwards its ref to the label element", () => {
    const ref = createRef<HTMLLabelElement>();
    render(<><Label htmlFor="email" ref={ref}>Email</Label><Field id="email" /></>);
    expect(screen.getByLabelText("Email")).toBe(document.getElementById("email"));
    expect(ref.current!.tagName).toBe("LABEL");
    expect(ref.current!.textContent).toBe("Email");
  });

  it("[atoms.label.text-role] names the control it wraps, and keeps the caller's className and native attributes", () => {
    render(<Label className="row" data-testid="label"><Checkbox /> Agree</Label>);
    expect(screen.getByLabelText("Agree")).toBe(screen.getByRole("checkbox"));
    expect(screen.getByTestId("label").classList.contains("row")).toBe(true);
  });
});
