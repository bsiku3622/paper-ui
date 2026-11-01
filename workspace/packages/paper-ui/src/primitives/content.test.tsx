import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";

import { textMonoClass, textNumericClass, textRoleClass } from "../styles/typography.css";
import { ICON_SIZES, INKS, TEXT_INK, TEXT_VARIANTS, type IconSize, type TextVariant } from "../tokens";
import { resolveInk } from "../resolvers";
import { inkClass } from "../styles/color.css";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { iconRoot, iconSize } from "./Icon.css";
import { IconSizeContext } from "./icon-context";

describe("Text", () => {
  it("[primitives.text.default-tag] draws its role with the tag that role implies, hero and display as the page's h1", () => {
    const tags = { hero: "H1", display: "H1", title: "H1", heading: "H2", subheading: "H3", body: "P", caption: "P", label: "SPAN" };
    expect(Object.keys(tags)).toEqual([...TEXT_VARIANTS]);
    for (const variant of TEXT_VARIANTS) {
      const view = render(<Text variant={variant}>{variant}</Text>);
      const element = screen.getByText(variant);
      expect(element.tagName, variant).toBe(tags[variant]);
      expect(element.classList.contains(textRoleClass[variant]), variant).toBe(true);
      view.unmount();
    }
  });

  it("[primitives.text.ink-beats-variant] [primitives.text.ink-vocabulary] [primitives.text.ink-table] gives every ink its own class, which Text wears beside the variant's, and the variant's own ink without one", () => {
    expect(Object.keys(inkClass).sort()).toEqual([...INKS].sort());
    expect(new Set(INKS.map((ink) => resolveInk(ink))).size).toBe(INKS.length);
    for (const ink of INKS) {
      const { unmount } = render(<Text data-testid="text" variant="caption" ink={ink}>Ink</Text>);
      const classes = screen.getByTestId("text").className.split(" ");
      expect(classes, ink).toContain(resolveInk(ink));
      expect(classes, ink).toContain(textRoleClass.caption);
      unmount();
    }
    // Without an ink prop the variant's own ink is the only one in play.
    render(<Text data-testid="plain" variant="caption">Ink</Text>);
    const worn = INKS.filter((ink) => screen.getByTestId("plain").className.split(" ").includes(resolveInk(ink)));
    expect(worn).toEqual([TEXT_INK.caption]);
  });

  it("[primitives.polymorphic.own-props-win] types the ref by the tag the variant draws, without an `as`", () => {
    const label = createRef<HTMLSpanElement>();
    const heading = createRef<HTMLHeadingElement>();
    render(<><Text variant="label" ref={label}>Label</Text><Text variant="heading" ref={heading}>Heading</Text></>);
    expect(label.current?.tagName).toBe("SPAN");
    expect(heading.current?.tagName).toBe("H2");
  });

  it("[primitives.text.numeric] sets digits tabular only when numeric is given", () => {
    render(<><Text numeric>1,234</Text><Text>5,678</Text></>);
    expect(screen.getByText("1,234").classList.contains(textNumericClass)).toBe(true);
    expect(screen.getByText("5,678").classList.contains(textNumericClass)).toBe(false);
  });

  it("[foundations.typography.line-breaking] [primitives.text.family-mono] adds the mono modifier, which owns the mono breaking, only for family mono", () => {
    render(<><Text family="mono">WEB-24</Text><Text>WEB-25</Text></>);
    expect(screen.getByText("WEB-24").classList.contains(textMonoClass.body)).toBe(true);
    expect(screen.getByText("WEB-25").classList.contains(textMonoClass.body)).toBe(false);
  });
});

describe("Icon", () => {
  const path = <path d="M1 1h2" />;

  it("[primitives.icon.size-precedence] [foundations.shape.geometry-entry] takes an explicit size over the size its container gives it, and that over body", () => {
    render(
      <>
        <Icon data-testid="alone">{path}</Icon>
        <IconSizeContext.Provider value="caption">
          <Icon data-testid="inherits">{path}</Icon>
          <Icon data-testid="explicit" size="label">{path}</Icon>
        </IconSizeContext.Provider>
      </>,
    );
    const has = (id: string, size: keyof typeof iconSize) => screen.getByTestId(id).classList.contains(iconSize[size]);
    expect(has("alone", "body")).toBe(true);
    expect(has("inherits", "caption")).toBe(true);
    expect(has("inherits", "body")).toBe(false);
    expect(has("explicit", "label")).toBe(true);
    expect(has("explicit", "caption")).toBe(false);
  });

  it("[primitives.icon.label] an aria-label makes the icon an image with that name", () => {
    render(<Icon aria-label="Warning"><path d="M12 8v5" /></Icon>);
    const image = screen.getByRole("img", { name: "Warning" });
    expect(image.tagName.toLowerCase()).toBe("svg");
    expect(image.getAttribute("aria-hidden")).toBeNull();
  });

  it("[primitives.icon.label] an aria-labelledby makes the icon an image named by the text it points at", () => {
    render(<><Text as="span" id="icon-name">Project icon</Text><Icon aria-labelledby="icon-name"><path d="M1 1h2" /></Icon></>);
    expect(screen.getByRole("img", { name: "Project icon" }).getAttribute("aria-hidden")).toBeNull();
  });

  it("[primitives.icon.label] an icon with no name is decoration: hidden from assistive technology, with no role", () => {
    const view = render(<Icon data-testid="decor"><path d="M1 1h2" /></Icon>);
    const icon = view.getByTestId("decor");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.hasAttribute("role")).toBe(false);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("[primitives.content.axes] draws body in sans on a p by default, and an Icon at the body artboard on the 24 viewBox", () => {
    render(<><Text data-testid="text">Body</Text><Icon data-testid="icon">{path}</Icon></>);
    const text = screen.getByTestId("text");
    expect(text.tagName).toBe("P");
    expect(text.classList.contains(textRoleClass.body)).toBe(true);
    expect(text.classList.contains(textMonoClass.body)).toBe(false);
    const icon = screen.getByTestId("icon");
    expect(icon.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(icon.classList.contains(iconSize.body)).toBe(true);
  });

  it("[primitives.icon.artboard] takes the path it is given and names its sizes after Text roles, a class per size", () => {
    expectTypeOf<IconSize>().toExtend<TextVariant>();
    for (const size of ICON_SIZES) {
      expect(TEXT_VARIANTS, size).toContain(size);
      const view = render(<Icon data-testid="icon" size={size}><path data-testid="path" d="M1 1h2" /></Icon>);
      expect(screen.getByTestId("icon").classList.contains(iconSize[size]), size).toBe(true);
      expect(screen.getByTestId("icon").classList.contains(iconRoot), size).toBe(true);
      expect(screen.getByTestId("path").parentElement).toBe(screen.getByTestId("icon"));
      view.unmount();
    }
  });

  it("[primitives.icon.ink] wears no ink class of its own unless it is given one, so it takes the colour around it", () => {
    render(<><Icon data-testid="plain">{path}</Icon><Icon data-testid="inked" ink="warning">{path}</Icon></>);
    const worn = (id: string) => INKS.filter((ink) => screen.getByTestId(id).classList.contains(resolveInk(ink)!));
    expect(worn("plain")).toEqual([]);
    expect(worn("inked")).toEqual(["warning"]);
  });
});
