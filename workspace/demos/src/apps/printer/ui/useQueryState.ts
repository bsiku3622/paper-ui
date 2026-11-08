// A dialog or a view that a link can open: its state lives in the address (?file=…, ?settings=presets), so a screenshot,
// a reload and the back button all find it where it was.

import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useQueryState = (key: string) => {
  const [params, setParams] = useSearchParams();
  const value = params.get(key);
  const set = useCallback(
    (next: string | null) => {
      setParams(
        (now) => {
          const copy = new URLSearchParams(now);
          if (next === null) copy.delete(key);
          else copy.set(key, next);
          return copy;
        },
        { replace: true },
      );
    },
    [setParams, key],
  );
  return [value, set] as const;
};
