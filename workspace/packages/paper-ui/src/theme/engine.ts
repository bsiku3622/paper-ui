// engine.ts — the theme's rules and its reads of the document. No React and no CSS: the stylesheet
// (tokens/variables.css.ts) and this file apply the same rule, and the names they share come from
// tokens/color-modes.ts through the barrel.
//
// <html>'s attribute is the root's one truth. When it is absent, the OS decides — the stylesheet by
// media query, readRootMode by matchMedia.

import { COLOR_MODES, COLOR_MODE_QUERY, THEME_ATTRIBUTE, THEME_PREFERENCES, THEME_SWAP_ATTRIBUTE, type SurfaceTheme, type ColorMode, type ThemePreference } from "../tokens";

// Where the user's choice is kept; the Provider and the boot script read the same key.
export const THEME_STORAGE_KEY = "pui-theme";

const isColorMode = (value: unknown): value is ColorMode => COLOR_MODES.some((mode) => mode === value);
export const isThemePreference = (value: unknown): value is ThemePreference => THEME_PREFERENCES.some((preference) => preference === value);

export const invertMode = (mode: ColorMode): ColorMode => (mode === "dark" ? "light" : "dark");

// A Surface's theme against the mode around it; "inverse" is the opposite of the ambient mode.
export const resolveSurfaceTheme = (theme: SurfaceTheme, ambient: ColorMode): ColorMode => (theme === "inverse" ? invertMode(ambient) : theme);

export const resolvePreference = (preference: ThemePreference, prefersDark: boolean): ColorMode =>
  preference === "system" ? (prefersDark ? "dark" : "light") : preference;

// What the OS prefers, as a media query; none where the window has no matchMedia (jsdom, a server).
export const osModeQuery = (doc: Document): MediaQueryList | undefined => doc.defaultView?.matchMedia?.(COLOR_MODE_QUERY);

// The mode <html> shows: its attribute when that names a mode, else what the OS prefers.
export const readRootMode = (doc: Document = document): ColorMode => {
  const attribute = doc.documentElement.getAttribute(THEME_ATTRIBUTE);
  if (isColorMode(attribute)) return attribute;
  return osModeQuery(doc)?.matches ? "dark" : "light";
};

// Calls back when the root's mode can have changed: its attribute is written, or the OS preference moves.
export const subscribeRootMode = (doc: Document, onChange: () => void): (() => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(doc.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  const query = osModeQuery(doc);
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

// Applies the stored choice to <html> before the app runs. themeBootScript serialises it with toString(),
// so it reads nothing from this module: the names arrive as arguments, and it checks a stored value
// against the preference literals itself (engine.test holds those to THEME_PREFERENCES).
export const bootTheme = (attribute: string, storageKey: string | null, fallback: string, query: string): void => {
  let preference = fallback;
  try {
    const stored = storageKey === null ? null : window.localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") preference = stored;
  } catch {
    // Storage can be blocked; the default applies.
  }
  document.documentElement.setAttribute(attribute, preference === "system" ? (window.matchMedia(query).matches ? "dark" : "light") : preference);
};

export type ThemeBootOptions = {
  // The key the choice is stored under; null reads none. Pass what <PaperProvider storageKey> gets.
  storageKey?: string | null;
  // The theme before the user has chosen. Pass what <PaperProvider defaultTheme> gets.
  defaultTheme?: ThemePreference;
};

// The inline script for <head>. "<" is escaped so no option can close the script element.
export const themeBootScript = ({ storageKey = THEME_STORAGE_KEY, defaultTheme = "system" }: ThemeBootOptions = {}): string => {
  const args = [THEME_ATTRIBUTE, storageKey, defaultTheme, COLOR_MODE_QUERY].map((value) => JSON.stringify(value).replace(/</g, "\\u003c"));
  return `(${bootTheme})(${args.join(",")})`;
};
