import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

afterEach(cleanup);

describe("Switch", () => {
  it("[atoms.mark.roles] [atoms.contract.axes] is a native checkbox that says it is a switch, and its state is the input's own checked", () => {
    render(<Switch aria-label="Notifications" />);
    const control = screen.getByRole("switch", { name: "Notifications" }) as HTMLInputElement;
    expect(control.tagName).toBe("INPUT");
    expect(control.type).toBe("checkbox");
    expect(control.checked).toBe(false);
    // The state is not written a second time as aria-checked: assistive technology reads the native checked.
    expect(control.hasAttribute("aria-checked")).toBe(false);
    fireEvent.click(control);
    expect(control.checked).toBe(true);
    expect(screen.getByRole("switch", { name: "Notifications", checked: true })).toBe(control);
  });

  it("[atoms.mark.roles] changes once per click, and says it is disabled with the native attribute", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Switch aria-label="Setting" onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender(<Switch aria-label="Setting" onChange={onChange} disabled />);
    const control = screen.getByRole("switch") as HTMLInputElement;
    expect(control.disabled).toBe(true);
    expect(control.hasAttribute("data-disabled")).toBe(true);
  });

  it("[atoms.mark.roles] keeps its controlled checked as the caller holds it", () => {
    const { rerender } = render(<Switch aria-label="Setting" checked onChange={() => {}} />);
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
    rerender(<Switch aria-label="Setting" checked={false} onChange={() => {}} />);
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(false);
  });
});
