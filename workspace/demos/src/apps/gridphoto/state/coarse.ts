// The camera only makes sense where there is one in hand, and dragging a file only with a mouse.

import { useEffect, useState } from "react";

const QUERY = "(pointer: coarse)";

export const useCoarsePointer = () => {
  const [coarse, setCoarse] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const change = () => setCoarse(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return coarse;
};
