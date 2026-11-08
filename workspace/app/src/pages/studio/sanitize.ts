// The studio sets values by the names of the page it reads. A page built from another version of the package may not have one of
// them, and PaperProvider refuses a name its stylesheet does not declare. So a page keeps, of what the studio sends, the values whose
// variable its own stylesheet declares. (The host keeps the same file, src/studio/sanitize.ts there.)

import { tokens } from "@studio-baeks/paper-ui/tokens";

import type { TokenOverrides, TokenTree } from "./protocol";

const kebab = (word: string) => word.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const dashed = (path: readonly string[]) => path.map(kebab).join("-");

const eachRule = (rules: CSSRuleList, visit: (rule: CSSStyleRule) => void) => {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) visit(rule);
    else if ("cssRules" in rule) eachRule((rule as CSSGroupingRule).cssRules, visit);
  }
};

let known: Set<string> | null = null;

// The names (without the system's prefix) of every variable the stylesheets declare.
const declared = (): Set<string> => {
  if (known) return known;
  const prefix = /^var\((--[a-z]+-)/.exec(tokens.shape.stroke.border)?.[1] ?? "";
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    eachRule(rules, (rule) => {
      for (const property of Array.from(rule.style)) if (property.startsWith(prefix)) names.add(property.slice(prefix.length));
    });
  }
  // A page whose stylesheet is not in yet says nothing; ask again at the next change.
  if (names.size > 0) known = names;
  return names;
};

const MODES = new Set(["light", "dark"]);

const keep = (tree: TokenTree, prefix: readonly string[], name: (path: readonly string[]) => string): TokenTree | undefined => {
  const out: TokenTree = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = [...prefix, key];
    if (typeof value === "object") {
      const inner = keep(value, path, name);
      if (inner) out[key] = inner;
    } else if (declared().has(name(path))) out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
};

export const sanitizeTokens = (edits: TokenOverrides): TokenOverrides => {
  if (declared().size === 0) return edits;
  const out: TokenOverrides = {};
  for (const root of ["shape", "layout", "typography"] as const) {
    const tree = edits[root];
    const kept = tree && keep(tree, [], (path) => `${root}-${dashed(path)}`);
    if (kept) out[root] = kept;
  }
  if (edits.opacity) {
    const kept = keep(edits.opacity, [], (path) => `color-opacity-${dashed(path)}`);
    if (kept) out.opacity = kept;
  }
  // Colour roles and shadow layers are per mode: the mode is the first key and not part of the name.
  for (const [root, name] of [["color", "color"], ["shadow", "layout-shadow"]] as const) {
    const tree = edits[root];
    if (!tree) continue;
    const modes: TokenTree = {};
    for (const [mode, value] of Object.entries(tree)) {
      if (!MODES.has(mode) || typeof value !== "object") continue;
      const kept = keep(value, [], (path) => `${name}-${dashed(path)}`);
      if (kept) modes[mode] = kept;
    }
    if (Object.keys(modes).length > 0) out[root] = modes;
  }
  // A palette step has no variable of its own; the names of the steps are the package's, and the studio takes them from it.
  if (edits.palette) out.palette = edits.palette;
  return out;
};
