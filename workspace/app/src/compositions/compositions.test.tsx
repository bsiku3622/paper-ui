import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./Avatar";
import { DayChip } from "./DayChip";
import { ProgressBar, progressPercent } from "./ProgressBar";
import { Toast } from "./Toast";

describe("ProgressBar", () => {
  it("holds the share of the way between 0 and 100", () => {
    expect(progressPercent(17)).toBe(17);
    expect(progressPercent(-5)).toBe(0);
    expect(progressPercent(140)).toBe(100);
    expect(progressPercent(15, 10, 20)).toBe(50);
    expect(progressPercent(5, 10, 10)).toBe(0);
  });

  it("is a progressbar with its value and range, and its fill is as wide as the share", () => {
    render(<ProgressBar value={40} label="마일스톤" accent="warning" />);
    const bar = screen.getByRole("progressbar", { name: "마일스톤" });
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("40%");
  });

  it("clamps the fill but not the value it reports", () => {
    render(<ProgressBar value={250} max={200} label="넘침" />);
    const bar = screen.getByRole("progressbar", { name: "넘침" });
    expect(bar.getAttribute("aria-valuenow")).toBe("250");
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("100%");
  });
});

describe("Avatar and DayChip", () => {
  it("render the initial and the day as their text", () => {
    render(<><Avatar initial="재" /><Avatar initial="S" shape="square" /><DayChip day="25" selected /><DayChip day="26" /></>);
    for (const text of ["재", "S", "25", "26"]) expect(screen.getByText(text)).toBeTruthy();
  });

  it("mark the day the page stands on with aria-current", () => {
    render(<><DayChip day="25" selected /><DayChip day="26" /></>);
    expect(screen.getByText("25").parentElement?.getAttribute("aria-current")).toBe("date");
    expect(screen.getByText("26").parentElement?.hasAttribute("aria-current")).toBe(false);
  });
});

describe("Toast", () => {
  it("keeps its live region mounted without a notice and puts a notice into it", () => {
    const { rerender } = render(<Toast message="" />);
    const region = screen.getByRole("status");
    expect(region.textContent).toBe("");
    rerender(<Toast message="작업을 완료했습니다" />);
    expect(screen.getByRole("status")).toBe(region);
    expect(region.textContent).toBe("작업을 완료했습니다");
    rerender(<Toast message="" />);
    expect(region.textContent).toBe("");
  });
});
