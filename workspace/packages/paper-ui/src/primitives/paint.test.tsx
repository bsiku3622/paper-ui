import { createRef, type ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { elevation } from "../index";
import { Box, Paint, Stack, Surface, paintClass, surfaceClass } from "./index";
import { surfaceBorder, surfaceRadius } from "./paint/Surface.css";
import { accentVariantClass, fillClass, hoverGate } from "../styles/color.css";
import { spaceClass } from "../styles/space.css";
import { ACCENTS, ELEVATIONS, SURFACE_FILLS, VARIANTS } from "../tokens";
import { stackRoot } from "./layout/flex.css";

// Never rendered: each line only has to compile.
const compiles = (...elements: ReactElement[]) => elements.length;

describe("Surface", () => {
  it("[primitives.surface.classes] turns fill, border, radius and elevation into the classes of their own maps", () => {
    render(<Surface data-testid="surface" fill="raised" border radius="md" elevation="overlay" padding="md" />);
    const element = screen.getByTestId("surface");
    for (const className of [fillClass.raised, surfaceBorder, surfaceRadius.md, elevation.overlay, spaceClass.padding.md]) {
      expect(element.classList.contains(className), className).toBe(true);
    }
  });

  it("[primitives.surface.classes] gives surfaceClass the same classes for everything but the theme", () => {
    expect(surfaceClass({ fill: "sunken", border: true, radius: "full", elevation: "modal" })).toBe(
      [fillClass.sunken, surfaceBorder, surfaceRadius.full, elevation.modal].join(" "),
    );
    expect(surfaceClass({})).toBe("");
    for (const fill of SURFACE_FILLS) expect(surfaceClass({ fill }), fill).toBe(fillClass[fill]);
  });

  it("[primitives.surface.classes] stays one element when it stands on Stack, and keeps Stack's own classes and props", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Surface as={Stack} ref={ref} data-testid="surface" gap="md" fill="raised" border align="center" />);
    expect(container.querySelectorAll("*")).toHaveLength(1);
    const element = screen.getByTestId("surface");
    expect(ref.current).toBe(element);
    for (const className of [stackRoot, spaceClass.gap.md, fillClass.raised, surfaceBorder]) expect(element.classList.contains(className), className).toBe(true);
  });

  it("[primitives.surface.classes] takes each tier's class from the public elevation map, and nothing else with it", () => {
    expect(Object.keys(elevation)).toEqual([...ELEVATIONS]);
    expect(new Set(Object.values(elevation)).size).toBe(ELEVATIONS.length);
    for (const tier of ELEVATIONS) {
      render(<Surface data-testid={tier} elevation={tier} />);
      expect(screen.getByTestId(tier).getAttribute("class"), tier).toBe(elevation[tier]);
      expect(surfaceClass({ elevation: tier }), tier).toBe(elevation[tier]);
    }
  });

  it("[primitives.surface.classes] paints nothing it was not asked to", () => {
    render(<Surface data-testid="plain" />);
    expect(screen.getByTestId("plain").getAttribute("class") ?? "").toBe("");
  });

  it("[primitives.surface.classes] takes paint props that Box and the layout primitives do not", () => {
    compiles(
      <Surface as={Stack} gap="md" fill="raised" />,
      <Surface as={Stack} gap="md" align="center" justify="between" theme="inverse" border radius="lg" elevation="lifted" padding="md" />,
      <Surface as="section" fill="sunken" border />,
      // @ts-expect-error fill is Surface's, and Stack paints nothing
      <Stack fill="raised" />,
      // @ts-expect-error border is Surface's, and Box paints nothing
      <Box border />,
      // @ts-expect-error theme is Surface's
      <Box theme="dark" />,
      // @ts-expect-error radius is Surface's
      <Box radius="md" />,
      // @ts-expect-error elevation is Surface's
      <Box elevation="lifted" />,
      // @ts-expect-error a layout primitive takes no accent
      <Stack accent="info" />,
      // @ts-expect-error as={Stack} keeps Stack's prop names
      <Surface as={Stack} gapp="md" />,
      // @ts-expect-error wrap is Inline's, not Stack's
      <Surface as={Stack} wrap />,
    );
  });
});

describe("Paint", () => {
  it("[primitives.paint.classes] picks the accent × variant class, and solid when the variant is left out", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) expect(paintClass({ accent, variant }), `${accent} ${variant}`).toBe(accentVariantClass[accent][variant]);
      expect(paintClass({ accent }), accent).toBe(accentVariantClass[accent].solid);
    }
  });

  it("[primitives.paint.classes] paints nothing without an accent, and adds the hover gate only to what asks for it", () => {
    expect(paintClass({})).toBe("");
    expect(paintClass({ variant: "soft" })).toBe("");
    expect(paintClass({ accent: "info", variant: "soft" })).not.toContain(hoverGate);
    expect(paintClass({ accent: "info", variant: "soft", hoverable: true })).toBe([accentVariantClass.info.soft, hoverGate].join(" "));
  });

  it("[primitives.paint.classes] renders one element that carries the paint classes beside its own", () => {
    const { container } = render(<Paint data-testid="paint" accent="success" variant="hairline" hoverable padding="sm" className="mine" />);
    expect(container.querySelectorAll("*")).toHaveLength(1);
    const element = screen.getByTestId("paint");
    for (const className of [accentVariantClass.success.hairline, hoverGate, spaceClass.padding.sm, "mine"]) expect(element.classList.contains(className), className).toBe(true);
  });

  it("[primitives.paint.classes] takes the accent props that Box does not", () => {
    compiles(
      <Paint accent="error" variant="soft" hoverable />,
      <Paint as="span" accent="info" />,
      // @ts-expect-error accent is Paint's
      <Box accent="info" />,
      // @ts-expect-error hoverable is Paint's
      <Box hoverable />,
    );
  });
});
