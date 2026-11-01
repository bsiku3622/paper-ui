import { describe, expect, it } from "vitest";

import { paperError } from "./errors";

describe("paperError", () => {
  it("[primitives.errors.prefix] prefixes the message so a console line is known to be ours", () => {
    const error = paperError("Something must be used inside <Something>.");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("[paper-ui] Something must be used inside <Something>.");
  });

  it("[primitives.errors.prefix] builds the kind of error it is given", () => {
    expect(paperError("A count must be positive.", RangeError)).toBeInstanceOf(RangeError);
  });
});
