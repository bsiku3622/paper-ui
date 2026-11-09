import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { controlSize } from "../primitives/control/Control.css";
import { FormField } from "../primitives/field/FormField";
import { DateRangePicker } from "./DateRangePicker";

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

const trigger = (name = "Stay") => screen.getByRole("button", { name });
const shown = () => trigger().textContent!.replace(/[\u2009\u202f\u00a0]/g, " ");
const hidden = () => [...document.querySelectorAll<HTMLInputElement>("input[aria-hidden]")];
const day = (number: number) => screen.getAllByRole("button").find((button) => button.closest("td") !== null && button.textContent === String(number))!;
const open = () => act(() => void fireEvent.click(trigger()));
const settle = async () => act(async () => { await new Promise((resolve) => setTimeout(resolve)); });

describe("DateRangePicker", () => {
  it("[components.date-range-picker.trigger] writes the range in the locale's medium range format, or the placeholder while there is none", () => {
    render(<DateRangePicker aria-label="Stay" placeholder="Pick dates" />);
    expect(shown()).toBe("Pick dates");
    cleanup();
    render(<DateRangePicker aria-label="Stay" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} />);
    expect(shown()).toBe("Nov 5 – 12, 2026");
    cleanup();
    render(<DateRangePicker aria-label="Stay" defaultValue={{ start: "2026-11-05", end: "2026-11-05" }} />);
    expect(shown()).toBe("Nov 5, 2026");
    cleanup();
    document.documentElement.lang = "ko-KR";
    render(<DateRangePicker aria-label="Stay" defaultValue={{ start: "2026-11-05", end: "2026-12-12" }} />);
    expect(shown()).toMatch(/2026\. 11\. 5\. ~ 2026\. 12\. 12\./);
  });

  it("[components.date-range-picker.trigger] announces a dialog popup, opens a range calendar and puts focus on the start day", () => {
    render(<DateRangePicker aria-label="Stay" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} />);
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    open();
    const dialog = screen.getByRole("dialog");
    expect(trigger().getAttribute("aria-controls")).toBe(dialog.id);
    expect(dialog.getAttribute("aria-label")).toBe("Stay");
    expect(dialog.querySelector("[data-part=range]")).not.toBeNull();
    expect(document.activeElement).toBe(day(5));
  });

  it("[components.date-range-picker.pick] stays open after the first press, and closes with the range and the focus on the trigger after the second", async () => {
    const onValueChange = vi.fn();
    render(<DateRangePicker aria-label="Stay" defaultValue={null} onValueChange={onValueChange} placeholder="Pick dates" />);
    open();
    fireEvent.click(day(12));
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(day(18));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-11-12", end: "2026-11-18" });
    expect(shown()).toBe("Nov 12 – 18, 2026");
    await settle();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("[components.date-range-picker.pick] closes on Escape without changing the value, and hands min, max, unavailable days and marks to the calendar", async () => {
    const onValueChange = vi.fn();
    render(<DateRangePicker aria-label="Stay" defaultValue={{ start: "2026-11-15", end: "2026-11-16" }} min="2026-11-10" max="2026-11-25" isDateUnavailable={(date) => date === "2026-11-18"} marked={["2026-11-12"]} onValueChange={onValueChange} />);
    open();
    expect(day(9).hasAttribute("data-disabled")).toBe(true);
    expect(day(18).hasAttribute("data-disabled")).toBe(true);
    expect(day(12).querySelector('[data-part="mark"]')).not.toBeNull();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await settle();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger());
  });

  it("[components.date-range-picker.pick] leaves a controlled value to its owner", () => {
    const { rerender } = render(<DateRangePicker aria-label="Stay" value={{ start: "2026-11-05", end: "2026-11-12" }} />);
    open();
    fireEvent.click(day(20));
    fireEvent.click(day(22));
    expect(shown()).toBe("Nov 5 – 12, 2026");
    rerender(<DateRangePicker aria-label="Stay" value={null} placeholder="None" />);
    expect(shown()).toBe("None");
  });

  it("[components.date-range-picker.form] writes the two ISO days to hidden inputs under startName and endName", () => {
    const { container } = render(
      <form>
        <DateRangePicker aria-label="Stay" startName="from" endName="to" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} />
      </form>,
    );
    const data = () => new FormData(container.querySelector("form")!);
    expect([data().get("from"), data().get("to")]).toEqual(["2026-11-05", "2026-11-12"]);
    open();
    fireEvent.click(day(20));
    fireEvent.click(day(22));
    expect([data().get("from"), data().get("to")]).toEqual(["2026-11-20", "2026-11-22"]);
  });

  it("[components.date-range-picker.form] returns to the default value when its form resets", async () => {
    const { container } = render(
      <form>
        <DateRangePicker aria-label="Stay" startName="from" endName="to" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} />
      </form>,
    );
    open();
    fireEvent.click(day(20));
    fireEvent.click(day(22));
    await settle();
    act(() => container.querySelector("form")!.reset());
    expect(hidden().map((input) => input.value)).toEqual(["2026-11-05", "2026-11-12"]);
    expect(shown()).toBe("Nov 5 – 12, 2026");
  });

  it("[components.date-range-picker.form] makes a required empty picker invalid for its form, sends focus to the trigger, and sends nothing while disabled", () => {
    const { container, rerender } = render(
      <form>
        <DateRangePicker aria-label="Stay" startName="from" endName="to" required />
      </form>,
    );
    expect(hidden().every((input) => input.required && input.validity.valueMissing)).toBe(true);
    expect(trigger().getAttribute("aria-required")).toBe("true");
    act(() => hidden()[1]!.focus());
    expect(document.activeElement).toBe(trigger());
    rerender(
      <form>
        <DateRangePicker aria-label="Stay" startName="from" endName="to" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} disabled />
      </form>,
    );
    fireEvent.click(trigger());
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(new FormData(container.querySelector("form")!).get("from")).toBeNull();
  });

  it("[components.date-range-picker.form] reads required, invalid and the description from a FormField", () => {
    render(
      <FormField label="Stay" description="Pick two days" required invalid error="Required">
        <DateRangePicker startName="from" endName="to" />
      </FormField>,
    );
    const button = screen.getByRole("button", { name: /Stay/ });
    expect(button.getAttribute("aria-required")).toBe("true");
    expect(button.getAttribute("aria-invalid")).toBe("true");
    expect(button.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("[components.date-range-picker.layout] takes the input frame's axes, passes ref to the trigger and className, style and testid to the frame", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<DateRangePicker ref={ref} aria-label="Stay" size="lg" status="error" className="mine" style={{ width: "10rem" }} data-testid="range-picker" />);
    const frame = screen.getByTestId("range-picker");
    expect(ref.current).toBe(trigger());
    expect(frame.classList.contains("mine")).toBe(true);
    expect(frame.classList.contains(controlSize.lg)).toBe(true);
    expect(frame.style.width).toBe("10rem");
    expect(frame.getAttribute("data-status")).toBe("error");
  });
});
