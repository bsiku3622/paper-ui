import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon, Text } from "./index";

describe("Icon", () => {
  it("an externally labelled Icon stays in the accessibility tree", () => {
    render(<><Text as="span" id="icon-name">Project icon</Text><Icon aria-labelledby="icon-name"><path d="M1 1h2" /></Icon></>);
    expect(screen.getByLabelText("Project icon").getAttribute("aria-hidden")).not.toBe("true");
  });
});
