import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const reports = async (code, filePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.filter((message) => message.severity === 2 && message.ruleId === "paper/global-class");
const flagged = async (code, filePath) => (await reports(code, filePath)).length > 0;

const SHEET = "app/src/pages/probe.css.ts";
const head = 'import { globalKeyframes, createGlobalVar, globalStyle, style } from "@vanilla-extract/css";\nexport const scoped = style({});\nexport const other = style({});\n';

test("[guardrails.global-class.scoped-selectors] a globalStyle selector starts from a scoped class, in every selector of its list", async () => {
  for (const selector of [
    '".home-hero"',
    '"p"',
    '":root"',
    '"html, body"',
    '"main:focus"',
    '"a:hover"',
    "`.md ${scoped}`",
    "`p > ${scoped}`",
    "`${scoped}, p`",
    "`${scoped} > a, .md ${other}`",
    "'.' + 'md'",
  ]) assert.equal(await flagged(`${head}globalStyle(${selector}, { margin: 0 });`, SHEET), true, selector);
  assert.equal(await flagged(`${head}const selector = ".md p";\nglobalStyle(selector, { margin: 0 });`, SHEET), true);
});

test("[guardrails.global-class.scoped-selectors] a descendant of a scoped class, a list of them and a built selector stay open", async () => {
  for (const selector of [
    "`${scoped} > *`",
    "`${scoped} h2`",
    "`${scoped} > span, ${other} > span`",
    "`${scoped}:is(.a, .b) > p`",
    "`${scoped}[data-orientation=\"vertical\"]`",
    "[scoped, other].map((name) => `${name} > :first-child`).join(', ')",
    "scoped",
    "`${scoped}`",
  ]) assert.equal(await flagged(`${head}globalStyle(${selector}, { margin: 0 });`, SHEET), false, selector);
});

test("[guardrails.global-class.scoped-selectors] an element or :root selector is the shell's alone, and no global name is made up", async () => {
  const shell = "app/src/site/shell.css.ts";
  assert.equal(await flagged(`${head}globalStyle(":root", { margin: 0 });\nglobalStyle("html", { margin: 0 });\nglobalStyle("main:focus", { outline: "none" });`, shell), false);
  assert.equal(await flagged(`${head}globalKeyframes("spin", { to: { opacity: 1 } });`, SHEET), true);
  assert.equal(await flagged(`${head}createGlobalVar("shell-nav-height");`, SHEET), true);
  assert.equal(await flagged(`${head}globalKeyframes("spin", { to: { opacity: 1 } });`, shell), false);
  // The rule reads app stylesheets; the package's own are layered-styles' business.
  assert.equal(await flagged(`${head}globalStyle(".md", { margin: 0 });`, "packages/paper-ui/src/atoms/Probe.css.ts"), false);
});

test("[guardrails.global-class.scoped-selectors] an import under another name is still the same call", async () => {
  assert.equal(await flagged('import { globalStyle as g } from "@vanilla-extract/css";\ng("p", { margin: 0 });', SHEET), true);
});
