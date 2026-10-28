import { StrictMode } from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_ATTRIBUTE } from "../tokens";
import { PaperProvider } from "./PaperProvider";
import { useResolvedTheme, useTheme, type ThemeControl } from "./context";

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
  return { set: (next: boolean) => { query.matches = next; listeners.forEach((listener) => listener()); } };
};

// jsdom here has no localStorage of its own.
const memoryStorage = () => {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => void data.set(key, value) };
};

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage());
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  root.removeAttribute(THEME_ATTRIBUTE);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useTheme", () => {
  it("throws an English error outside <PaperProvider>", () => {
    mockMedia(false);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow("useTheme must be used inside <PaperProvider>.");
    error.mockRestore();
  });

  it("reads the user's choice and the mode <html> shows, and sets a new choice", () => {
    mockMedia(false);
    const { result } = renderHook(() => useTheme(), { wrapper: ({ children }) => <PaperProvider storageKey={null} defaultTheme="system">{children}</PaperProvider> });
    expect(result.current).toMatchObject({ theme: "system", resolved: "light" });
    act(() => result.current.setTheme("dark"));
    expect(result.current).toMatchObject({ theme: "dark", resolved: "dark" });
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("[foundations.theme.one-store] gives nested Providers one control", () => {
    mockMedia(false);
    const seen: Record<string, ThemeControl> = {};
    const Probe = ({ name }: { name: string }) => {
      seen[name] = useTheme();
      return null;
    };
    render(
      <PaperProvider storageKey={null} defaultTheme="light">
        <Probe name="outer" />
        <PaperProvider storageKey={null} defaultTheme="light">
          <Probe name="inner" />
        </PaperProvider>
      </PaperProvider>,
    );
    expect(seen.inner).toEqual(seen.outer);
    act(() => seen.inner?.setTheme("dark"));
    expect(seen.outer).toMatchObject({ theme: "dark", resolved: "dark" });
    expect(seen.inner).toEqual(seen.outer);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });
});

describe("the root attribute", () => {
  it("is written from the choice, which a stored value decides over the default", () => {
    mockMedia(false);
    localStorage.setItem("pui-theme", "dark");
    render(<PaperProvider defaultTheme="light" />);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("[foundations.theme.one-store] is restored when the last Provider unmounts, and not before", () => {
    mockMedia(false);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    const outer = render(
      <PaperProvider storageKey={null} defaultTheme="light">
        <PaperProvider storageKey={null} defaultTheme="light" />
      </PaperProvider>,
    );
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    const sibling = render(<PaperProvider storageKey={null} defaultTheme="light" />);
    outer.unmount();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    sibling.unmount();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("is removed again on unmount when there was none, and survives StrictMode's second mount", () => {
    mockMedia(false);
    const view = render(<StrictMode><PaperProvider storageKey={null} defaultTheme="dark" /></StrictMode>);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    view.unmount();
    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it("follows the OS under system, and not under a chosen mode", () => {
    const media = mockMedia(false);
    const { result } = renderHook(() => useTheme(), { wrapper: ({ children }) => <PaperProvider storageKey={null}>{children}</PaperProvider> });
    act(() => media.set(true));
    expect(result.current.resolved).toBe("dark");
    act(() => result.current.setTheme("light"));
    act(() => media.set(false));
    act(() => media.set(true));
    expect(result.current.resolved).toBe("light");
  });

  it("[foundations.theme.storage] keeps the choice under the Provider's storageKey, and none with null", () => {
    mockMedia(false);
    const { result } = renderHook(() => useTheme(), { wrapper: ({ children }) => <PaperProvider storageKey="app-theme">{children}</PaperProvider> });
    act(() => result.current.setTheme("dark"));
    expect(localStorage.getItem("app-theme")).toBe("dark");
    expect(localStorage.getItem("pui-theme")).toBeNull();
  });
});

describe("useResolvedTheme", () => {
  it("[foundations.theme.one-store] outside a Provider reads <html>, and follows its changes", async () => {
    mockMedia(false);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("dark");
    act(() => root.setAttribute(THEME_ATTRIBUTE, "light"));
    await waitFor(() => expect(result.current).toBe("light"));
  });

  it("outside a Provider and with no attribute reads what the OS prefers", () => {
    const media = mockMedia(true);
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("dark");
    act(() => media.set(false));
    expect(result.current).toBe("light");
  });

  it("inside a Provider reads the mode <html> shows, an external write included", async () => {
    mockMedia(false);
    const { result } = renderHook(() => useResolvedTheme(), { wrapper: ({ children }) => <PaperProvider storageKey={null} defaultTheme="light">{children}</PaperProvider> });
    expect(result.current).toBe("light");
    act(() => root.setAttribute(THEME_ATTRIBUTE, "dark"));
    await waitFor(() => expect(result.current).toBe("dark"));
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });
});

describe("a server render", () => {
  // Each render gets modules of its own, so it meets a store nobody configured before.
  const fresh = async () => {
    vi.resetModules();
    const [{ PaperProvider: Provider }, { useResolvedTheme: useMode, useTheme: useControl }] = await Promise.all([import("./PaperProvider"), import("./context")]);
    const Readout = () => {
      const { theme, resolved } = useControl();
      return <>{theme}/{resolved}</>;
    };
    return { Provider, Readout, Mode: () => <>{useMode()}</> };
  };

  it("answers with the default theme, light for system, wraps nothing and writes nothing", async () => {
    mockMedia(true);
    const dark = await fresh();
    expect(renderToStaticMarkup(<dark.Provider defaultTheme="dark"><dark.Readout /></dark.Provider>)).toBe("dark/dark");
    const system = await fresh();
    expect(renderToStaticMarkup(<system.Provider defaultTheme="system"><system.Readout /></system.Provider>)).toBe("system/light");
    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it("reads light outside a Provider, whatever <html> shows", async () => {
    mockMedia(true);
    root.setAttribute(THEME_ATTRIBUTE, "dark");
    const { Mode } = await fresh();
    expect(renderToStaticMarkup(<Mode />)).toBe("light");
  });
});

describe("the stylesheet warning", () => {
  it("is logged once in development when styles.css is missing", async () => {
    mockMedia(false);
    vi.resetModules();
    const { PaperProvider: Fresh } = await import("./PaperProvider");
    const warn = vi.mocked(console.warn);
    warn.mockClear();
    render(<Fresh storageKey={null} />).unmount();
    render(<Fresh storageKey={null} />).unmount();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("styles.css");
  });
});
