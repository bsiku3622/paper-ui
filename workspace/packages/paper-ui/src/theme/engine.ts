import { COLOR_MODES, COLOR_MODE_QUERY, THEME_ATTRIBUTE, THEME_PREFERENCES, THEME_SWAP_ATTRIBUTE, type SurfaceTheme, type ColorMode, type ThemePreference } from "../tokens";

export const THEME_STORAGE_KEY = "pui-theme";

const isColorMode = (value: unknown): value is ColorMode => COLOR_MODES.some((mode) => mode === value);
export const isThemePreference = (value: unknown): value is ThemePreference => THEME_PREFERENCES.some((preference) => preference === value);

export const invertMode = (mode: ColorMode): ColorMode => (mode === "dark" ? "light" : "dark");

export const resolveSurfaceTheme = (theme: SurfaceTheme, ambient: ColorMode): ColorMode => (theme === "inverse" ? invertMode(ambient) : theme);

export const resolvePreference = (preference: ThemePreference, prefersDark: boolean): ColorMode =>
  preference === "system" ? (prefersDark ? "dark" : "light") : preference;

export const osModeQuery = (doc: Document): MediaQueryList | undefined => doc.defaultView?.matchMedia?.(COLOR_MODE_QUERY);

export const readRootMode = (doc: Document = document): ColorMode => {
  const attribute = doc.documentElement.getAttribute(THEME_ATTRIBUTE);
  if (isColorMode(attribute)) return attribute;
  return osModeQuery(doc)?.matches ? "dark" : "light";
};

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
      void view?.getComputedStyle(root).transitionDuration;
      root.removeAttribute(THEME_SWAP_ATTRIBUTE);
    };
    if (view) view.requestAnimationFrame(settle);
    else settle();
  };
};

// A mutation record arrives before the next style update, so a write is held. Chromium and WebKit report a media query's change
// after that update, so with no attribute on <html> the stylesheet has already flipped.
export const subscribeRootMode = (doc: Document, onChange: () => void): (() => void) => {
  const changed = () => {
    holdTransitions(doc)();
    onChange();
  };
  const observer = new MutationObserver(changed);
  observer.observe(doc.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  const query = osModeQuery(doc);
  query?.addEventListener("change", changed);
  return () => {
    observer.disconnect();
    query?.removeEventListener("change", changed);
  };
};

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
  storageKey?: string | null;
  defaultTheme?: ThemePreference;
};

export const themeBootScript = ({ storageKey = THEME_STORAGE_KEY, defaultTheme = "system" }: ThemeBootOptions = {}): string => {
  const args = [THEME_ATTRIBUTE, storageKey, defaultTheme, COLOR_MODE_QUERY].map((value) => JSON.stringify(value).replace(/</g, "\\u003c"));
  return `(${bootTheme})(${args.join(",")})`;
};
