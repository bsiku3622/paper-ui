// What leaves the studio: the changes as data (JSON), and as code to paste — PaperProvider's props for the values, and for each part a
// line saying where in the source and what to set. The studio edits no source file; this is how a change gets there.

import type { LeverValue, PartEdits, PartSite, PartValue, TokenOverrides, TokenTree } from "./protocol";

export type Snapshot = {
  levers: Record<string, LeverValue>;
  tokens: TokenOverrides;
  edits: Record<string, string>;
  parts: PartEdits;
  sites: Record<string, PartSite>;
};

export const exportJson = (snapshot: Snapshot): string =>
  JSON.stringify({ studio: 1, levers: snapshot.levers, values: snapshot.edits, tokens: snapshot.tokens, parts: snapshot.parts, sites: snapshot.sites }, null, 2);

const KEY = /^[A-Za-z_$][\w$]*$/;
const key = (name: string) => (KEY.test(name) ? name : JSON.stringify(name));

// A tree as the object literal one writes it in code.
export const literal = (tree: TokenTree, depth = 0): string => {
  const pad = "  ".repeat(depth + 1);
  const entries = Object.entries(tree).map(([name, value]) => `${pad}${key(name)}: ${typeof value === "string" ? JSON.stringify(value) : literal(value, depth + 1)},`);
  return entries.length === 0 ? "{}" : `{\n${entries.join("\n")}\n${"  ".repeat(depth)}}`;
};

const ORDER = ["color", "palette", "shape", "layout", "typography", "shadow", "opacity"] as const;

// <PaperProvider …> with a prop for each root the studio changed. Empty when no value was.
export const providerCode = (tokens: TokenOverrides): string => {
  const props = ORDER.flatMap((name) => {
    const tree = tokens[name];
    return tree ? [`  ${name}={${literal(tree, 1)}}`] : [];
  });
  return props.length === 0 ? "" : `<PaperProvider\n${props.join("\n")}\n>`;
};

const valueText = (value: PartValue): string => (value === null ? "(prop 빼기)" : typeof value === "string" ? JSON.stringify(value) : String(value));

// One line for each prop set on a part: file:line — prop=value.
export const partLines = (parts: PartEdits, sites: Readonly<Record<string, PartSite>>): string[] =>
  Object.entries(parts).flatMap(([id, props]) => {
    const site = sites[id];
    const where = site ? `${site.file}:${site.line}` : id;
    return [`// ${site?.component ?? id.slice(id.indexOf("#") + 1, id.lastIndexOf(":"))}`, ...Object.entries(props).map(([prop, value]) => `${where} — ${prop}=${valueText(value)}`)];
  });

export const exportCode = (snapshot: Snapshot, leverNotes: readonly string[] = []): string => {
  const sections: string[] = [];
  if (leverNotes.length > 0) sections.push(["// 시안", ...leverNotes.map((note) => `// ${note}`)].join("\n"));
  const provider = providerCode(snapshot.tokens);
  if (provider) sections.push(`// 값 — PaperProvider의 props\n${provider}`);
  const lines = partLines(snapshot.parts, snapshot.sites);
  if (lines.length > 0) sections.push(["// 요소 — 파일:줄 — prop=값", ...lines].join("\n"));
  return sections.join("\n\n");
};
