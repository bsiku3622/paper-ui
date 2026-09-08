// Button 의 `as` — 태그가 갈리면 속성도 갈린다.
//
// <button> 만 갖는 속성(type·disabled)을 <a> 에 얹으면 무효 속성이 될 뿐 링크는 그대로
// 눌린다. 조용히 새는 계약이라 여기서 못 박는다.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button · as", () => {
  it("기본은 <button> 이고 type 이 붙는다", () => {
    render(<Button>저장</Button>);
    const el = screen.getByRole("button", { name: "저장" });
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("type")).toBe("button");
  });

  it("as='a' 면 링크 하나만 그린다 — 안에 button 이 없다", () => {
    render(
      <Button as="a" href="/docs" shape="pill">
        문서 읽기
      </Button>,
    );
    const el = screen.getByRole("link", { name: "문서 읽기" });
    expect(el.tagName).toBe("A");
    expect(el.querySelector("button")).toBeNull();
    // <button> 전용 속성은 안 새어 나간다.
    expect(el.hasAttribute("type")).toBe(false);
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("as 로 링크가 된 뒤 loading 이면 aria-disabled 와 탭 이탈로 막는다", () => {
    render(
      <Button as="a" href="/docs" loading>
        저장 중
      </Button>,
    );
    const el = screen.getByRole("link", { name: /저장 중/ });
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("<button> 일 때 loading 은 disabled 로 막는다", () => {
    render(<Button loading>저장 중</Button>);
    const el = screen.getByRole("button", { name: /저장 중/ });
    expect((el as HTMLButtonElement).disabled).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });
});
