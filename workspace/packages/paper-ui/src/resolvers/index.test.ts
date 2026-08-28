// resolvers — 규칙의 주인. 브라우저 없이 검증하는 순수 로직 층.
// (렌더된 구조·색은 tests/playground.spec.ts 의 e2e 가 맡는다.)

import { describe, it, expect } from "vitest";

import { resolveStatus, resolveTone, resolveSurface, resolveColor, resolveBoxClass } from "./index";

describe("resolveStatus", () => {
  it("status 를 accent tone 클래스로 — 이름이 곧 의미(info·success·warning·error)", () => {
    expect(resolveStatus("info")).toBe("pui-info-ink");
    expect(resolveStatus("success")).toBe("pui-success-ink");
    expect(resolveStatus("warning")).toBe("pui-warning-ink");
    expect(resolveStatus("error")).toBe("pui-error-ink");
  });
  it("tone 을 반영한다 (wash · dot)", () => {
    expect(resolveStatus("error", "wash")).toBe("pui-error-wash");
    expect(resolveStatus("info", "dot")).toBe("pui-info-dot");
  });
  it("status 없으면 빈 문자열", () => {
    expect(resolveStatus(undefined)).toBe("");
  });
});

describe("resolveSurface / resolveColor / resolveTone", () => {
  it("surface(면) → pui-surface-{s}", () => {
    expect(resolveSurface("sunken")).toBe("pui-surface-sunken");
    expect(resolveSurface(undefined)).toBe("");
  });
  it("color × variant(잉크색) → pui-c-{color}-{variant} (variant 기본 solid)", () => {
    expect(resolveColor("error", "soft")).toBe("pui-c-error-soft");
    expect(resolveColor("primary")).toBe("pui-c-primary-solid");
    expect(resolveColor("primary", "quiet")).toBe("pui-c-primary-quiet");
    expect(resolveColor(undefined)).toBe("");
  });
  it("accent tone 은 기본이 ink", () => {
    expect(resolveTone("success")).toBe("pui-success-ink");
  });
});

describe("resolveBoxClass", () => {
  it("surface(면) + 간격을 공백으로 합친다 — Box 에 색은 없다", () => {
    expect(resolveBoxClass({ surface: "sunken", padding: "md", gap: "sm" })).toBe(
      "pui-surface-sunken pui-p-md pui-gap-sm",
    );
  });
  it("빈 입력은 빈 문자열", () => {
    expect(resolveBoxClass({})).toBe("");
  });
});
