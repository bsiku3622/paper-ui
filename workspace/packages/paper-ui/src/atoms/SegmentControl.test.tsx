import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { segmentPaint } from "../primitives/paint/recipes.css";
import { SegmentControl } from "./SegmentControl";
import { segmentUnderlineThumb } from "./SegmentControl.css";

afterEach(cleanup);

const items = (
  <>
    <SegmentControl.Item value="d">1일</SegmentControl.Item>
    <SegmentControl.Item value="w">7일</SegmentControl.Item>
    <SegmentControl.Item value="m" disabled>1달</SegmentControl.Item>
  </>
);

describe("SegmentControl", () => {
  it("[atoms.segment.radiogroup] is a radio group whose items say which one is chosen, with one Tab stop", () => {
    render(<SegmentControl aria-label="기간" defaultValue="w">{items}</SegmentControl>);
    expect(screen.getByRole("radiogroup", { name: "기간" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "7일" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "1일" }).getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("radio", { name: "7일" }).tabIndex).toBe(0);
    expect(screen.getByRole("radio", { name: "1일" }).tabIndex).toBe(-1);
  });

  it("[atoms.segment.radiogroup] chooses on a press and tells the owner, and pressing the chosen one takes nothing away", () => {
    const onValueChange = vi.fn();
    render(<SegmentControl aria-label="기간" defaultValue="w" onValueChange={onValueChange}>{items}</SegmentControl>);
    fireEvent.click(screen.getByRole("radio", { name: "1일" }));
    expect(onValueChange).toHaveBeenLastCalledWith("d");
    expect(screen.getByRole("radio", { name: "1일" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "1일" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("radio", { name: "1일" }).getAttribute("aria-checked")).toBe("true");
  });

  it("[atoms.segment.radiogroup] moves the choice with the arrow keys, past nothing that is disabled", () => {
    render(<SegmentControl aria-label="기간" defaultValue="d">{items}</SegmentControl>);
    const first = screen.getByRole("radio", { name: "1일" });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("radio", { name: "7일" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(screen.getByRole("radio", { name: "7일" }), { key: "ArrowRight" });
    expect(screen.getByRole("radio", { name: "1달" }).getAttribute("aria-checked")).toBe("false");
  });

  it("[atoms.segment.radiogroup] holds the value its owner gives and only asks for a change", () => {
    const onValueChange = vi.fn();
    render(<SegmentControl aria-label="기간" value="w" onValueChange={onValueChange}>{items}</SegmentControl>);
    fireEvent.click(screen.getByRole("radio", { name: "1일" }));
    expect(onValueChange).toHaveBeenCalledWith("d");
    expect(screen.getByRole("radio", { name: "7일" }).getAttribute("aria-checked")).toBe("true");
  });

  it("[atoms.segment.outline] draws no sliding chip and leads every choice with a hidden check, so the names stay the words", () => {
    render(<SegmentControl aria-label="기간" variant="outline" defaultValue="w">{items}</SegmentControl>);
    const root = screen.getByRole("radiogroup", { name: "기간" });
    expect(root.querySelectorAll(":scope > span[aria-hidden]").length).toBe(0);
    expect(root.querySelectorAll("svg[aria-hidden=true]").length).toBe(3);
    expect(screen.getByRole("radio", { name: "7일" }).getAttribute("aria-checked")).toBe("true");
  });

  it("[atoms.segment.outline] keeps the sliding chip and no check on the track, which is the default", () => {
    render(<SegmentControl aria-label="기간" defaultValue="w">{items}</SegmentControl>);
    const root = screen.getByRole("radiogroup", { name: "기간" });
    expect(root.querySelectorAll(":scope > span[aria-hidden]").length).toBe(1);
    expect(root.querySelectorAll("svg").length).toBe(0);
  });

  it("[atoms.segment.underline] keeps the sliding part as a bar under the chosen choice, with no check and no chip face", () => {
    render(<SegmentControl aria-label="기간" variant="underline" defaultValue="w">{items}</SegmentControl>);
    const root = screen.getByRole("radiogroup", { name: "기간" });
    const bars = root.querySelectorAll(":scope > span[aria-hidden]");
    expect(bars.length).toBe(1);
    expect(bars[0]!.classList.contains(segmentUnderlineThumb)).toBe(true);
    expect(bars[0]!.classList.contains(segmentPaint.thumb)).toBe(false);
    expect(root.classList.contains(segmentPaint.track)).toBe(false);
    expect(root.querySelectorAll("svg").length).toBe(0);
    expect(screen.getByRole("radio", { name: "7일" }).getAttribute("aria-checked")).toBe("true");
  });

  it("[atoms.segment.radiogroup] disables every item when the group is disabled", () => {
    const onValueChange = vi.fn();
    render(<SegmentControl aria-label="기간" defaultValue="w" disabled onValueChange={onValueChange}>{items}</SegmentControl>);
    const first = screen.getByRole("radio", { name: "1일" }) as HTMLButtonElement;
    expect(first.disabled).toBe(true);
    fireEvent.click(first);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
