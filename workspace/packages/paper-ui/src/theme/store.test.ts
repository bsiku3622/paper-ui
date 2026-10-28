import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_ATTRIBUTE, THEME_SWAP_ATTRIBUTE } from "../tokens";
import { THEME_STORAGE_KEY } from "./engine";
import { getThemeStore } from "./store";

const root = document.documentElement;
const store = getThemeStore();

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

// jsdom here has no localStorage of its own; a test gets a fresh one that records its calls.
const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void data.set(key, value)),
  };
};
let storage = memoryStorage();

// Every attach of a test is released after it, so the next test starts from a store nobody holds.
let detaches: (() => void)[] = [];
const attach = () => {
  const detach = store.attach();
  detaches.push(detach);
  return detach;
};

beforeEach(() => {
  detaches = [];
  storage = memoryStorage();
  vi.stubGlobal("localStorage", storage);
  root.removeAttribute(THEME_ATTRIBUTE);
  root.removeAttribute(THEME_SWAP_ATTRIBUTE);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
});
afterEach(() => {
  detaches.forEach((detach) => detach());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("getThemeStore", () => {
  it("is one store per document", () => {
    expect(getThemeStore(document)).toBe(store);
    expect(getThemeStore(document.implementation.createHTMLDocument())).not.toBe(store);
  });
});

describe("the preference", () => {
  it("starts from the default theme and resolves it onto <html> when attached", () => {
    mockMedia(false);
    store.configure({ storageKey: THEME_STORAGE_KEY, defaultTheme: "dark" });
    expect(store.getPreference()).toBe("dark");
    attach();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(store.getMode()).toBe("dark");
  });

  it("starts from the stored choice, which beats the default, and ignores a stored value that is no theme", () => {
    mockMedia(false);
    storage.setItem(THEME_STORAGE_KEY, "light");
    store.configure({ storageKey: THEME_STORAGE_KEY, defaultTheme: "dark" });
    expect(store.getPreference()).toBe("light");
    attach()();
    storage.setItem(THEME_STORAGE_KEY, "sepia");
    expect(store.getPreference()).toBe("dark");
  });

  it("[foundations.theme.storage] setPreference writes the storage and the attribute, and tells subscribers", () => {
    mockMedia(false);
    store.configure({ storageKey: "custom-key", defaultTheme: "system" });
    attach();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setPreference("dark");
    expect(storage.getItem("custom-key")).toBe("dark");
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(store.getPreference()).toBe("dark");
    expect(store.getMode()).toBe("dark");
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("[foundations.theme.storage] a null storageKey never touches storage", () => {
    mockMedia(false);
    store.configure({ storageKey: null, defaultTheme: "light" });
    attach();
    store.setPreference("dark");
    expect(store.getPreference()).toBe("dark");
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("[foundations.theme.storage] keeps the choice for the page when storage throws", () => {
    mockMedia(false);
    storage.getItem.mockImplementation(() => { throw new Error("blocked"); });
    storage.setItem.mockImplementation(() => { throw new Error("blocked"); });
    store.configure({ storageKey: THEME_STORAGE_KEY, defaultTheme: "light" });
    attach();
    expect(() => store.setPreference("dark")).not.toThrow();
    expect(store.getPreference()).toBe("dark");
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("[foundations.theme.swap-instant] holds transitions around each write it makes", () => {
    mockMedia(false);
    store.configure({ storageKey: null, defaultTheme: "light" });
    attach();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    root.removeAttribute(THEME_SWAP_ATTRIBUTE);
    store.setPreference("dark");
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
  });
});

describe("system", () => {
  it("follows the OS while the preference is system, and stops following once a mode is chosen", () => {
    const media = mockMedia(false);
    store.configure({ storageKey: null, defaultTheme: "system" });
    attach();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    media.set(true);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(store.getMode()).toBe("dark");
    store.setPreference("light");
    media.set(false);
    media.set(true);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("light");
  });

  it("tells subscribers when the OS moves the mode", () => {
    const media = mockMedia(false);
    store.configure({ storageKey: null, defaultTheme: "system" });
    attach();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    media.set(true);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});

describe("the root attribute", () => {
  it("reads an external write and does not revert it", async () => {
    mockMedia(false);
    store.configure({ storageKey: null, defaultTheme: "light" });
    attach();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    await vi.waitFor(() => expect(listener).toHaveBeenCalled());
    expect(store.getMode()).toBe("dark");
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    unsubscribe();
  });

  it("stops watching <html> when the last subscriber leaves", async () => {
    mockMedia(false);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(listener).not.toHaveBeenCalled();
  });

  it("[foundations.theme.one-store] restores what <html> held before the first attach, only after the last detach", () => {
    mockMedia(false);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    store.configure({ storageKey: null, defaultTheme: "light" });
    const first = attach();
    const second = attach();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    first();
    first();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    second();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("removes the attribute again when it held none before the attach", () => {
    mockMedia(false);
    store.configure({ storageKey: null, defaultTheme: "dark" });
    attach()();
    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });
});

describe("configure", () => {
  it("[foundations.theme.one-store] logs a development error for a different configuration, once, and the first one wins", () => {
    mockMedia(false);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    store.configure({ storageKey: null, defaultTheme: "dark" });
    store.configure({ storageKey: null, defaultTheme: "dark" });
    expect(error).not.toHaveBeenCalled();
    store.configure({ storageKey: "other", defaultTheme: "light" });
    store.configure({ storageKey: "other", defaultTheme: "light" });
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.[0]).toContain("[paper-ui]");
    expect(store.getPreference()).toBe("dark");
    attach()();
  });

  it("takes a new configuration once every attach has been released", () => {
    mockMedia(false);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    store.configure({ storageKey: null, defaultTheme: "dark" });
    attach()();
    store.configure({ storageKey: null, defaultTheme: "light" });
    expect(error).not.toHaveBeenCalled();
    expect(store.getPreference()).toBe("light");
    attach()();
  });
});
