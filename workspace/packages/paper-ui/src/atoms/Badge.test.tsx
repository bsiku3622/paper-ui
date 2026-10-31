import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { paintClass } from "../primitives/paint/Paint";
import { hoverGate } from "../styles/color.css";
import { ACCENTS, VARIANTS } from "../tokens";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("[atoms.badge.paint] is a span painted by Paint: one accent × variant class for every pair, and no hover gate", () => {
    for (const accent of ACCENTS) {
      for (const variant of VARIANTS) {
        const view = render(<Badge accent={accent} variant={variant} data-testid="badge">B</Badge>);
        const badge = view.getByTestId("badge");
        expect(badge.tagName, `${accent} ${variant}`).toBe("SPAN");
        for (const name of paintClass({ accent, variant }).split(" ")) expect(badge.classList.contains(name), `${accent} ${variant}`).toBe(true);
        expect(badge.classList.contains(hoverGate), `${accent} ${variant}`).toBe(false);
        expect(badge.hasAttribute("data-selected")).toBe(false);
        view.unmount();
      }
    }
  });

  it("[atoms.badge.paint] is soft and primary until it is told otherwise", () => {
    const view = render(<Badge data-testid="badge">B</Badge>);
    for (const name of paintClass({ accent: "primary", variant: "soft" }).split(" ")) expect(view.getByTestId("badge").classList.contains(name)).toBe(true);
  });
});
