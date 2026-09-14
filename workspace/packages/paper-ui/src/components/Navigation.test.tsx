import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../atoms";
import { Menu, Steps, TableOfContents } from "../molecules";
import { CommandMenu } from "./CommandMenu";
import { DropdownMenu } from "./DropdownMenu";
import { TreeNavigation } from "./TreeNavigation";

describe("navigation family", () => {
  it("Menu는 방향키로 disabled item을 건너뛴다", () => {
    render(<Menu items={[
      { value: "one", label: "하나" },
      { value: "two", label: "둘", disabled: true },
      { value: "three", label: "셋" },
    ]} />);
    const first = screen.getByRole("menuitem", { name: "하나" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "셋" }));
  });

  it("Steps는 현재 순서를 aria-current로 함께 전달한다", () => {
    render(<Steps current="review" items={[
      { value: "draft", label: "작성" },
      { value: "review", label: "검토" },
      { value: "publish", label: "게시" },
    ]} />);
    expect(screen.getByText("검토").closest("li")?.getAttribute("aria-current")).toBe("step");
  });

  it("TableOfContents는 문서 안의 현재 위치를 표시한다", () => {
    render(<TableOfContents active="shape" items={[
      { value: "color", label: "Color" },
      { value: "shape", label: "Shape", depth: 1 },
    ]} />);
    expect(screen.getByRole("link", { name: "Shape" }).getAttribute("aria-current")).toBe("location");
  });

  it("DropdownMenu는 trigger와 선택 후 닫힘을 연결한다", () => {
    const onSelect = vi.fn();
    render(<DropdownMenu trigger={<Button>더 보기</Button>} items={[{ value: "edit", label: "편집" }]} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "편집" }));
    expect(onSelect).toHaveBeenCalledWith("edit");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("CommandMenu는 검색된 명령을 Enter로 선택한다", () => {
    const onSelect = vi.fn();
    render(<CommandMenu commands={[
      { value: "issues", label: "이슈 열기" },
      { value: "docs", label: "문서 열기", keywords: ["가이드"] },
    ]} onSelect={onSelect} />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "문서" } });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("docs");
  });

  it("TreeNavigation은 branch를 접고 펼친다", () => {
    render(<TreeNavigation defaultExpanded={["docs"]} items={[
      { value: "docs", label: "문서", children: [{ value: "tokens", label: "토큰" }] },
    ]} />);
    const branch = screen.getByRole("treeitem", { name: "문서" });
    expect(branch.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(branch);
    expect(branch.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("treeitem", { name: "토큰" })).toBeNull();
  });
});
