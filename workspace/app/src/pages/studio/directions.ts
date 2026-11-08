// The levers the demo screens answer to inside the studio, and what each writes into PaperProvider's props. They are the directions the
// owner judges Paper by (the same names the owner's own host has), the ones that are a matter of the system's values: the canvas, the
// line, the corner, the one hue and the size of the reading text. Every colour here is a palette step, chosen by name.

import { hexOf } from "./color-source";
import type { LabSpec, LeverValue, PresetDef, TokenOverrides, TokenTree } from "./protocol";

const n = (step: string) => hexOf(`neutral.${step}`);

// A preset names levers by their keys. They are written as pairs, because a lever called `accent` in an object would be read as a CSS
// property and its value `blue` as a colour.
type Pairs = readonly (readonly [string, LeverValue])[];
const BASE: Pairs = [["canvas", "50"], ["lines", "base"], ["round", false], ["accent", "ink"], ["edges", "shadow"], ["text", "base"]];
const preset = (id: string, label: string, note: string, ...changes: Pairs): PresetDef => ({ id, label, note, values: Object.fromEntries([...BASE, ...changes]) });

export const PAPER_LAB: LabSpec = {
  levers: [
    { key: "canvas", label: "바탕", section: "방향", options: [{ value: "50", label: ".50 (지금)" }, { value: "100", label: ".100" }, { value: "white", label: "흰색, 보드는 .100" }, { value: "pure", label: "전부 흰색" }] },
    { key: "lines", label: "선", section: "방향", options: [{ value: "base", label: "neutral.200 (지금)" }, { value: "alpha", label: "놓인 면의 10% 그늘" }] },
    { key: "round", label: "둥글게", section: "방향", note: "컨트롤 R16, 면 16 · 24 · 28" },
    { key: "accent", label: "포인트 색", section: "참고 화면에서 온 것", options: [{ value: "ink", label: "잉크 (지금)" }, { value: "blue", label: "파랑 하나" }] },
    { key: "edges", label: "면 가르기", section: "참고 화면에서 온 것", note: "카드의 그림자를 선 1px로", options: [{ value: "shadow", label: "그림자 (지금)" }, { value: "line", label: "선 1px" }] },
    { key: "text", label: "글자", section: "참고 화면에서 온 것", options: [{ value: "base", label: "지금" }, { value: "up", label: "한 단 크게" }] },
  ],
  presets: [
    preset("now", "지금", "Paper 그대로"),
    preset("clear", "맑게", "바탕 .100, 선은 놓인 면을 따라", ["canvas", "100"], ["lines", "alpha"]),
    preset("white", "순백", "바탕은 흰색, 카드를 띄우는 보드만 .100", ["canvas", "white"], ["lines", "alpha"]),
    preset("pure", "전부 흰색", "보드까지 흰색, 카드는 선으로", ["canvas", "pure"], ["lines", "alpha"]),
    preset("round", "둥글게", "맑게 + 컨트롤 R16 · 면 16/24/28", ["canvas", "100"], ["lines", "alpha"], ["round", true]),
    preset("ref", "참고 화면처럼", "흰 바탕 · 선으로 가른 카드 · 파랑 하나 · 글자 한 단", ["canvas", "pure"], ["lines", "alpha"], ["accent", "blue"], ["edges", "line"], ["text", "up"]),
  ],
  defaults: Object.fromEntries(BASE),
};

// The levers as the props of PaperProvider.
export const directionsOf = (levers: Readonly<Record<string, LeverValue>>): TokenOverrides => {
  const light: TokenTree = {};
  const dark: TokenTree = {};
  const canvas = levers.canvas ?? PAPER_LAB.defaults.canvas;
  if (canvas === "100") light.bg = { canvas: n("100"), sunken: n("150") };
  if (canvas === "white" || canvas === "pure") {
    // The page is the top face. Light: white over .100. Dark: the raised step over the deepest one.
    light.bg = { canvas: n("0"), raised: n("0"), sunken: n("100") };
    dark.bg = { canvas: n("925"), raised: n("925"), sunken: n("950") };
  }
  if (levers.lines === "alpha") {
    light.border = { base: hexOf("alpha10.neutral.950"), strong: hexOf("alpha15.neutral.950"), hover: hexOf("alpha30.neutral.950") };
    dark.border = { base: hexOf("alpha10.neutral.0"), strong: hexOf("alpha15.neutral.0"), hover: hexOf("alpha30.neutral.0") };
  }
  if (levers.accent === "blue") {
    // Only the primary accent's solid face and the words on it take blue: the main button, the checked marks, the bars.
    const primary = { primary: { solid: hexOf("blue.600"), wash: hexOf("blue.50") } };
    light.accent = primary;
    dark.accent = primary;
  }
  const out: TokenOverrides = {};
  if (levers.edges === "line") {
    // A card's edge is a line: the shadows a first face casts become a ring one line wide, in the colour of the one grey line.
    const ring = { resting: { "0": "0px 0px 0px 1px" }, lifted: { "0": "0px 0px 0px 1px" } };
    out.shadow = { light: ring, dark: ring };
    light.shadow = { resting: hexOf("alpha10.neutral.950"), lifted: hexOf("alpha10.neutral.950") };
    dark.shadow = { resting: hexOf("alpha10.neutral.0"), lifted: hexOf("alpha10.neutral.0") };
  }
  if (Object.keys(light).length > 0 || Object.keys(dark).length > 0) out.color = { ...(Object.keys(light).length > 0 ? { light } : {}), ...(Object.keys(dark).length > 0 ? { dark } : {}) };
  if (levers.round === true) out.shape = { radius: { control: { xs: "14px", sm: "16px", md: "16px", lg: "16px" }, surface: { sm: "16px", md: "24px", lg: "28px" } } };
  // One step up for the reading sizes: 12 → 13, 13 → 14, 14 → 15, with their line heights.
  if (levers.text === "up") out.typography = { palette: { fontSize: { "12": "0.8125rem", "13": "0.875rem", "14": "0.9375rem" }, leading: { "16": "1.125rem", "20": "1.375rem" } } };
  return out;
};

const mergeTree = (base: TokenTree | undefined, top: TokenTree | undefined): TokenTree | undefined => {
  if (!top) return base;
  if (!base) return top;
  const out: TokenTree = { ...base };
  for (const [key, value] of Object.entries(top)) {
    const under = out[key];
    out[key] = typeof value === "object" && typeof under === "object" ? (mergeTree(under, value) as TokenTree) : value;
  }
  return out;
};

// Edits over the levers' values: where both name a value, the edit is kept.
export const mergeTokens = (base: TokenOverrides, top: TokenOverrides): TokenOverrides => {
  const out: TokenOverrides = {};
  for (const name of ["color", "palette", "shape", "layout", "typography", "shadow", "opacity"] as const) {
    const merged = mergeTree(base[name], top[name]);
    if (merged) out[name] = merged;
  }
  return out;
};
