import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { measureSpace, useMeasuredSpace } from "./measure";
import { stepProbe } from "./measure.css";

// jsdom lays nothing out; a probe reads the width the browser would give its step.
const laidOut = (widths: Record<string, number>) =>
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const width = widths[this.className] ?? 0;
    return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, width, height: 0, toJSON: () => ({}) } as DOMRect;
  });

afterEach(() => vi.restoreAllMocks());

describe("measureSpace", () => {
  it("counts a step as one pixel where nothing is laid out, and none as nothing", () => {
    const element = document.createElement("div");
    expect(measureSpace("sm", element)).toBe(1);
    expect(measureSpace("gutter", element)).toBe(1);
    expect(measureSpace("none", element)).toBe(0);
  });

  it("reads the width a probe has inside the element, and takes the probe out again", () => {
    const element = document.createElement("div");
    document.body.append(element);
    const seen: Array<{ parent: Element | null; className: string }> = [];
    const rect = laidOut({ [stepProbe.md]: 12, [stepProbe.gutter]: 16 });
    rect.mockImplementationOnce(function (this: Element) {
      seen.push({ parent: this.parentElement, className: this.className });
      return { width: 12 } as DOMRect;
    });
    expect(measureSpace("md", element)).toBe(12);
    expect(seen).toEqual([{ parent: element, className: stepProbe.md }]);
    expect(element.childElementCount).toBe(0);
    expect(measureSpace("gutter", element)).toBe(16);
    expect(element.childElementCount).toBe(0);
    element.remove();
  });

  it("measures no probe for none", () => {
    const element = document.createElement("div");
    const append = vi.spyOn(element, "append");
    measureSpace("none", element);
    expect(append).not.toHaveBeenCalled();
  });
});

describe("useMeasuredSpace", () => {
  function Probe({ step, active }: { step: Parameters<typeof measureSpace>[0]; active: boolean }) {
    const pixels = useMeasuredSpace(step, () => document.getElementById("host"), active);
    return <output>{pixels}</output>;
  }
  const host = () => <div id="host" />;

  it("reads 0 until it is active, then the measured width", () => {
    laidOut({ [stepProbe.lg]: 16 });
    const view = render(<>{host()}<Probe step="lg" active={false} /></>);
    expect(view.container.querySelector("output")!.textContent).toBe("0");
    view.rerender(<>{host()}<Probe step="lg" active /></>);
    expect(view.container.querySelector("output")!.textContent).toBe("16");
  });

  it("measures again when the window resizes", () => {
    const widths = { [stepProbe.sm]: 8 };
    laidOut(widths);
    const view = render(<>{host()}<Probe step="sm" active /></>);
    expect(view.container.querySelector("output")!.textContent).toBe("8");
    widths[stepProbe.sm] = 10;
    act(() => { window.dispatchEvent(new Event("resize")); });
    expect(view.container.querySelector("output")!.textContent).toBe("10");
  });

  it("stops listening once it is inactive or gone", () => {
    laidOut({ [stepProbe.sm]: 8 });
    const remove = vi.spyOn(window, "removeEventListener");
    const view = render(<>{host()}<Probe step="sm" active /></>);
    view.unmount();
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
