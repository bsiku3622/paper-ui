import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import * as entry from "../index";
import { INVENTORY } from "../inventory";
import { iconSize } from "../primitives/Icon.css";
import { CONTROL_ICON, CONTROL_SIZES, STATUSES } from "../tokens";
import { Select } from "./Select";

afterEach(cleanup);

const choices = (
  <>
    <Select.Option value="">선택하세요</Select.Option>
    <Select.Option value="a">A</Select.Option>
  </>
);

describe("Select", () => {
  it("[atoms.select.native-form] [atoms.contract.axes] Option과 Group을 native select anatomy로 렌더한다", () => {
    render(
      <Select aria-label="선택">
        <Select.Option value="">선택하세요</Select.Option>
        <Select.Group label="추가 옵션">
          <Select.Option value="a">옵션 A</Select.Option>
          <Select.Option value="b" disabled>옵션 B</Select.Option>
        </Select.Group>
      </Select>,
    );

    const select = screen.getByRole("combobox", { name: "선택" });
    expect(within(select).getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("group", { name: "추가 옵션" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "옵션 B" }).hasAttribute("disabled")).toBe(true);
  });

  it("[atoms.select.native-form] ref와 폼 속성은 native select, className과 style은 wrapper로 전달한다", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<form aria-label="form"><Select ref={ref} name="choice" aria-label="choice" className="custom-select" style={{ width: 240 }} defaultValue="a">
      <Select.Option value="a">A</Select.Option>
      <Select.Option value="b">B</Select.Option>
    </Select></form>);
    const select = screen.getByRole("combobox", { name: "choice" });
    expect(ref.current).toBe(select);
    expect(select.parentElement!.classList.contains("custom-select")).toBe(true);
    expect(select.parentElement!.style.width).toBe("240px");
    fireEvent.change(select, { target: { value: "b" } });
    expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("choice")).toBe("b");
    expect(select.parentElement!.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("[atoms.select.native-form] puts data-testid on the wrapper and not on the select", () => {
    render(<Select aria-label="id" data-testid="wrapped">{choices}</Select>);
    const select = screen.getByRole("combobox", { name: "id" });
    expect(screen.getByTestId("wrapped")).toBe(select.parentElement);
    expect(select.hasAttribute("data-testid")).toBe(false);
  });

  it("[atoms.select.native-form] forwards the ref of an Option and of a Group to their elements", () => {
    const option = createRef<HTMLOptionElement>();
    const group = createRef<HTMLOptGroupElement>();
    render(<Select aria-label="refs"><Select.Group ref={group} label="G"><Select.Option ref={option} value="a">A</Select.Option></Select.Group></Select>);
    expect(option.current).toBe(screen.getByRole("option", { name: "A" }));
    expect(group.current).toBe(screen.getByRole("group", { name: "G" }));
  });

  it("[atoms.select.anatomy] reaches its option and group through Select alone: the entry exports neither under a name of its own", () => {
    expect(Select.Option).toBeTruthy();
    expect(Select.Group).toBeTruthy();
    for (const name of ["Option", "Group", "SelectOption", "SelectGroup"]) expect(name in entry, name).toBe(false);
    expect(INVENTORY.anatomy.Select).toEqual(["Option", "Group"]);
    expect(INVENTORY.atoms).not.toContain("Option");
  });

  it("[atoms.select.native-form] has no multiple: a select that lists its choices is a different control", () => {
    // @ts-expect-error a Select takes one value
    const many = <Select multiple aria-label="many">{choices}</Select>;
    expect(many).toBeTruthy();
  });

  it("[atoms.field.neutral-status] draws a status on the wrapper, and error also makes the select invalid", () => {
    render(<Select aria-label="neutral">{choices}</Select>);
    expect(screen.getByLabelText("neutral").parentElement!.hasAttribute("data-status")).toBe(false);
    expect(screen.getByLabelText("neutral").hasAttribute("aria-invalid")).toBe(false);
    cleanup();
    for (const status of STATUSES) {
      const { unmount } = render(<Select aria-label={status} status={status}>{choices}</Select>);
      const select = screen.getByLabelText(status);
      expect(select.parentElement!.getAttribute("data-status"), status).toBe(status);
      expect(select.getAttribute("aria-invalid"), status).toBe(status === "error" ? "true" : null);
      unmount();
    }
  });

  it("[atoms.field.neutral-status] takes its face from the fill prop, raised unless it is sunken", () => {
    const { rerender } = render(<Select aria-label="face">{choices}</Select>);
    const raised = screen.getByLabelText("face").parentElement!.className;
    rerender(<Select aria-label="face" fill="sunken">{choices}</Select>);
    expect(screen.getByLabelText("face").parentElement!.className).not.toBe(raised);
  });

  it("[atoms.focus.ring] [primitives.state.emitters] shows the keyboard's focus on the wrapper and not on the select", () => {
    render(<Select aria-label="ring">{choices}</Select>);
    const select = screen.getByLabelText("ring");
    fireEvent.keyDown(document.body, { key: "Tab" });
    act(() => select.focus());
    expect(select.parentElement!.getAttribute("data-focus-visible")).toBe("true");
    expect(select.hasAttribute("data-focus-visible")).toBe(false);
    act(() => select.blur());
    expect(select.parentElement!.hasAttribute("data-focus-visible")).toBe(false);
  });

  it("[atoms.field.frame] says disabled on the wrapper, which is where the stylesheet reads it", () => {
    render(<Select aria-label="off" disabled>{choices}</Select>);
    expect(screen.getByLabelText("off").parentElement!.hasAttribute("data-disabled")).toBe(true);
  });

  it("[atoms.select.native-form] draws its arrow as an Icon at the control's icon size", () => {
    for (const size of CONTROL_SIZES) {
      const { unmount } = render(<Select aria-label={size} size={size}>{choices}</Select>);
      expect(screen.getByLabelText(size).parentElement!.querySelector("svg")!.getAttribute("class")!.split(" "), size).toContain(iconSize[CONTROL_ICON[size]]);
      unmount();
    }
  });

  it("[atoms.select.native-form] hides its arrow from assistive technology and keeps it out of the Tab order", () => {
    render(<Select aria-label="arrow">{choices}</Select>);
    const arrow = screen.getByLabelText("arrow").parentElement!.querySelector("svg")!;
    expect(arrow.getAttribute("aria-hidden")).toBe("true");
    expect(arrow.getAttribute("focusable")).toBe("false");
    expect(arrow.hasAttribute("tabindex")).toBe(false);
    expect(arrow.getAttribute("role")).toBeNull();
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });
});
