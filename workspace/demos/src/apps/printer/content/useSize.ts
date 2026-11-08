// Content that draws itself at the pixel size of its place (a chart, a map) needs to know that size. Paper has no measuring part.

import { useEffect, useRef, useState } from "react";

export const useSize = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setSize({ width: Math.round(node.clientWidth), height: Math.round(node.clientHeight) });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
};
