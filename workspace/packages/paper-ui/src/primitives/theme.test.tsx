import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Floating } from "./float/Floating";
import { Grid } from "./layout/Grid";
import { Inline } from "./layout/Inline";
import { Stack } from "./layout/Stack";
import { Surface } from "./paint/Surface";
import { fillClass } from "../styles/color.css";
import { ScopeModeContext, useResolvedTheme } from "../theme/context";
import { SURFACE_FILLS, THEME_ATTRIBUTE, type SurfaceTheme } from "../tokens";

const root = document.documentElement;

// The mode the nearest scope gives, written out so a test can read what context carries.
const Mode = ({ id }: { id: string }) => <span data-testid={id}>{useResolvedTheme()}</span>;

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
  root.removeAttribute(THEME_ATTRIBUTE);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Surface theme", () => {
  it("[primitives.surface.theme] inverse takes the opposite of the mode around it, on its own element and in context", () => {
    render(
      <ScopeModeContext.Provider value="dark">
        <Surface theme="inverse" data-testid="box"><Mode id="inside" /></Surface>
        <Mode id="outside" />
      </ScopeModeContext.Provider>,
    );
    expect(screen.getByTestId("box").getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(screen.getByTestId("inside").textContent).toBe("light");
    expect(screen.getByTestId("outside").textContent).toBe("dark");
  });

  it("[primitives.surface.theme] flips back in a nested inverse, and reads the page's mode when nothing is above it", () => {
    root.setAttribute(THEME_ATTRIBUTE, "light");
    render(
      <Surface theme="inverse" data-testid="outer">
        <Surface theme="inverse" data-testid="inner"><Mode id="inside" /></Surface>
      </Surface>,
    );
    expect(screen.getByTestId("outer").getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(screen.getByTestId("inner").getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(screen.getByTestId("inside").textContent).toBe("light");
  });

  it("[primitives.surface.theme] fixes light and dark whatever the mode around it", () => {
    for (const ambient of ["light", "dark"] as const) {
      const view = render(
        <ScopeModeContext.Provider value={ambient}>
          <Surface theme="dark" data-testid="dark"><Mode id="dark-inside" /></Surface>
          <Surface theme="light" data-testid="light"><Mode id="light-inside" /></Surface>
        </ScopeModeContext.Provider>,
      );
      expect(screen.getByTestId("dark").getAttribute(THEME_ATTRIBUTE), ambient).toBe("dark");
      expect(screen.getByTestId("dark-inside").textContent, ambient).toBe("dark");
      expect(screen.getByTestId("light").getAttribute(THEME_ATTRIBUTE), ambient).toBe("light");
      expect(screen.getByTestId("light-inside").textContent, ambient).toBe("light");
      view.unmount();
    }
  });

  it("[primitives.surface.theme] paints the theme's canvas unless it is given a fill", () => {
    render(
      <>
        <Surface theme="inverse" data-testid="board" />
        <Surface theme="dark" fill="raised" data-testid="raised" />
        <Surface data-testid="plain" />
      </>,
    );
    expect(screen.getByTestId("board").classList.contains(fillClass.canvas)).toBe(true);
    expect(screen.getByTestId("raised").classList.contains(fillClass.raised)).toBe(true);
    expect(screen.getByTestId("raised").classList.contains(fillClass.canvas)).toBe(false);
    for (const fill of SURFACE_FILLS) expect(screen.getByTestId("plain").classList.contains(fillClass[fill]), fill).toBe(false);
  });

  it("[primitives.surface.theme] writes no attribute and gives no scope without a theme", () => {
    render(<Surface data-testid="plain"><Mode id="inside" /></Surface>);
    expect(screen.getByTestId("plain").hasAttribute(THEME_ATTRIBUTE)).toBe(false);
    expect(screen.getByTestId("inside").textContent).toBe("light");
  });

  it("[primitives.surface.theme] reaches Stack, Inline and Grid through `as`, on the same element", () => {
    const themes: SurfaceTheme[] = ["dark", "light", "inverse"];
    render(
      <ScopeModeContext.Provider value="light">
        <Surface as={Stack} theme={themes[0]} data-testid="stack" />
        <Surface as={Inline} theme={themes[1]} data-testid="inline" />
        <Surface as={Grid} theme={themes[2]} data-testid="grid" />
      </ScopeModeContext.Provider>,
    );
    expect(screen.getByTestId("stack").getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(screen.getByTestId("inline").getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(screen.getByTestId("grid").getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("[foundations.theme.swap-instant] holds transitions when a Surface's mode changes between commits, and not on its first", () => {
    const swapping = () => root.hasAttribute("data-pui-theme-swap");
    const view = render(<ScopeModeContext.Provider value="light"><Surface theme="inverse" /></ScopeModeContext.Provider>);
    expect(swapping()).toBe(false);
    view.rerender(<ScopeModeContext.Provider value="dark"><Surface theme="inverse" /></ScopeModeContext.Provider>);
    expect(swapping()).toBe(true);
  });
});

describe("Portal scope", () => {
  it("[primitives.surface.theme] re-establishes the opener's mode on the portal root", () => {
    render(
      <Surface theme="dark">
        <Floating defaultOpen>
          <Floating.Trigger>Open</Floating.Trigger>
          <Floating.Content aria-label="Panel"><Mode id="panel" /></Floating.Content>
        </Floating>
      </Surface>,
    );
    const panel = screen.getByRole("dialog", { name: "Panel" });
    const portalRoot = panel.closest(`[${THEME_ATTRIBUTE}]`);
    expect(portalRoot?.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(panel.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
    expect(portalRoot?.closest("[data-testid]")).toBeNull();
    expect(screen.getByTestId("panel").textContent).toBe("dark");
  });
});
