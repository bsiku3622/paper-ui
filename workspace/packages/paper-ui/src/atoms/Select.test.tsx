import { render, screen, within } from "@testing-library/react";
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
});
