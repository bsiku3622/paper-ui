import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { STATUSES } from "../tokens";
import { Textarea } from "./Textarea";

afterEach(cleanup);

describe("Textarea", () => {
  it("[atoms.field.neutral-status] status 를 생략하면 data-status 를 그리지 않는다", () => {
    render(<Textarea aria-label="neutral" />);
    const textarea = screen.getByLabelText("neutral");
    expect(textarea.hasAttribute("data-status")).toBe(false);
    expect(textarea.hasAttribute("aria-invalid")).toBe(false);
  });

  it("[atoms.field.neutral-status] status 를 주면 data-status 로 그리고, error 만 aria-invalid 를 건다", () => {
    for (const status of STATUSES) {
      const { unmount } = render(<Textarea aria-label={status} status={status} />);
      const textarea = screen.getByLabelText(status);
      expect(textarea.getAttribute("data-status"), status).toBe(status);
      expect(textarea.getAttribute("aria-invalid"), status).toBe(status === "error" ? "true" : null);
      unmount();
    }
  });

  it("[atoms.textarea.rows] shows four rows unless rows says otherwise, and keeps the caller's other attributes", () => {
    const ref = createRef<HTMLTextAreaElement>();
    const view = render(<Textarea ref={ref} aria-label="rows" name="memo" />);
    const textarea = screen.getByLabelText("rows") as HTMLTextAreaElement;
    expect(textarea.rows).toBe(4);
    expect(ref.current).toBe(textarea);
    expect(textarea.getAttribute("name")).toBe("memo");
    view.rerender(<Textarea aria-label="rows" rows={1} />);
    expect(textarea.rows).toBe(1);
  });

  it("[atoms.textarea.rows] takes its face from the fill prop, raised unless it is sunken", () => {
    const { rerender } = render(<Textarea aria-label="raised" />);
    const raised = screen.getByLabelText("raised").className;
    rerender(<Textarea aria-label="raised" fill="sunken" />);
    expect(screen.getByLabelText("raised").className).not.toBe(raised);
    rerender(<Textarea aria-label="raised" fill="raised" />);
    expect(screen.getByLabelText("raised").className).toBe(raised);
  });

  it("[atoms.textarea.rows] stands on its own stylesheet: no import from Field, and no height floor of its own", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "Textarea.css.ts"), "utf8");
    const component = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "Textarea.tsx"), "utf8");
    expect(`${source}${component}`).not.toMatch(/Field\.css/);
    expect(source).not.toMatch(/minHeight|min-height/);
  });

  it("[atoms.focus.ring] is its own frame: the keyboard's focus lands on the textarea, and its handlers still run", () => {
    const onFocus = vi.fn();
    render(<Textarea aria-label="ring" onFocus={onFocus} />);
    const textarea = screen.getByLabelText("ring");
    fireEvent.keyDown(document.body, { key: "Tab" });
    act(() => textarea.focus());
    expect(textarea.getAttribute("data-focus-visible")).toBe("true");
    expect(onFocus).toHaveBeenCalledTimes(1);
    act(() => textarea.blur());
    expect(textarea.hasAttribute("data-focus-visible")).toBe(false);
  });

  it("[atoms.field.frame] says disabled on itself, which is where the stylesheet reads it", () => {
    render(<Textarea aria-label="off" disabled />);
    expect(screen.getByLabelText("off").hasAttribute("data-disabled")).toBe(true);
  });

  it("[atoms.textarea.rows] takes no pill shape", () => {
    // @ts-expect-error a multi-line control has no half-height corner
    const pill = <Textarea shape="pill" />;
    expect(pill).toBeTruthy();
  });
});
