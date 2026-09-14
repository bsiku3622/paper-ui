import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field, Select } from "../atoms";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("라벨·컨트롤·도움말을 한 접근성 관계로 잇는다", () => {
    render(
      <FormField>
        <FormField.Label>우선순위</FormField.Label>
        <FormField.Control><Select><Select.Option value="">선택하세요</Select.Option><Select.Option value="high">높음</Select.Option></Select></FormField.Control>
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
        <FormField.Control><Select><Select.Option value="">선택하세요</Select.Option><Select.Option value="high">높음</Select.Option></Select></FormField.Control>
        <FormField.Error>하나를 골라주세요.</FormField.Error>
      </FormField>,
    );

    const select = screen.getByLabelText("우선순위");
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.getAttribute("aria-describedby")).toBe(screen.getByText("하나를 골라주세요.").id);
  });

  it("Field도 같은 compound 구조로 감싸고 align을 Root에서 정한다", () => {
    const { container } = render(
      <FormField align="center">
        <FormField.Label>이름</FormField.Label>
        <FormField.Control><Field /></FormField.Control>
        <FormField.Hint>실명을 입력하세요.</FormField.Hint>
      </FormField>,
    );

    expect(screen.getByLabelText("이름")).toBeTruthy();
    expect(container.firstElementChild?.className).toContain("stackAlign_center");
  });
});
