import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { paintClass } from "../primitives/paint/Paint";
import { hoverGate } from "../styles/color.css";
import { ACCENTS, VARIANTS } from "../tokens";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("[atoms.badge.paint] [atoms.states.hover-table] is a span painted by Paint: one accent × variant class for every pair, and no hover gate", () => {
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

  it("[atoms.badge.paint] [atoms.contract.axes] is soft and primary until it is told otherwise", () => {
    const view = render(<Badge data-testid="badge">B</Badge>);
    for (const name of paintClass({ accent: "primary", variant: "soft" }).split(" ")) expect(view.getByTestId("badge").classList.contains(name)).toBe(true);
  });

  it("[atoms.badge.paint] draws the dot as a decoration: aria-hidden, no text, and only when it is asked for", () => {
    const { container, rerender } = render(<Badge dot>진행</Badge>);
    const dots = container.querySelectorAll("span > span");
    expect(dots).toHaveLength(1);
    expect(dots[0]!.getAttribute("aria-hidden")).toBe("true");
    expect(dots[0]!.textContent).toBe("");
    expect(container.textContent).toBe("진행");
    rerender(<Badge>진행</Badge>);
    expect(container.querySelectorAll("span > span")).toHaveLength(0);
  });
});
