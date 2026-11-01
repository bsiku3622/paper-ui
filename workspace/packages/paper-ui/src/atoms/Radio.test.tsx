import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Radio } from "./Radio";

afterEach(cleanup);

describe("Radio", () => {
  const group = (onChange?: () => void) => (
    <>
      <Radio name="plan" value="free" aria-label="Free" onChange={onChange} />
      <Radio name="plan" value="pro" aria-label="Pro" onChange={onChange} />
    </>
  );

  it("[atoms.mark.roles] [atoms.contract.axes] is a native radio: one choice stands in a group of one name, and the form reads its value", () => {
    render(<form data-testid="form">{group()}</form>);
    const [free, pro] = [screen.getByRole("radio", { name: "Free" }), screen.getByRole("radio", { name: "Pro" })] as HTMLInputElement[];
    expect([free!.type, pro!.type]).toEqual(["radio", "radio"]);
    fireEvent.click(free!);
    expect([free!.checked, pro!.checked]).toEqual([true, false]);
    fireEvent.click(pro!);
    expect([free!.checked, pro!.checked]).toEqual([false, true]);
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("plan")).toBe("pro");
  });

  it("[atoms.mark.roles] changes when it is chosen and not when it is already the choice, and says it is disabled with the native attribute", () => {
    const onChange = vi.fn();
    const { rerender } = render(group(onChange));
    fireEvent.click(screen.getByRole("radio", { name: "Free" }));
    fireEvent.click(screen.getByRole("radio", { name: "Free" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender(<Radio name="plan" value="pro" aria-label="Pro" onChange={onChange} disabled />);
    const pro = screen.getByRole("radio", { name: "Pro" }) as HTMLInputElement;
    expect(pro.disabled).toBe(true);
    expect(pro.hasAttribute("data-disabled")).toBe(true);
  });
});
