import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTheme } from "./theme-context";

describe("useTheme", () => {
  it("throws an English error outside <PaperProvider>", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow("useTheme must be used inside <PaperProvider>.");
    error.mockRestore();
  });
});
