import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../atoms";
import { Menu, Steps, TableOfContents } from "../molecules";
import { CommandMenu } from "./CommandMenu";
import { DropdownMenu } from "./DropdownMenu";
import { TreeNavigation } from "./TreeNavigation";

describe("navigation family", () => {
  it("Menu는 방향키로 disabled item을 건너뛴다", () => {
    render(<Menu><Menu.Item value="one">하나</Menu.Item><Menu.Item value="two" disabled>둘</Menu.Item><Menu.Item value="three">셋</Menu.Item></Menu>);
    const first = screen.getByRole("menuitem", { name: "하나" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "셋" }));
  });

  it("Steps는 현재 순서를 aria-current로 함께 전달한다", () => {
    render(<Steps value="review"><Steps.Item value="draft">작성</Steps.Item><Steps.Item value="review">검토</Steps.Item><Steps.Item value="publish">게시</Steps.Item></Steps>);
    expect(screen.getByText("검토").closest("li")?.getAttribute("aria-current")).toBe("step");
  });

  it("TableOfContents는 문서 안의 현재 위치를 표시한다", () => {
    render(<TableOfContents value="shape"><TableOfContents.Item value="color">Color</TableOfContents.Item><TableOfContents.Item value="shape" depth={1}>Shape</TableOfContents.Item></TableOfContents>);
    expect(screen.getByRole("link", { name: "Shape" }).getAttribute("aria-current")).toBe("location");
  });

  it("DropdownMenu는 trigger와 선택 후 닫힘을 연결한다", () => {
    const onValueChange = vi.fn();
    render(<DropdownMenu onValueChange={onValueChange}><DropdownMenu.Trigger><Button>더 보기</Button></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item value="edit">편집</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu>);
    fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "편집" }));
    expect(onValueChange).toHaveBeenCalledWith("edit");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("CommandMenu는 검색된 명령을 Enter로 선택한다", () => {
    const onSelect = vi.fn();
    render(<CommandMenu onSelect={onSelect}><CommandMenu.Item value="issues">이슈 열기</CommandMenu.Item><CommandMenu.Item value="docs" keywords={["가이드"]}>문서 열기</CommandMenu.Item></CommandMenu>);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "문서" } });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("docs");
  });

  it("TreeNavigation은 branch를 접고 펼친다", () => {
    render(<TreeNavigation defaultExpandedValues={["docs"]}><TreeNavigation.Item value="docs" label="문서"><TreeNavigation.Item value="tokens" label="토큰" /></TreeNavigation.Item></TreeNavigation>);
    const branch = screen.getByRole("treeitem", { name: "문서" });
    expect(branch.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(branch);
    expect(branch.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("treeitem", { name: "토큰" })).toBeNull();
  });
});
