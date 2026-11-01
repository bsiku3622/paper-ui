// Link — 딴 데로 가는 글자. 태그 하나만 그리고(라우터 Link 포함), 밑줄이 링크임을 알리며, 키보드 포커스를 스스로 판정한다.

import { createRef, forwardRef, type AnchorHTMLAttributes } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";

import { LINK_UNDERLINES } from "../tokens";
import { Link, type LinkProps } from "./Link";
import { linkUnderline } from "./Link.css";

const Router = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(function Router({ to, ...rest }, ref) {
  return <a ref={ref} href={to} {...rest} />;
});

describe("Link", () => {
  it("[atoms.link.underline] [atoms.contract.axes] underlines at rest by default and only on hover when asked", () => {
    expect(Object.keys(linkUnderline)).toEqual([...LINK_UNDERLINES]);
    render(<><Link href="#a">기본</Link><Link href="#b" underline="hover">호버</Link></>);
    const always = screen.getByRole("link", { name: "기본" }).className.split(" ");
    const hover = screen.getByRole("link", { name: "호버" }).className.split(" ");
    expect(always).toContain(linkUnderline.always);
    expect(always).not.toContain(linkUnderline.hover);
    expect(hover).toContain(linkUnderline.hover);
    expect(hover).not.toContain(linkUnderline.always);
    expectTypeOf<LinkProps["underline"]>().toEqualTypeOf<"always" | "hover" | undefined>();
  });

  it("[atoms.link.target] draws one tag: an <a> by default, and the router's own link when `as` names it, with that link's props", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<><Link ref={ref} href="/docs">문서</Link><Link as={Router} to="/demo" underline="hover">데모</Link></>);
    expect(screen.getByRole("link", { name: "문서" }).tagName).toBe("A");
    expect(ref.current).toBe(screen.getByRole("link", { name: "문서" }));
    const routed = screen.getByRole("link", { name: "데모" });
    expect(routed.getAttribute("href")).toBe("/demo");
    expect(document.querySelectorAll("a")).toHaveLength(2);
    // @ts-expect-error the router link needs its `to`
    const missing = <Link as={Router}>길</Link>;
    expect(missing).toBeTruthy();
  });

  it("[atoms.link.target] marks the keyboard focus on its own element, and not a pointer focus", () => {
    render(<Link href="#a">링크</Link>);
    const link = screen.getByRole("link", { name: "링크" });
    act(() => link.focus());
    expect(link.getAttribute("data-focused")).toBe("true");
    fireEvent.keyDown(link, { key: "Tab" });
    act(() => link.blur());
    act(() => link.focus());
    expect(link.getAttribute("data-focus-visible")).toBe("true");
  });

  it("[atoms.link.target] merges the caller's handlers and className with its own", () => {
    let focused = 0;
    render(<Link href="#a" className="mine" onFocus={() => { focused += 1; }}>링크</Link>);
    const link = screen.getByRole("link", { name: "링크" });
    expect(link.className.split(" ")).toContain("mine");
    act(() => link.focus());
    expect(focused).toBe(1);
  });
});
