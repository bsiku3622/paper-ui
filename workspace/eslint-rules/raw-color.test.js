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
