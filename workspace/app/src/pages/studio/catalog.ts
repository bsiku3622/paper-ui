// What the studio can turn: every value PaperProvider takes an override for, grouped the way the owner reads them — colour per mode,
// the palette, Shape, Layout, Typography, the shadows' geometry.
//
// The list is read from the page's own stylesheet, so a source the package adds later shows up here by itself (under 기타 until it is
// named). Colour roles and the palette come from color-source.ts, and where a source sits in the tree an override is written in comes
// from the *-source.ts modules. A colour is chosen from the palette's steps and never typed: a value that is a colour holds a step.

import { tokens } from "@studio-baeks/paper-ui/tokens";

import { RAMPS, ROLES } from "./color-source";
import { LAYOUT_PATHS } from "./layout-source";
import { dashed } from "./paths";
import type { Mode, TokenOverrides, TokenTree } from "./protocol";
import { SHAPE_PATHS } from "./shape-source";
import { TYPOGRAPHY_PATHS } from "./typography-source";

export type Section = "color" | "palette" | "shape" | "layout" | "typography" | "shadow";
export type Kind = "color" | "length" | "number" | "shadow" | "text";
export type Root = "color" | "palette" | "shape" | "layout" | "typography" | "shadow" | "opacity";
export type Slot = { id: string; mode: Mode | null; original: string; root: Root; path: string[] };
export type Hint = { min: number; max: number; step: number };
export type Item = { key: string; section: Section; group: string; label: string; hint: string; kind: Kind; slots: Slot[]; range?: Hint };
export type Group = { id: string; section: Section; title: string; note?: string; collapsed: boolean; items: Item[] };
export type Catalog = { groups: Group[]; items: Item[]; slots: Map<string, { item: Item; slot: Slot }> };

export const SECTIONS: { id: Section; label: string }[] = [
  { id: "color", label: "색" },
  { id: "palette", label: "팔레트" },
  { id: "shape", label: "모양" },
  { id: "layout", label: "배치" },
  { id: "typography", label: "글자" },
  { id: "shadow", label: "그림자" },
];

const MODES: readonly Mode[] = ["light", "dark"];

// ── What the stylesheet declares ─────────────────────────────────────────────────

type Declared = { global: Map<string, string>; mode: Record<Mode, Map<string, string>> };

const eachRule = (rules: CSSRuleList, visit: (rule: CSSStyleRule) => void) => {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) visit(rule);
    else if ("cssRules" in rule) eachRule((rule as CSSGroupingRule).cssRules, visit);
  }
};

// The prefix every variable of the system starts with, taken from the tokens and not written here.
const namespace = (): string => /^var\((--[a-z]+-)/.exec(tokens.shape.stroke.border)?.[1] ?? "";

export const readDeclared = (): Declared => {
  const prefix = namespace();
  const found: Declared = { global: new Map(), mode: { light: new Map(), dark: new Map() } };
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    eachRule(rules, (rule) => {
      const selector = rule.selectorText;
      if (selector.includes(":not(")) return;
      const mode: Mode | null = /data-pui-theme="?dark"?/.test(selector) ? "dark" : /data-pui-theme="?light"?/.test(selector) ? "light" : null;
      for (const property of Array.from(rule.style)) {
        if (!property.startsWith(prefix)) continue;
        const name = property.slice(prefix.length);
        (mode ? found.mode[mode] : found.global).set(name, rule.style.getPropertyValue(property).trim());
      }
    });
  }
  return found;
};

// ── Naming ────────────────────────────────────────────────────────────────────────

const COLOR_LABELS: Record<string, string> = {
  "bg.canvas": "캔버스", "bg.raised": "올린 면", "bg.sunken": "낮은 면",
  "ink.primary": "1차", "ink.secondary": "2차", "ink.tertiary": "3차",
  "border.base": "기본", "border.strong": "진한 선", "border.hover": "올렸을 때",
  "control.track": "스위치 트랙",
  "interaction.focus": "포커스 링", "interaction.link": "링크", "interaction.selected": "선택 틴트", "interaction.active": "눌림 틴트",
  "interaction.bgHover.onSurface": "면 위 hover", "interaction.bgHover.onPrimarySolid": "주색 위 hover", "interaction.bgHover.onAccentSolid": "의미색 위 hover",
  "marker.fill": "칠", "marker.ink": "칠 위 글자",
  "overlay.scrim": "덮개",
  "shadow.resting": "그림자 (제자리)", "shadow.lifted": "그림자 (떠 있음)", "shadow.floating": "그림자 (떠다님)",
};
const TONE_LABELS: Record<string, string> = { solid: "채움", wash: "채움 위 글자", ink: "글자", soft: "옅은 면", subtle: "보조 글자" };
const ACCENT_TITLES: Record<string, string> = { primary: "주색 (행동)", info: "정보", success: "성공", warning: "주의", error: "오류" };
const COLOR_GROUPS: Record<string, string> = {
  bg: "바탕", ink: "글자", border: "선", control: "컨트롤", interaction: "상호작용", marker: "형광펜", overlay: "덮개와 그림자 색", shadow: "덮개와 그림자 색",
};

const SOURCE_GROUPS: { match: string; title: string; note?: string; collapsed?: boolean }[] = [
  { match: "shape.radius", title: "모서리" },
  { match: "shape.space", title: "여백 단계", note: "안쪽 여백과 형제 사이 간격이 같은 단계를 씁니다." },
  { match: "shape.control.height", title: "컨트롤 높이", note: "입력칸과 버튼의 여백이 이 값을 따릅니다." },
  { match: "shape.control", title: "컨트롤 여백" },
  { match: "shape.stroke", title: "선과 포커스" },
  { match: "shape.focus", title: "선과 포커스" },
  { match: "shape.target", title: "선과 포커스" },
  { match: "shape.selection", title: "표식과 아이콘 크기" },
  { match: "shape.icon", title: "표식과 아이콘 크기" },
  { match: "shape.anatomy", title: "부품 세부", collapsed: true },
  { match: "shape.dimension", title: "고정 치수와 글 폭", collapsed: true },
  { match: "shape.measure", title: "고정 치수와 글 폭", collapsed: true },
  { match: "layout.container", title: "화면 폭" },
  { match: "layout.elevation", title: "쌓임", collapsed: true },
  { match: "typography.palette.family", title: "서체" },
  { match: "typography.palette.fontSize", title: "글자 크기 사다리", note: "역할마다 따로 값을 주지 않으면 여기를 따릅니다." },
  { match: "typography.palette.leading", title: "줄 높이 사다리" },
  { match: "typography.palette.weight", title: "굵기 사다리" },
  { match: "typography.palette.tracking", title: "자간 사다리", collapsed: true },
  { match: "typography.palette", title: "그 밖의 글자", collapsed: true },
];

const SOURCE_LABELS: Record<string, string> = {
  "space": "단계",
  "radius.control": "컨트롤", "radius.selection": "체크박스", "radius.surface": "면", "radius.text": "글자 곁", "radius.pill": "알약", "radius.full": "원",
  "control.height": "높이", "control.buttonInset": "버튼 여백",
  "stroke.border": "테두리 굵기", "stroke.emphasis": "강조 선 굵기", "stroke.icon": "아이콘 선 굵기",
  "focus.width": "포커스 링 굵기", "focus.offset": "포커스 링 간격", "target.min": "최소 누름 영역",
  "selection.size": "표식", "icon": "아이콘", "dimension.width": "폭", "dimension.height": "높이", "measure": "글 폭",
  "anatomy.badge.height": "배지 높이", "anatomy.badge.inset": "배지 여백",
  "container.content": "콘텐츠 최대 폭", "elevation.nudge": "띄움 한 걸음", "elevation": "쌓임",
  "palette.family.sans": "본문 서체", "palette.family.mono": "고정폭 서체",
  "palette.fontSize": "크기", "palette.leading": "줄 높이", "palette.weight": "굵기", "palette.tracking": "자간",
  "palette.monoSizeScale": "고정폭 크기 배수", "palette.codeScale.inline": "인라인 코드 배수", "palette.codeScale.compact": "작은 코드 배수", "palette.decoration.underlineOffset": "밑줄 간격",
};

const labelOfSource = (system: string, path: string[]): string => {
  const whole = path.join(".");
  for (const [prefix, label] of Object.entries(SOURCE_LABELS)) {
    if (whole === prefix) return label;
    if (whole.startsWith(`${prefix}.`)) return `${label} ${path.slice(prefix.split(".").length).join(" · ")}`;
  }
  return `${system === "typography" ? path.slice(path[0] === "palette" ? 1 : 0).join(" · ") : path.join(" · ")}`;
};

// ── Kinds ──────────────────────────────────────────────────────────────────────────

const LENGTH = /^-?[\d.]+(rem|px|em|%)$/;
const SHADOW = /^(-?[\d.]+(px)?\s+){3}-?[\d.]+(px)?$/;

export const kindOf = (value: string): Kind => {
  if (/^#[\da-f]{6,8}$/i.test(value)) return "color";
  if (SHADOW.test(value) && value.split(/\s+/).length === 4 && /px/.test(value)) return "shadow";
  if (LENGTH.test(value)) return "length";
  if (/^-?[\d.]+$/.test(value)) return "number";
  return "text";
};

const hintOf = (kind: Kind, original: string, whole: string): Hint | undefined => {
  if (kind === "length") {
    const unit = /[a-z%]+$/.exec(original)?.[0] ?? "px";
    if (unit === "em") return { min: -0.2, max: 2, step: unit === "em" && /tracking/.test(whole) ? 0.001 : 0.01 };
    if (unit === "%") return { min: 0, max: 200, step: 1 };
    if (/radius/.test(whole)) return { min: 0, max: 48, step: 1 };
    if (/stroke|focus/.test(whole)) return { min: 0, max: 8, step: 0.5 };
    return { min: 0, max: 640, step: 1 };
  }
  if (kind === "number") {
    if (/weight/.test(whole)) return { min: 100, max: 900, step: 10 };
    if (/opacity/.test(whole)) return { min: 0, max: 1, step: 0.01 };
    return { min: -10, max: 100, step: 0.01 };
  }
  return undefined;
};

const slotId = (root: Root, mode: Mode | null, path: readonly string[]) => [root, ...(mode ? [mode] : []), ...path].join(".");

const makeSlot = (root: Root, mode: Mode | null, path: string[], original: string): Slot => ({ id: slotId(root, mode, path), mode, original, root, path });

// ── The catalog ────────────────────────────────────────────────────────────────────

let built: Catalog | null = null;

export const buildCatalog = (): Catalog => {
  const declared = readDeclared();
  const items: Item[] = [];
  const groups = new Map<string, Group>();
  const collapsedOf = (title: string) => SOURCE_GROUPS.find((entry) => entry.title === title)?.collapsed ?? false;
  const groupFor = (section: Section, title: string, note?: string, collapsed = collapsedOf(title)): Group => {
    const id = `${section}/${title}`;
    const have = groups.get(id);
    if (have) return have;
    const group: Group = { id, section, title, note, collapsed, items: [] };
    groups.set(id, group);
    return group;
  };
  const add = (item: Item, group: Group) => {
    items.push(item);
    group.items.push(item);
  };

  // Colour roles, a light and a dark value each.
  for (const role of ROLES) {
    const whole = role.path.join(".");
    const top = role.path[0]!;
    const accent = top === "accent";
    const title = accent ? (ACCENT_TITLES[role.path[1]!] ?? role.path[1]!) : (COLOR_GROUPS[top] ?? "기타");
    const group = groupFor("color", title, undefined, accent && role.path[1] !== "primary");
    const label = accent ? (TONE_LABELS[role.path[2]!] ?? role.path.slice(2).join(" · ")) : (COLOR_LABELS[whole] ?? role.path.slice(1).join(" · "));
    const slots = MODES.map((mode) => makeSlot("color", mode, role.path, role.value[mode]));
    add({ key: `color.${whole}`, section: "color", group: title, label, hint: `color.${whole}`, kind: "color", slots }, group);
  }

  // The palette: one entry per plain step (an alpha step is a strength, not a colour to set).
  for (const ramp of RAMPS) {
    if (ramp.id.startsWith("alpha")) continue;
    const group = groupFor("palette", `팔레트 · ${ramp.label}`, undefined, ramp.id !== "neutral" && ramp.id !== "blue");
    for (const step of ramp.steps) {
      const path = ramp.id === "marker" ? ["marker"] : [ramp.id, step.step];
      add({ key: `palette.${path.join(".")}`, section: "palette", group: group.title, label: ramp.id === "marker" ? "marker" : step.step, hint: `palette.${path.join(".")}`, kind: "color", slots: [makeSlot("palette", null, path, step.hex)] }, group);
    }
  }

  // Sources: the variables declared on the root, found where they sit in the authored tree.
  const authored = new Map<string, string[]>();
  for (const [system, paths] of [["shape", SHAPE_PATHS], ["layout", LAYOUT_PATHS], ["typography", TYPOGRAPHY_PATHS]] as const) {
    for (const path of paths) authored.set(`${system}-${dashed(path)}`, path);
  }
  for (const [name, original] of declared.global) {
    const system = name.slice(0, name.indexOf("-"));
    if (system === "color") {
      const rest = name.slice("color-".length);
      if (!rest.startsWith("opacity-")) continue;
      const path = [rest.slice("opacity-".length)];
      const group = groupFor("color", "불투명도", undefined, false);
      add({ key: `opacity.${path.join(".")}`, section: "color", group: group.title, label: path[0] === "disabled" ? "비활성" : path[0] === "subdued" ? "물러남" : path[0]!, hint: `opacity.${path.join(".")}`, kind: "number", slots: [makeSlot("opacity", null, path, original)], range: { min: 0, max: 1, step: 0.01 } }, group);
      continue;
    }
    if (system !== "shape" && system !== "layout" && system !== "typography") continue;
    if (name.startsWith("layout-shadow-")) continue;
    const path = authored.get(name) ?? name.slice(system.length + 1).split("-");
    const whole = `${system}.${path.join(".")}`;
    const spec = SOURCE_GROUPS.find((entry) => whole === entry.match || whole.startsWith(`${entry.match}.`));
    const group = groupFor(system, spec?.title ?? "기타", spec?.note);
    const kind = kindOf(original);
    add({ key: whole, section: system, group: group.title, label: labelOfSource(system, path), hint: whole, kind, slots: [makeSlot(system, null, path, original)], range: hintOf(kind, original, whole) }, group);
  }

  // The shadows' geometry, per mode (the colour of a shadow is a colour role).
  const layers = [...declared.mode.light.keys()].filter((name) => name.startsWith("layout-shadow-"));
  for (const name of layers) {
    const path = name.slice("layout-shadow-".length).split("-");
    const group = groupFor("shadow", "그림자 모양", "거리 · 흐림 · 퍼짐입니다. 색은 색 탭의 그림자 색입니다.", false);
    const label = `${path[0] === "resting" ? "제자리" : path[0] === "lifted" ? "떠 있음" : "떠다님"} ${Number(path[1]) + 1}겹`;
    const slots = MODES.map((mode) => makeSlot("shadow", mode, path, declared.mode[mode].get(name) ?? ""));
    add({ key: `shadow.${path.join(".")}`, section: "shadow", group: group.title, label, hint: `shadow.${path.join(".")}`, kind: "shadow", slots }, group);
  }

  const sectionOrder = SECTIONS.map((section) => section.id);
  const ordered = [...groups.values()].sort((a, b) => sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section));
  const slots = new Map<string, { item: Item; slot: Slot }>();
  for (const item of items) for (const slot of item.slots) slots.set(slot.id, { item, slot });
  return { groups: ordered, items, slots };
};

export const getCatalog = (): Catalog => (built ??= buildCatalog());

// ── Edits → PaperProvider's props ──────────────────────────────────────────────────

// The nested overrides PaperProvider takes, from the studio's flat edits (slot id → value).
export const overridesOf = (edits: Readonly<Record<string, string>>, catalog: Catalog): TokenOverrides => {
  const out: TokenOverrides = {};
  for (const [id, value] of Object.entries(edits)) {
    const found = catalog.slots.get(id);
    if (!found) continue;
    const { root, mode, path } = found.slot;
    const keys = mode ? [mode, ...path] : path;
    let node: TokenTree = (out[root] ??= {});
    for (const key of keys.slice(0, -1)) {
      const next = node[key];
      node = typeof next === "object" ? next : (node[key] = {});
    }
    node[keys[keys.length - 1]!] = value;
  }
  return out;
};
