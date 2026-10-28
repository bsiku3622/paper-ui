import { createRef } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Select } from "./Select";

describe("Select", () => {
  it("Option과 Group을 native select anatomy로 렌더한다", () => {
    render(
      <Select aria-label="선택">
        <Select.Option value="">선택하세요</Select.Option>
        <Select.Group label="추가 옵션">
          <Select.Option value="a">옵션 A</Select.Option>
          <Select.Option value="b" disabled>옵션 B</Select.Option>
        </Select.Group>
      </Select>,
    );

    const select = screen.getByRole("combobox", { name: "선택" });
    expect(within(select).getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("group", { name: "추가 옵션" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "옵션 B" }).hasAttribute("disabled")).toBe(true);
  });

  it("[atoms.select.native-form] ref와 폼 속성은 native select, className과 style은 wrapper로 전달한다", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<form aria-label="form"><Select ref={ref} name="choice" aria-label="choice" className="custom-select" style={{ width: 240 }} defaultValue="a">
      <Select.Option value="a">A</Select.Option>
      <Select.Option value="b">B</Select.Option>
    </Select></form>);
    const select = screen.getByRole("combobox", { name: "choice" });
    expect(ref.current).toBe(select);
    expect(select.parentElement!.classList.contains("custom-select")).toBe(true);
    expect(select.parentElement!.style.width).toBe("240px");
    fireEvent.change(select, { target: { value: "b" } });
    expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("choice")).toBe("b");
    expect(select.parentElement!.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });
});
