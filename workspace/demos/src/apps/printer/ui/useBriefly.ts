// Something that takes a moment on the real printer (reading a file, probing the bed) takes a moment here too: true for `ms`
// after `key` changes, so a screen can show a Spinner in the meantime.

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
