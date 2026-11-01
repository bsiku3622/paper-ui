import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

import { STRUCTURAL, STYLE_CATEGORIES, categoryOf, isKeyframeSelector, isStructural, isStyleProperty, isUnit } from "./structural.js";

const eslint = new ESLint();
const reports = async (code, filePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.filter((message) => message.severity === 2 && message.ruleId === "paper/source-numbers");
const flagged = async (code, filePath) => (await reports(code, filePath)).length > 0;

const PACKAGE_CSS = "packages/paper-ui/src/atoms/Probe.css.ts";
const APP_CSS = "app/src/pages/Probe.css.ts";
const APP_TSX = "app/src/pages/Probe.tsx";
const css = (rule) => `import { style } from "@vanilla-extract/css";\nexport const probe = style(${rule});`;
const withTokens = (rule, specifier = "@studio-baeks/paper-ui/tokens") => `import { style } from "@vanilla-extract/css";\nimport { tokens } from "${specifier}";\nexport const probe = style(${rule});`;
const withVar = (rule) => `import { createVar, style } from "@vanilla-extract/css";\nconst v = createVar();\nexport const probe = style(${rule});`;
const before = (lines, rule) => `import { style } from "@vanilla-extract/css";\n${lines}\nexport const probe = style(${rule});`;

test("[guardrails.source-numbers.structural-only] a number, a unit or an easing in a style position is a source value unless it is structural, in the package and in the app", async () => {
  for (const rule of [
    "{ opacity: 0.5 }",
    "{ fontWeight: 600 }",
    "{ lineHeight: 1.04 }",
    "{ letterSpacing: '-0.035em' }",
    "{ transition: 'opacity 150ms ease' }",
    "{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }",
    "{ animation: 'spin 1s linear infinite' }",
    "{ paddingBlock: 'clamp(2rem, 8vh, 4rem)' }",
    "{ gap: 26 }",
    "{ padding: '0 28px' }",
    "{ borderRadius: 6 }",
    "{ border: '2px solid var(--x)' }",
    "{ outlineOffset: '3px' }",
    "{ top: 20 }",
    "{ transform: 'translateY(1px)' }",
    "{ transform: 'scale(1.02)' }",
    "{ transform: 'rotate(30deg)' }",
    "{ margin: `calc(${'var(--x)'} * 3)` }",
    "{ fontSize: '14px' }",
    "{ wordSpacing: '0.2em' }",
    "{ textUnderlineOffset: '0.2em' }",
    "{ opacity: dense ? 0.4 : 1 }",
    "{ gap: dense && '4px' }",
    "{ selectors: { '&:hover': { opacity: 0.8 } } }",
    "{ '@media': { '(min-width: 40em)': { padding: '9px' } } }",
    "[{ gap: 4 }, { color: 'var(--x)' }]",
    "{ padding: pad(8) }",
  ]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), true, `app ${rule}`);
  }
});

test("[guardrails.source-numbers.structural-only] the package takes dimension from roles too, and the app owns its screen's dimensions", async () => {
  for (const rule of ["{ width: 16 }", "{ width: '1.25rem' }", "{ minHeight: '3em' }", "{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }", "{ aspectRatio: '16 / 9' }", "{ flexBasis: '10rem' }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
  }
  for (const rule of ["{ width: 218, height: 58 }", "{ maxWidth: 1540 }", "{ gridTemplateColumns: '218px minmax(0,1fr) 260px' }", "{ minWidth: '44rem' }", "{ flexBasis: '10rem' }"]) {
    assert.equal(await flagged(css(rule), APP_CSS), false, `app ${rule}`);
  }
});

test("[guardrails.source-numbers.structural-only] every structural value, a role and a name stay open", async () => {
  for (const rule of [
    "{ margin: 0, padding: '0px', gap: '0rem', top: 0 }",
    "{ width: '100%', height: '100%', minWidth: 0, maxWidth: '100%' }",
    "{ transform: 'translate(-50%, -50%)', insetInlineStart: '50%' }",
    "{ transform: 'rotate(45deg)' }",
    "{ transform: 'rotate(-90deg) rotate(180deg)' }",
    "{ gridTemplateColumns: 'minmax(0, 1fr)' }",
    "{ gridTemplateColumns: '1fr auto' }",
    "{ opacity: 0 }",
    "{ opacity: 1 }",
    "{ flex: 1, flexGrow: 1, flexShrink: 0, scale: 1 }",
    "{ aspectRatio: 1 }",
    "{ aspectRatio: '1' }",
    "{ marginLeft: 'calc(var(--x) / 2)', marginTop: 'calc(var(--x) * -1)' }",
    "{ animationIterationCount: '1 !important' }",
    "{ padding: tokens.shape.inset.lg, gap: tokens.layout.gap.md, borderRadius: tokens.shape.radius.control, fontSize: tokens.typography.role.body.size }",
    "{ fontWeight: emphasisRule('semibold').fontWeight, transition: transition('hover', 'color') }",
    "{ zIndex: 0 }",
    "{ width: 'var(--pui-shape-dimension-width-3xl)' }",
    "{ display: 'grid', content: '\"2px\"' }",
    "{ selectors: { '&:nth-child(2)': { padding: 0 } } }",
    "{ ...typographyRule('caption'), ...elevationStyle('overlay') }",
    "{ boxShadow: strokeRing(tokens.color.ink.tertiary) }",
  ]) assert.equal(await flagged(css(rule), PACKAGE_CSS), false, rule);
});

test("[guardrails.source-numbers.structural-only] the check follows a same-file const, a template, a mapper and JSX style", async () => {
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nconst S = 16;\nexport const probe = style({ width: S });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nexport const probe = style({ width: `${16}px` });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nconst SIZES = { sm: 12, md: 16 };\nexport const probe = style({ width: SIZES.md });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { styleVariants } from '@vanilla-extract/css';\nexport const probe = styleVariants({ a: 1 }, (value) => ({ gap: '4px' }));", PACKAGE_CSS), true);
  assert.equal(await flagged("import { layered } from '../tokens/layers.css';\nconst { style } = layered('components');\nexport const probe = style({ gap: '4px' });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { layered } from '../tokens/layers.css';\nexport const probe = layered('components').style({ gap: '4px' });", PACKAGE_CSS), true);
  assert.equal(await flagged("export const X = ({ dense }) => <div style={{ padding: dense ? '4px' : '8px' }} />;", APP_TSX), true);
  // One const, read by each property that reads it: the app's width does not hide its padding.
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nconst S = '8px';\nexport const probe = style({ width: S, padding: S });", APP_CSS), true);
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nconst S = '8px';\nexport const probe = style({ width: S, height: S });", APP_CSS), false);
  assert.equal(await flagged("export const props = { style: { marginTop: 8 } };", APP_TSX), true);
  assert.equal(await flagged("export const X = () => <Box style={{ width: 218, gridTemplateColumns: '1fr 2fr' }} />;", APP_TSX), false);
  // Outside a style position a number is a number.
  assert.equal(await flagged("export const X = () => <Box padding='md' data-count={8}>{16}</Box>; export const n = { padding: 8 };", APP_TSX), false);
  assert.equal(await flagged("export const n = { count: 8 };", "packages/paper-ui/src/internal/probe.ts"), false);
});

test("[guardrails.source-numbers.structural-only] a property no category names is read all the same, with structural.js as the allowlist", async () => {
  for (const rule of ["{ scale: 1.2 }", "{ rotate: '13deg' }", "{ order: 3 }", "{ strokeDasharray: '2 2' }", "{ strokeDashoffset: 3 }", "{ backgroundSize: '16px' }", "{ clipPath: 'inset(4px)' }", "{ textIndent: '1em' }", "{ flex: '0 0 240px' }", "{ WebkitLineClamp: 3 }", "{ someFutureProperty: 7 }", "{ '--x': '16px' }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), true, `app ${rule}`);
  }
  for (const rule of ["{ scale: 1 }", "{ rotate: '45deg' }", "{ order: 0 }", "{ backgroundSize: '100%' }", "{ clipPath: 'inset(0)' }", "{ textIndent: 0 }", "{ strokeDashoffset: 0 }", "{ flex: '1 1 0' }", "{ someFutureProperty: 'auto' }", "{ '--x': '0px' }", "{ gridArea: 'brand' }", "{ padding: tokens.shape.inset['2xl'] }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), false, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), false, `app ${rule}`);
  }
  // Tab stops and grid lines are the screen's dimensions: the app states them, the package does not.
  for (const rule of ["{ tabSize: 4 }", "{ gridColumn: '2 / -2' }", "{ gridColumnStart: 2 }", "{ gridRow: 3 }", "{ gridArea: '1 / 2 / 3 / 4' }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), false, `app ${rule}`);
  }
  // A selector and a condition are not values.
  for (const rule of ["{ selectors: { '&:nth-child(2)': { padding: 0 } } }", "{ selectors: Object.fromEntries(ITEMS.map((_, index) => [`&:nth-child(${index + 1})`, { padding: 0 }])) }", "{ '@supports': { '(width: 1dvh)': { padding: 0 } } }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), false, rule);
  }
  assert.equal(await flagged("import { globalStyle } from '@vanilla-extract/css';\nglobalStyle(`${s} > :nth-child(${n(2)})`, { padding: 0 });", APP_CSS), false);
  assert.equal(await flagged(css("{ selectors: { '&:hover': { order: 3 } } }"), PACKAGE_CSS), true);
});

test("[guardrails.source-numbers.structural-only] a custom property's value under `vars` is read; in the app a variable holds a dimension only when a same-file rule reads it as one", async () => {
  for (const rule of ["{ vars: { [v]: '16px' }, width: v }", "{ vars: { [v]: 0.5 } }", "{ vars: { '--x': '16px' } }", "{ vars: { [v]: pick(8) } }", "{ '@media': { '(hover: hover)': { vars: { [v]: '3px' } } } }", "{ selectors: { '&:hover': { vars: { [v]: '3px' } } } }"]) {
    assert.equal(await flagged(withVar(rule), PACKAGE_CSS), true, `package ${rule}`);
  }
  for (const rule of ["{ vars: { [v]: '0px' }, width: v }", "{ vars: { [v]: 'none' } }", "{ vars: { [v]: tokens.shape.inset.md }, padding: v }", "{ vars: { [v]: `calc(${tokens.shape.inset.md} / 2)` } }"]) {
    assert.equal(await flagged(withVar(rule), PACKAGE_CSS), false, `package ${rule}`);
    assert.equal(await flagged(withVar(rule), APP_CSS), false, `app ${rule}`);
  }
  for (const rule of ["{ vars: { [v]: '16px' }, padding: v }", "{ vars: { [v]: '52px' }, top: v }", "{ vars: { [v]: '52px' } }", "{ vars: { '--x': '52px' }, height: 'var(--x)' }"]) {
    assert.equal(await flagged(withVar(rule), APP_CSS), true, `app ${rule}`);
  }
  for (const rule of ["{ vars: { [v]: '52px' }, height: v }", "{ vars: { [v]: '52px' }, top: v, minHeight: `calc(100vh - ${v})` }"]) {
    assert.equal(await flagged(withVar(rule), APP_CSS), false, `app ${rule}`);
    assert.equal(await flagged(withVar(rule), PACKAGE_CSS), true, `package ${rule}`);
  }
});

test("[guardrails.source-numbers.structural-only] a number passed to a function returning a style is read, by the property it reaches when the function is in the file", async () => {
  for (const [lines, rule] of [
    ["const pick = (n) => ({ width: n });", "pick(16)"],
    ["function pick(n) { return { width: n }; }", "pick(16)"],
    ["const pick = (n) => { const w = n; return { width: w }; };", "pick(16)"],
    ["const pick = (n) => { if (n) return { width: n }; return {}; };", "pick(16)"],
    ["const pick = (n = 16) => ({ width: n });", "pick()"],
    ["const pick = (o) => ({ width: o.w });", "pick({ w: 16 })"],
    ["const pick = ({ w }) => ({ width: w });", "pick({ w: 16 })"],
    ["const pick = (...sizes) => ({ width: sizes });", "pick(8, 16)"],
    ["const pick = (n) => ({ width: `${n}px` });", "pick(16)"],
    ["const pick = (n) => ({ width: n });", "{ ...pick(0), ...pick(16) }"],
    ["const size = () => ({ width: 16 });", "size()"],
    ["const px = (n) => `${n}px`;", "{ width: px(16) }"],
    ["import { f } from './helper';", "f(0.5)"],
    ["import { f } from './helper';", "[f('16px')]"],
    ["import { f } from './helper';", "{ ...f(16) }"],
    ["", "Object.fromEntries([['width', 16]])"],
    ["const pick = (n) => ({ width: n });", "pick(pick(16))"],
    ["const SIZES = { sm: 16 };", "{ width: SIZES?.sm }"],
    ["import { f } from './helper';", "f.bind(null, 16)()"],
    ["const made = f(16);", "made()"],
    ["", "[16].map((n) => ({ width: n }))"],
  ]) assert.equal(await flagged(before(lines, rule), PACKAGE_CSS), true, `${lines} style(${rule})`);
  for (const [lines, rule] of [
    ["const pick = (n) => ({ width: n });", "pick(0)"],
    ["const pick = (n) => ({ width: n });", "pick(tokens.shape.dimension.width.md)"],
    ["import { SIZES } from './sizes';\nconst pick = (n) => ({ width: SIZES[n] });", "pick(3)"],
    ["import { f } from './helper';", "f('caption')"],
    ["import { f } from './helper';", "f('2xl')"],
    ["import { f } from './helper';", "f(0)"],
    ["", "{ gap: 0 }, 'debug-2'"],
  ]) assert.equal(await flagged(before(lines, rule), PACKAGE_CSS), false, `${lines} style(${rule})`);
  // The property it reaches decides, so the app states its own dimension through a helper and nothing else.
  assert.equal(await flagged(before("const pick = (n) => ({ width: n });", "pick(16)"), APP_CSS), false);
  assert.equal(await flagged(before("const pick = (n) => ({ padding: n });", "pick(16)"), APP_CSS), true);
  assert.equal(await flagged(before("import { f } from './helper';", "f(0.5)"), APP_CSS), true);
  // A mapper's parameter is an entry of its table; an entry it does not read is not a value.
  const mapped = (table, mapper) => `import { styleVariants } from "@vanilla-extract/css";\nexport const probe = styleVariants(${table}, ${mapper});`;
  assert.equal(await flagged(mapped("{ sm: 8, md: 16 }", "(value) => ({ gap: value })"), PACKAGE_CSS), true);
  assert.equal(await flagged(mapped("{ sm: 8, md: 16 }", "(_, name) => ({ gridArea: name })"), PACKAGE_CSS), false);
  assert.equal(await flagged(mapped("{ sm: 8, md: 16 }", "(value) => ({ width: value })"), APP_CSS), false);
  assert.equal(await flagged(mapped("{ sm: 8, md: 16 }", "(value) => ({ gap: value })"), APP_CSS), true);
});

test("[guardrails.source-numbers.structural-only] a parameter of a same-file function whose body calls a style API reads what its calls hand it, in the package and in the app", async () => {
  for (const [lines, property] of [
    ["const f = (o: number) => style({ opacity: o }); f(0.5);", "opacity"],
    ["function f(o) { return style({ opacity: o }); } f(0.5);", "a declaration"],
    ["const f = (o) => { const rule = style({ opacity: o }); return rule; }; f(0.5);", "a statement"],
    ["const f = (o) => { globalStyle('a', { opacity: o }); }; f(0.5);", "no return"],
    ["const inner = (o) => style({ opacity: o }); const outer = (o) => inner(o); outer(0.5);", "handed on"],
    ["const f = ({ o }) => style({ opacity: o }); f({ o: 0.5 });", "a pattern"],
    ["const f = (a) => style({ opacity: a.o }); f({ o: 0.5 });", "a member"],
    ["const f = (o) => style({ opacity: o }); const g = f; g(0.5);", "an alias"],
    ["const f = (o) => style({ opacity: o }); f(1); f(0.5);", "the second call"],
    ["const f = (o) => style({ opacity: o }); f(...[0.5]);", "a spread"],
    ["const f = (o = 0.5) => style({ opacity: o }); f();", "a default"],
    ["const t = (s, m) => style({ fontSize: s, transition: m }); t('14px', 'color 150ms ease');", "two parameters"],
    ["const t = (m) => style({ transition: m }); t('color var(--x) ease');", "an easing"],
  ]) {
    const code = `import { globalStyle, style } from "@vanilla-extract/css";\n${lines}`;
    assert.equal(await flagged(code, PACKAGE_CSS), true, `package ${property}: ${lines}`);
    assert.equal(await flagged(code, APP_CSS), true, `app ${property}: ${lines}`);
  }
  const code = (lines) => `import { style } from "@vanilla-extract/css";\nimport { tokens } from "@studio-baeks/paper-ui/tokens";\n${lines}`;
  for (const lines of [
    "const f = (o) => style({ opacity: o }); f(1); f(0);",
    "const f = (o) => style({ opacity: o }); export const g = f;",
    "const f = (n) => style({ opacity: 0 }); f(0.5);",
    "const f = (o) => o * 2; f(0.5);",
    "const pad = (n) => style({ padding: n }); pad(tokens.shape.inset.md);",
    "const pad = (n) => style({ padding: tokens.shape.inset[n] }); pad('2xl');",
    "const pick = (a, b) => style({ padding: a, gridArea: 'x' }); pick(0, 13);",
  ]) {
    assert.equal(await flagged(code(lines), PACKAGE_CSS), false, `package ${lines}`);
    assert.equal(await flagged(code(lines), APP_CSS), false, `app ${lines}`);
  }
  assert.equal(await flagged(code("const pad = (n) => style({ padding: n }); pad(13);"), APP_CSS), true);
  // The property it reaches decides: the app states its own dimension through a helper.
  assert.equal(await flagged(code("const w = (n) => style({ width: n }); w(13);"), APP_CSS), false);
  assert.equal(await flagged(code("const w = (n) => style({ width: n }); w(13);"), PACKAGE_CSS), true);
  // JSX and a DOM write are style positions the same way.
  for (const lines of [
    "const mk = (p) => <div style={{ padding: p }} />; export const a = mk(13);",
    "const Inner = ({ p }) => <div style={{ padding: p }} />; export const X = () => <Inner p={13} />;",
    "const Inner = (props) => <div style={{ padding: props.p }} />; export const X = () => <Inner p={13} />;",
    "const set = (el, p) => { el.style.padding = p; }; set(el, '16px');",
  ]) assert.equal(await flagged(lines, APP_TSX), true, lines);
  for (const lines of [
    "const Inner = ({ p, q }) => <div style={{ padding: p }} data-q={q} />; export const X = () => <Inner p='md' q={13} />;",
    "const Inner = (props) => <div style={{ padding: props.p }} />; export const X = () => <Inner p='md' q={13} />;",
    "const Inner = ({ p }) => <div data-p={p} />; export const X = () => <Inner p={13} />;",
  ]) assert.equal(await flagged(lines, APP_TSX), false, lines);
});

test("[guardrails.source-numbers.structural-only] a `.map` or `.forEach` callback's parameter reads the literal entries it runs over", async () => {
  for (const lines of [
    "[13, 14].map((n) => style({ padding: n }));",
    "[13].forEach((n) => { globalStyle('a', { padding: n }); });",
    "[13].flatMap((n) => [style({ padding: n })]);",
    "const SIZES = [13, 14]; SIZES.map((n) => style({ padding: n }));",
    "const SIZES = [13, 14] as const; SIZES.map((n) => style({ padding: n }));",
    "[[13]].map(([n]) => style({ padding: n }));",
    "[{ p: 13 }].map(({ p }) => style({ padding: p }));",
    "[{ p: 13 }].map((o) => style({ padding: o.p }));",
    "const make = (n) => style({ padding: n }); [13].map(make);",
    "Object.values({ a: 13 }).map((n) => style({ padding: n }));",
    "Object.entries({ a: 13 }).map(([, n]) => style({ padding: n }));",
    "const list = (sizes) => sizes.map((n) => style({ padding: n })); list([13]);",
    "for (const n of [13, 14]) style({ padding: n });",
    "[13].filter(Boolean).map((n) => style({ padding: n }));",
    "export const probe = style([13].map((n) => ({ padding: n })));",
  ]) {
    const code = `import { globalStyle, style } from "@vanilla-extract/css";\n${lines}`;
    assert.equal(await flagged(code, PACKAGE_CSS), true, `package ${lines}`);
    assert.equal(await flagged(code, APP_CSS), true, `app ${lines}`);
  }
  for (const lines of [
    "[0, 1].map((n) => style({ opacity: n }));",
    "[13, 14].map(() => style({ gap: 0 }));",
    "[13, 14].map((_, index) => style({ gap: 0, gridArea: `a${index}` }));",
    "[13, 14].map((n) => String(n));",
    "Object.entries({ a: 13 }).map(([name]) => style({ gridArea: name }));",
    "Object.keys({ a: 13 }).map((name) => style({ gridArea: name }));",
    "import { SPACES, tokens } from '@studio-baeks/paper-ui/tokens'; SPACES.map((step) => style({ gap: tokens.layout.gap[step] }));",
  ]) {
    const code = `import { style } from "@vanilla-extract/css";\n${lines}`;
    assert.equal(await flagged(code, PACKAGE_CSS), false, `package ${lines}`);
    assert.equal(await flagged(code, APP_CSS), false, `app ${lines}`);
  }
  // The property it reaches decides.
  assert.equal(await flagged(css("[218].map((n) => ({ width: n }))"), APP_CSS), false);
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\n[218, 58].map((n) => style({ width: n }));", APP_CSS), false);
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\n[218, 58].map((n) => style({ width: n }));", PACKAGE_CSS), true);
});

test("[guardrails.source-numbers.structural-only] an imported style API is read by its original name", async () => {
  for (const code of [
    "import { style as s } from '@vanilla-extract/css'; s({ padding: 13 });",
    "import { style as s } from '@vanilla-extract/css'; const pad = (n) => s({ padding: n }); pad(13);",
    "import { globalStyle as g } from '@vanilla-extract/css'; g('a', { padding: 13 });",
    "import { styleVariants as v } from '@vanilla-extract/css'; v({ sm: 13 }, (n) => ({ padding: n }));",
    "import { keyframes as k } from '@vanilla-extract/css'; k({ '25%': { opacity: 0 } });",
  ]) {
    assert.equal(await flagged(code, APP_CSS), true, code);
  }
  for (const code of [
    "import { style as s } from '@vanilla-extract/css'; s({ padding: tokens.shape.inset.md, opacity: 1 });",
    "import { pad as style } from './pad'; style({ padding: 13 });",
    "import { pad } from './pad'; pad({ padding: 13 });",
  ]) assert.equal(await flagged(code, APP_CSS), false, code);
});

test("[guardrails.source-numbers.structural-only] in the package a style-keyed object literal is a style position wherever it is written", async () => {
  const PLAIN = ["packages/paper-ui/src/internal/probe.ts", "packages/paper-ui/src/atoms/recipes/probe.ts", "packages/paper-ui/src/primitives/probe.ts", "packages/paper-ui/src/theme/probe.ts", "packages/paper-ui/src/atoms/Probe.tsx", "packages/paper-ui/src/atoms/Probe.css.ts"];
  for (const code of [
    "export const faded = { width: 16, opacity: 0.5 };",
    "export const faded = { opacity: 0.5, fontSize: '14px', transition: 'color 150ms ease' };",
    "export const faded = { transition: 'color var(--x) ease' };",
    "export const faded = { opacity: 0.5 } as const;",
    "export const faded = { scale: 1.2 };",
    "export const faded = { order: 3 };",
    "export const faded = { backgroundSize: '16px' };",
    "export const faded = { selectors: { '&:hover': { opacity: 0.5 } } };",
    "export const faded = { vars: { [v]: '16px' } };",
    "export const faded = { '--x': '16px' };",
    "export const faded = { '@media': { '(max-width: 760px)': { gap: 0 } } };",
    "export const faded = { zIndex: 5 };",
    "const opacity = 0.5; export const faded = { opacity };",
    "const pick = (n) => ({ width: n }); export const faded = pick(16);",
    "const pick = (n) => { const rule = { width: n }; return rule; }; export const faded = pick(16);",
    "export const faded = (n = 16) => ({ width: n });",
    "export const geometry = { button: sizes((size) => ({ height: height[size], paddingInline: 8 } satisfies StyleRule)) };",
  ]) for (const path of PLAIN) assert.equal(await flagged(code, path), true, `${path}: ${code}`);
  for (const code of [
    "export const n = { count: 8, rows: 4, delay: 300 };",
    "export const point = { x: 16, y: 8 };",
    "export const geometry = { height: tokens.shape.control.height.md, paddingInline: 0, ...elevationStyle('overlay') };",
    "export const fill = { gap: 'md', padding: '2xl', border: true, width: 'full' };",
    "export const options = { filter: (value) => value > 8 };",
    "export const faded = { opacity: 1, boxShadow: 'none', zIndex: 0 };",
    "const pick = (n) => ({ count: n }); export const counted = pick(16);",
    "const pick = (n) => ({ width: n }); export const zero = pick(0);",
    "export const copy = { title: 'Step 3', label: '16px' };",
    "export const byIndex = { 0: 'a', 1: 'b' };",
    "export const geometry = { button: sizes((size) => ({ height: height[size], paddingInline: 0 } satisfies StyleRule)) };",
  ]) for (const path of PLAIN) assert.equal(await flagged(code, path), false, `${path}: ${code}`);
  // The token layer holds the values, a test asserts them, and the app keeps its own objects.
  assert.equal(await flagged("export const faded = { opacity: 0.5 };", "packages/paper-ui/src/tokens/probe.ts"), false);
  assert.equal(await flagged("export const faded = { opacity: 0.5 };", "packages/paper-ui/src/atoms/Probe.test.ts"), false);
  assert.equal(await flagged("export const faded = { opacity: 0.5 };", "app/src/pages/probe.ts"), false);
});

test("[guardrails.source-numbers.structural-only] a DOM style write is a style position", async () => {
  const paint = (body) => `export const paint = (el) => { ${body} };`;
  for (const body of ["el.style.opacity = '0.5';", "el.style.padding = '16px';", "el.style.setProperty('padding', '16px');", "el.style.setProperty('--x', '16px');", "el.style.cssText = 'padding: 16px';", "const s = el.style; s.padding = '16px';"]) {
    assert.equal(await flagged(paint(body), "packages/paper-ui/src/internal/probe.ts"), true, `package ${body}`);
    assert.equal(await flagged(paint(body), "app/src/pages/probe.ts"), true, `app ${body}`);
  }
  assert.equal(await flagged(paint("el.style.width = '16px';"), "packages/paper-ui/src/internal/probe.ts"), true);
  assert.equal(await flagged(paint("el.style.width = '16px';"), "app/src/pages/probe.ts"), false);
  for (const body of ["el.style.opacity = '1';", "el.style.padding = `${n}px`;", "el.style.setProperty('--x', String(n));", "el.width = 16;", "map.setProperty('padding', '16px');"]) {
    assert.equal(await flagged(paint(body), "packages/paper-ui/src/internal/probe.ts"), false, body);
  }
});

test("[guardrails.source-numbers.structural-only] the token layer and tests are not read", async () => {
  assert.equal(await flagged("export const SOURCE = { space: { sm: 8 } };", "packages/paper-ui/src/tokens/shape.ts"), false);
  assert.equal(await flagged(css("{ padding: '9px' }"), "packages/paper-ui/src/tokens/probe.css.ts"), false);
  assert.equal(await flagged(css("{ padding: '9px' }"), "packages/paper-ui/src/atoms/Probe.test.ts"), false);
  assert.equal(await flagged(css("{ padding: '9px' }"), "fixtures/harness/src/probe.css.ts"), false);
});

test("[guardrails.source-numbers.media-keys] a media or container query takes its length from tokens.layout.breakpoint", async () => {
  for (const rule of [
    "{ '@media': { 'screen and (max-width: 760px)': { gap: 0 } } }",
    "{ '@media': { '(min-width: 40em)': { gap: 0 } } }",
    "{ '@container': { '(min-width: 30rem)': { gap: 0 } } }",
    "{ '@media': { [`(max-width: 760px)`]: { gap: 0 } } }",
    "{ '@media': { [NARROW]: { gap: 0 } } }",
    "{ '@media': { '(max-width: 760PX)': { gap: 0 } } }",
    "{ '@media': { '(width >= 40lh)': { gap: 0 } } }",
  ]) {
    const code = rule.includes("NARROW") ? `import { style } from "@vanilla-extract/css";\nconst NARROW = "(max-width: 760px)";\nexport const probe = style(${rule});` : css(rule);
    assert.equal(await flagged(code, PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(code, APP_CSS), true, `app ${rule}`);
  }
  for (const rule of [
    "{ '@media': { '(prefers-reduced-motion: reduce)': { gap: 0 }, '(prefers-contrast: more)': { gap: 0 }, '(hover: hover)': { gap: 0 }, '(min-width: 0)': { gap: 0 } } }",
    "{ '@media': { '(min-resolution: 2dppx)': { gap: 0 } } }",
  ]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), false, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), false, `app ${rule}`);
  }
  // A keyframes block opens and closes at structural selectors.
  assert.equal(await flagged("import { keyframes } from '@vanilla-extract/css';\nexport const probe = keyframes({ '0%': { opacity: 0 }, '25%': { opacity: 1 }, '100%': { opacity: 0 } });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { keyframes } from '@vanilla-extract/css';\nexport const probe = keyframes({ from: { opacity: 0 }, '50%': { opacity: 1 }, to: { opacity: 0 } });", PACKAGE_CSS), false);
});

test("[guardrails.source-numbers.media-keys] a query key is followed through tables, calls and templates, and what cannot be read is reported", async () => {
  for (const [lines, rule] of [
    ["const M = { a: '(max-width: 760px)' };", "{ '@media': { [M.a]: { gap: 0 } } }"],
    ["const M = { a: { b: '(max-width: 760px)' } };", "{ '@media': { [M.a.b]: { gap: 0 } } }"],
    ["const M = { a: '(max-width: 760px)' };", "{ '@media': { [M[key]]: { gap: 0 } } }"],
    ["const M = { a: '(max-width: 760px)' } as const;", "{ '@media': { [M.a]: { gap: 0 } } }"],
    ["const q = (w) => `(max-width: ${w}px)`;", "{ '@media': { [q(760)]: { gap: 0 } } }"],
    ["function q(w) { return `(max-width: ${w}px)`; }", "{ '@media': { [q(760)]: { gap: 0 } } }"],
    ["const q = () => '(max-width: 760px)';", "{ '@media': { [q()]: { gap: 0 } } }"],
    ["const w = 760;", "{ '@media': { [`(max-width: ${w}px)`]: { gap: 0 } } }"],
    ["const w = '760px';", "{ '@media': { [`(max-width: ${w})`]: { gap: 0 } } }"],
    ["const w = '760px';", "{ '@media': { ['(max-width: ' + w + ')']: { gap: 0 } } }"],
    ["const q = (n = 760) => `(max-width: ${n}px)`;", "{ '@media': { [q()]: { gap: 0 } } }"],
    ["const q = ({ n = 760 } = {}) => `(max-width: ${n}px)`;", "{ '@media': { [q()]: { gap: 0 } } }"],
    ["import { tokens } from '@studio-baeks/paper-ui/tokens';\nconst q = (w = tokens.layout.breakpoint.md) => `(max-width: ${w})`;", "{ '@media': { [q('760px')]: { gap: 0 } } }"],
    ["const rule = (q) => ({ '@media': { [q]: { gap: 0 } } });", "rule('(max-width: 760px)')"],
    ["const rule = (block) => ({ '@media': block });", "rule({ '(max-width: 760px)': { gap: 0 } })"],
    ["import { q } from './queries';", "{ '@media': { [q(760)]: { gap: 0 } } }"],
    ["import { Q } from './queries';", "{ '@media': { [Q]: { gap: 0 } } }"],
    ["import { Q } from './queries';", "{ '@media': { [Q.narrow]: { gap: 0 } } }"],
    ["import { Q } from './queries';", "{ '@media': { [`screen and ${Q}`]: { gap: 0 } } }"],
    ["import { q } from './queries';\nimport { tokens } from '@studio-baeks/paper-ui/tokens';", "{ '@media': { [q(tokens.layout.breakpoint.md)]: { gap: 0 } } }"],
    ["const block = { '(max-width: 760px)': { gap: 0 } };", "{ '@media': block }"],
    ["", "{ '@media': { ...{ '(max-width: 760px)': { gap: 0 } } } }"],
    ["const on = true;", "{ '@media': { ...(on ? { '(max-width: 760px)': { gap: 0 } } : {}) } }"],
    ["import { block } from './queries';", "{ '@media': block }"],
    ["import { block } from './queries';", "{ '@media': { ...block } }"],
    // Only the breakpoint role passes, and only the real one.
    ["import { tokens } from '@studio-baeks/paper-ui/tokens';", "{ '@media': { [`(max-width: ${tokens.shape.dimension.width.md})`]: { gap: 0 } } }"],
    ["const tokens = { layout: { breakpoint: { md: '760px' } } };", "{ '@media': { [`(max-width: ${tokens.layout.breakpoint.md})`]: { gap: 0 } } }"],
    ["import { tokens } from './fake';", "{ '@media': { [`(max-width: ${tokens.layout.breakpoint.md})`]: { gap: 0 } } }"],
    ["", "{ '@media': { [`(max-width: ${tokens.layout.breakpoint.md})`]: { gap: 0 } } }"],
  ]) {
    assert.equal(await flagged(before(lines, rule), PACKAGE_CSS), true, `package ${lines} ${rule}`);
    assert.equal(await flagged(before(lines, rule), APP_CSS), true, `app ${lines} ${rule}`);
  }
  const BP = "import { tokens } from '@studio-baeks/paper-ui/tokens';";
  for (const [lines, rule] of [
    [BP, "{ '@media': { [`screen and (max-width: ${tokens.layout.breakpoint.md})`]: { gap: 0 } } }"],
    [BP, "{ '@media': { [`(min-width: ${tokens.layout.breakpoint.sm}) and (max-width: ${tokens.layout.breakpoint.lg})`]: { gap: 0 } } }"],
    [`${BP}\nconst BP = tokens.layout.breakpoint;\nconst narrow = \`screen and (max-width: \${BP.md})\`;`, "{ '@media': { [narrow]: { gap: 0 } } }"],
    [`${BP}\nconst { breakpoint } = tokens.layout;`, "{ '@media': { [`(max-width: ${breakpoint.md})`]: { gap: 0 } } }"],
    [`${BP}\nconst { layout: { breakpoint: bp } } = tokens;`, "{ '@media': { [`(max-width: ${bp.md})`]: { gap: 0 } } }"],
    [`${BP}\nconst BP = tokens.layout.breakpoint;`, "{ '@media': { [`(max-width: ${BP[size]})`]: { gap: 0 } } }"],
    [`${BP}\nconst q = (w) => \`(max-width: \${w})\`;`, "{ '@media': { [q(tokens.layout.breakpoint.md)]: { gap: 0 } } }"],
    [`${BP}\nconst q = (w = tokens.layout.breakpoint.md) => \`(max-width: \${w})\`;`, "{ '@media': { [q()]: { gap: 0 } } }"],
    [`${BP}\nconst q = (w = tokens.layout.breakpoint.md) => \`(max-width: \${w})\`;`, "{ '@media': { [q(tokens.layout.breakpoint.sm)]: { gap: 0 } } }"],
    [`${BP}\nconst M = { a: \`(max-width: \${tokens.layout.breakpoint.md})\` };`, "{ '@media': { [M.a]: { gap: 0 } } }"],
    ["const M = { a: '(hover: hover)', b: '(max-width: 760px)' };", "{ '@media': { [M.a]: { gap: 0 } } }"],
    ["const FORCED = '(forced-colors: active)';", "{ '@media': { [FORCED]: { gap: 0 }, [`(hover: hover) and ${FORCED}`]: { gap: 0 } } }"],
    ["const on = true;\nconst FORCED = '(forced-colors: active)';", "{ '@media': { ...(on ? { [FORCED]: { gap: 0 } } : {}), ...(on && { '(hover: hover)': { gap: 0 } }) } }"],
    ["const block = { '(hover: hover)': { gap: 0 } };", "{ '@media': block }"],
  ]) {
    assert.equal(await flagged(before(lines, rule), PACKAGE_CSS), false, `package ${lines} ${rule}`);
    assert.equal(await flagged(before(lines, rule), APP_CSS), false, `app ${lines} ${rule}`);
  }
  // The package reads the same role through the barrel.
  assert.equal(await flagged(withTokens("{ '@media': { [`(max-width: ${tokens.layout.breakpoint.md})`]: { gap: 0 } } }", "../tokens"), PACKAGE_CSS), false);
  // What a query holds is still read as a rule.
  assert.equal(await flagged(before("const FORCED = '(forced-colors: active)';", "{ '@media': { [FORCED]: { padding: '9px' } } }"), PACKAGE_CSS), true);
  assert.equal(await flagged(before("", "{ '@media': { ...{ '(hover: hover)': { padding: '9px' } } } }"), PACKAGE_CSS), true);
  // A dimension module's import says what the module says; anywhere else the same name cannot be read.
  const demo = before("import { DEMO_MEDIA, maxWidth } from './layout';", "{ '@media': { [DEMO_MEDIA.rail]: { gap: 0 }, [maxWidth(900)]: { gap: 0 } } }");
  assert.equal(await flagged(demo, "app/src/pages/demo/demo.css.ts"), false);
  assert.equal(await flagged(demo, "app/src/pages/demo.css.ts"), true);
});

test("[guardrails.source-numbers.depth-owners] depth is stated by the elevation owners and drawn as strokeRing()", async () => {
  for (const rule of ["{ zIndex: 5 }", "{ zIndex: 'var(--x)' }", "{ boxShadow: '0 0 0 1px var(--x)' }", "{ boxShadow: shadows.low }", "{ filter: 'blur(4px)' }", "{ boxShadow: tokens.layout.shadow }", "{ boxShadow: ring(tokens.color.ink.primary) }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), true, `app ${rule}`);
  }
  assert.equal(await flagged("export const X = () => <div style={{ zIndex: 1 }} />;", APP_TSX), true);
  for (const rule of ["{ boxShadow: 'none' }", "{ zIndex: 0 }", "{ boxShadow: strokeRing(tokens.color.border.base) }", "{ ...elevationStyle('overlay') }", "{ ...elevationStack('modal', 'var(--rank)'), ...elevationCast('modal') }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), false, rule);
  }
  const owners = ["packages/paper-ui/src/primitives/paint/Surface.css.ts", "packages/paper-ui/src/primitives/float/Floating.css.ts"];
  for (const owner of owners) {
    assert.equal(await flagged(css("{ zIndex: ELEVATION.z.overlay, boxShadow: ELEVATION.shadow.overlay }"), owner), false, owner);
    assert.equal(await flagged(css("{ zIndex: 5 }"), owner), true, `${owner} still writes no number`);
  }
});

test("[guardrails.source-numbers.app-roles] the app reads no typography palette", async () => {
  for (const code of [
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const bold = tokens.typography.palette.weight.bold;",
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const X = () => <b style={{ fontWeight: tokens.typography.palette.weight.bold }} />;",
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nconst { palette } = tokens.typography;\nexport const p = palette.weight.bold;",
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nconst { typography: { palette } } = tokens;\nexport const p = palette.weight.bold;",
  ]) assert.equal(await flagged(code, APP_TSX), true, code);
  const read = "import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const p = tokens.typography.palette.fontSize;";
  // No page is excused: the public tree has no palette, and the one that shows it reads it through the inspector alias.
  for (const path of ["app/src/playground/foundations/TypographyPage.tsx", "app/src/playground/foundations/typography-roles.ts", "app/src/playground/foundations/ShapePage.tsx"]) assert.equal(await flagged(read, path), true, path);
  assert.equal(await flagged("import { TYPOGRAPHY } from '@paper-ui/inspect/typography';\nexport const p = TYPOGRAPHY.palette.fontSize;", "app/src/playground/foundations/TypographyPage.tsx"), false);
  assert.equal(await flagged("import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const p = tokens.typography.role.body.size;", APP_TSX), false);
});

test("[guardrails.source-numbers.app-roles] the module the manifest declares for a page's dimensions is left alone", async () => {
  const frame = "export const DEMO_LAYOUT = { frame: 1540 };\nexport const probe = { style: { padding: 24, opacity: 0.4 } };";
  assert.equal(await flagged(frame, "app/src/pages/demo/layout.ts"), false);
  assert.equal(await flagged(frame, "app/src/pages/demo/other.ts"), true);
});

test("structural.js names what is structural once", () => {
  assert.deepEqual(STRUCTURAL.percentages, [100, 50, -50]);
  assert.equal(categoryOf("paddingInlineStart"), "spacing");
  assert.equal(categoryOf("border-top-left-radius"), "form");
  assert.equal(categoryOf("borderTopColor"), undefined);
  assert.equal(categoryOf("zIndex"), "depth");
  assert.equal(categoryOf("transitionDuration"), "motion");
  assert.equal(categoryOf("gridTemplateColumns"), "dimension");
  assert.equal(categoryOf("gridColumnStart"), "dimension");
  assert.equal(categoryOf("tabSize"), "dimension");
  assert.equal(categoryOf("scale"), undefined);
  assert.equal(isStyleProperty("scale"), true);
  assert.equal(isStyleProperty("strokeDasharray"), true);
  assert.equal(isStyleProperty("padding"), true);
  assert.equal(isStyleProperty("--x"), true);
  assert.equal(isStyleProperty("WebkitLineClamp"), true);
  assert.equal(isStyleProperty("vars"), true);
  assert.equal(isStyleProperty("count"), false);
  assert.equal(isStyleProperty("x"), false);
  assert.equal(isUnit("px"), true);
  assert.equal(isUnit("%"), true);
  assert.equal(isUnit("xl"), false);
  assert.equal(isStructural({ property: "gridTemplateColumns", value: 1 }), true);
  assert.equal(isStructural({ property: "gridTemplateColumns", value: 2 }), false);
  assert.equal(categoryOf("display"), undefined);
  for (const [category, entries] of Object.entries(STYLE_CATEGORIES)) assert.ok(entries.length > 0, category);
  assert.equal(isStructural({ property: "opacity", value: 1 }), true);
  assert.equal(isStructural({ property: "zIndex", value: 1 }), false);
  assert.equal(isStructural({ property: "width", value: 50, unit: "%" }), true);
  assert.equal(isStructural({ property: "width", value: 33, unit: "%" }), false);
  assert.equal(isStructural({ property: "transform", value: 135, unit: "deg" }), true);
  assert.equal(isStructural({ property: "transform", value: 30, unit: "deg" }), false);
  assert.equal(isStructural({ property: "margin", value: 2, operator: "/" }), true);
  assert.equal(isStructural({ property: "margin", value: 3, operator: "/" }), false);
  assert.equal(isKeyframeSelector("50%"), true);
  assert.equal(isKeyframeSelector("25%"), false);
});
