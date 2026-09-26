import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./Field";

describe("Field", () => {
  it("sunken 표면과 leading/trailing adornment를 함께 렌더한다", () => {
    render(
      <Field
        surface="sunken"
        placeholder="작업 검색..."
        leading={<span>검색 아이콘</span>}
        trailing={<kbd>⌘ K</kbd>}
      />,
    );

    expect(screen.getByPlaceholderText("작업 검색...")).toBeTruthy();
    expect(screen.getByText("검색 아이콘")).toBeTruthy();
    expect(screen.getByText("⌘ K").tagName).toBe("KBD");
  });

  it("기본 surface는 raised다", () => {
    const { rerender } = render(<Field aria-label="raised" />);
    const raisedClass = screen.getByLabelText("raised").parentElement?.className;

    rerender(<Field aria-label="sunken" surface="sunken" />);
    const sunkenClass = screen.getByLabelText("sunken").parentElement?.className;

    expect(raisedClass).not.toBe(sunkenClass);
  });
});
