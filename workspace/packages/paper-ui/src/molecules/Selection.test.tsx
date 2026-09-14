import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { RadioGroup } from "./RadioGroup";
import { SegmentedControl } from "./SegmentedControl";
import { Tabs } from "./Tabs";

describe("selection naming contract", () => {
  it("Tabs는 defaultValue에서 시작해 onValueChange로 이동한다", () => {
    const onValueChange = vi.fn();
    render(<Tabs defaultValue="one" onValueChange={onValueChange}><Tabs.List><Tabs.Trigger value="one">하나</Tabs.Trigger><Tabs.Trigger value="two">둘</Tabs.Trigger></Tabs.List><Tabs.Content value="one">첫 내용</Tabs.Content><Tabs.Content value="two">둘째 내용</Tabs.Content></Tabs>);
    fireEvent.click(screen.getByRole("tab", { name: "둘" }));
    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(screen.getByRole("tab", { name: "둘" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("둘째 내용");
  });

  it("Tabs는 trigger와 panel을 연결하고 방향키로 다음 panel을 연다", () => {
    render(<Tabs defaultValue="one"><Tabs.List aria-label="문서"><Tabs.Trigger value="one">하나</Tabs.Trigger><Tabs.Trigger value="two">둘</Tabs.Trigger></Tabs.List><Tabs.Content value="one">첫 내용</Tabs.Content><Tabs.Content value="two">둘째 내용</Tabs.Content></Tabs>);
    const first = screen.getByRole("tab", { name: "하나" });
    first.focus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    const second = screen.getByRole("tab", { name: "둘" });
    const panel = screen.getByRole("tabpanel");
    expect(second.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(second.id);
    expect(panel.textContent).toBe("둘째 내용");
  });

  it("SegmentedControl은 같은 value 계약으로 radio 선택을 관리한다", () => {
    render(<SegmentedControl defaultValue="one"><SegmentedControl.Item value="one">하나</SegmentedControl.Item><SegmentedControl.Item value="two">둘</SegmentedControl.Item></SegmentedControl>);
    fireEvent.click(screen.getByRole("radio", { name: "둘" }));
    expect(screen.getByRole("radio", { name: "둘" }).getAttribute("aria-checked")).toBe("true");
  });

  it("RadioGroup은 같은 defaultValue 계약으로 uncontrolled 선택을 관리한다", () => {
    render(<RadioGroup defaultValue="one"><RadioGroup.Item value="one">하나</RadioGroup.Item><RadioGroup.Item value="two">둘</RadioGroup.Item></RadioGroup>);
    fireEvent.click(screen.getByRole("radio", { name: "둘" }));
    expect((screen.getByRole("radio", { name: "둘" }) as HTMLInputElement).checked).toBe(true);
  });

  it("Menu도 value 이름으로 현재 항목을 표시한다", () => {
    render(<Menu defaultValue="one"><Menu.Item value="one">하나</Menu.Item><Menu.Item value="two">둘</Menu.Item></Menu>);
    fireEvent.click(screen.getByRole("menuitem", { name: "둘" }));
    expect(screen.getByRole("menuitem", { name: "둘" }).getAttribute("aria-current")).toBe("page");
  });
});
