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

export const useNarrow = () => !useMedia(`(min-width: ${tokens.layout.breakpoint.md})`);
