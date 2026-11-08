import { useCallback, useRef, useState } from "react";

export type ControllableStateOptions<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
  equals?: (a: T, b: T) => boolean;
};

// set compares against the latest value, which a ref follows between renders, so two sets in one handler compose.
export function useControllableState<T>({ value, defaultValue, onChange, equals = Object.is }: ControllableStateOptions<T>): readonly [T, (next: T) => void, () => T] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = value !== undefined ? value : internal;
  const latest = useRef(current);
  latest.current = current;
  const rules = useRef({ controlled, onChange, equals });
  rules.current = { controlled, onChange, equals };
  const set = useCallback((next: T) => {
    const { controlled: isControlled, onChange: notify, equals: same } = rules.current;
    if (same(next, latest.current)) return;
    if (!isControlled) {
      latest.current = next;
      setInternal(next);
    }
    notify?.(next);
  }, []);
  const read = useCallback(() => latest.current, []);
  return [current, set, read] as const;
}
