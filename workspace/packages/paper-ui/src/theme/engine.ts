// engine.ts — the theme's rules and its reads of the document. No React and no CSS: the stylesheet
// (tokens/variables.css.ts) and this file apply the same rule, and the names they share come from
// tokens/color-modes.ts through the barrel.
//
// <html>'s attribute is the root's one truth. When it is absent, the OS decides — the stylesheet by
// media query, readRootMode by matchMedia.

import { COLOR_MODES, COLOR_MODE_QUERY, THEME_ATTRIBUTE, THEME_SWAP_ATTRIBUTE, type BoxTheme, type ColorMode, type ThemePreference } from "../tokens";

const isColorMode = (value: unknown): value is ColorMode => COLOR_MODES.some((mode) => mode === value);

export const invertMode = (mode: ColorMode): ColorMode => (mode === "dark" ? "light" : "dark");

// A Box's theme against the mode around it; "inverse" is the opposite of the ambient mode.
export const resolveBoxTheme = (theme: BoxTheme, ambient: ColorMode): ColorMode => (theme === "inverse" ? invertMode(ambient) : theme);

export const resolvePreference = (preference: ThemePreference, prefersDark: boolean): ColorMode =>
  preference === "system" ? (prefersDark ? "dark" : "light") : preference;

// The mode <html> shows: its attribute when that names a mode, else what the OS prefers.
export const readRootMode = (doc: Document = document): ColorMode => {
  const attribute = doc.documentElement.getAttribute(THEME_ATTRIBUTE);
  if (isColorMode(attribute)) return attribute;
  return doc.defaultView?.matchMedia(COLOR_MODE_QUERY).matches ? "dark" : "light";
};

// Calls back when the root's mode can have changed: its attribute is written, or the OS preference moves.
export const subscribeRootMode = (doc: Document, onChange: () => void): (() => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(doc.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  const query = doc.defaultView?.matchMedia(COLOR_MODE_QUERY);
  query?.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    query?.removeEventListener("change", onChange);
  };
};

// While a mode is being swapped, <html> carries the swap attribute so nothing transitions between the
// two. Holds are counted per document; the attribute stays until the last one is released.
const holds = new WeakMap<Document, number>();

export const holdTransitions = (doc: Document = document): (() => void) => {
  const root = doc.documentElement;
  holds.set(doc, (holds.get(doc) ?? 0) + 1);
  root.setAttribute(THEME_SWAP_ATTRIBUTE, "");
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds.set(doc, (holds.get(doc) ?? 1) - 1);
    const view = doc.defaultView;
    const settle = () => {
      if (holds.get(doc)) return;
      // The new values are computed while the hold is still on; removing it afterwards starts no transition.
      void view?.getComputedStyle(root).transitionDuration;
      root.removeAttribute(THEME_SWAP_ATTRIBUTE);
    };
    if (view) view.requestAnimationFrame(settle);
    else settle();
  };
};
