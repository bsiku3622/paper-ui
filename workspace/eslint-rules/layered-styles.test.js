import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const reports = async (code, filePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.filter((message) => message.ruleId === "paper/layered-styles");

test("[guardrails.layered-styles.package-css-layered] package stylesheets build rules only through layered()", async () => {
  const button = "packages/paper-ui/src/atoms/Button.css.ts";
  for (const code of [
    'import { style } from "@vanilla-extract/css"; export const root = style({ display: "flex" });',
    'import { styleVariants as variants } from "@vanilla-extract/css"; export const size = variants({ md: {} });',
    'import { globalStyle } from "@vanilla-extract/css"; globalStyle(".pui-x", { display: "flex" });',
    'import { globalLayer } from "@vanilla-extract/css"; export const own = globalLayer("own");',
    'import { recipe } from "@vanilla-extract/recipes"; export const button = recipe({});',
    'import * as css from "@vanilla-extract/css"; export const root = css.style({});',
    'export { style } from "@vanilla-extract/css";',
  ]) assert.equal((await reports(code, button)).length, 1, code);

  // The layer module defines the layers and wraps the rule APIs; @keyframes and @property stay top level.
  assert.deepEqual(await reports('import { globalLayer, globalStyle, style, styleVariants } from "@vanilla-extract/css"; export { globalLayer, globalStyle, style, styleVariants };', "packages/paper-ui/src/tokens/layers.css.ts"), []);
  assert.deepEqual(await reports('import { keyframes, createVar, fallbackVar, createGlobalVar } from "@vanilla-extract/css"; export const spin = keyframes({}); export const v = createVar(); export const f = fallbackVar(v, "0"); export const g = createGlobalVar("g");', button), []);
  assert.deepEqual(await reports('import type { StyleRule } from "@vanilla-extract/css"; import { type ComplexStyleRule } from "@vanilla-extract/css"; export type R = StyleRule | ComplexStyleRule;', button), []);
  assert.deepEqual(await reports('import { layered } from "../tokens/layers.css"; const { style } = layered("components"); export const root = style({});', button), []);
  // App stylesheets stay outside the package layers, so their rules win.
  assert.deepEqual(await reports('import { style } from "@vanilla-extract/css"; export const panel = style({});', "app/src/site/panel.css.ts"), []);
});
