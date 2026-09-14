import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Select } from "../atoms";
import { FormField } from "./FormField";
import { SearchField } from "./SearchField";

describe("FormField", () => {
  it("라벨·컨트롤·도움말을 한 접근성 관계로 잇는다", () => {
    render(
      <FormField>
        <FormField.Label>우선순위</FormField.Label>
        <FormField.Control><Select options={[{ value: "", label: "선택하세요" }, { value: "high", label: "높음" }]} /></FormField.Control>
        <FormField.Hint>저장 후에도 변경할 수 있습니다.</FormField.Hint>
      </FormField>,
    );

    const select = screen.getByLabelText("우선순위");
    const note = screen.getByText("저장 후에도 변경할 수 있습니다.");
    expect(select.getAttribute("aria-describedby")).toBe(note.id);
  });

  it("오류는 aria-invalid와 오류 문구로 함께 전달한다", () => {
    render(
      <FormField>
        <FormField.Label>우선순위</FormField.Label>
        <FormField.Control><Select options={[{ value: "", label: "선택하세요" }, { value: "high", label: "높음" }]} /></FormField.Control>
        <FormField.Error>하나를 골라주세요.</FormField.Error>
      </FormField>,
    );

    const select = screen.getByLabelText("우선순위");
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.getAttribute("aria-describedby")).toBe(screen.getByText("하나를 골라주세요.").id);
  });
});

describe("SearchField", () => {
  it("검색 type·돋보기·clear 동작을 Field 계약으로 묶는다", () => {
    const onClear = vi.fn();
    render(<SearchField defaultValue="token" onClear={onClear} />);
    const input = screen.getByRole("searchbox", { name: "검색" });
    expect(input.getAttribute("type")).toBe("search");
    fireEvent.change(input, { target: { value: "" } });
    // 값이 있을 때만 clear 버튼이 생기므로 새 값으로 다시 확인한다.
    fireEvent.change(input, { target: { value: "tokens" } });
    fireEvent.click(screen.getByRole("button", { name: "지우기" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
