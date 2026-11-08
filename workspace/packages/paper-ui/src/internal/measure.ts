import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

import type { Space } from "../tokens";
import { stepProbe } from "./measure.css";

export type MeasuredStep = Space | "gutter" | "none";

// jsdom lays nothing out, so every step reads 0 there. A step then counts as one pixel, so a gap does not vanish in a test.
const UNMEASURED = 1;

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

export function measureSpace(step: MeasuredStep, element: Element): number {
  if (step === "none") return 0;
  const probe = element.ownerDocument.createElement("span");
  probe.className = stepProbe[step];
  element.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width > 0 ? width : UNMEASURED;
}

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

export function useSlidingThumb(root: RefObject<HTMLElement | null>, thumb: RefObject<HTMLElement | null>, selector: string, value: unknown): boolean {
  const [settled, setSettled] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const box = root.current;
    const moving = thumb.current;
    if (!box || !moving) return;
    const place = () => {
      const item = box.querySelector<HTMLElement>(selector);
      moving.style.width = `${item ? item.offsetWidth : 0}px`;
      moving.style.transform = `translateX(${item ? item.offsetLeft : 0}px)`;
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(box);
    for (const child of Array.from(box.children)) if (child !== moving) observer.observe(child);
    return () => observer.disconnect();
  }, [root, thumb, selector, value]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return settled;
}

export function rangeShare(value: number | undefined, min = 0, max = 100): number {
  const at = value ?? (min + max) / 2;
  return max > min ? Math.min(Math.max((at - min) / (max - min), 0), 1) : 0;
}
