import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../atoms";
import { tokens } from "../tokens";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("Trigger와 Content를 aria-describedby로 연결한다", () => {
    render(
      <Tooltip>
        <Tooltip.Trigger asChild><Button>도움말</Button></Tooltip.Trigger>
        <Tooltip.Content>추가 설명</Tooltip.Content>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "도움말" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.mouseEnter(trigger);
    const content = screen.getByRole("tooltip");
    expect(trigger.getAttribute("aria-describedby")).toBe(content.id);
    expect(content.style.width).toBe("max-content");
    expect(content.style.maxWidth).toBe(tokens.shape.width.xl.layout);
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("Content는 Box의 maxWidth를 그대로 받는다", () => {
    render(
      <Tooltip>
        <Tooltip.Trigger asChild><Button>도움말</Button></Tooltip.Trigger>
        <Tooltip.Content maxWidth="md">길이를 제한한 설명</Tooltip.Content>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "도움말" }));
    expect(screen.getByRole("tooltip").style.maxWidth).toBe(tokens.shape.width.md.layout);
  });
});
