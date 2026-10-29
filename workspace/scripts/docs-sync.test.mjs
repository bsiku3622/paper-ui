// Docs that state a fact the repository also writes down must agree with it.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const stylesheets = (html) =>
  [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(([tag]) => tag.match(/\bhref="([^"]+)"/)?.[1]);

// The load URLs live in one place, the FONT_STYLESHEETS constant of the Typography source.
const fontStylesheets = () => {
  const body = read("../packages/paper-ui/src/tokens/typography.ts").match(/export const FONT_STYLESHEETS = \{([\s\S]*?)\}/)?.[1];
  assert.ok(body, "typography.ts declares FONT_STYLESHEETS");
  return [...body.matchAll(/\b(sans|mono):\s*"([^"]+)"/g)].map(([, , url]) => url);
};

test("[install.fonts.snippet-matches-app] the app and install.md load exactly the font stylesheets FONT_STYLESHEETS names", () => {
  const expected = fontStylesheets();
  assert.equal(expected.length, 2, "FONT_STYLESHEETS names a sans and a mono stylesheet");

  const fonts = read("../../docs/get-started/install.md").split(/^## 폰트$/m)[1]?.split(/^## /m)[0] ?? "";
  const snippet = fonts.match(/```html\n([\s\S]*?)```/)?.[1];
  assert.ok(snippet, "install.md 폰트 has an html code block");
  assert.deepEqual(stylesheets(snippet), expected);
  assert.deepEqual(stylesheets(read("../app/index.html")), expected);
});
