import { createRef, type Ref } from "react";
import { describe, expect, it, vi } from "vitest";

import { composeEventHandlers, mergeProps, mergeRefs } from "./composition";

describe("mergeProps", () => {
  it("[primitives.composition.merge-props] runs the handlers of one event in argument order", () => {
    const calls: string[] = [];
    const merged = mergeProps({ onClick: () => calls.push("a") }, { onClick: () => calls.push("b") }, { onClick: () => calls.push("c") });
    merged.onClick();
    expect(calls).toEqual(["a", "b", "c"]);
  });

  it("[primitives.composition.merge-props] passes the same arguments to every handler and keeps handlers of different events apart", () => {
    const first = vi.fn();
    const second = vi.fn();
    const other = vi.fn();
    const merged = mergeProps({ onKeyDown: first, onFocus: other }, { onKeyDown: second });
    merged.onKeyDown({ key: "a" });
    expect(first).toHaveBeenCalledWith({ key: "a" });
    expect(second).toHaveBeenCalledWith({ key: "a" });
    expect(other).not.toHaveBeenCalled();
    expect(merged.onFocus).toBe(other);
  });

  it("[primitives.composition.merge-props] joins className", () => {
    expect(mergeProps({ className: "a" }, { className: "b c" }, { className: undefined }).className).toBe("a b c");
    expect(mergeProps({ className: undefined as string | undefined }, { className: undefined as string | undefined }).className).toBeUndefined();
  });

  it("[primitives.composition.merge-props] merges style by key, later keys winning", () => {
    expect(mergeProps({ style: { color: "red", margin: 1 } }, { style: { color: "blue" } }, { style: undefined }).style).toEqual({ color: "blue", margin: 1 });
  });

  it("[primitives.composition.merge-props] never lets an undefined override a value, and takes the last defined one otherwise", () => {
    const merged = mergeProps({ title: "a", role: "button", "aria-label": "x" }, { title: undefined, role: "link" }, { "aria-label": undefined });
    expect(merged).toEqual({ title: "a", role: "link", "aria-label": "x" });
    expect(mergeProps({ tabIndex: 0 }, { tabIndex: -1 }).tabIndex).toBe(-1);
    expect(mergeProps({ disabled: true }, { disabled: false }).disabled).toBe(false);
  });

  it("[primitives.composition.merge-props] never lets a null ref clear the ref beside it", () => {
    const hook = vi.fn();
    const none = null as Ref<unknown>;
    expect(mergeProps({ ref: hook }, { ref: none }).ref).toBe(hook);
    expect(mergeProps({ ref: none }, { ref: hook }).ref).toBe(hook);
  });

  it("[primitives.composition.merge-props] does not merge ids: the last one wins", () => {
    expect(mergeProps({ id: "a" }, { id: "b" }).id).toBe("b");
    expect(mergeProps({ id: "a" }, { id: undefined }).id).toBe("a");
  });

  it("[primitives.composition.merge-props] merges an object ref and a callback ref, and calls the callback with null on unmount", () => {
    const object = createRef<HTMLElement>();
    const callback = vi.fn();
    const ref = mergeProps({ ref: object }, { ref: callback }).ref;
    const node = document.createElement("div");
    ref(node);
    expect(object.current).toBe(node);
    expect(callback).toHaveBeenLastCalledWith(node);
    ref(null);
    expect(object.current).toBeNull();
    expect(callback).toHaveBeenLastCalledWith(null);
  });

  it("[primitives.composition.merge-props] ignores null and undefined sets", () => {
    expect(mergeProps(null, { a: 1 }, undefined)).toEqual({ a: 1 });
  });
});

describe("mergeRefs", () => {
  it("[primitives.composition.merge-props] feeds every callback and object ref, and skips an absent one", () => {
    const object = createRef<HTMLElement>();
    const callback = vi.fn();
    const ref = mergeRefs(object, undefined, null, callback);
    const node = document.createElement("span");
    ref(node);
    expect(object.current).toBe(node);
    expect(callback).toHaveBeenCalledWith(node);
  });

  it("[primitives.composition.merge-props] runs the cleanup a callback ref returned instead of calling it with null", () => {
    const cleanup = vi.fn();
    const withCleanup = vi.fn(() => cleanup);
    const plain = vi.fn();
    const ref = mergeRefs(withCleanup, plain);
    const node = document.createElement("span");
    ref(node);
    ref(null);
    expect(withCleanup).toHaveBeenCalledTimes(1);
    expect(withCleanup).toHaveBeenCalledWith(node);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(plain).toHaveBeenLastCalledWith(null);
  });
});

describe("composeEventHandlers", () => {
  it("[primitives.composition.compose-handlers] runs the caller, then the internal handler", () => {
    const calls: string[] = [];
    composeEventHandlers(() => calls.push("caller"), () => calls.push("internal"))({});
    expect(calls).toEqual(["caller", "internal"]);
  });

  it("[primitives.composition.compose-handlers] skips the internal handler after the caller prevented the default of a cancelable event", () => {
    const internal = vi.fn();
    const event = new MouseEvent("click", { cancelable: true });
    composeEventHandlers((e: Event) => e.preventDefault(), internal)(event);
    expect(internal).not.toHaveBeenCalled();
    composeEventHandlers((e: Event) => e.stopPropagation(), internal)(new MouseEvent("click", { cancelable: true }));
    expect(internal).toHaveBeenCalledTimes(1);
  });

  it("[primitives.composition.compose-handlers] always runs the internal handler for an event that cannot be prevented", () => {
    const internal = vi.fn();
    composeEventHandlers((e: { type: string }) => e.type, internal)({ type: "press" });
    expect(internal).toHaveBeenCalledTimes(1);
  });

  it("[primitives.composition.compose-handlers] accepts a missing side", () => {
    const internal = vi.fn();
    composeEventHandlers(undefined, internal)({});
    expect(internal).toHaveBeenCalledTimes(1);
    expect(() => composeEventHandlers(() => {}, undefined)({})).not.toThrow();
  });
});
