// Content: a face fixed to the window. "bottom" is a bar across the foot of the window (the editor's status bar) that leaves
// as much room under the page as it takes, so the page can scroll past it; "start" is a sheet over the left of the page.

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { elevation } from "@studio-baeks/paper-ui";

import { bar, rail } from "./pin.css";

export const Pin = ({ at, children }: { at: "bottom" | "start"; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || at !== "bottom") return;
    const watch = new ResizeObserver(() => setHeight(element.getBoundingClientRect().height));
    watch.observe(element);
    setHeight(element.getBoundingClientRect().height);
    return () => watch.disconnect();
  }, [at]);
  if (at === "start") return <div className={`${elevation.overlay} ${rail}`}>{children}</div>;
  return (
    <>
      <div aria-hidden style={{ height }} />
      <div ref={ref} className={`${elevation.sticky} ${bar}`}>
        {children}
      </div>
    </>
  );
};
