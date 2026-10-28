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
  ]) assert.equal(await hasRule(code, "paper/raw-color"), true, code);
});

test("both token variable prefixes are guarded", async () => {
  for (const prefix of ["pui", "paper"]) {
    assert.equal(await hasRule(`export const style = {color: "var(--${prefix}-color-ink-primary)"};`, "paper/raw-color"), true);
  }
});

test("inline token aliases, destructuring, namespace imports and style objects are guarded", async () => {
  for (const code of [
    'import {tokens} from "../tokens"; export const X = () => <div style={{color: tokens.color.ink.primary}} />;',
    'import {tokens as t} from "../tokens"; const ink=t.color.ink.primary; export const X = () => <div style={{color: ink}} />;',
    'import {tokens} from "../tokens"; const {color}=tokens; const style={color:color.ink.primary}; export const X = () => <div style={style} />;',
    'import * as ui from "../tokens"; export const X = () => <div style={{color:ui.tokens.color.ink.primary}} />;',
  ]) assert.equal(await hasRule(code, "paper/inline-token"), true, code);
});

test("consumer styles, CSS classes, inherited ink and system colors stay available", async () => {
  assert.deepEqual(await errors('import {tokens} from "@studio-baeks/paper-ui/tokens"; export const X = () => <div style={{color:tokens.color.ink.primary}} />;', "app/src/TokenProbe.tsx"), []);
  assert.deepEqual(await errors('import {tokens} from "../tokens"; export const style = {color: tokens.color.ink.primary, borderColor: "currentColor", background: "transparent", outlineColor: "CanvasText"};', "packages/paper-ui/src/atoms/TokenProbe.css.ts"), []);
  assert.deepEqual(await errors('export const X = ({style}) => <div style={style} />;'), []);
});

test("raw imports cannot bypass the boundary through a barrel", async () => {
  assert.equal(await hasRule('import {COLOR_VALUES} from "../tokens"; export {COLOR_VALUES};', "no-restricted-imports"), true);
  assert.equal(await hasRule('import {SHAPE_SOURCE} from "../tokens/shape"; export {SHAPE_SOURCE};', "no-restricted-imports"), true);
  assert.equal(await hasRule('import {COLOR_VALUES} from "../tokens/index.ts"; export {COLOR_VALUES};', "no-restricted-imports"), true);
  assert.equal(await hasRule('import {LAYOUT_SOURCE} from "../tokens/layout.ts"; export {LAYOUT_SOURCE};', "no-restricted-imports"), true);
  assert.equal(await hasRule('import {SPACE} from "../tokens"; export {SPACE};', "no-restricted-imports"), true);
  assert.deepEqual(await errors('import {COLOR_VALUES} from "../../../../packages/paper-ui/src/tokens/colors"; export {COLOR_VALUES};', "app/src/playground/foundations/ColorPage.tsx"), []);
  assert.deepEqual(await errors('import {SHAPE_SOURCE} from "../../../../packages/paper-ui/src/tokens/shape"; export {SHAPE_SOURCE};', "app/src/playground/foundations/ShapePage.tsx"), []);
  assert.equal(await hasRule('import {COLOR_VALUES} from "../../packages/paper-ui/src/tokens/colors"; export {COLOR_VALUES};', "no-restricted-imports", "app/src/pages/Probe.tsx"), true);
});

test("fixed component geometry belongs to tokens while structural CSS stays local", async () => {
  const path = "packages/paper-ui/src/atoms/TokenProbe.css.ts";
  for (const code of ['export const style={width:16};', 'export const style={padding:"1rem"};', 'export const style={transform:`translateY(1px)`};']) {
    assert.equal(await hasRule(code, "paper/source-numbers", path), true, code);
  }
  assert.deepEqual(await errors('export const style={width:"100%",margin:0,aspectRatio:"1",transform:"translateY(-50%)"};', path), []);
});

test("the package writes no length outside a token source", async () => {
  for (const path of ["packages/paper-ui/src/primitives/TokenProbe.tsx", "packages/paper-ui/src/internal/probe.ts", "packages/paper-ui/src/tokens/shape-recipes.ts"]) {
    assert.equal(await hasRule('export const style={marginTop:"2px"};', "paper/source-numbers", path), true, path);
  }
  assert.deepEqual(await errors('export const SOURCE={space:{sm:8}, stroke:"1px"};', "packages/paper-ui/src/tokens/shape.ts"), []);
});

test("apps take spacing, form and depth from roles but own their content dimensions", async () => {
  const path = "app/src/pages/Probe.css.ts";
  for (const code of ['export const s={padding:"0 28px"};', 'export const s={gap:26};', 'export const s={zIndex:10};', 'export const s={borderRadius:6};', 'export const s={top:20};', 'export const s={boxShadow:"0 1px 2px"};', 'export const X=()=> <div style={{marginTop:8}} />;']) {
    assert.equal(await hasRule(code, "paper/source-numbers", path.replace(".css.ts", code.includes("<") ? ".tsx" : ".css.ts")), true, code);
  }
  assert.deepEqual(await errors('export const s={width:218, height:58, gridTemplateColumns:"218px minmax(0,1fr) 260px", maxWidth:1540, flex:1, margin:0};', path), []);
});

test("[guardrails.no-rule-disable.paper-rules-stay-on] a comment cannot switch a paper rule off", async () => {
  for (const code of [
    '// eslint-disable-next-line paper/raw-color -- 브랜드 색\nexport const style = { color: "#f00" };',
    'export const style = { color: "#f00" }; // eslint-disable-line paper/raw-color, paper/no-rule-disable -- 둘 다',
    '/* eslint-disable */\nexport const style = { color: "#f00" };',
    '/* eslint paper/raw-color: "off" */\nexport const style = { color: "#f00" };',
    '/* eslint quotes:0,paper/raw-color:0 */\nexport const style = { color: "#f00" };',
    '/* eslint "paper/raw-color": "off" */\nexport const style = { color: "#f00" };',
  ]) assert.equal(await hasRule(code, "paper/no-rule-disable"), true, code);
  assert.equal(await hasRule('/* eslint no-restricted-imports: ["error", "paper/probe"] */\nexport const x = 1;', "paper/no-rule-disable"), false);
});

test("[guardrails.no-rule-disable.reason-required] other rules are switched off only with a reason, and only where they fire", async () => {
  const autofocus = "export const X = () => <input aria-label=\"이름\" autoFocus />;";
  assert.equal(await hasRule(`// eslint-disable-next-line jsx-a11y/no-autofocus\n${autofocus}`, "paper/no-rule-disable"), true);
  assert.deepEqual(await errors(`// eslint-disable-next-line jsx-a11y/no-autofocus -- 열리자마자 입력에 포커스를 둔다\n${autofocus}`), []);
  const unused = await errors("// eslint-disable-next-line jsx-a11y/no-autofocus -- 가릴 것이 없는 주석\nexport const x = 1;");
  assert.equal(unused.some((message) => message.ruleId === null && message.message.startsWith("Unused eslint-disable directive")), true);
});
