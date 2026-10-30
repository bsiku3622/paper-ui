import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useControllableState } from "./useControllableState";

describe("useControllableState", () => {
  it("keeps the value when uncontrolled, and notifies once per change", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("does not notify, or render again, for the value it already has", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: "a", onChange }));
    act(() => result.current[1]("a"));
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current[1]("b"));
    act(() => result.current[1]("b"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("only notifies when controlled, and leaves the value to its owner", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useControllableState({ value, defaultValue: 0, onChange }), { initialProps: { value: 5 } });
    act(() => result.current[1](6));
    expect(onChange).toHaveBeenCalledWith(6);
    expect(result.current[0]).toBe(5);
    rerender({ value: 6 });
    expect(result.current[0]).toBe(6);
    act(() => result.current[1](6));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("treats null as a controlled value, and undefined as none", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }: { value: string | null | undefined }) => useControllableState<string | null | undefined>({ value, defaultValue: "start", onChange }), { initialProps: { value: null as string | null | undefined } });
    expect(result.current[0]).toBeNull();
    act(() => result.current[1]("next"));
    expect(onChange).toHaveBeenCalledWith("next");
    expect(result.current[0]).toBeNull();
    rerender({ value: undefined });
    expect(result.current[0]).toBe("start");
    act(() => result.current[1]("next"));
    expect(result.current[0]).toBe("next");
  });

  it("composes two sets in one handler through the latest value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 0, onChange }));
    act(() => {
      result.current[1](1);
      result.current[1](1);
      result.current[1](2);
    });
    expect(result.current[0]).toBe(2);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([1, 2]);
  });

  it("compares with the equals it is given", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: { x: 0, y: 0 }, onChange, equals: (a, b) => a.x === b.x && a.y === b.y }));
    act(() => result.current[1]({ x: 0, y: 0 }));
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current[1]({ x: 1, y: 0 }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("holds the identity of set across renders", () => {
    const { result, rerender } = renderHook(() => useControllableState({ defaultValue: 0, onChange: () => {} }));
    const first = result.current[1];
    rerender();
    expect(result.current[1]).toBe(first);
  });
});
