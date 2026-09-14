import { useCallback, useState } from "react";

export const useControllableState = <T>({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: T;
  defaultValue: T;
  onValueChange?: (value: T) => void;
}): readonly [T, (value: T) => void] => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;
  const setValue = useCallback((nextValue: T) => {
    if (!controlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }, [controlled, onValueChange]);
  return [resolvedValue, setValue] as const;
};
