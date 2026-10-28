import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { DIVIDER_LEVELS, ORIENTATIONS } from "../tokens";
import { Divider } from "./Divider";
import { dividerLevel, dividerOrientation } from "./Divider.css";

const line = (element: ReactElement): HTMLElement => {
  const view = render(element);
  return view.container.querySelector("hr") as HTMLElement;
};

describe("Divider", () => {
  it("기본은 base 수평선이다", () => {
    const hr = line(<Divider />);
    expect(hr.getAttribute("aria-orientation")).toBe("horizontal");
    expect(hr.classList.contains(dividerOrientation.horizontal)).toBe(true);
    expect(hr.classList.contains(dividerLevel.base)).toBe(true);
  });

  it("[atoms.divider.orientation-level] orientation 은 class 와 aria-orientation 으로 간다", () => {
    for (const orientation of ORIENTATIONS) {
      const hr = line(<Divider orientation={orientation} />);
      expect(hr.getAttribute("aria-orientation"), orientation).toBe(orientation);
      expect(hr.classList.contains(dividerOrientation[orientation]), orientation).toBe(true);
    }
  });

  it("[atoms.divider.orientation-level] level 은 class 로 간다", () => {
    for (const level of DIVIDER_LEVELS) {
      const hr = line(<Divider level={level} />);
      expect(hr.classList.contains(dividerLevel[level]), level).toBe(true);
    }
    expect(new Set(DIVIDER_LEVELS.map((level) => dividerLevel[level])).size).toBe(DIVIDER_LEVELS.length);
  });
});
