import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BOX_THEMES, COLOR_MODES, THEME_ATTRIBUTE, THEME_PREFERENCES, THEME_SWAP_ATTRIBUTE, type ColorMode } from "../tokens";
import { holdTransitions, invertMode, readRootMode, resolveBoxTheme, resolvePreference, subscribeRootMode } from "./engine";

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
  it("inverts each mode into the other", () => {
    expect(invertMode("light")).toBe("dark");
    expect(invertMode("dark")).toBe("light");
    for (const mode of COLOR_MODES) expect(invertMode(invertMode(mode))).toBe(mode);
  });

  it("resolves a Box theme against the mode around it", () => {
    for (const ambient of COLOR_MODES) {
      expect(resolveBoxTheme("inverse", ambient)).toBe(invertMode(ambient));
      for (const theme of BOX_THEMES.filter((box): box is ColorMode => box !== "inverse")) expect(resolveBoxTheme(theme, ambient)).toBe(theme);
    }
  });

  it("resolves a preference, following the OS only for system", () => {
    for (const prefersDark of [true, false]) {
      expect(resolvePreference("system", prefersDark)).toBe(prefersDark ? "dark" : "light");
      expect(resolvePreference("light", prefersDark)).toBe("light");
      expect(resolvePreference("dark", prefersDark)).toBe("dark");
    }
    expect(THEME_PREFERENCES).toContain("system");
  });
});

describe("readRootMode", () => {
  it("reads the attribute when it names a mode, whatever the OS prefers", () => {
    const media = mockMedia(true);
    root.setAttribute(THEME_ATTRIBUTE, "light");
    expect(readRootMode()).toBe("light");
    media.set(false);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    expect(readRootMode()).toBe("dark");
  });

  it("follows the OS when there is no attribute, the way the stylesheet does", () => {
    const media = mockMedia(true);
    expect(readRootMode()).toBe("dark");
    media.set(false);
    expect(readRootMode()).toBe("light");
  });

  it("follows the OS when the attribute names no mode", () => {
    mockMedia(true);
    root.setAttribute(THEME_ATTRIBUTE, "sepia");
    expect(readRootMode()).toBe("dark");
  });
});

describe("subscribeRootMode", () => {
  it("calls back for an attribute write and for an OS change, and stops once unsubscribed", async () => {
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

  it("ignores other attributes of <html>", async () => {
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

  it("sets the swap attribute at once and removes it on the next frame, after a style flush", () => {
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

  it("counts holds: the attribute stays until the last one is released and its frame has passed", () => {
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

  it("keeps the attribute when a new hold starts before the releasing frame", () => {
    holdTransitions(document)();
    const again = holdTransitions(document);
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(true);
    again();
    nextFrame();
    expect(root.hasAttribute(THEME_SWAP_ATTRIBUTE)).toBe(false);
  });

  it("releases a hold once, however often its release is called", () => {
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
