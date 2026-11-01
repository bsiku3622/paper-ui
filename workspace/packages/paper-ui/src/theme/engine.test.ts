import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SURFACE_THEMES, COLOR_MODES, THEME_ATTRIBUTE, THEME_PREFERENCES, THEME_SWAP_ATTRIBUTE, type ColorMode } from "../tokens";
import { THEME_STORAGE_KEY, holdTransitions, invertMode, readRootMode, resolveSurfaceTheme, resolvePreference, subscribeRootMode, themeBootScript } from "./engine";

const root = document.documentElement;

// A matchMedia whose answer the test sets and whose change listeners it can fire.
const mockMedia = (matches: boolean) => {
  const listeners = new Set<() => void>();
  const query = {
    matches,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", vi.fn(() => query));
  return { listeners, set: (next: boolean) => { query.matches = next; listeners.forEach((listener) => listener()); } };
};

beforeEach(() => {
  root.removeAttribute(THEME_ATTRIBUTE);
  root.removeAttribute(THEME_SWAP_ATTRIBUTE);
});
afterEach(() => vi.unstubAllGlobals());

describe("the theme's pure rules", () => {
  it("[primitives.surface.theme] inverts each mode into the other", () => {
    expect(invertMode("light")).toBe("dark");
    expect(invertMode("dark")).toBe("light");
    for (const mode of COLOR_MODES) expect(invertMode(invertMode(mode))).toBe(mode);
  });

  it("[primitives.surface.theme] resolves a Surface theme against the mode around it", () => {
    for (const ambient of COLOR_MODES) {
      expect(resolveSurfaceTheme("inverse", ambient)).toBe(invertMode(ambient));
      for (const theme of SURFACE_THEMES.filter((theme): theme is ColorMode => theme !== "inverse")) expect(resolveSurfaceTheme(theme, ambient)).toBe(theme);
    }
  });

  it("[foundations.theme.choice-and-mode] resolves a preference, following the OS only for system", () => {
    for (const prefersDark of [true, false]) {
      expect(resolvePreference("system", prefersDark)).toBe(prefersDark ? "dark" : "light");
      expect(resolvePreference("light", prefersDark)).toBe("light");
      expect(resolvePreference("dark", prefersDark)).toBe("dark");
    }
    expect(THEME_PREFERENCES).toContain("system");
  });
});

describe("readRootMode", () => {
  it("[foundations.theme.root-attribute] reads the attribute when it names a mode, whatever the OS prefers", () => {
    const media = mockMedia(true);
    root.setAttribute(THEME_ATTRIBUTE, "light");
    expect(readRootMode()).toBe("light");
    media.set(false);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    expect(readRootMode()).toBe("dark");
  });

  it("[foundations.theme.root-attribute] follows the OS when there is no attribute, the way the stylesheet does", () => {
    const media = mockMedia(true);
    expect(readRootMode()).toBe("dark");
    media.set(false);
    expect(readRootMode()).toBe("light");
  });

  it("[foundations.theme.server-render] answers light, and subscribes without error, where the window has no matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(readRootMode()).toBe("light");
    subscribeRootMode(document, () => {})();
  });

  it("[foundations.theme.root-attribute] follows the OS when the attribute names no mode", () => {
    mockMedia(true);
    root.setAttribute(THEME_ATTRIBUTE, "sepia");
    expect(readRootMode()).toBe("dark");
  });
});

describe("subscribeRootMode", () => {
  it("[foundations.theme.root-attribute] calls back for an attribute write and for an OS change, and stops once unsubscribed", async () => {
    const media = mockMedia(false);
    const onChange = vi.fn();
    const unsubscribe = subscribeRootMode(document, onChange);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    media.set(true);
    expect(onChange).toHaveBeenCalledTimes(2);
    unsubscribe();
    expect(media.listeners.size).toBe(0);
    root.setAttribute(THEME_ATTRIBUTE, "light");
    media.set(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("[foundations.theme.swap-instant] holds transitions for a write it did not make and for an OS change, before it calls back", async () => {
    const media = mockMedia(false);
    const held: boolean[] = [];
    const unsubscribe = subscribeRootMode(document, () => held.push(root.hasAttribute(THEME_SWAP_ATTRIBUTE)));
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    expect(held).toEqual([]);
    await vi.waitFor(() => expect(held).toEqual([true]));
    root.removeAttribute(THEME_SWAP_ATTRIBUTE);
    media.set(true);
    expect(held).toEqual([true, true]);
    unsubscribe();
  });

  it("[foundations.theme.root-attribute] ignores other attributes of <html>", async () => {
    mockMedia(false);
    const onChange = vi.fn();
    const unsubscribe = subscribeRootMode(document, onChange);
    root.setAttribute("lang", "ko");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
    root.removeAttribute("lang");
  });
});

describe("holdTransitions", () => {
  // The next animation frame, run by hand.
  let frames: FrameRequestCallback[];
  const nextFrame = () => frames.splice(0).forEach((frame) => frame(0));

  beforeEach(() => {
    frames = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((frame) => frames.push(frame));
  });
  afterEach(() => vi.restoreAllMocks());

  it("[foundations.theme.swap-instant] sets the swap attribute at once and removes it on the next frame, after a style flush", () => {
    const flush = vi.spyOn(window, "getComputedStyle");
    const release = holdTransitions(document);
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    release();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    expect(flush).not.toHaveBeenCalled();
    nextFrame();
    expect(flush).toHaveBeenCalledWith(root);
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(false);
  });

  it("[foundations.theme.swap-instant] counts holds: the attribute stays until the last one is released and its frame has passed", () => {
    const first = holdTransitions(document);
    const second = holdTransitions(document);
    first();
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    second();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(false);
  });

  it("[foundations.theme.swap-instant] keeps the attribute when a new hold starts before the releasing frame", () => {
    holdTransitions(document)();
    const again = holdTransitions(document);
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    again();
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(false);
  });

  it("[foundations.theme.swap-instant] releases a hold once, however often its release is called", () => {
    const first = holdTransitions(document);
    const second = holdTransitions(document);
    first();
    first();
    first();
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    second();
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(false);
  });
});

describe("themeBootScript", () => {
  // jsdom here has no localStorage of its own; a test gives it one that holds what the test stored.
  const store = (stored: Record<string, string>) => {
    const getItem = vi.fn((key: string) => stored[key] ?? null);
    vi.stubGlobal("localStorage", { getItem });
    return getItem;
  };
  const boot = (options?: Parameters<typeof themeBootScript>[0]) => {
    root.removeAttribute(THEME_ATTRIBUTE);
    new Function(themeBootScript(options))();
    return root.getAttribute(THEME_ATTRIBUTE);
  };

  it("[foundations.theme.boot-before-paint] sets the attribute the way resolvePreference does, for every stored value, default and OS", () => {
    for (const prefersDark of [true, false]) {
      mockMedia(prefersDark);
      for (const stored of [undefined, ...THEME_PREFERENCES, "sepia"]) {
        for (const defaultTheme of THEME_PREFERENCES) {
          store(stored === undefined ? {} : { k: stored });
          const preference = THEME_PREFERENCES.find((candidate) => candidate === stored) ?? defaultTheme;
          expect(boot({ storageKey: "k", defaultTheme }), `${stored} / ${defaultTheme} / dark OS ${prefersDark}`).toBe(resolvePreference(preference, prefersDark));
        }
      }
    }
  });

  it("[foundations.theme.boot-before-paint] lets a stored light beat a dark OS", () => {
    mockMedia(true);
    store({ k: "light" });
    expect(boot({ storageKey: "k", defaultTheme: "system" })).toBe("light");
  });

  it("[foundations.theme.boot-before-paint] reads the default key and the system default when given no options", () => {
    mockMedia(true);
    const getItem = store({ [THEME_STORAGE_KEY]: "dark" });
    expect(boot()).toBe("dark");
    expect(getItem).toHaveBeenCalledWith("pui-theme");
    store({});
    expect(boot()).toBe("dark");
  });

  it("[foundations.theme.boot-before-paint] reads no storage for a null key, and falls back when storage throws", () => {
    mockMedia(false);
    const getItem = store({ k: "dark" });
    expect(boot({ storageKey: null, defaultTheme: "light" })).toBe("light");
    expect(getItem).not.toHaveBeenCalled();
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); } });
    expect(boot({ storageKey: "k", defaultTheme: "dark" })).toBe("dark");
  });

  it("[foundations.theme.boot-before-paint] is an expression that carries its options as data, so no option can end the script element", () => {
    mockMedia(false);
    const key = '</script><script>alert("x")</script>';
    const script = themeBootScript({ storageKey: key });
    expect(script).not.toContain("</script");
    const getItem = store({ [key]: "dark" });
    expect(boot({ storageKey: key })).toBe("dark");
    expect(getItem).toHaveBeenCalledWith(key);
  });
});

describe("the boot entry", () => {
  // Every module boot.ts reaches through relative imports, and the packages those modules import.
  const reach = (file: string, modules = new Set<string>(), packages = new Set<string>()) => {
    modules.add(file);
    for (const [, specifier = ""] of readFileSync(file, "utf8").matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
      if (!specifier.startsWith(".")) {
        packages.add(specifier);
        continue;
      }
      const base = resolve(dirname(file), specifier);
      const next = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find((candidate) => /\.tsx?$/.test(candidate) && existsSync(candidate));
      if (next && !modules.has(next)) reach(next, modules, packages);
    }
    return { modules, packages };
  };

  it("[install.entry.tokens-server-safe] imports no React and no CSS, however far its imports reach", () => {
    const { modules, packages } = reach(resolve(process.cwd(), "src/theme/boot.ts"));
    expect([...modules].length).toBeGreaterThan(1);
    expect([...packages]).toEqual([]);
    expect([...modules].filter((file) => /\.css\.ts$/.test(file))).toEqual([]);
  });
});
