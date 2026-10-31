import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FormField, Icon } from "../primitives";
import { iconSize } from "../primitives/Icon.css";
import { CONTROL_ICON, CONTROL_SIZES, STATUSES } from "../tokens";
import { Field } from "./Field";
import { fieldActionReach } from "./Field.css";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("lang");
});

const wrapperOf = (label: string) => screen.getByLabelText(label).parentElement as HTMLElement;

describe("Field", () => {
  it("sunken 표면과 leading/trailing adornment를 함께 렌더한다", () => {
    render(
      <Field
        fill="sunken"
        placeholder="작업 검색..."
        leading={<span>검색 아이콘</span>}
        trailing={<kbd>⌘ K</kbd>}
      />,
    );

    expect(screen.getByPlaceholderText("작업 검색...")).toBeTruthy();
    expect(screen.getByText("검색 아이콘")).toBeTruthy();
    expect(screen.getByText("⌘ K").tagName).toBe("KBD");
  });

  it("기본 fill은 raised다", () => {
    const { rerender } = render(<Field aria-label="raised" />);
    const raisedClass = screen.getByLabelText("raised").parentElement?.className;

    rerender(<Field aria-label="sunken" fill="sunken" />);
    const sunkenClass = screen.getByLabelText("sunken").parentElement?.className;

    expect(raisedClass).not.toBe(sunkenClass);
  });

  it("[atoms.field.neutral-status] status 를 생략하면 data-status 를 그리지 않는다", () => {
    render(<Field aria-label="neutral" />);
    const wrapper = screen.getByLabelText("neutral").parentElement as HTMLElement;
    expect(wrapper.hasAttribute("data-status")).toBe(false);
    expect(screen.getByLabelText("neutral").hasAttribute("aria-invalid")).toBe(false);
  });

  it("[atoms.field.neutral-status] status 를 주면 data-status 로 그리고, error 만 aria-invalid 를 건다", () => {
    for (const status of STATUSES) {
      const { unmount } = render(<Field aria-label={status} status={status} />);
      const input = screen.getByLabelText(status);
      expect(input.parentElement?.getAttribute("data-status"), status).toBe(status);
      expect(input.getAttribute("aria-invalid"), status).toBe(status === "error" ? "true" : null);
      unmount();
    }
  });

  it("[atoms.field.actions] clear tells onClear before it gives the focus back, so the input has the focus last", () => {
    const seen: (Element | null)[] = [];
    render(<Field aria-label="이름" clearable defaultValue="값" onClear={() => seen.push(document.activeElement)} />);
    const input = screen.getByLabelText("이름");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(seen).toEqual([document.body]);
    expect(document.activeElement).toBe(input);
  });

  it("[atoms.field.actions] clear is a button named by clearLabel or the locale's word, that empties the value, tells onChange and onClear, and gives the focus back to the input", () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    const view = render(<Field aria-label="이름" clearable defaultValue="값" onClear={onClear} onChange={onChange} />);
    const input = screen.getByLabelText("이름") as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(input.value).toBe("");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(input);
    expect(screen.queryByRole("button")).toBeNull();

    view.rerender(<Field aria-label="이름" clearable clearLabel="비우기" defaultValue="값" key="named" />);
    expect(screen.getByRole("button", { name: "비우기" })).toBeTruthy();
    cleanup();
    document.documentElement.lang = "ko";
    render(<Field aria-label="이름" clearable defaultValue="값" />);
    expect(screen.getByRole("button", { name: "지우기" })).toBeTruthy();
  });

  it("[atoms.field.actions] shows clear only while there is a value and the Field can be used", () => {
    const view = render(<Field aria-label="empty" clearable value="" onChange={() => {}} />);
    expect(screen.queryByRole("button")).toBeNull();
    view.rerender(<Field aria-label="empty" clearable value="x" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    view.rerender(<Field aria-label="empty" clearable disabled value="x" onChange={() => {}} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("[atoms.field.actions] reveal is a toggle button with one constant name, whose state is aria-pressed, and it is disabled together with the Field", () => {
    const view = render(<Field aria-label="secret" type="password" showPasswordToggle defaultValue="s" />);
    const input = screen.getByLabelText("secret") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(input.type).toBe("password");
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Show password" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(toggle);
    expect(input.type).toBe("password");

    view.rerender(<Field aria-label="secret" type="password" showPasswordToggle showPasswordLabel="보기" defaultValue="s" />);
    expect(screen.getByRole("button", { name: "보기" })).toBeTruthy();
    view.rerender(<Field aria-label="secret" type="password" showPasswordToggle disabled defaultValue="s" />);
    const off = screen.getByRole("button", { name: "Show password" }) as HTMLButtonElement;
    expect(off.disabled).toBe(true);
    expect(off.hasAttribute("data-disabled")).toBe(true);
    fireEvent.click(off);
    expect((screen.getByLabelText("secret") as HTMLInputElement).type).toBe("password");
    cleanup();
    render(<FormField label="Password" disabled><Field type="password" showPasswordToggle /></FormField>);
    expect((screen.getByRole("button", { name: "Show password" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("[atoms.field.actions] draws the action icons at the control's icon size, and an adornment's own size wins", () => {
    const sizes = CONTROL_SIZES.map((size) => {
      const { unmount } = render(<Field aria-label={size} size={size} clearable defaultValue="x" type="password" showPasswordToggle leading={<Icon size="label" data-testid="own" />} />);
      const classes = screen.getAllByRole("button").map((button) => button.querySelector("svg")!.getAttribute("class")!);
      const own = screen.getByTestId("own").getAttribute("class")!;
      unmount();
      return { size, classes, own };
    });
    for (const { size, classes, own } of sizes) {
      for (const icon of classes) expect(icon.split(" "), size).toContain(iconSize[CONTROL_ICON[size]]);
      expect(own.split(" "), size).toContain(iconSize.label);
    }
    expect(new Set(sizes.map(({ classes }) => classes[0])).size).toBe(3);
  });

  it("[atoms.field.actions] gives each action the hit area of its size, and a native button of its own type", () => {
    for (const size of CONTROL_SIZES) {
      const { unmount } = render(<Field aria-label={size} size={size} clearable defaultValue="x" type="password" showPasswordToggle />);
      for (const action of screen.getAllByRole("button")) {
        expect(action.classList.contains(fieldActionReach[size]), size).toBe(true);
        expect(action.getAttribute("type"), size).toBe("button");
      }
      unmount();
    }
  });

  it("[atoms.field.target] hands className, style and data-testid to the wrapper, and ref and native attributes to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Field ref={ref} name="who" placeholder="이름" aria-label="who" className="mine" style={{ width: 240 }} data-testid="who" />);
    const input = screen.getByLabelText("who");
    const wrapper = screen.getByTestId("who");
    expect(ref.current).toBe(input);
    expect(input.getAttribute("name")).toBe("who");
    expect(input.hasAttribute("data-testid")).toBe(false);
    expect(wrapper).toBe(input.parentElement);
    expect(wrapper.classList.contains("mine")).toBe(true);
    expect(wrapper.style.width).toBe("240px");
  });

  it("[atoms.focus.ring] shows the keyboard's focus on the wrapper and not on the input", () => {
    render(<Field aria-label="ring" />);
    const input = screen.getByLabelText("ring");
    const wrapper = wrapperOf("ring");
    fireEvent.keyDown(document.body, { key: "Tab" });
    act(() => input.focus());
    expect(wrapper.getAttribute("data-focus-visible")).toBe("true");
    expect(input.hasAttribute("data-focus-visible")).toBe(false);
    act(() => input.blur());
    expect(wrapper.hasAttribute("data-focus-visible")).toBe(false);
  });

  it("[atoms.focus.ring] leaves the caller's focus handlers running beside its own", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<Field aria-label="handlers" onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByLabelText("handlers");
    act(() => input.focus());
    act(() => input.blur());
    expect([onFocus.mock.calls.length, onBlur.mock.calls.length]).toEqual([1, 1]);
  });

  it("[atoms.field.frame] says disabled on the wrapper, which is where the stylesheet reads it", () => {
    render(<Field aria-label="off" disabled />);
    expect((screen.getByLabelText("off") as HTMLInputElement).disabled).toBe(true);
    expect(wrapperOf("off").hasAttribute("data-disabled")).toBe(true);
    cleanup();
    render(<Field aria-label="on" />);
    expect(wrapperOf("on").hasAttribute("data-disabled")).toBe(false);
  });
});
