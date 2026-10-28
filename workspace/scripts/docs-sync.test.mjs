// Docs that state a fact the repository also writes down must agree with it.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const stylesheets = (html) =>
  [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(([tag]) => tag.match(/\bhref="([^"]+)"/)?.[1]);

test("[install.fonts.snippet-matches-app] the app loads exactly the font stylesheets install.md gives", () => {
  const fonts = read("../../docs/get-started/install.md").split(/^## 폰트$/m)[1]?.split(/^## /m)[0] ?? "";
  const snippet = fonts.match(/```html\n([\s\S]*?)```/)?.[1];
  assert.ok(snippet, "install.md 폰트 has an html code block");
  const expected = stylesheets(snippet);
  assert.ok(expected.length > 0, "the snippet loads at least one stylesheet");
  assert.deepEqual(stylesheets(read("../app/index.html")), expected);
});
