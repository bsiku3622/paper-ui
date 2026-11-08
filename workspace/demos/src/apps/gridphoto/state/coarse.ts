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
