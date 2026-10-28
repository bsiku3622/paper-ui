import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Box, Grid, Inline, Overlay, Stack } from "./index";
import { ScopeModeContext, useResolvedTheme } from "../theme/context";
import { THEME_ATTRIBUTE, type BoxTheme } from "../tokens";

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

describe("Box theme", () => {
  it("[primitives.box.theme] inverse takes the opposite of the mode around it, on its own element and in context", () => {
    render(
      <ScopeModeContext.Provider value="dark">
        <Box theme="inverse" data-testid="box"><Mode id="inside" /></Box>
        <Mode id="outside" />
      </ScopeModeContext.Provider>,
    );
    expect(screen.getByTestId("box").getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(screen.getByTestId("inside").textContent).toBe("light");
    expect(screen.getByTestId("outside").textContent).toBe("dark");
  });

  it("[primitives.box.theme] flips back in a nested inverse, and reads the page's mode when nothing is above it", () => {
    root.setAttribute(THEME_ATTRIBUTE, "light");
    render(
      <Box theme="inverse" data-testid="outer">
        <Box theme="inverse" data-testid="inner"><Mode id="inside" /></Box>
      </Box>,
    );
    expect(screen.getByTestId("outer").getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(screen.getByTestId("inner").getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(screen.getByTestId("inside").textContent).toBe("light");
  });

  it("[primitives.box.theme] fixes light and dark whatever the mode around it", () => {
    for (const ambient of ["light", "dark"] as const) {
      const view = render(
        <ScopeModeContext.Provider value={ambient}>
          <Box theme="dark" data-testid="dark"><Mode id="dark-inside" /></Box>
          <Box theme="light" data-testid="light"><Mode id="light-inside" /></Box>
        </ScopeModeContext.Provider>,
      );
      expect(screen.getByTestId("dark").getAttribute(THEME_ATTRIBUTE), ambient).toBe("dark");
      expect(screen.getByTestId("dark-inside").textContent, ambient).toBe("dark");
      expect(screen.getByTestId("light").getAttribute(THEME_ATTRIBUTE), ambient).toBe("light");
      expect(screen.getByTestId("light-inside").textContent, ambient).toBe("light");
      view.unmount();
    }
  });

  it("[primitives.box.theme] paints the theme's canvas unless it is given a surface", () => {
    render(
      <>
        <Box theme="inverse" data-testid="board" />
        <Box theme="dark" surface="raised" data-testid="raised" />
        <Box data-testid="plain" />
      </>,
    );
    expect(screen.getByTestId("board").className).toContain("pui-surface-canvas");
    expect(screen.getByTestId("raised").className).toContain("pui-surface-raised");
    expect(screen.getByTestId("raised").className).not.toContain("pui-surface-canvas");
    expect(screen.getByTestId("plain").className).not.toContain("pui-surface-");
  });

  it("writes no attribute and gives no scope without a theme", () => {
    render(<Box data-testid="plain"><Mode id="inside" /></Box>);
    expect(screen.getByTestId("plain").hasAttribute(THEME_ATTRIBUTE)).toBe(false);
    expect(screen.getByTestId("inside").textContent).toBe("light");
  });

  it("is an axis of Stack, Inline and Grid as well", () => {
    const themes: BoxTheme[] = ["dark", "light", "inverse"];
    render(
      <ScopeModeContext.Provider value="light">
        <Stack theme={themes[0]} data-testid="stack" />
        <Inline theme={themes[1]} data-testid="inline" />
        <Grid theme={themes[2]} data-testid="grid" />
      </ScopeModeContext.Provider>,
    );
    expect(screen.getByTestId("stack").getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(screen.getByTestId("inline").getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(screen.getByTestId("grid").getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("[foundations.theme.swap-instant] holds transitions when a Box's mode changes between commits, and not on its first", () => {
    const swapping = () => root.hasAttribute("data-pui-theme-swap");
    const view = render(<ScopeModeContext.Provider value="light"><Box theme="inverse" /></ScopeModeContext.Provider>);
    expect(swapping()).toBe(false);
    view.rerender(<ScopeModeContext.Provider value="dark"><Box theme="inverse" /></ScopeModeContext.Provider>);
    expect(swapping()).toBe(true);
  });
});

describe("Overlay portal scope", () => {
  it("[primitives.box.theme] re-establishes the opener's mode on the portal element", () => {
    render(
      <Box theme="dark">
        <Overlay defaultOpen>
          <Overlay.Content aria-label="Panel"><Mode id="panel" /></Overlay.Content>
        </Overlay>
      </Box>,
    );
    const panel = screen.getByRole("dialog", { name: "Panel" });
    expect(panel.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(panel.closest("[data-testid]")).toBeNull();
    expect(screen.getByTestId("panel").textContent).toBe("dark");
  });
});
