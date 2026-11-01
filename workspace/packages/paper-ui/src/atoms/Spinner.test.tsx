// Spinner — 진행 중 표시. 혼자 서면 이름 있는 progressbar, 컨트롤 안이면 장식이다.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, expectTypeOf, it } from "vitest";

import { Spinner, type SpinnerProps } from "./Spinner";
import { spinnerInline, spinnerSize } from "./Spinner.css";
import { spinnerPaint } from "../primitives/paint/recipes.css";
import { loop } from "../styles/motion.css";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("lang");
});

describe("Spinner", () => {
  it("[atoms.spinner.roles] [atoms.contract.axes] is a progressbar with an aria-label and no value, named by the catalog unless given a label", () => {
    const view = render(<Spinner />);
    const bar = screen.getByRole("progressbar", { name: "Loading" });
    expect(bar.tagName).toBe("SPAN");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(bar.hasAttribute("aria-hidden")).toBe(false);
    view.rerender(<Spinner label="저장 중" />);
    expect(screen.getByRole("progressbar", { name: "저장 중" })).toBe(bar);
  });

  it("[atoms.spinner.roles] names itself in the language of the document", () => {
    document.documentElement.lang = "ko";
    render(<Spinner />);
    expect(screen.getByRole("progressbar", { name: "불러오는 중" })).toBeTruthy();
  });

  it("[atoms.spinner.roles] is hidden from assistive technology when decorative, with no role and no name", () => {
    const { container } = render(<Spinner decorative label="ignored" />);
    const span = container.firstElementChild!;
    expect(span.getAttribute("aria-hidden")).toBe("true");
    expect(span.hasAttribute("role")).toBe(false);
    expect(span.hasAttribute("aria-label")).toBe(false);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("[atoms.spinner.roles] turns with the one spin loop, takes its size from the control ladder or the line, and its colour from the paint tier", () => {
    const { container } = render(
      <>
        <Spinner size="sm" />
        <Spinner size="inline" ink="inherit" decorative />
        <Spinner />
      </>,
    );
    const [small, inline, plain] = [...container.children].map((node) => node.className.split(" "));
    for (const classes of [small, inline, plain]) expect(classes).toContain(loop.spin);
    expect(small).toContain(spinnerSize.sm);
    expect(inline).toContain(spinnerInline);
    expect(inline).toContain(spinnerPaint.inherit);
    expect(inline).not.toContain(spinnerPaint.ink);
    expect(plain).toContain(spinnerSize.md);
    expect(plain).toContain(spinnerPaint.ink);
  });

  it("[atoms.spinner.roles] has no keyframes of its own in any Atom stylesheet: the spin is Motion's one", () => {
    const atoms = dirname(fileURLToPath(import.meta.url));
    const sheets = readdirSync(atoms).filter((name) => name.endsWith(".css.ts"));
    expect(sheets).toContain("Spinner.css.ts");
    for (const sheet of sheets) expect(readFileSync(join(atoms, sheet), "utf8"), sheet).not.toMatch(/\bkeyframes\(/);
  });

  it("[atoms.spinner.roles] forwards a ref and the span's own attributes", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} data-testid="spin" id="s" />);
    expect(ref.current).toBe(screen.getByTestId("spin"));
    expect(ref.current?.id).toBe("s");
    expectTypeOf<SpinnerProps["size"]>().toEqualTypeOf<"sm" | "md" | "lg" | "inline" | undefined>();
    expectTypeOf<SpinnerProps["ink"]>().toEqualTypeOf<"inherit" | undefined>();
  });
});
