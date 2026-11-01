import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const flagged = async (code, filePath = "packages/paper-ui/src/atoms/Probe.tsx") =>
  (await eslint.lintText(code, { filePath }))[0].messages.some((message) => message.severity === 2 && message.ruleId === "paper/raw-color");

test("[guardrails.raw-color.no-color-literals] a colour is written by no file: not in a source, a stylesheet, a component or the app", async () => {
  for (const [code, path] of [
    ['export const OKLCH = { neutral: "oklch(0.5 0 0)" };', "packages/paper-ui/src/tokens/palette.ts"],
    ['export const GRAY = "#808080";', "packages/paper-ui/src/tokens/palette.ts"],
    ['export const ladder = (hex: string) => `${hex}` + "#ffffff";', "packages/paper-ui/src/tokens/color-ladder.ts"],
    ['export const style = { backgroundImage: "linear-gradient(white, black)" };', "packages/paper-ui/src/atoms/Probe.css.ts"],
    ['export const style = { color: dark ? "white" : "black" };', "app/src/Probe.css.ts"],
    ['export const style = { color: `${dark ? "red" : "blue"}` };', "app/src/Probe.css.ts"],
    ['export const style = { background: fade("white", 0.4) };', "app/src/Probe.css.ts"],
    ['export const style = { border: "1px solid red" };', "app/src/Probe.css.ts"],
    ['export const style = { outline: "2px solid rebeccapurple" };', "app/src/Probe.css.ts"],
    ['export const style = { color: "oklch(0.7 0.1 200)" };', "app/src/Probe.css.ts"],
    ['export const style = { color: "hsl(210 50% 40%)" };', "app/src/Probe.css.ts"],
    ['export const style = { color: "color-mix(in oklab, var(--a) 40%, white)" };', "app/src/Probe.css.ts"],
    ['export const style = { background: "color(display-p3 1 0 0)" };', "app/src/Probe.css.ts"],
    ['export const style = { boxShadow: "0 0 0 1px #00000040" };', "app/src/Probe.css.ts"],
    ['export const style = { backgroundImage: "url(data:image/svg+xml,%23ff0000)" };', "app/src/Probe.css.ts"],
    ['export const style = { color: "#f00" };', "packages/paper-ui/src/internal/probe.ts"],
    ['export const X = () => <svg fill="red" />;', "app/src/Probe.tsx"],
    ['export const X = () => <svg stroke={on ? "navy" : "currentColor"} />;', "app/src/Probe.tsx"],
    ['export const X = () => <div style={{ color: "#f00" }} />;', "app/src/Probe.tsx"],
    ['export const style = { "--accent": "gold" };', "app/src/Probe.css.ts"],
    ['export const style = { outlineColor: "CanvasText" };', "packages/paper-ui/src/atoms/Probe.css.ts"],
    ['export const style = { borderColor: dark ? "ButtonText" : "GrayText" };', "packages/paper-ui/src/atoms/Probe.css.ts"],
    ['export const style = { background: "Highlight" };', "app/src/Probe.css.ts"],
  ]) assert.equal(await flagged(code, path), true, `${path}: ${code}`);
});

test("[guardrails.raw-color.no-color-literals] roles, keywords that are not colours, system colours through SYSTEM_COLORS and the vocabulary's own words stay open", async () => {
  for (const [code, path] of [
    ['import { tokens } from "../tokens"; export const style = { color: tokens.color.ink.primary };', "packages/paper-ui/src/styles/probe.css.ts"],
    ['export const style = { borderColor: "currentColor", background: "transparent", color: "inherit", outlineColor: "initial", fill: "unset" };', "app/src/Probe.css.ts"],
    ['import { SYSTEM_COLORS } from "../tokens"; export const style = { outlineColor: SYSTEM_COLORS.canvasText, borderColor: SYSTEM_COLORS.buttonText };', "packages/paper-ui/src/atoms/Probe.css.ts"],
    ['export const style = { border: "1px solid var(--x)", background: "none", borderStyle: "solid", textDecoration: "underline" };', "app/src/Probe.css.ts"],
    ['export const X = () => <Surface fill="canvas" />;', "app/src/Probe.tsx"],
    ['export const pick = (fill?: string) => surfaceClass({ fill: fill ?? "canvas", border: true });', "packages/paper-ui/src/primitives/Probe.tsx"],
    ['export const X = ({ style }) => <div style={style} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['export const label = "Field mark (primary)";', "app/src/Probe.tsx"],
    ['export const X = () => <a href="#main">skip</a>;', "app/src/Probe.tsx"],
  ]) assert.equal(await flagged(code, path), false, `${path}: ${code}`);
});

test("[guardrails.raw-color.no-color-literals] a keyword is followed through a same-file name, a table, a function and a shorthand", async () => {
  for (const [code, path] of [
    ['const c = "tomato"; export const rule = style({ color: c });', "packages/paper-ui/src/atoms/Probe.css.ts"],
    ['const fill = "white"; export const rule = style({ fill });', "packages/paper-ui/src/atoms/Probe.css.ts"],
    ['const pair = { a: "navy" }; export const rule = style({ color: pair.a });', "packages/paper-ui/src/atoms/Probe.css.ts"],
    ['const c = "tomato"; export const rule = style({ color: c });', "app/src/Probe.css.ts"],
    ['const fill = "white"; export const rule = style({ fill });', "app/src/Probe.css.ts"],
    ['const pair = { a: "navy" }; export const rule = style({ color: pair.a });', "app/src/Probe.css.ts"],
    ['const a = "navy"; const b = a; export const rule = style({ color: b });', "app/src/Probe.css.ts"],
    ['let c; c = "navy"; export const rule = style({ color: c });', "app/src/Probe.css.ts"],
    ['const pair = { a: { b: "navy" } }; export const rule = style({ color: pair.a.b });', "app/src/Probe.css.ts"],
    ['const pair = { a: "navy" }; export const pick = (k) => ({ color: pair[k] });', "app/src/Probe.css.ts"],
    ['const pair = { a: "navy" } as const; export const rule = style({ color: pair.a });', "app/src/Probe.css.ts"],
    ['const pair = { a: "navy" }; export const rule = style({ color: pair?.a });', "app/src/Probe.css.ts"],
    ['const { a } = { a: "navy" }; export const rule = style({ color: a });', "app/src/Probe.css.ts"],
    ['const list = ["navy"]; export const rule = style({ color: list[0] });', "app/src/Probe.css.ts"],
    ['const c = "navy"; export const rule = style({ border: `1px solid ${c}` });', "app/src/Probe.css.ts"],
    ['const c = "navy"; export const rule = style({ color: dark ? c : "inherit" });', "app/src/Probe.css.ts"],
    ['const pick = () => "tomato"; export const rule = style({ color: pick() });', "app/src/Probe.css.ts"],
    ['function pick() { return "tomato"; } export const rule = style({ color: pick() });', "app/src/Probe.css.ts"],
    ['const c = "navy"; export const X = () => <svg fill={c} />;', "app/src/Probe.tsx"],
    ['const c = "CanvasText"; export const rule = style({ outlineColor: c });', "packages/paper-ui/src/atoms/Probe.css.ts"],
  ]) assert.equal(await flagged(code, path), true, `${path}: ${code}`);
  for (const [code, path] of [
    ['const c = "inherit"; export const rule = style({ color: c });', "app/src/Probe.css.ts"],
    ['const fill = "canvas"; export const rule = style({ fill });', "app/src/Probe.css.ts"],
    ['const pair = { a: "inherit", label: "navy" }; export const rule = style({ color: pair.a });', "app/src/Probe.css.ts"],
    ['const name = "tomato"; export const rule = style({ gridArea: name });', "app/src/Probe.css.ts"],
    ['const pair = { a: "navy" }; export const rule = style({ gridArea: pair.a });', "app/src/Probe.css.ts"],
    ['import { c } from "./elsewhere"; export const rule = style({ color: c });', "app/src/Probe.css.ts"],
    ['export const rule = ({ color }) => style({ color });', "app/src/Probe.css.ts"],
    // A name run into other text is part of a longer word: a palette path, not a colour.
    ['const ramp = { info: "blue" }; export const role = { accent: `${ramp.info}.700` };', "packages/paper-ui/src/tokens/colors.ts"],
    ['const RAMP = { error: "red" }; const path = (status) => { const ramp = RAMP[status]; return `${ramp}.700`; }; export const role = { accent: path("error") };', "packages/paper-ui/src/tokens/colors.ts"],
  ]) assert.equal(await flagged(code, path), false, `${path}: ${code}`);
});

test("[guardrails.raw-color.no-color-literals] a keyword reaches a colour through a parameter, a mapper's table, a variable, a computed key and a DOM write", async () => {
  const CSS = "app/src/Probe.css.ts";
  const TSX = "app/src/Probe.tsx";
  for (const [code, path] of [
    ['styleVariants({ x: "navy" }, (c) => ({ color: c }));', CSS],
    ['const m = (c) => ({ color: c }); styleVariants({ x: "navy" }, m);', CSS],
    ['const pick = (c) => ({ color: c }); style(pick("navy"));', CSS],
    ['function pick(c) { return { color: c }; } style(pick("navy"));', CSS],
    ['const pick = (o) => ({ color: o.c }); style(pick({ c: "navy" }));', CSS],
    ['const pick = (c) => style({ color: c }); pick("navy");', CSS],
    ['const same = (c) => c; style({ color: same("navy") });', CSS],
    ['const fade = (c) => `color-mix(in oklab, ${c}, transparent)`; style({ background: fade("navy") });', CSS],
    ['["navy"].map((c) => style({ color: c }));', CSS],
    ['import { pick } from "./pick"; style(pick("navy"));', CSS],
    ['import { pick } from "./pick"; style([base, pick("navy")]);', CSS],
    ['import { pick } from "./pick"; style({ ...pick("navy") });', CSS],
    ['import { pick } from "./pick"; globalStyle("a", pick("navy"));', CSS],
    ['import { style as s } from "@vanilla-extract/css"; import { pick } from "./pick"; s(pick("navy"));', CSS],
    ['const v = createVar(); style({ vars: { [v]: "navy" } });', CSS],
    ['const v = createVar(); const c = "navy"; style({ vars: { [v]: c } });', CSS],
    ['style({ vars: { name: "navy" } });', CSS],
    ['import { v } from "./probe.css"; export const X = () => <div style={{ [v]: "navy" }} />;', TSX],
    ['const k = "color"; style({ [k]: "navy" });', CSS],
    ['const k = "borderColor"; const c = "navy"; style({ [k]: c });', CSS],
    ['export const paint = (el) => { el.style.color = "navy"; };', TSX],
    ['export const paint = (el) => { el.style["color"] = "navy"; };', TSX],
    ['export const paint = (el) => { const c = "navy"; el.style.background = c; };', TSX],
    ['export const paint = (el) => { el.style.setProperty("color", "navy"); };', TSX],
    ['export const paint = (el) => { el.style.setProperty("--x", "navy"); };', TSX],
    ['export const paint = (el) => { el.style.cssText = "color: navy"; };', TSX],
    ['export const paint = (el) => { el.setAttribute("style", "color: navy"); };', TSX],
    ['const set = (el, c) => { el.style.color = c; }; set(el, "navy");', TSX],
    ['const Inner = ({ c }) => <div style={{ color: c }} />; export const X = () => <Inner c="navy" />;', TSX],
  ]) assert.equal(await flagged(code, path), true, `${path}: ${code}`);
  for (const [code, path] of [
    ['styleVariants({ x: "inherit" }, (c) => ({ color: c }));', CSS],
    ['styleVariants({ x: "navy" }, (name) => ({ gridArea: name }));', CSS],
    ['styleVariants({ x: "navy" }, (_, name) => ({ gridArea: name, color: "inherit" }));', CSS],
    ['const pick = (name) => ({ gridArea: name }); style(pick("navy"));', CSS],
    ['const pick = (c) => ({ color: c }); style(pick("inherit"));', CSS],
    ['const ramp = (name) => `${name}.700`; export const role = { accent: ramp("red") };', CSS],
    ['["navy"].map((name) => style({ gridArea: name }));', CSS],
    ['import { pick } from "./pick"; style(pick("caption"));', CSS],
    ['import { pick } from "./pick"; export const label = pick("navy");', CSS],
    ['style({ gap: 0 }, "navy");', CSS],
    ['const v = createVar(); style({ vars: { [v]: "inherit" } });', CSS],
    ['const v = createVar(); style({ vars: { [v]: tokens.color.ink.primary } });', CSS],
    ['const k = "gridArea"; style({ [k]: "navy" });', CSS],
    ['const sel = "&:hover"; style({ selectors: { [sel]: { gridArea: "navy" } } });', CSS],
    ['import { sel } from "./sel"; style({ selectors: { [sel]: { gridArea: "navy" } } });', CSS],
    ['export const paint = (el) => { el.style.color = "inherit"; el.style.gridArea = "navy"; };', TSX],
    ['export const paint = (el) => { el.dataset.color = "navy"; el.setAttribute("data-color", "navy"); };', TSX],
    ['export const paint = (map) => { map.setProperty("color", "navy"); };', TSX],
    ['const set = (el, c) => { el.style.gridArea = c; }; set(el, "navy");', TSX],
    ['const Inner = ({ c, d }) => <div style={{ color: c }} data-d={d} />; export const X = () => <Inner c="inherit" d="navy" />;', TSX],
    // A ramp's name as a table's key is not a colour.
    ['const NAMES = ["blue", "red"]; export const tree = { accent: Object.fromEntries(NAMES.map((name) => [name, { solid: 1 }])) };', "packages/paper-ui/src/tokens/palette.ts"],
    ['export const tree = { accent: Object.fromEntries([["blue", { solid: 1 }]]) };', "packages/paper-ui/src/tokens/palette.ts"],
  ]) assert.equal(await flagged(code, path), false, `${path}: ${code}`);
  // The value of a pair is still read.
  assert.equal(await flagged('const NAMES = ["a"]; export const tree = { accent: Object.fromEntries(NAMES.map((name) => [name, "navy"])) };', "packages/paper-ui/src/tokens/palette.ts"), true);
});

test("[guardrails.raw-color.no-color-literals] tests and fixtures are not read", async () => {
  assert.equal(await flagged('export const expected = "#ffffff";', "packages/paper-ui/src/tokens/color.test.ts"), false);
  assert.equal(await flagged('export const expected = "#ffffff";', "tests/foundations/probe.spec.ts"), false);
});

test("[guardrails.raw-color.color-owners] the package reads tokens.color in the paint tier, the class maps of styles/ and Icon's ink, and nowhere else", async () => {
  const read = 'import { tokens } from "../tokens"; export const style = { background: tokens.color.bg.raised };';
  const destructured = 'import { tokens } from "../tokens"; const { color } = tokens; export const style = { background: color.bg.raised };';
  const bracket = 'import { tokens } from "../tokens"; export const style = { background: tokens["color"].bg.raised };';
  const PKG = "packages/paper-ui/src";
  for (const path of ["atoms/Probe.css.ts", "atoms/recipes/probe.css.ts", "primitives/Box.css.ts", "primitives/Text.css.ts", "primitives/layout/flex.css.ts", "primitives/float/Floating.css.ts", "primitives/press/press.css.ts", "internal/measure.css.ts", "theme/probe.ts"]) {
    for (const code of [read, destructured, bracket]) assert.equal(await flagged(code, `${PKG}/${path}`), true, `${path}: ${code}`);
  }
  for (const path of ["primitives/paint/Surface.css.ts", "primitives/paint/recipes.css.ts", "primitives/Icon.css.ts", "styles/color.css.ts", "styles/theme.css.ts", "tokens/probe.ts"]) {
    for (const code of [read, destructured]) assert.equal(await flagged(code, `${PKG}/${path}`), false, `${path}: ${code}`);
  }
  // Another system's role is not a colour, and the app picks its own colours.
  assert.equal(await flagged('import { tokens } from "../tokens"; export const style = { padding: tokens.shape.inset.md };', `${PKG}/atoms/Probe.css.ts`), false);
  assert.equal(await flagged(read, "app/src/pages/probe.css.ts"), false);
  assert.equal(await flagged(read, `${PKG}/atoms/Probe.test.ts`), false);
});
