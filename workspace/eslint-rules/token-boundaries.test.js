import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const packagePath = "packages/paper-ui/src/atoms/TokenProbe.tsx";
const errors = async (code, filePath = packagePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.filter((message) => message.severity === 2);
const hasRule = async (code, rule, path) => (await errors(code, path)).some((message) => message.ruleId === rule);

test("raw colors are caught in JSX, compound CSS, encoded SVG and templates", async () => {
  for (const code of [
    'export const X = () => <div style={{color: "#f00"}} />;',
    'export const style = { border: "1px solid #ff0000" };',
    'export const style = { backgroundImage: "url(data:image/svg+xml,%23ff0000)" };',
    'export const style = { border: `1px solid #ff0000` };',
    'export const style = { color: "red" };',
    'export const style = { background: "linear-gradient(red, blue)" };',
    'export const style = { background: "rgb(1 2 3)" };',
  ]) assert.equal(await hasRule(code, "token-boundaries/no-raw-color"), true, code);
});

test("both token variable prefixes are guarded", async () => {
  for (const prefix of ["pui", "paper"]) {
    assert.equal(await hasRule(`export const style = {color: "var(--${prefix}-color-ink-primary)"};`, "token-boundaries/no-raw-color"), true);
  }
});

test("inline token aliases, destructuring, namespace imports and style objects are guarded", async () => {
  for (const code of [
    'import {tokens} from "../tokens"; export const X = () => <div style={{color: tokens.color.ink.primary}} />;',
    'import {tokens as t} from "../tokens"; const ink=t.color.ink.primary; export const X = () => <div style={{color: ink}} />;',
    'import {tokens} from "../tokens"; const {color}=tokens; const style={color:color.ink.primary}; export const X = () => <div style={style} />;',
    'import * as ui from "../tokens"; export const X = () => <div style={{color:ui.tokens.color.ink.primary}} />;',
  ]) assert.equal(await hasRule(code, "token-boundaries/no-inline-tokens"), true, code);
});

test("consumer styles, CSS classes, inherited ink and system colors stay available", async () => {
  assert.deepEqual(await errors('import {tokens} from "@studio-baeks/paper-ui"; export const X = () => <div style={{color:tokens.color.ink.primary}} />;', "app/src/TokenProbe.tsx"), []);
  assert.deepEqual(await errors('import {tokens} from "../tokens"; export const style = {color: tokens.color.ink.primary, borderColor: "currentColor", background: "transparent", outlineColor: "CanvasText"};', "packages/paper-ui/src/atoms/TokenProbe.css.ts"), []);
  assert.deepEqual(await errors('export const X = ({style}) => <div style={style} />;'), []);
});

test("raw imports cannot bypass the boundary through a barrel", async () => {
  assert.equal(await hasRule('import {COLOR_VALUES} from "../tokens"; export {COLOR_VALUES};', "no-restricted-imports"), true);
  assert.equal(await hasRule('import {SHAPE_PALETTE} from "../tokens/shape-palette"; export {SHAPE_PALETTE};', "no-restricted-imports"), true);
  assert.equal(await hasRule('import {COLOR_VALUES} from "../tokens/index.ts"; export {COLOR_VALUES};', "no-restricted-imports"), true);
  assert.equal(await hasRule('import {SHAPE_PALETTE} from "../tokens/shape-palette.ts"; export {SHAPE_PALETTE};', "no-restricted-imports"), true);
  assert.deepEqual(await errors('import {COLOR_VALUES} from "../../../packages/paper-ui/src/tokens/colors"; export {COLOR_VALUES};', "app/src/playground/Tokens.tsx"), []);
});

test("fixed component geometry belongs to tokens while structural CSS stays local", async () => {
  const path = "packages/paper-ui/src/atoms/TokenProbe.css.ts";
  for (const code of ['export const style={width:16};', 'export const style={padding:"1rem"};', 'export const style={transform:`translateY(1px)`};']) {
    assert.equal(await hasRule(code, "token-boundaries/no-raw-geometry", path), true, code);
  }
  assert.deepEqual(await errors('export const style={width:"100%",margin:0,aspectRatio:"1",transform:"translateY(-50%)"};', path), []);
});
