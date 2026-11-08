import { useSyncExternalStore } from "react";

import { tokens } from "@studio-baeks/paper-ui/tokens";

type Step = "sm" | "md" | "lg" | "xl";

export const useAtLeast = (step: Step) => {
  const query = `(min-width: ${tokens.layout.breakpoint[step]})`;
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => true,
  );
};
