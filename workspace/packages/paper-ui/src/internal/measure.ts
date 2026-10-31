// A step of the Layout scale as the pixels it is where it is used. Runtime geometry (a placement offset, a keyboard step)
// takes a role name like any other length, and the number the engine needs is read off the page, so a subtree that
// overrides the source or a root that scales still moves what is measured in it.

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Space } from "../tokens";
import { stepProbe } from "./measure.css";

export type MeasuredStep = Space | "gutter" | "none";

// jsdom lays nothing out, so every step reads 0 there. A step then counts as one pixel, which keeps a gap or a movement
// from vanishing in a test; `none` is always 0.
const UNMEASURED = 1;

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

/** The pixel width of `step` at `element`: a hidden probe is put inside it, read, and taken out again. */
export function measureSpace(step: MeasuredStep, element: Element): number {
  if (step === "none") return 0;
  const probe = element.ownerDocument.createElement("span");
  probe.className = stepProbe[step];
  element.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width > 0 ? width : UNMEASURED;
}

/** `measureSpace` while `active`: measured when it turns on and again when the window resizes (zoom and font size change rem). */
export function useMeasuredSpace(step: MeasuredStep, getElement: () => Element | null | undefined, active: boolean): number {
  const [pixels, setPixels] = useState(0);
  const element = useRef(getElement);
  element.current = getElement;
  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const measure = () => {
      const target = element.current();
      if (target) setPixels(measureSpace(step, target));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [step, active]);
  return pixels;
}
