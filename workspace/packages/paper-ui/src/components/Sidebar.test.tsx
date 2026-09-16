import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "./Sidebar";
import { sidebarItemActive } from "./Sidebar.css";

describe("Sidebar", () => {
  it("compound item과 badge가 root의 value context를 읽는다", () => {
    render(
      <Sidebar value="components">
        <Sidebar.Group label="문서">
          <Sidebar.Item value="components">컴포넌트<Sidebar.Badge color="info">NEW</Sidebar.Badge></Sidebar.Item>
          <Sidebar.Item value="tokens">토큰<Sidebar.Badge color="warning">MOD</Sidebar.Badge></Sidebar.Item>
        </Sidebar.Group>
      </Sidebar>,
    );

    expect(screen.getByText("컴포넌트").closest("button")?.getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("NEW").className).toContain("pui-c-info-soft");
    expect(screen.getByText("NEW").closest("button")?.className).toContain(sidebarItemActive);
    expect(screen.getByText("NEW").className).not.toContain("sidebarBadgeSelectedOverlay");
    expect(screen.getByText("MOD").className).not.toContain("sidebarBadgeSelectedOverlay");
  });

  it("item 선택과 badge selectedVariant를 각각 위임한다", () => {
    const onValueChange = vi.fn();
    render(
      <Sidebar value="components" onValueChange={onValueChange}>
        <Sidebar.Group>
          <Sidebar.Item value="components">
            컴포넌트<Sidebar.Badge color="info" selectedVariant="outline">NEW</Sidebar.Badge>
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar>,
    );

    fireEvent.click(screen.getByRole("button", { name: "컴포넌트NEW" }));
    expect(onValueChange).toHaveBeenCalledWith("components");
    expect(screen.getByText("NEW").className).toContain("pui-c-info-outline");
  });
});
