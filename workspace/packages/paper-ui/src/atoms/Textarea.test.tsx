import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STATUSES } from "../tokens";
import { Textarea } from "./Textarea";

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
});
