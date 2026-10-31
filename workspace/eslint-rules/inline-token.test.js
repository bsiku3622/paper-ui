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
    ['import {measureSpace} from "../internal/measure"; export const X = ({gap}) => <div style={{marginTop: measureSpace(gap)}} />;', "packages/paper-ui/src/primitives/float/Floating.tsx"],
    ['export const X = ({style}) => <div style={{...style}} />;', "packages/paper-ui/src/atoms/Field.tsx"],
  ]) assert.equal(await hasInline(code, path), false, `${path}: ${code}`);
  // The same shapes are reported when the value comes from a tracked module.
  assert.equal(await hasInline('import {overlayStyle} from "../../internal/shape"; export const X = (p) => <div style={overlayStyle(p)} />;', "packages/paper-ui/src/primitives/float/Floating.tsx"), true);
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
});
