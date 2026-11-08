import type { WikiIndex } from "../data";
import type { Parsed } from "../lib/markup";
import type { InlineCtx } from "./Inlines";

export const makeCtx = (index: WikiIndex, self: Parsed | null): InlineCtx => ({
  variant: "lead",
  exists: (title) => index.resolve(title) !== null,
  anchorOf: (title, text) => {
    const toc = title === "" ? (self?.toc ?? []) : (index.articles.get(index.resolve(title) ?? title)?.parsed.toc ?? []);
    return toc.find((entry) => entry.text === text)?.id ?? "";
  },
});
