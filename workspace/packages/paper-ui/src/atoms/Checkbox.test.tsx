import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
  it("[atoms.checkbox.indeterminate] sets the indeterminate property from the prop, and clears it when the prop goes", () => {
    const view = render(<Checkbox aria-label="all" indeterminate />);
    const box = screen.getByLabelText("all") as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    view.rerender(<Checkbox aria-label="all" indeterminate={false} />);
    expect(box.indeterminate).toBe(false);
    view.rerender(<Checkbox aria-label="all" />);
    expect(box.indeterminate).toBe(false);
    view.rerender(<Checkbox aria-label="all" indeterminate />);
    expect(box.indeterminate).toBe(true);
  });

  it("[atoms.checkbox.indeterminate] does not call a callback ref again when indeterminate toggles", () => {
    const ref = vi.fn();
    const view = render(<Checkbox aria-label="all" ref={ref} />);
    const element = screen.getByLabelText("all");
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenLastCalledWith(element);
    for (const indeterminate of [true, false, true]) view.rerender(<Checkbox aria-label="all" ref={ref} indeterminate={indeterminate} />);
    expect(ref).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(ref).toHaveBeenCalledTimes(2);
    expect(ref).toHaveBeenLastCalledWith(null);
  });

  it("[atoms.checkbox.indeterminate] fills an object ref with the input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Checkbox aria-label="all" ref={ref} indeterminate />);
    expect(ref.current).toBe(screen.getByLabelText("all"));
    expect(ref.current?.indeterminate).toBe(true);
  });
});
