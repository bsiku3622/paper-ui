import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const hasInline = async (code, filePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.some((message) => message.severity === 2 && message.ruleId === "paper/inline-token");
const probe = "packages/paper-ui/src/primitives/TokenProbe.tsx";

test("[guardrails.inline-token.no-token-style] a token reaches `style` through names, calls, hooks, imports and merged props", async () => {
  for (const code of [
    'import {tokens} from "../tokens"; export const X = () => <div style={{color: tokens.color.ink.primary}} />;',
    'import {tokens as t} from "../tokens"; const ink=t.color.ink.primary; export const X = () => <div style={{color: ink}} />;',
    'import {tokens} from "../tokens"; const {color}=tokens; const style={color:color.ink.primary}; export const X = () => <div style={style} />;',
    'import * as ui from "../tokens"; export const X = () => <div style={{color:ui.tokens.color.ink.primary}} />;',
    'import {tokens} from "../tokens"; export const X = () => <div style={{color: String(tokens.color.ink.primary)}} />;',
    'import {useMemo} from "react"; import {tokens} from "../tokens"; export const X = () => <div style={useMemo(() => ({color: tokens.color.ink.primary}), [])} />;',
    'import {focusRing} from "../tokens"; export const X = () => <div style={focusRing} />;',
    'import {controlGeometry} from "../internal/shape"; export const X = () => <div style={controlGeometry.button.md} />;',
    'import {mergeProps} from "./composition"; import {tokens} from "../tokens"; export const props = (p) => mergeProps(p, {style: {color: tokens.color.ink.primary}});',
    'import {tokens} from "../tokens"; const color = (name) => tokens.color.ink[name]; export const X = ({name}) => <div style={{color: color(name)}} />;',
    'import {tokens} from "../tokens"; const style = {}; style.color = tokens.color.ink.primary; export const X = () => <div style={style} />;',
    'import {tokens} from "../tokens"; let style; style = {color: tokens.color.ink.primary}; export const X = () => <div style={style} />;',
    'import {tokens} from "../tokens"; export const X = ({on}) => <div style={on ? {color: tokens.color.ink.primary} : undefined} />;',
    'import {tokens} from "../tokens"; export const X = ({style}) => <div style={{...style, color: `${tokens.color.ink.primary}`}} />;',
    'import {tokens} from "../tokens"; export const X = () => <div style={{color: tokens.color.ink.primary} as const} />;',
    'import {sheet} from "../styles/space.css"; export const X = () => <div style={{gap: sheet.gap.md}} />;',
    'import {tokens} from "@studio-baeks/paper-ui/tokens"; export const X = () => <div style={{color: tokens.color.ink.primary}} />;',
    'import {tokens} from "../tokens"; export const props = () => ({style: {color: tokens.color.ink.primary}});',
    'import {tokens} from "../tokens"; const pick = (n) => { if (!n) throw new Error("none"); return tokens.color.ink[n]; }; export const X = ({n}) => <div style={{color: pick(n)}} />;',
  ]) {
    assert.equal(await hasInline(code, probe), true, code);
  }
});

test("[guardrails.inline-token.no-token-style] a module or a name that holds no token does not report", async () => {
  for (const code of [
    'export const X = ({style}) => <div style={style} />;',
    'import {tokens} from "../tokens"; export const X = ({style}) => <div style={style} className={String(tokens.color.ink.primary)} />;',
    'import {tokens} from "../tokens"; const color = 1; export const X = () => <div style={{color}} data-token={tokens.color.ink.primary} />;',
    'import {tokens} from "../tokens"; const {color} = tokens; export const X = () => <div style={{color: 1}} data-token={color.ink.primary} />;',
    'import {boxSize} from "./Box.css"; export const X = () => <div style={{width: boxSize.width}} />;',
    'import type {tokens} from "../tokens"; export const X = (p: {t: typeof tokens}) => <div style={{width: 1} as const} />;',
    'import {Space} from "../tokens"; export const X = ({gap}: {gap: Space}) => <div style={{gridTemplateColumns: `repeat(${gap}, 1fr)`}} />;',
    'import {paperError} from "../internal/errors"; const tracks = (n) => { if (n < 1) throw paperError("bad"); return `repeat(${n}, 1fr)`; }; export const X = ({n}) => <div style={{gridTemplateColumns: tracks(n)}} />;',
  ]) assert.equal(await hasInline(code, probe), false, code);
});

test("[guardrails.inline-token.declared-runtime] a runtime value of the moment reaches `style`: track strings, drag coordinates, a variable by name, an Aria position, the caller's style", async () => {
  for (const [code, path] of [
    ['export const X = ({columns}) => <div style={{gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`}} />;', "packages/paper-ui/src/primitives/layout/Grid.tsx"],
    ['export const X = ({position}) => <div style={{translate: `${position.x}px ${position.y}px`}} />;', "packages/paper-ui/src/primitives/drag/Draggable.tsx"],
    ['import {styles} from "./Floating.css"; export const X = ({rank}) => <div style={{[styles.rank]: rank}} />;', "packages/paper-ui/src/primitives/float/Floating.tsx"],
    ['import {overlayPosition} from "../../internal/aria/position"; export const X = (p) => <div style={overlayPosition(p).style} />;', "packages/paper-ui/src/primitives/float/Floating.tsx"],
    ['import {pressStyle} from "../../internal/aria/press"; export const props = (p) => ({style: pressStyle(p)});', "packages/paper-ui/src/primitives/press/Pressable.tsx"],
    ['import {measureSpace} from "../../internal/measure"; export const X = ({gap}) => <div style={{marginTop: measureSpace(gap)}} />;', "packages/paper-ui/src/primitives/float/Floating.tsx"],
    ['export const X = ({style}) => <div style={{...style}} />;', "packages/paper-ui/src/atoms/Field.tsx"],
  ]) assert.equal(await hasInline(code, path), false, `${path}: ${code}`);
  // The same shapes are reported when the value comes from a tracked module.
  assert.equal(await hasInline('import {overlayStyle} from "../../internal/shape"; export const X = (p) => <div style={overlayStyle(p)} />;', "packages/paper-ui/src/primitives/float/Floating.tsx"), true);
});

test("[guardrails.inline-token.no-token-style] any relative module is tracked: what a sibling returns is not read, so it is taken to hold a token", async () => {
  for (const [code, path] of [
    ['import { pick } from "./other"; export const X = () => <div style={{ width: pick() }} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['import { dim } from "./probe-style"; export const X = () => <div style={dim} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['import dim from "./probe-style"; export const X = () => <div style={dim} />;', "packages/paper-ui/src/primitives/Probe.tsx"],
    ['import * as sibling from "./probe-style"; export const X = () => <div style={{ width: sibling.dim }} />;', "packages/paper-ui/src/primitives/Probe.tsx"],
    ['import { pick } from "./other"; const width = pick(); export const X = () => <div style={{ width }} />;', "packages/paper-ui/src/theme/Probe.tsx"],
    ['import { pick } from "./other"; export const props = () => ({ style: { width: pick() } });', "packages/paper-ui/src/atoms/useProbe.ts"],
    ['import { pick } from "../compositions/other"; export const X = () => <div style={{ width: pick() }} />;', "app/src/pages/Probe.tsx"],
    ['import { DEMO_LAYOUT } from "./layout"; export const X = () => <div style={{ width: DEMO_LAYOUT.frame }} />;', "app/src/pages/demo/Probe.tsx"],
    // A stylesheet in a directory of token values and maps is not a class list of its own.
    ['import { sheet } from "../styles/space.css"; export const X = () => <div style={{ gap: sheet.gap.md }} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['import { probe } from "../internal/measure.css"; export const X = () => <div style={{ gap: probe.md }} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
  ]) assert.equal(await hasInline(code, path), true, `${path}: ${code}`);
  for (const [code, path] of [
    ['import { rank } from "./Floating.css"; export const X = ({ value }) => <div style={{ [rank]: value }} />;', "packages/paper-ui/src/primitives/float/Probe.tsx"],
    ['import * as styles from "./Floating.css.ts"; export const X = ({ value }) => <div style={{ [styles.rank]: value }} />;', "packages/paper-ui/src/primitives/float/Probe.tsx"],
    ['import { navHeight } from "../site/shell.css"; export const X = ({ value }) => <div style={{ [navHeight]: value }} />;', "app/src/pages/Probe.tsx"],
    ['import { useCarry } from "../../theme/source-carry"; export const X = ({ opener }) => <div style={useCarry(opener)} />;', "packages/paper-ui/src/primitives/a11y/Probe.tsx"],
    ['import { useAnchor } from "../../internal/aria/overlay"; export const X = (p) => <div style={useAnchor(p).style} />;', "packages/paper-ui/src/primitives/float/Probe.tsx"],
    // A sibling that never reaches `style`, a type, and a package that is not the system.
    ['import { pick } from "./other"; export const X = ({ style }) => <div style={style} data-width={pick()} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['import type { Dim } from "./other"; export const X = (p: { width: Dim }) => <div style={{ width: p.width }} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['import { type Dim } from "./other"; export const X = (p: { width: Dim }) => <div style={{ width: p.width as Dim }} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['import { clamp } from "lodash"; export const X = ({ n }) => <div style={{ width: clamp(n, 0, 1) }} />;', "app/src/pages/Probe.tsx"],
  ]) assert.equal(await hasInline(code, path), false, `${path}: ${code}`);
});

test("[guardrails.inline-token.no-token-style] a DOM style write is a style: a property, setProperty, Object.assign and the attribute", async () => {
  const TOKEN = 'import {tokens} from "../tokens";';
  const paint = (body) => `${TOKEN} export const paint = (el) => { ${body} };`;
  for (const body of [
    "el.style.width = tokens.shape.dimension.width.md;",
    "el.style['width'] = tokens.shape.dimension.width.md;",
    "el.style.width ||= tokens.shape.dimension.width.md;",
    "el.style.setProperty('width', tokens.shape.dimension.width.md);",
    "el.ownerDocument.documentElement.style.setProperty('--x', tokens.shape.dimension.width.md);",
    "el.style.cssText = `width: ${tokens.shape.dimension.width.md}`;",
    "el.style = `width: ${tokens.shape.dimension.width.md}`;",
    "const { style } = el; style.width = tokens.shape.dimension.width.md;",
    "const { style: s } = el; s.setProperty('width', tokens.shape.dimension.width.md);",
    "const s = el.style; s.width = tokens.shape.dimension.width.md;",
    "Object.assign(el.style, { width: tokens.shape.dimension.width.md });",
    "el.setAttribute('style', `width: ${tokens.shape.dimension.width.md}`);",
  ]) assert.equal(await hasInline(paint(body), "packages/paper-ui/src/internal/probe.ts"), true, body);
  assert.equal(await hasInline('import { pick } from "./other"; export const paint = (el) => { el.style.width = pick(); };', "packages/paper-ui/src/atoms/probe.ts"), true);
  assert.equal(await hasInline('import {tokens} from "@studio-baeks/paper-ui/tokens"; export const paint = (el) => { el.style.setProperty("width", tokens.shape.dimension.width.md); };', "app/src/pages/probe.ts"), true);
  for (const body of [
    "el.style.width = `${n}px`;",
    "el.style.setProperty('--x', String(n));",
    "el.dataset.token = tokens.color.ink.primary;",
    "el.setAttribute('data-token', tokens.color.ink.primary);",
    "el.title = tokens.color.ink.primary;",
    "Object.assign(el.dataset, { token: tokens.color.ink.primary });",
    "map.setProperty('width', tokens.shape.dimension.width.md);",
  ]) assert.equal(await hasInline(paint(body), "packages/paper-ui/src/internal/probe.ts"), false, body);
  assert.equal(await hasInline('import {measureSpace} from "../internal/measure"; export const paint = (el) => { el.style.width = `${measureSpace("md", el)}px`; };', "packages/paper-ui/src/atoms/probe.ts"), false);
});

test("[guardrails.inline-token.no-token-style] the rule reads package .ts and .tsx, and leaves stylesheets and tests alone", async () => {
  const token = 'import {tokens} from "../tokens"; export const props = () => ({style: {color: tokens.color.ink.primary}});';
  assert.equal(await hasInline(token, "packages/paper-ui/src/primitives/useProbe.ts"), true);
  assert.equal(await hasInline(token, "packages/paper-ui/src/primitives/Probe.css.ts"), false);
  assert.equal(await hasInline(token, "packages/paper-ui/src/primitives/probe.test.tsx"), false);
});

test("[guardrails.inline-token.no-token-style] an app .tsx tracks what the package hands it, and nothing else", async () => {
  const app = "app/src/pages/TokenProbe.tsx";
  for (const code of [
    'import {tokens} from "@studio-baeks/paper-ui/tokens"; export const X = () => <div style={{color: tokens.color.ink.primary}} />;',
    'import {tokens} from "@studio-baeks/paper-ui/tokens"; const gap = tokens.layout.gap.md; export const X = () => <div style={{gap}} />;',
    'import {tokens as t} from "@studio-baeks/paper-ui/tokens"; export const X = ({on}) => <div style={on ? {color: t.color.ink.primary} : undefined} />;',
    'import {tokens} from "@studio-baeks/paper-ui/tokens"; export const props = () => ({style: {padding: String(tokens.shape.inset.lg)}});',
    'import {focusRing} from "@studio-baeks/paper-ui/tokens"; export const X = () => <div style={focusRing} />;',
    'import {STATE_TINT} from "@studio-baeks/paper-ui/tokens"; export const X = () => <div style={{background: STATE_TINT}} />;',
    'import {elevation} from "@studio-baeks/paper-ui"; export const X = () => <div style={{zIndex: elevation.modal}} />;',
  ]) assert.equal(await hasInline(code, app), true, code);
  for (const code of [
    'export const X = ({style}) => <div style={style} />;',
    'export const X = ({columns}) => <div style={{gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`}} />;',
    'import {tokens} from "@studio-baeks/paper-ui/tokens"; import * as s from "./probe.css"; export const X = () => <div className={s.probe} data-gap={tokens.layout.gap.md} />;',
    'import {Swatch} from "./kit"; export const X = ({color}) => <Swatch color={color} />;',
    'export const X = ({color}) => <div style={{background: color}} />;',
  ]) assert.equal(await hasInline(code, app), false, code);
  // The stylesheets, the tests and the e2e specs are not read.
  const token = 'import {tokens} from "@studio-baeks/paper-ui/tokens"; export const X = () => <div style={{color: tokens.color.ink.primary}} />;';
  assert.equal(await hasInline(token, "app/src/pages/probe.css.ts"), false);
  assert.equal(await hasInline(token, "app/src/pages/probe.test.tsx"), false);
  // A plain .ts in the app is read like a .tsx.
  const plain = 'import {tokens} from "@studio-baeks/paper-ui/tokens"; export const props = { style: { color: tokens.color.ink.primary } };';
  assert.equal(await hasInline(plain, "app/src/pages/probe.ts"), true);
  assert.equal(await hasInline(plain, "app/src/pages/probe.test.ts"), false);
  assert.equal(await hasInline('export const props = { style: { color: "inherit" } };', "app/src/pages/probe.ts"), false);
  assert.equal(await hasInline('import {tokens} from "@studio-baeks/paper-ui/tokens"; export const props = { title: tokens.color.ink.primary };', "app/src/pages/probe.ts"), false);
});
