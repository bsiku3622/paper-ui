import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { textMonoClass, textNumericClass, textRoleClass } from "../styles/typography.css";
import { TEXT_VARIANTS } from "../tokens";
import { Icon, Text } from "./index";

describe("Text", () => {
  it("draws its role with the tag that role implies, hero and display as the page's h1", () => {
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

  it("[foundations.typography.line-breaking] adds the mono modifier, which owns the mono breaking, only for family mono", () => {
    render(<><Text family="mono">WEB-24</Text><Text>WEB-25</Text></>);
    expect(screen.getByText("WEB-24").classList.contains(textMonoClass.body)).toBe(true);
    expect(screen.getByText("WEB-25").classList.contains(textMonoClass.body)).toBe(false);
  });
});

describe("Icon", () => {
  it("an externally labelled Icon stays in the accessibility tree", () => {
    render(<><Text as="span" id="icon-name">Project icon</Text><Icon aria-labelledby="icon-name"><path d="M1 1h2" /></Icon></>);
    expect(screen.getByLabelText("Project icon").getAttribute("aria-hidden")).not.toBe("true");
  });
});
