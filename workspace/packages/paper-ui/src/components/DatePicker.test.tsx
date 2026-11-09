import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FormField } from "../primitives/field/FormField";
import { controlSize } from "../primitives/control/Control.css";
import { DatePicker } from "./DatePicker";

beforeEach(() => {
  document.documentElement.lang = "en-US";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 9, 12));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.documentElement.removeAttribute("lang");
});

const trigger = (name = "Due date") => screen.getByRole("button", { name });
const hiddenInput = () => document.querySelector("input[aria-hidden]") as HTMLInputElement;
const day = (name: RegExp) => screen.getByRole("button", { name });
const open = (name?: string) => act(() => void fireEvent.click(trigger(name)));
const settle = async () => act(async () => { await new Promise((resolve) => setTimeout(resolve)); });

describe("DatePicker", () => {
  it("[components.date-picker.trigger] shows the locale's medium date, or the placeholder while there is none", () => {
    render(<DatePicker aria-label="Due date" placeholder="Pick a date" />);
    expect(trigger().textContent).toBe("Pick a date");
    cleanup();
    render(<DatePicker aria-label="Due date" defaultValue="2026-11-20" placeholder="Pick a date" />);
    expect(trigger().textContent).toBe("Nov 20, 2026");
    cleanup();
    document.documentElement.lang = "ko-KR";
    render(<DatePicker aria-label="Due date" defaultValue="2026-11-20" />);
    expect(trigger().textContent).toBe("2026. 11. 20.");
  });

  it("[components.date-picker.trigger] announces a dialog popup with aria-haspopup and aria-expanded, and opens a calendar on click", () => {
    render(<DatePicker aria-label="Due date" defaultValue="2026-11-20" />);
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
    open();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    const dialog = screen.getByRole("dialog");
    expect(trigger().getAttribute("aria-controls")).toBe(dialog.id);
    expect(dialog.getAttribute("aria-label")).toBe("Due date");
    expect(dialog.querySelector("[aria-selected=true] [role=button]")?.getAttribute("aria-label")).toMatch(/November 20, 2026/);
  });

  it("[components.date-picker.trigger] puts focus on the chosen day when it opens", () => {
    render(<DatePicker aria-label="Due date" defaultValue="2026-11-20" />);
    open();
    expect(document.activeElement).toBe(day(/November 20, 2026/));
  });

  it("[components.date-picker.pick] sets the value, closes, reports an ISO string and returns focus to the trigger", async () => {
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Due date" defaultValue="2026-11-20" onValueChange={onValueChange} />);
    open();
    fireEvent.click(day(/November 3, 2026/));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-03");
    expect(trigger().textContent).toBe("Nov 3, 2026");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    await settle();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("[components.date-picker.pick] closes on Escape without changing the value and returns focus", async () => {
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Due date" defaultValue="2026-11-20" onValueChange={onValueChange} />);
    open();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await settle();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger().textContent).toBe("Nov 20, 2026");
    expect(document.activeElement).toBe(trigger());
  });

  it("[components.date-picker.pick] hands min, max, unavailable days and marks to the calendar", () => {
    render(<DatePicker aria-label="Due date" defaultValue="2026-11-15" min="2026-11-10" max="2026-11-25" isDateUnavailable={(date) => date === "2026-11-18"} marked={["2026-11-12"]} />);
    open();
    expect(day(/November 9, 2026/).getAttribute("aria-disabled")).toBe("true");
    expect(day(/November 18, 2026/).getAttribute("aria-disabled")).toBe("true");
    expect(day(/November 12, 2026/).querySelector('[data-part="mark"]')).not.toBeNull();
  });

  it("[components.date-picker.pick] leaves a controlled value to its owner", () => {
    const { rerender } = render(<DatePicker aria-label="Due date" value="2026-11-05" />);
    open();
    fireEvent.click(day(/November 12, 2026/));
    expect(trigger().textContent).toBe("Nov 5, 2026");
    rerender(<DatePicker aria-label="Due date" value={null} placeholder="None" />);
    expect(trigger().textContent).toBe("None");
  });

  it("[components.date-picker.form] writes the ISO value to a hidden input with the name and reads it back from the form", () => {
    const { container } = render(
      <form>
        <DatePicker aria-label="Due date" name="due" defaultValue="2026-11-20" />
      </form>,
    );
    expect(hiddenInput().value).toBe("2026-11-20");
    expect(hiddenInput().tabIndex).toBe(-1);
    expect(new FormData(container.querySelector("form")!).get("due")).toBe("2026-11-20");
    open();
    fireEvent.click(day(/November 3, 2026/));
    expect(new FormData(container.querySelector("form")!).get("due")).toBe("2026-11-03");
  });

  it("[components.date-picker.form] returns to the default value when its form resets", async () => {
    const { container } = render(
      <form>
        <DatePicker aria-label="Due date" name="due" defaultValue="2026-11-20" />
      </form>,
    );
    open();
    fireEvent.click(day(/November 3, 2026/));
    await settle();
    act(() => container.querySelector("form")!.reset());
    expect(hiddenInput().value).toBe("2026-11-20");
    expect(trigger().textContent).toBe("Nov 20, 2026");
  });

  it("[components.date-picker.form] makes a required empty picker invalid for its form and sends focus to the trigger", () => {
    render(
      <form>
        <DatePicker aria-label="Due date" name="due" required />
      </form>,
    );
    expect(hiddenInput().required).toBe(true);
    expect(hiddenInput().validity.valueMissing).toBe(true);
    expect(trigger().getAttribute("aria-required")).toBe("true");
    act(() => hiddenInput().focus());
    expect(document.activeElement).toBe(trigger());
  });

  it("[components.date-picker.form] reads disabled, required, invalid and the description from a FormField", () => {
    render(
      <FormField label="Due" description="Pick one" required invalid error="Required">
        <DatePicker name="due" />
      </FormField>,
    );
    const button = screen.getByRole("button", { name: /Due/ });
    expect(button.getAttribute("aria-required")).toBe("true");
    expect(button.getAttribute("aria-invalid")).toBe("true");
    expect(button.getAttribute("aria-describedby")).toBeTruthy();
    expect(button.parentElement!.hasAttribute("data-invalid")).toBe(true);
  });

  it("[components.date-picker.form] does not open while disabled and sends no value", () => {
    const { container } = render(
      <form>
        <DatePicker aria-label="Due date" name="due" defaultValue="2026-11-20" disabled />
      </form>,
    );
    expect(trigger().hasAttribute("disabled") || trigger().hasAttribute("data-disabled")).toBe(true);
    fireEvent.click(trigger());
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(new FormData(container.querySelector("form")!).get("due")).toBeNull();
  });

  it("[components.date-picker.layout] takes the input frame's axes, passes ref, className, style and testid to the frame, and follows the Control ladder", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<DatePicker ref={ref} aria-label="Due date" size="lg" status="error" className="mine" style={{ width: "10rem" }} data-testid="picker" />);
    const frame = screen.getByTestId("picker");
    expect(ref.current).toBe(trigger());
    expect(frame.classList.contains("mine")).toBe(true);
    expect(frame.classList.contains(controlSize.lg)).toBe(true);
    expect(frame.style.width).toBe("10rem");
    expect(frame.getAttribute("data-status")).toBe("error");
  });
});
