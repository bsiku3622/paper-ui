import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { controlSize } from "../primitives/control/Control.css";
import { dotPaint } from "../primitives/paint/recipes.css";
import { RangeCalendar } from "./RangeCalendar";

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

const day = (name: RegExp) => {
  const number = /November (\d+)/.exec(name.source)![1];
  return screen.getAllByRole("button").find((button) => button.closest("td") !== null && button.textContent === number)!;
};
const band = (name: RegExp) => day(name).closest("td")!.querySelector("[data-part=range]");
const solid = (name: RegExp) => day(name).className;

describe("RangeCalendar", () => {
  it("[components.range-calendar.selection] takes the first press as the start and the second as the end, and reports ISO strings once", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar aria-label="Dates" defaultValue={null} onValueChange={onValueChange} />);
    fireEvent.click(day(/November 12, 2026/));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(day(/November 18, 2026/));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-11-12", end: "2026-11-18" });
    expect(band(/November 15, 2026/)).not.toBeNull();
  });

  it("[components.range-calendar.selection] orders the two presses, so an earlier second press makes the start", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar aria-label="Dates" onValueChange={onValueChange} />);
    fireEvent.click(day(/November 18, 2026/));
    fireEvent.click(day(/November 12, 2026/));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-11-12", end: "2026-11-18" });
  });

  it("[components.range-calendar.selection] makes a one-day range of the same day twice, and leaves a controlled value to its owner", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<RangeCalendar aria-label="Dates" value={{ start: "2026-11-03", end: "2026-11-05" }} onValueChange={onValueChange} />);
    fireEvent.click(day(/November 20, 2026/));
    fireEvent.click(day(/November 20, 2026/));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-11-20", end: "2026-11-20" });
    expect(band(/November 4, 2026/)).not.toBeNull();
    expect(band(/November 20, 2026/)).toBeNull();
    rerender(<RangeCalendar aria-label="Dates" value={null} />);
    expect(document.querySelector("[data-part=range]")).toBeNull();
  });

  it("[components.range-calendar.band] lays one band from the start to the end day inclusive, cut at neither week's edge, and none outside it", () => {
    render(<RangeCalendar aria-label="Dates" defaultValue={{ start: "2026-11-05", end: "2026-11-11" }} />);
    for (const name of [/November 5, 2026/, /November 7, 2026/, /November 8, 2026/, /November 11, 2026/]) expect(band(name), String(name)).not.toBeNull();
    for (const name of [/November 4, 2026/, /November 12, 2026/]) expect(band(name), String(name)).toBeNull();
    const [start, middle, end] = [band(/November 5, 2026/)!, band(/November 8, 2026/)!, band(/November 11, 2026/)!];
    expect(start.className).not.toBe(middle.className);
    expect(end.className).not.toBe(middle.className);
    expect(start.className).not.toBe(end.className);
    expect(band(/November 7, 2026/)!.className).toBe(middle.className);
    expect(band(/November 8, 2026/)!.className).toBe(middle.className);
  });

  it("[components.range-calendar.band] makes only the two end days solid, with the corners that join the band square, and a one-day range fully round", () => {
    const { unmount } = render(<RangeCalendar aria-label="Dates" defaultValue={{ start: "2026-11-05", end: "2026-11-11" }} />);
    const [start, middle, end] = [solid(/November 5, 2026/), solid(/November 8, 2026/), solid(/November 11, 2026/)];
    expect(start).not.toBe(middle);
    expect(end).not.toBe(middle);
    expect(start).not.toBe(end);
    expect(solid(/November 10, 2026/)).toBe(solid(/November 8, 2026/));
    expect(day(/November 5, 2026/).closest("td")!.getAttribute("aria-selected")).toBe("true");
    unmount();
    render(<RangeCalendar aria-label="Dates" defaultValue={{ start: "2026-11-05", end: "2026-11-05" }} />);
    const both = day(/November 5, 2026/);
    expect(both.className).not.toBe(start);
    expect(both.className).not.toBe(end);
    expect(band(/November 5, 2026/)).not.toBeNull();
  });

  it("[components.range-calendar.band] keeps today's ring when today is not an end day, and a marked dot on the band", () => {
    const { container } = render(<RangeCalendar aria-label="Dates" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} marked={["2026-11-08"]} />);
    expect(solid(/November 9, 2026/)).not.toBe(solid(/November 10, 2026/));
    const dot = container.querySelector('[data-part="mark"]')!;
    expect(dot.classList.contains(dotPaint)).toBe(true);
    expect(dot.closest("td")!.querySelector("[data-part=range]")).not.toBeNull();
  });

  it("[components.range-calendar.preview] draws the band up to the day the pointer or focus is on while the end is still to come", () => {
    render(<RangeCalendar aria-label="Dates" defaultValue={null} />);
    fireEvent.click(day(/November 12, 2026/));
    expect(band(/November 14, 2026/)).toBeNull();
    fireEvent.pointerEnter(day(/November 16, 2026/));
    for (const name of [/November 12, 2026/, /November 14, 2026/, /November 16, 2026/]) expect(band(name), String(name)).not.toBeNull();
    expect(band(/November 17, 2026/)).toBeNull();
    fireEvent.pointerEnter(day(/November 10, 2026/));
    expect(band(/November 10, 2026/)).not.toBeNull();
    expect(band(/November 16, 2026/)).toBeNull();
  });

  it("[components.range-calendar.preview] previews with the keys too, and keeps the old range under the preview's end", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar aria-label="Dates" defaultValue={null} onValueChange={onValueChange} />);
    act(() => day(/November 12, 2026/).focus());
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    fireEvent.keyUp(document.activeElement!, { key: "Enter" });
    expect(document.activeElement).toBe(day(/November 13, 2026/));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(band(/November 14, 2026/)).not.toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    fireEvent.keyUp(document.activeElement!, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-11-12", end: "2026-11-14" });
  });

  it("[components.range-calendar.limits] disables days outside min and max and the unavailable ones, and cannot end a range on them", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar aria-label="Dates" defaultValue={null} min="2026-11-10" max="2026-11-25" isDateUnavailable={(date) => date === "2026-11-18"} onValueChange={onValueChange} />);
    for (const name of [/November 9, 2026/, /November 26, 2026/, /November 18, 2026/]) {
      expect(day(name).hasAttribute("data-disabled")).toBe(true);
      fireEvent.click(day(name));
    }
    fireEvent.click(day(/November 11, 2026/));
    fireEvent.click(day(/November 18, 2026/));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(day(/November 14, 2026/));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-11-11", end: "2026-11-14" });
  });

  it("[components.range-calendar.layout] sizes the days by the Control ladder, passes ref, className and the disabled state on, and puts the focus on the start day with focusOnMount", () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<RangeCalendar ref={ref} aria-label="Dates" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} className="mine" data-testid="range" focusOnMount />);
    expect(ref.current).toBe(screen.getByTestId("range"));
    expect(ref.current!.classList.contains("mine")).toBe(true);
    expect(day(/November 5, 2026/).classList.contains(controlSize.xs)).toBe(true);
    expect(document.activeElement).toBe(day(/November 5, 2026/));
    rerender(<RangeCalendar ref={ref} aria-label="Dates" defaultValue={{ start: "2026-11-05", end: "2026-11-12" }} size="md" disabled />);
    expect(day(/November 5, 2026/).classList.contains(controlSize.md)).toBe(true);
    expect(ref.current!.hasAttribute("data-disabled")).toBe(true);
  });
});
