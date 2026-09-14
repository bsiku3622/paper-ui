import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { RadioGroup } from "./RadioGroup";
import { Tabs } from "./Tabs";

describe("selection naming contract", () => {
  it("Tabs는 defaultValue에서 시작해 onValueChange로 이동한다", () => {
    const onValueChange = vi.fn();
    render(<Tabs defaultValue="one" onValueChange={onValueChange}><Tabs.Item value="one">하나</Tabs.Item><Tabs.Item value="two">둘</Tabs.Item></Tabs>);
    fireEvent.click(screen.getByRole("tab", { name: "둘" }));
    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(screen.getByRole("tab", { name: "둘" }).getAttribute("aria-selected")).toBe("true");
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
