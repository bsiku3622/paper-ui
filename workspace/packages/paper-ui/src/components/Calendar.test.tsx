import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { controlSize } from "../primitives/control/Control.css";
import { dotPaint } from "../primitives/paint/recipes.css";
import { Calendar } from "./Calendar";

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

const day = (name: RegExp | string) => screen.getByRole("button", { name });
const days = () => screen.getAllByRole("button").filter((button) => button.closest("td"));

describe("Calendar", () => {
  it("[components.calendar.selection] draws the month of the value and reports a picked day as an ISO string", () => {
    const onValueChange = vi.fn();
    render(<Calendar aria-label="Date" defaultValue="2026-11-20" onValueChange={onValueChange} />);
    expect(days()).toHaveLength(30);
    expect(day(/November 20, 2026/).closest("td")!.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(day(/November 3, 2026/));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-03");
    expect(day(/November 3, 2026/).closest("td")!.getAttribute("aria-selected")).toBe("true");
    expect(day(/November 20, 2026/).closest("td")!.getAttribute("aria-selected")).toBeNull();
  });

  it("[components.calendar.selection] leaves a controlled value to its owner", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Calendar aria-label="Date" value="2026-11-05" onValueChange={onValueChange} />);
    fireEvent.click(day(/November 12, 2026/));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-12");
    expect(day(/November 5, 2026/).closest("td")!.getAttribute("aria-selected")).toBe("true");
    rerender(<Calendar aria-label="Date" value={null} onValueChange={onValueChange} />);
    expect(document.querySelectorAll("td").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("gridcell").filter((cell) => cell.getAttribute("aria-selected") === "true")).toHaveLength(0);
  });

  it("[components.calendar.selection] marks today with the hairline face and the chosen day with the solid one, and leaves the days outside the month empty", () => {
    render(<Calendar aria-label="Date" defaultValue="2026-11-20" />);
    const today = day(/November 9, 2026/);
    const chosen = day(/November 20, 2026/);
    const plain = day(/November 10, 2026/);
    expect(today.className).not.toBe(plain.className);
    expect(chosen.className).not.toBe(plain.className);
    expect(chosen.className).not.toBe(today.className);
    const cells = [...document.querySelectorAll("tbody td")];
    expect(cells.length % 7).toBe(0);
    expect(cells.filter((cell) => cell.textContent === "")).toHaveLength(cells.length - 30);
  });

  it("[components.calendar.limits] disables the days outside min and max and the ones the app calls unavailable", () => {
    const onValueChange = vi.fn();
    render(<Calendar aria-label="Date" defaultValue="2026-11-15" min="2026-11-10" max="2026-11-25" isDateUnavailable={(date) => date === "2026-11-18"} onValueChange={onValueChange} />);
    for (const name of [/November 9, 2026/, /November 26, 2026/, /November 18, 2026/]) {
      expect(day(name).getAttribute("aria-disabled")).toBe("true");
      expect(day(name).hasAttribute("data-disabled")).toBe(true);
      fireEvent.click(day(name));
    }
    expect(onValueChange).not.toHaveBeenCalled();
    expect(day(/November 10, 2026/).getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(day(/November 25, 2026/));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-25");
  });

  it("[components.calendar.limits] paints no band between min and max, only the disabled days outside", () => {
    const { container } = render(<Calendar aria-label="Date" defaultValue="2026-11-20" min="2026-11-08" max="2026-11-26" />);
    expect(container.querySelector("[data-part=range]")).toBeNull();
    expect(day(/November 7, 2026/).hasAttribute("data-disabled")).toBe(true);
    expect(day(/November 12, 2026/).hasAttribute("data-disabled")).toBe(false);
  });

  it("[components.calendar.limits] stops paging at the month min and max close", () => {
    render(<Calendar aria-label="Date" defaultValue="2026-11-15" min="2026-11-01" max="2026-12-31" />);
    expect(screen.getByRole("button", { name: /previous/i }).hasAttribute("disabled")).toBe(true);
    const next = screen.getByRole("button", { name: /next/i });
    expect(next.hasAttribute("disabled")).toBe(false);
    fireEvent.click(next);
    expect(screen.getAllByText("December 2026").length).toBeGreaterThan(0);
    expect(next.hasAttribute("disabled")).toBe(true);
  });

  it("[components.calendar.marked] puts a dot only under the marked days", () => {
    const { container } = render(<Calendar aria-label="Date" defaultValue="2026-11-15" marked={["2026-11-04", "2026-11-21", "2026-12-01"]} />);
    const dots = [...container.querySelectorAll('[data-part="mark"]')];
    expect(dots).toHaveLength(2);
    expect(dots.every((dot) => dot.classList.contains(dotPaint) && dot.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(dots.map((dot) => dot.parentElement!.getAttribute("aria-label"))).toEqual([expect.stringMatching(/November 4, 2026/), expect.stringMatching(/November 21, 2026/)]);
  });

  it("[components.calendar.keyboard] moves by day, week, month and edge with the keys and picks with Enter", () => {
    const onValueChange = vi.fn();
    render(<Calendar aria-label="Date" defaultValue="2026-11-15" onValueChange={onValueChange} />);
    const press = (key: string, init: Record<string, unknown> = {}) => fireEvent.keyDown(document.activeElement!, { key, ...init });
    act(() => day(/November 15, 2026/).focus());
    press("ArrowRight");
    expect(document.activeElement).toBe(day(/November 16, 2026/));
    press("ArrowDown");
    expect(document.activeElement).toBe(day(/November 23, 2026/));
    press("ArrowLeft");
    press("ArrowUp");
    expect(document.activeElement).toBe(day(/November 15, 2026/));
    press("End");
    expect(document.activeElement).toBe(day(/November 30, 2026/));
    press("Home");
    expect(document.activeElement).toBe(day(/November 1, 2026/));
    press("PageDown");
    expect(screen.getAllByText("December 2026").length).toBeGreaterThan(0);
    expect(document.activeElement!.getAttribute("aria-label")).toMatch(/December 1, 2026/);
    press("Enter");
    fireEvent.keyUp(document.activeElement!, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("2026-12-01");
  });

  it("[components.calendar.keyboard] has one tab stop among the days", () => {
    render(<Calendar aria-label="Date" defaultValue="2026-11-15" />);
    expect(days().filter((button) => button.tabIndex === 0)).toEqual([day(/November 15, 2026/)]);
  });

  it("[components.calendar.locale] takes week start, month and weekday names from the locale", () => {
    document.documentElement.lang = "ko-KR";
    render(<Calendar aria-label="날짜" defaultValue="2026-11-15" />);
    expect(screen.getAllByText("2026년 11월").length).toBeGreaterThan(0);
    expect([...document.querySelectorAll("th")].map((header) => header.textContent)).toEqual(["일", "월", "화", "수", "목", "금", "토"]);
    cleanup();
    document.documentElement.lang = "en-GB";
    render(<Calendar aria-label="Date" defaultValue="2026-11-15" />);
    expect(document.querySelector("th")!.textContent).toMatch(/Mon/);
  });

  it("[components.calendar.layout] sizes the days by the Control ladder, defaults to xs, and passes ref, className and the disabled state on", () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<Calendar ref={ref} aria-label="Date" defaultValue="2026-11-15" className="mine" data-testid="calendar" />);
    expect(ref.current).toBe(screen.getByTestId("calendar"));
    expect(ref.current!.classList.contains("mine")).toBe(true);
    expect(day(/November 15, 2026/).classList.contains(controlSize.xs)).toBe(true);
    rerender(<Calendar ref={ref} aria-label="Date" defaultValue="2026-11-15" size="md" disabled />);
    expect(day(/November 15, 2026/).classList.contains(controlSize.md)).toBe(true);
    expect(within(ref.current!).getAllByRole("button").every((button) => button.hasAttribute("data-disabled"))).toBe(true);
  });
});
