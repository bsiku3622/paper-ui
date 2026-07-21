// resolvers — 규칙의 주인. 브라우저 없이 검증하는 순수 로직 층.
// (렌더된 구조·색은 tests/playground.spec.ts 의 e2e 가 맡는다.)

import { describe, it, expect } from "vitest";

import { resolveStatus, resolveTone, resolvePaper, resolveBoxClass } from "./index";

describe("resolveStatus", () => {
  it("status 를 accent tone 클래스로 — info=blue · success=green · error=red", () => {
    expect(resolveStatus("info")).toBe("pui-blue-ink");
    expect(resolveStatus("success")).toBe("pui-green-ink");
    expect(resolveStatus("error")).toBe("pui-red-ink");
  });
  it("tone 을 반영한다 (wash · dot)", () => {
    expect(resolveStatus("error", "wash")).toBe("pui-red-wash");
    expect(resolveStatus("info", "dot")).toBe("pui-blue-dot");
  });
  it("status 없으면 빈 문자열", () => {
    expect(resolveStatus(undefined)).toBe("");
  });
});

describe("resolveTone / resolvePaper", () => {
  it("accent 는 기본이 ink tone", () => {
    expect(resolveTone("green")).toBe("pui-green-ink");
  });
  it("paper 는 base/subtle/muted", () => {
    expect(resolvePaper("subtle")).toBe("pui-paper-subtle");
    expect(resolvePaper(undefined)).toBe("");
  });
});

describe("resolveBoxClass", () => {
  it("여러 축을 공백으로 합친다", () => {
    expect(resolveBoxClass({ paper: "subtle", padding: "md", gap: "sm" })).toBe(
      "pui-paper-subtle pui-p-md pui-gap-sm",
    );
  });
  it("status 가 accent 보다 우선한다 (한 자리만 색)", () => {
    // status 와 accent 를 동시에 줘도 status 로 해석 (컴포넌트가 둘 다 넘기지 않게 하는 계약)
    expect(resolveBoxClass({ status: "error", accent: "blue", tone: "wash" })).toContain("pui-red-wash");
  });
  it("빈 입력은 빈 문자열", () => {
    expect(resolveBoxClass({})).toBe("");
  });
});
