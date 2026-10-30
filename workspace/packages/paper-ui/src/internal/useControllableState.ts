import { useCallback, useRef, useState } from "react";

export type ControllableStateOptions<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
  // Whether two values are the same one; a set to the same value is not a change.
  equals?: (a: T, b: T) => boolean;
};

// The one rule behind every x / defaultX / onXChange triplet. A value that is not undefined makes the state
// controlled (null is a value). set compares against the latest value, which a ref follows between renders, so
// two sets in one handler compose; a set to the value it already has does nothing and notifies no one. read gives
// that latest value to a caller that derives the next one from it.
// Uncontrolled, set keeps the value and notifies; controlled, set only notifies and the owner decides.
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
