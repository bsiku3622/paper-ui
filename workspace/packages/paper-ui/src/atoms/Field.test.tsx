import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STATUSES } from "../tokens";
import { Field } from "./Field";

describe("Field", () => {
  it("sunken 표면과 leading/trailing adornment를 함께 렌더한다", () => {
    render(
      <Field
        fill="sunken"
        placeholder="작업 검색..."
        leading={<span>검색 아이콘</span>}
        trailing={<kbd>⌘ K</kbd>}
      />,
    );

    expect(screen.getByPlaceholderText("작업 검색...")).toBeTruthy();
    expect(screen.getByText("검색 아이콘")).toBeTruthy();
    expect(screen.getByText("⌘ K").tagName).toBe("KBD");
  });

  it("기본 fill은 raised다", () => {
    const { rerender } = render(<Field aria-label="raised" />);
    const raisedClass = screen.getByLabelText("raised").parentElement?.className;

    rerender(<Field aria-label="sunken" fill="sunken" />);
    const sunkenClass = screen.getByLabelText("sunken").parentElement?.className;

    expect(raisedClass).not.toBe(sunkenClass);
  });

  it("[atoms.field.neutral-status] status 를 생략하면 data-status 를 그리지 않는다", () => {
    render(<Field aria-label="neutral" />);
    const wrapper = screen.getByLabelText("neutral").parentElement as HTMLElement;
    expect(wrapper.hasAttribute("data-status")).toBe(false);
    expect(screen.getByLabelText("neutral").hasAttribute("aria-invalid")).toBe(false);
  });

  it("[atoms.field.neutral-status] status 를 주면 data-status 로 그리고, error 만 aria-invalid 를 건다", () => {
    for (const status of STATUSES) {
      const { unmount } = render(<Field aria-label={status} status={status} />);
      const input = screen.getByLabelText(status);
      expect(input.parentElement?.getAttribute("data-status"), status).toBe(status);
      expect(input.getAttribute("aria-invalid"), status).toBe(status === "error" ? "true" : null);
      unmount();
    }
  });
});
