// The tools every hook-built element is composed with. The contract is Paper's own and is tested in composition.test.ts.

import type { CSSProperties, Ref } from "react";

import { joinClass } from "../internal/joinClass";
import { mergeRefs } from "../internal/refs";

export { mergeRefs };

type Props = { [key: string]: unknown };
type NullToObject<T> = T extends null | undefined ? object : T;
type UnionToIntersection<U> = (U extends unknown ? (value: U) => void : never) extends (value: infer I) => void ? I : never;
// A key whose type is only undefined adds nothing: an undefined never overrides.
type Defined<T> = { [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined> };
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? Defined<NullToObject<V>> : never;

const isHandler = (key: string, value: unknown): value is (...args: unknown[]) => void => /^on[A-Z]/.test(key) && typeof value === "function";

/**
 * Merges prop sets, left to right.
 * - `on[A-Z]*` handlers run one after the other, in argument order.
 * - `className` is joined.
 * - `style` is merged by key, later keys winning.
 * - `ref` is merged with mergeRefs. A null ref is no ref, so it never clears the one before it.
 * - Any other key takes the last value that is not undefined, so an undefined never overrides; `id` is not merged.
 */
export function mergeProps<T extends Array<object | null | undefined>>(...sets: T): UnionToIntersection<TupleTypes<T>> {
  const result: Props = {};
  for (const set of sets) {
    if (!set) continue;
    for (const [key, value] of Object.entries(set as Props)) {
      const previous = result[key];
      if (isHandler(key, previous) && isHandler(key, value)) {
        result[key] = (...args: unknown[]) => {
          previous(...args);
          value(...args);
        };
      } else if (key === "className") {
        result[key] = joinClass(previous as string | undefined, value as string | undefined) || undefined;
      } else if (key === "style" && typeof previous === "object" && previous && typeof value === "object" && value) {
        result[key] = { ...(previous as CSSProperties), ...(value as CSSProperties) };
      } else if (key === "ref") {
        if (value) result[key] = previous ? mergeRefs(previous as Ref<unknown>, value as Ref<unknown>) : value;
      } else if (value !== undefined) {
        result[key] = value;
      }
    }
  }
  return result as UnionToIntersection<TupleTypes<T>>;
}

/**
 * Composes a caller's handler with a component's own, caller first. The internal one is skipped only when the
 * caller prevented the default of an event that can be prevented; a notification such as a PressEvent cannot be,
 * so the internal handler always follows it.
 */
export function composeEventHandlers<E extends object>(caller?: (event: E) => void, internal?: (event: E) => void): (event: E) => void {
  return (event) => {
    caller?.(event);
    if (!("defaultPrevented" in event && event.defaultPrevented)) internal?.(event);
  };
}
