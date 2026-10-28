import { describe, expect, it } from "vitest";

import { parseDoc } from "./parse";

describe("parseDoc", () => {
  it("takes the title from the first line and returns the body without it", () => {
    expect(parseDoc("# Overview\n\nFirst paragraph.\n\n## Section\n")).toEqual({ title: "Overview", body: "First paragraph.\n\n## Section\n" });
  });

  it("trims the title and reads CRLF line ends", () => {
    expect(parseDoc("#  Installation  \r\n\r\nText\r\n")).toEqual({ title: "Installation", body: "Text\n" });
  });

  it("keeps a later h1 in the body", () => {
    expect(parseDoc("# A\n\ntext\n\n# B\n").body).toBe("text\n\n# B\n");
  });

  it("returns an empty body for a title-only doc", () => {
    expect(parseDoc("# Only")).toEqual({ title: "Only", body: "" });
  });

  it("throws when the first line is not an h1", () => {
    for (const raw of ["", "intro\n# Title\n", "\n# Title\n", "## Title\n", "#Title\n", "# \n"]) {
      expect(() => parseDoc(raw), JSON.stringify(raw)).toThrow(/# Title/);
    }
  });
});
