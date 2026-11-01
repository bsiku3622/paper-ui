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

test("[guardrails.verify.order] runs lint, typecheck, unit tests, build, the tarball smoke and e2e in the order the docs name, in CI and before publishing, and a package build lints and type-checks first", () => {
  const { scripts } = JSON.parse(read("../package.json"));
  assert.equal(scripts.verify, "pnpm check && pnpm build && pnpm smoke:dist && pnpm test:e2e");
  assert.equal(scripts.check, "pnpm lint && pnpm typecheck && pnpm test");
  const sentence = read("../../docs/foundations/README.md").split("\n").find((line) => line.startsWith("이 검사는 사람이 기억해서 돌리지 않습니다."));
  assert.ok(sentence, "the README states the order");
  assert.match(sentence, /lint · typecheck · 단위 테스트 · build · smoke:dist · e2e/);
  const paper = JSON.parse(read("../packages/paper-ui/package.json")).scripts;
  assert.match(paper.prepublishOnly, /pnpm -w run verify/);
  const build = paper.build;
  for (const [earlier, later] of [["eslint", "vite build"], ["tsc --noEmit", "vite build"]]) assert.ok(build.indexOf(earlier) >= 0 && build.indexOf(earlier) < build.indexOf(later), `${earlier} before ${later}`);
  assert.match(read("../../.github/workflows/ci.yml"), /run: pnpm verify/);
});
