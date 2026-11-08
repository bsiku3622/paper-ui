// Is the window as wide as a media query says? The prototype folds its chrome for a phone; the screen needs to know which
// layout it is in, because a phone has no "일정 열기" button and its top bar has a calendar button instead.

import { useEffect, useState } from "react";

import { tokens } from "@studio-baeks/paper-ui/tokens";

export const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
};

// A phone: narrower than Paper's md.
export const useNarrow = () => !useMedia(`(min-width: ${tokens.layout.breakpoint.md})`);
