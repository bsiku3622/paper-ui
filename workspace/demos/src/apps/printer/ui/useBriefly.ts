import { useEffect, useState } from "react";

export const useBriefly = (key: string, ms: number) => {
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    setBusy(true);
    const timer = window.setTimeout(() => setBusy(false), ms);
    return () => window.clearTimeout(timer);
  }, [key, ms]);
  return busy;
};
