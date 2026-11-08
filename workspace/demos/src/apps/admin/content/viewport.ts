// Paper can hide a part below a breakpoint (Box hideBelow) but cannot say "only below one", so a table that becomes
// cards on a phone has to choose between two renderings. This asks the window, with the breakpoints Paper defines.

import { useEffect, useState } from "react";

import { tokens } from "@studio-baeks/paper-ui/tokens";
import type { Breakpoint } from "@studio-baeks/paper-ui/tokens";

export const useAtLeast = (breakpoint: Breakpoint) => {
  const query = `(min-width: ${tokens.layout.breakpoint[breakpoint]})`;
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
