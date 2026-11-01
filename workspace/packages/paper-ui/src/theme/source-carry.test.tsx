import { fireEvent, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { describe, expect, it } from "vitest";

import { Portal } from "../primitives/a11y/Portal";
import { portalRoot } from "../primitives/a11y/Portal.css";
import { Floating } from "../primitives/float/Floating";
import { sourceCarry } from "./source-carry";

// jsdom does not cascade a custom property into a child, so the opener names its own overrides and the container names none.
const withStyle = (declarations: Record<string, string>) => {
  const element = document.createElement("div");
  for (const [name, value] of Object.entries(declarations)) element.style.setProperty(name, value);
  document.body.append(element);
  return element;
};

describe("sourceCarry", () => {
  it("[foundations.override.portal-carry] names the source variables the opener sets differently from the container, with the opener's values", () => {
    const opener = withStyle({ "--pui-shape-control-height-md": "40px", "--pui-shape-space-lg": "24px" });
    const container = document.createElement("div");
    document.body.append(container);
    expect(sourceCarry(opener, container)).toEqual({ "--pui-shape-control-height-md": "40px", "--pui-shape-space-lg": "24px" });
    opener.remove();
    container.remove();
  });

  it("[foundations.override.portal-carry] carries nothing that is the same on both sides, that is not a source variable, or from an opener that is not on the page", () => {
    const same = { "--pui-shape-space-md": "12px" };
    const opener = withStyle({ ...same, "--pui-color-ink-primary": "red", "--other": "1" });
    const container = withStyle(same);
    expect(sourceCarry(opener, container)).toEqual({});
    expect(sourceCarry(null, container)).toEqual({});
    opener.remove();
    expect(sourceCarry(opener, container)).toEqual({});
    container.remove();
  });
});

describe("Portal", () => {
  it("[primitives.portal.carry] puts the carry on the one root, in the first frame, from the element it names as the opener", () => {
    const opener = withStyle({ "--pui-shape-control-height-md": "40px" });
    render(<Portal opener={() => opener}><span>Inside</span></Portal>);
    const root = screen.getByText("Inside").parentElement!;
    expect(root.style.getPropertyValue("--pui-shape-control-height-md")).toBe("40px");
    opener.remove();
  });

  it("[primitives.portal.carry] takes the focused element as the opener when none is named, and carries nothing from the page itself", () => {
    const opener = withStyle({ "--pui-shape-space-lg": "24px" });
    opener.tabIndex = 0;
    opener.focus();
    const first = render(<Portal><span>Focused</span></Portal>);
    expect(screen.getByText("Focused").parentElement!.style.getPropertyValue("--pui-shape-space-lg")).toBe("24px");
    first.unmount();
    opener.remove();
    render(<Portal><span>Page</span></Portal>);
    expect(screen.getByText("Page").parentElement!.getAttribute("style")).toBeNull();
  });
});

describe("Floating", () => {
  const REGION = { "--pui-shape-control-height-md": "40px" } as CSSProperties;
  const carried = () => document.querySelector<HTMLElement>(`.${portalRoot}`)!.style.getPropertyValue("--pui-shape-control-height-md");

  it("[foundations.override.portal-carry] [primitives.floating.open-from-start] a panel open from its first render reads its Trigger, written above or below it, and not the element that holds the focus", () => {
    const elsewhere = withStyle({ "--pui-shape-control-height-md": "48px" });
    elsewhere.tabIndex = 0;
    const trigger = <Floating.Trigger style={REGION}>Open</Floating.Trigger>;
    for (const presentation of ["popover", "modal"] as const) {
      for (const open of [{ defaultOpen: true }, { open: true }]) {
        for (const below of [false, true]) {
          elsewhere.focus();
          const view = render(<Floating {...open}>{!below && trigger}<Floating.Content presentation={presentation} aria-label="Panel">Body</Floating.Content>{below && trigger}</Floating>);
          expect(carried(), `${presentation} ${Object.keys(open)[0]} ${below ? "below" : "above"}`).toBe("40px");
          view.unmount();
        }
      }
    }
    elsewhere.remove();
  });

  it("[foundations.override.portal-carry] a panel opened by its Trigger reads it, and one open from its first render with no Trigger or anchor reads the focused element", () => {
    const view = render(<Floating><Floating.Trigger style={REGION}>Open</Floating.Trigger><Floating.Content aria-label="Panel">Body</Floating.Content></Floating>);
    fireEvent.click(screen.getByText("Open"));
    expect(carried()).toBe("40px");
    view.unmount();
    const focused = withStyle(REGION as Record<string, string>);
    focused.tabIndex = 0;
    focused.focus();
    render(<Floating defaultOpen><Floating.Content presentation="modal" aria-label="Lone">Body</Floating.Content></Floating>);
    expect(carried()).toBe("40px");
    focused.remove();
  });
});
