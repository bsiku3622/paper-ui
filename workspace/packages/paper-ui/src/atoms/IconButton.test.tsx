// IconButton — 정사각 anatomy 와 부딪히는 축은 열지 않고, 안의 Icon 은 컨트롤 높이를 따른다.

import { createRef, forwardRef, type AnchorHTMLAttributes } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Floating } from "../primitives/float/Floating";
import { Icon } from "../primitives/Icon";
import { CONTROL_ICON, tokens } from "../tokens";
import { IconButton } from "./IconButton";

const glyph = <Icon><path d="M4 12h16" /></Icon>;
const iconClass = (name: string) => screen.getByRole("button", { name }).querySelector("svg")!.getAttribute("class")!;

describe("IconButton", () => {
  it("[atoms.icon-button.axes] [atoms.contract.axes] opens exactly the axes of a square: as, accent, variant, size, shape, disabled, iconSize", () => {
    // @ts-expect-error a square has no room for a spinner
    const loading = <IconButton aria-label="저장" loading>{glyph}</IconButton>;
    // @ts-expect-error a square is as wide as it is tall
    const full = <IconButton aria-label="저장" fullWidth>{glyph}</IconButton>;
    // @ts-expect-error the label is an icon, not a text role
    const font = <IconButton aria-label="저장" fontSize="label">{glyph}</IconButton>;
    // @ts-expect-error the name is the one thing an icon cannot say
    const nameless = <IconButton>{glyph}</IconButton>;
    const ok = <IconButton aria-label="저장" accent="error" variant="hairline" size="sm" shape="pill" disabled iconSize="caption">{glyph}</IconButton>;
    expect([loading, full, font, nameless, ok]).toHaveLength(5);
  });

  it("[atoms.icon-button.axes] forwards a ref to the button and renders the one element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} aria-label="추가">{glyph}</IconButton>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "추가" }));
    expect(ref.current?.type).toBe("button");
    expect(document.querySelectorAll("button")).toHaveLength(1);
  });

  it("[atoms.icon-button.axes] takes `as`, as a Button does", () => {
    const Router = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function Router(props, ref) { return <a ref={ref} href="/there" {...props} />; });
    render(<><IconButton as="a" href="/docs" aria-label="문서">{glyph}</IconButton><IconButton as={Router} aria-label="이동">{glyph}</IconButton></>);
    expect(screen.getByRole("link", { name: "문서" }).hasAttribute("type")).toBe(false);
    expect(screen.getByRole("link", { name: "이동" }).getAttribute("href")).toBe("/there");
  });

  it("[atoms.icon-button.axes] [foundations.shape.geometry-entry] gives the Icon inside the control's own size at each control size, and lets an explicit size win", () => {
    render(
      <>
        <IconButton aria-label="sm" size="sm">{glyph}</IconButton>
        <IconButton aria-label="md" size="md">{glyph}</IconButton>
        <IconButton aria-label="lg" size="lg">{glyph}</IconButton>
        <IconButton aria-label="forced" size="lg" iconSize="label">{glyph}</IconButton>
        <IconButton aria-label="own" size="lg"><Icon size="caption"><path d="M4 12h16" /></Icon></IconButton>
      </>,
    );
    const size = (name: string) => iconClass(name);
    expect(CONTROL_ICON).toEqual({ sm: "caption", md: "body", lg: "subheading" });
    expect(size("sm")).not.toBe(size("md"));
    expect(size("md")).not.toBe(size("lg"));
    expect(size("sm")).toBe(size("own"));
    expect(size("forced")).not.toBe(size("lg"));
    expect(tokens.shape.control.icon.sm).not.toBe(tokens.shape.control.icon.lg);
  });

  it("[atoms.icon-button.axes] press and disabled work as a Button's do", () => {
    const click = vi.fn();
    const view = render(<IconButton aria-label="추가" onClick={click}>{glyph}</IconButton>);
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(click).toHaveBeenCalledTimes(1);
    view.rerender(<IconButton aria-label="추가" onClick={click} disabled>{glyph}</IconButton>);
    expect((screen.getByRole("button", { name: "추가" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("[atoms.icon-button.axes] takes the look of a Paper part like a Button", () => {
    render(
      <Floating>
        <IconButton as={Floating.Trigger} aria-label="메뉴">{glyph}</IconButton>
        <Floating.Content aria-label="패널">내용</Floating.Content>
      </Floating>,
    );
    fireEvent.click(screen.getByRole("button", { name: "메뉴" }));
    expect(screen.getByRole("dialog", { name: "패널" })).toBeTruthy();
  });

  it("[atoms.icon-button.axes] asks for a name and for one Icon, which the types enforce", () => {
    const glyph = <Icon><path d="M2 2h4" /></Icon>;
    // @ts-expect-error an icon-only button has no text to name it, so aria-label is required
    render(<IconButton>{glyph}</IconButton>);
    // @ts-expect-error the label is one Icon, not a list
    render(<IconButton aria-label="Two">{[glyph, glyph]}</IconButton>);
    // @ts-expect-error loading belongs to the text Button
    render(<IconButton aria-label="Busy" loading>{glyph}</IconButton>);
    render(<IconButton aria-label="Named">{glyph}</IconButton>);
    expect(screen.getByRole("button", { name: "Named" })).toBeTruthy();
  });

  it("[atoms.icon-button.axes] forwards iconSize to the Icon inside, over the size its control would give", () => {
    render(<IconButton aria-label="Large glyph" size="sm" iconSize="subheading"><Icon><path d="M2 2h4" /></Icon></IconButton>);
    const svg = screen.getByRole("button", { name: "Large glyph" }).querySelector("svg")!;
    const small = render(<IconButton aria-label="Own size" size="sm"><Icon><path d="M2 2h4" /></Icon></IconButton>).container.querySelector("svg")!;
    expect(svg.getAttribute("class")).not.toBe(small.getAttribute("class"));
  });
});
