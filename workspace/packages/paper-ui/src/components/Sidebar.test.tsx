import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("활성 항목의 badge 면은 지우고 비활성 badge 면은 유지한다", () => {
    render(
      <Sidebar
        active="components"
        groups={[{
          value: "docs",
          items: [
            { value: "components", label: "컴포넌트", badge: { label: "NEW", color: "info" } },
            { value: "tokens", label: "토큰", badge: { label: "MOD", color: "warning" } },
          ],
        }]}
      />,
    );

    expect(screen.getByText("NEW").className).toContain("pui-c-info-quiet");
    expect(screen.getByText("MOD").className).toContain("pui-c-warning-soft");
  });

  it("badge의 resting·active variant를 명시적으로 바꿀 수 있다", () => {
    render(
      <Sidebar
        active="components"
        groups={[{
          value: "docs",
          items: [{
            value: "components",
            label: "컴포넌트",
            badge: { label: "NEW", color: "info", variant: "hairline", activeVariant: "outline" },
          }],
        }]}
      />,
    );

    expect(screen.getByText("NEW").className).toContain("pui-c-info-outline");
  });
});
