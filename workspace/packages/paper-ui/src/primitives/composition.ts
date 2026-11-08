import type { CSSProperties, Ref } from "react";

import { joinClass } from "../internal/joinClass";
import { mergeRefs } from "../internal/refs";

export { mergeRefs };

type Props = { [key: string]: unknown };
type NullToObject<T> = T extends null | undefined ? object : T;
type UnionToIntersection<U> = (U extends unknown ? (value: U) => void : never) extends (value: infer I) => void ? I : never;
type Defined<T> = { [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined> };
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? Defined<NullToObject<V>> : never;

const isHandler = (key: string, value: unknown): value is (...args: unknown[]) => void => /^on[A-Z]/.test(key) && typeof value === "function";

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

export function composeEventHandlers<E extends object>(caller?: (event: E) => void, internal?: (event: E) => void): (event: E) => void {
  return (event) => {
    caller?.(event);
    if (!("defaultPrevented" in event && event.defaultPrevented)) internal?.(event);
  };
}
