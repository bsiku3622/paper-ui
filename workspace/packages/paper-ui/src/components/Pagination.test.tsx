import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("현재 페이지와 양 끝·주변 페이지만 남긴다", () => {
    render(<Pagination page={6} totalPages={12} onChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "6페이지" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "1페이지" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "12페이지" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "3페이지" })).toBeNull();
  });

  it("앞뒤와 숫자 이동을 모두 onChange로 보낸다", () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={7} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    fireEvent.click(screen.getByRole("button", { name: "5페이지" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(onChange).toHaveBeenNthCalledWith(1, 2);
    expect(onChange).toHaveBeenNthCalledWith(2, 5);
    expect(onChange).toHaveBeenNthCalledWith(3, 4);
  });
});
