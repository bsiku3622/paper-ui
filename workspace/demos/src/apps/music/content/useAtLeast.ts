// useAtLeast — whether the window is as wide as one of Paper's breakpoints. Box can hide a part *below* a breakpoint
// (`hideBelow`) but nothing says "only below", and a row of tracks needs to say its second line differently on a phone.
// The breakpoint is Paper's own value (tokens.layout.breakpoint), read at run time.

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
