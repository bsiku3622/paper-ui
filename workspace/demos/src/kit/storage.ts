import { useCallback, useEffect, useState } from "react";

const PREFIX = "paper-apps:";

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

export const useStored = <T,>(key: string, initial: T | (() => T)) => {
  const [value, setValue] = useState<T>(() => read(key, typeof initial === "function" ? (initial as () => T)() : initial));
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
    }
  }, [key, value]);
  const reset = useCallback(() => setValue(typeof initial === "function" ? (initial as () => T)() : initial), [initial]);
  return [value, setValue, reset] as const;
};

export const clearStored = (prefix: string) => {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith(PREFIX + prefix)) localStorage.removeItem(key);
  } catch {
  }
};
