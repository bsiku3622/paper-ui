// resolvers — 규칙의 주인. 브라우저 없이 검증하는 순수 로직 층.
// (렌더된 구조·색은 tests/playground.spec.ts 의 e2e 가 맡는다.)

import { describe, it, expect } from "vitest";

import { resolveStatus, resolveTone, resolveSurface, resolveAccent, resolveBoxClass } from "./index";

describe("resolveStatus", () => {
  it("status 를 accent tone 클래스로 — 이름이 곧 의미(info·success·warning·error)", () => {
    expect(resolveStatus("info")).toBe("pui-info-solid");
    expect(resolveStatus("success")).toBe("pui-success-solid");
    expect(resolveStatus("warning")).toBe("pui-warning-solid");
    expect(resolveStatus("error")).toBe("pui-error-solid");
  });
  it("tone 을 반영한다 (wash · dot)", () => {
    expect(resolveStatus("error", "wash")).toBe("pui-error-wash");
    expect(resolveStatus("info", "dot")).toBe("pui-info-dot");
  });
  it("status 없으면 빈 문자열", () => {
    expect(resolveStatus(undefined)).toBe("");
  });
});

describe("resolveSurface / resolveAccent / resolveTone", () => {
  it("surface(면) → pui-surface-{s}", () => {
    expect(resolveSurface("sunken")).toBe("pui-surface-sunken");
    expect(resolveSurface(undefined)).toBe("");
  });
  it("accent × variant → pui-a-{accent}-{variant} (variant 기본 solid)", () => {
    expect(resolveAccent("error", "soft")).toBe("pui-a-error-soft");
    expect(resolveAccent("primary")).toBe("pui-a-primary-solid");
    expect(resolveAccent("primary", "muted")).toBe("pui-a-primary-muted");
    expect(resolveAccent(undefined)).toBe("");
  });
  it("accent tone 은 기본이 solid", () => {
    expect(resolveTone("success")).toBe("pui-success-solid");
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
