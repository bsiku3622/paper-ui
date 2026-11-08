import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sliderShareProperty } from "../primitives/paint/recipes.css";
import { FormField } from "../primitives/field/FormField";
import { Slider } from "./Slider";

afterEach(cleanup);

const share = (input: HTMLElement) => input.style.getPropertyValue(sliderShareProperty);

describe("Slider", () => {
  it("[atoms.slider.native] is the native range: the role, the bounds and the value are the browser's", () => {
    render(<Slider aria-label="예산" min={0} max={200} step={10} defaultValue={50} />);
    const input = screen.getByRole("slider", { name: "예산" }) as HTMLInputElement;
    expect(input.type).toBe("range");
    expect(input.min).toBe("0");
    expect(input.max).toBe("200");
    expect(input.step).toBe("10");
    expect(input.value).toBe("50");
  });

  it("[atoms.slider.fill] fills as far as the value stands, starts in the middle when it has none, and follows a change", () => {
    const { rerender } = render(<Slider aria-label="a" />);
    const input = screen.getByRole("slider");
    expect(share(input)).toBe("0.5");
    rerender(<Slider aria-label="a" value={25} onChange={() => {}} />);
    expect(share(input)).toBe("0.25");
    cleanup();
    render(<Slider aria-label="b" defaultValue={10} />);
    const free = screen.getByRole("slider") as HTMLInputElement;
    expect(share(free)).toBe("0.1");
    fireEvent.change(free, { target: { value: "80" } });
    expect(share(free)).toBe("0.8");
  });

  it("[atoms.slider.fill] keeps the fill inside the track when the value is out of range, and calls the caller first", () => {
    const onChange = vi.fn();
    render(<Slider aria-label="c" value={300} onChange={onChange} />);
    const input = screen.getByRole("slider");
    expect(share(input)).toBe("1");
    fireEvent.change(input, { target: { value: "10" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("[atoms.slider.native] takes its relations and its error from a FormField like the other inputs", () => {
    render(<FormField label="값" invalid><Slider defaultValue={1} /></FormField>);
    const input = screen.getByRole("slider", { name: "값" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("data-status")).toBe("error");
  });
});
