// useStored — state that outlives a reload, for what a user makes in a demo (a note, a playlist, a setting).
// Kept in localStorage under "paper-apps:<key>"; a private window without storage keeps it for the page only.

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
      // No storage: the value lasts until the page reloads.
    }
  }, [key, value]);
  const reset = useCallback(() => setValue(typeof initial === "function" ? (initial as () => T)() : initial), [initial]);
  return [value, setValue, reset] as const;
};

// Forget everything one app stored, for its "처음 상태로" button.
export const clearStored = (prefix: string) => {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith(PREFIX + prefix)) localStorage.removeItem(key);
  } catch {
    // No storage, nothing to clear.
  }
};
