import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { paintClass } from "../primitives/paint/Paint";
import { Sidebar } from "./Sidebar";
import { sidebarScrim } from "./Sidebar.css";

let drawer = false;

beforeEach(() => {
  drawer = false;
  window.matchMedia = ((query: string) => ({
    matches: drawer && query.startsWith("not all and"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const classesOf = (element: Element) => [...element.classList];

function Shell({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>메뉴</button>
      <Sidebar label="Main" open={open} onOpenChange={(next) => { setOpen(next); onOpenChange?.(next); }}>
        <Sidebar.Group title="프린터">
          <Sidebar.Item as="a" href="/" current>대시보드</Sidebar.Item>
          <Sidebar.Item as="a" href="/files">파일</Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Divider />
        <Sidebar.Footer>
          <Sidebar.Item>업로드</Sidebar.Item>
        </Sidebar.Footer>
      </Sidebar>
    </>
  );
}

describe("Sidebar", () => {
  it("[components.sidebar.current] marks the current item with aria-current and the muted face, and every other item stays ghost", () => {
    render(<Shell />);
    const current = screen.getByRole("link", { name: "대시보드" });
    const other = screen.getByRole("link", { name: "파일" });
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(other.hasAttribute("aria-current")).toBe(false);
    const muted = paintClass({ accent: "primary", variant: "muted", hoverable: true }).split(" ");
    const ghost = paintClass({ accent: "primary", variant: "ghost", hoverable: true }).split(" ");
    const onlyMuted = muted.filter((name) => !ghost.includes(name));
    expect(onlyMuted.length).toBeGreaterThan(0);
    expect(onlyMuted.every((name) => current.classList.contains(name) && !other.classList.contains(name))).toBe(true);
  });

  it("[components.sidebar.landmark] is a navigation named by label, whose group is named by its title", () => {
    render(<Shell />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
    const group = screen.getByRole("group", { name: "프린터" });
    expect(group.contains(screen.getByRole("link", { name: "대시보드" }))).toBe(true);
  });

  it("[components.sidebar.landmark] leaves a group with no title as a plain wrapper", () => {
    render(<Sidebar label="Main"><Sidebar.Group><Sidebar.Item>하나</Sidebar.Item></Sidebar.Group></Sidebar>);
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("[components.sidebar.rail] stays reachable and takes no part in the open state while the page is wide", () => {
    render(<Shell />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.hasAttribute("inert")).toBe(false);
    expect(document.querySelector(`.${sidebarScrim}`)).toBeNull();
  });

  it("[components.sidebar.drawer] is inert while the drawer is closed, and reachable again when it opens", () => {
    drawer = true;
    render(<Shell />);
    const nav = document.querySelector("nav")!;
    expect(nav.hasAttribute("inert")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "메뉴" }));
    expect(nav.hasAttribute("inert")).toBe(false);
    expect(document.querySelector(`.${sidebarScrim}`)).not.toBeNull();
  });

  it("[components.sidebar.drawer] takes focus when it opens and gives it back to what opened it when it closes", () => {
    drawer = true;
    render(<Shell />);
    const opener = screen.getByRole("button", { name: "메뉴" });
    act(() => opener.focus());
    fireEvent.click(opener);
    expect(document.querySelector("nav")!.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(document.activeElement).toBe(opener);
  });

  it("[components.sidebar.dismiss] closes on Escape", () => {
    drawer = true;
    const onOpenChange = vi.fn();
    render(<Shell onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: "메뉴" }));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.querySelector("nav")!.hasAttribute("inert")).toBe(true);
  });

  it("[components.sidebar.dismiss] closes when an item is pressed in the drawer, and leaves the rail alone", () => {
    drawer = true;
    const onOpenChange = vi.fn();
    render(<Shell onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: "메뉴" }));
    fireEvent.click(screen.getByRole("link", { name: "파일" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    cleanup();

    drawer = false;
    const onRail = vi.fn();
    render(<Shell onOpenChange={onRail} />);
    fireEvent.click(screen.getByRole("link", { name: "파일" }));
    expect(onRail).not.toHaveBeenCalled();
  });

  it("[components.sidebar.dismiss] closes when the scrim is pressed", () => {
    drawer = true;
    const onOpenChange = vi.fn();
    render(<Shell onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: "메뉴" }));
    fireEvent.click(document.querySelector(`.${sidebarScrim}`)!);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.querySelector(`.${sidebarScrim}`)).toBeNull();
  });

  it("[components.sidebar.drawer] never becomes a drawer with collapseBelow never", () => {
    drawer = true;
    render(<Sidebar label="Main" collapseBelow="never"><Sidebar.Item>하나</Sidebar.Item></Sidebar>);
    expect(document.querySelector("nav")!.hasAttribute("inert")).toBe(false);
    expect(classesOf(document.querySelector("nav")!).length).toBeGreaterThan(0);
  });

  it("[components.sidebar.drawer] is a drawer at every width with collapseBelow always, whatever the media say", () => {
    drawer = false;
    const { rerender } = render(<Sidebar label="Main" collapseBelow="always"><Sidebar.Item>하나</Sidebar.Item></Sidebar>);
    expect(document.querySelector("nav")!.hasAttribute("inert")).toBe(true);
    rerender(<Sidebar label="Main" collapseBelow="always" open><Sidebar.Item>하나</Sidebar.Item></Sidebar>);
    expect(document.querySelector("nav")!.hasAttribute("inert")).toBe(false);
  });

  it("[components.sidebar.offset] writes the bar height once, on the nav and the scrim", () => {
    drawer = true;
    render(<Sidebar label="Main" defaultOpen offset="3.5rem"><Sidebar.Item>하나</Sidebar.Item></Sidebar>);
    const nav = document.querySelector("nav")!;
    const scrim = document.querySelector<HTMLElement>(`.${sidebarScrim}`)!;
    expect(nav.getAttribute("style")).toMatch(/3\.5rem/);
    expect(scrim.getAttribute("style")).toBe(nav.getAttribute("style"));
  });
});
