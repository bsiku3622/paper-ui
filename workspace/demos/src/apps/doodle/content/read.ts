// A small Markdown reader: text in, plain data out (no HTML). The prototype drew documents with react-markdown and GFM; this
// reads what that was used for — headings, paragraphs, lists with check boxes, quotes, code, tables, links, **bold**,
// *italic*, ~~strike~~ and `code` — so Markdown.tsx can draw it without a dependency.

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong" | "em" | "del"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: Inline[] }
  | { t: "image"; alt: string; src: string }
  | { t: "br" };

export type Align = "left" | "center" | "right" | null;

export type Item = { checked: boolean | null; c: Node[] };

export type Node =
  | { t: "heading"; level: number; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "list"; ordered: boolean; start: number; items: Item[] }
  | { t: "quote"; c: Node[] }
  | { t: "code"; lang: string; v: string }
  | { t: "hr" }
  | { t: "image"; alt: string; src: string }
  | { t: "table"; align: Align[]; head: Inline[][]; rows: Inline[][][] };

const SPECIAL = /[\\`*_{}[\]()#+\-.!~|>]/;

const matchLink = (src: string, from: number): { label: string; href: string; end: number } | null => {
  if (src[from] !== "[") return null;
  let depth = 0;
  let close = -1;
  for (let i = from; i < src.length; i++) {
    const ch = src[i];
    if (ch === "\\") { i++; continue; }
    if (ch === "[") depth++;
    if (ch === "]") { depth--; if (depth === 0) { close = i; break; } }
  }
  if (close < 0 || src[close + 1] !== "(") return null;
  const end = src.indexOf(")", close + 2);
  if (end < 0) return null;
  const href = src.slice(close + 2, end).trim().split(/\s+/)[0] ?? "";
  if (!href) return null;
  return { label: src.slice(from + 1, close), href, end: end + 1 };
};

const closing = (src: string, delim: string, from: number) => {
  for (let j = from; j < src.length; j++) {
    if (src[j] === "\\") { j++; continue; }
    if (src.startsWith(delim, j) && j > from && !/\s/.test(src[j - 1] ?? "")) {
      // *a* inside **b** is not the end of an emphasis that began with one star
      if (delim.length === 1 && src[j + 1] === delim) continue;
      return j;
    }
  }
  return -1;
};

const PAIRS: readonly (readonly [string, "strong" | "del"])[] = [["**", "strong"], ["__", "strong"], ["~~", "del"]];

export const parseInline = (source: string): Inline[] => {
  const src = source.replace(/ {2,}\n/g, "\u0001").replace(/\n/g, " ");
  const out: Inline[] = [];
  let buf = "";
  const flush = () => { if (buf) { out.push({ t: "text", v: buf }); buf = ""; } };
  let i = 0;
  scan: while (i < src.length) {
    const ch = src[i]!;
    if (ch === "\u0001") { flush(); out.push({ t: "br" }); i++; continue; }
    if (ch === "\\" && i + 1 < src.length && SPECIAL.test(src[i + 1]!)) { buf += src[i + 1]; i += 2; continue; }
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) { flush(); out.push({ t: "code", v: src.slice(i + 1, end) }); i = end + 1; continue; }
    }
    if (ch === "!" && src[i + 1] === "[") {
      const m = matchLink(src, i + 1);
      if (m) { flush(); out.push({ t: "image", alt: m.label, src: m.href }); i = m.end; continue; }
    }
    if (ch === "[") {
      const m = matchLink(src, i);
      if (m) { flush(); out.push({ t: "link", href: m.href, c: parseInline(m.label) }); i = m.end; continue; }
    }
    if (ch === "h" && /^https?:\/\//.test(src.slice(i, i + 8))) {
      const m = /^https?:\/\/[^\s<>)]+[^\s<>).,;:!?]/.exec(src.slice(i));
      if (m) { flush(); out.push({ t: "link", href: m[0], c: [{ t: "text", v: m[0] }] }); i += m[0].length; continue; }
    }
    for (const [delim, kind] of PAIRS) {
      if (src.startsWith(delim, i) && !/\s/.test(src[i + 2] ?? " ")) {
        const end = closing(src, delim, i + 2);
        if (end > 0) { flush(); out.push({ t: kind, c: parseInline(src.slice(i + 2, end)) }); i = end + 2; continue scan; }
      }
    }
    if ((ch === "*" || ch === "_") && !/\s/.test(src[i + 1] ?? " ")) {
      // underscores inside a word are just underscores
      const wordy = ch === "_" && /\w/.test(src[i - 1] ?? " ");
      const end = wordy ? -1 : closing(src, ch, i + 1);
      if (end > 0) { flush(); out.push({ t: "em", c: parseInline(src.slice(i + 1, end)) }); i = end + 1; continue; }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
};

const FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([\w+-]*)\s*$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const RULE = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^\s{0,3}>/;
const LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const DELIMITER = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;
const BLANK = /^\s*$/;

const indentOf = (line: string) => /^\s*/.exec(line)![0].length;
const cellsOf = (row: string) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|"));

const startsBlock = (line: string) => FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line) || LIST.test(line);

const parseBlocks = (lines: string[]): Node[] => {
  const out: Node[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (BLANK.test(line)) { i++; continue; }

    const fence = FENCE.exec(line);
    if (fence) {
      const mark = fence[1]!;
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith(mark)) body.push(lines[i++]!);
      i++;
      out.push({ t: "code", lang: fence[2] ?? "", v: body.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      out.push({ t: "heading", level: heading[1]!.length, c: parseInline(heading[2]!) });
      i++;
      continue;
    }

    if (RULE.test(line)) { out.push({ t: "hr" }); i++; continue; }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i]!)) body.push(lines[i++]!.replace(/^\s{0,3}>\s?/, ""));
      out.push({ t: "quote", c: parseBlocks(body) });
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && DELIMITER.test(lines[i + 1]!) && lines[i + 1]!.includes("-")) {
      const head = cellsOf(line);
      const align: Align[] = cellsOf(lines[i + 1]!).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        return left && right ? "center" : right ? "right" : left ? "left" : null;
      });
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && !BLANK.test(lines[i]!) && lines[i]!.includes("|")) {
        const cells = cellsOf(lines[i++]!);
        rows.push(head.map((_, column) => parseInline(cells[column] ?? "")));
      }
      out.push({ t: "table", align, head: head.map((cell) => parseInline(cell)), rows });
      continue;
    }

    const first = LIST.exec(line);
    if (first) {
      const base = first[1]!.length;
      const ordered = /\d/.test(first[2]!);
      const items: Item[] = [];
      const start = ordered ? parseInt(first[2]!, 10) : 1;
      while (i < lines.length) {
        const m = LIST.exec(lines[i]!);
        if (!m || m[1]!.length !== base || /\d/.test(m[2]!) !== ordered) break;
        const width = m[1]!.length + m[2]!.length + 1;
        const body = [m[3]!];
        i++;
        while (i < lines.length) {
          const next = lines[i]!;
          if (BLANK.test(next)) {
            let j = i + 1;
            while (j < lines.length && BLANK.test(lines[j]!)) j++;
            if (j < lines.length && indentOf(lines[j]!) > base) { while (i < j) { body.push(""); i++; } continue; }
            break;
          }
          if (indentOf(next) > base) { body.push(next.replace(new RegExp(`^ {0,${width}}`), "")); i++; continue; }
          break;
        }
        const task = /^\[( |x|X)\]\s+/.exec(body[0]!);
        if (task) body[0] = body[0]!.slice(task[0].length);
        items.push({ checked: task ? task[1] !== " " : null, c: parseBlocks(body) });
      }
      out.push({ t: "list", ordered, start, items });
      continue;
    }

    const body = [line];
    i++;
    while (i < lines.length && !BLANK.test(lines[i]!) && !startsBlock(lines[i]!)) body.push(lines[i++]!);
    const c = parseInline(body.map((text) => text.trim()).join("\n"));
    if (c.length === 1 && c[0]!.t === "image") out.push({ t: "image", alt: c[0]!.alt, src: c[0]!.src });
    else out.push({ t: "p", c });
  }
  return out;
};

export const parse = (source: string): Node[] => parseBlocks(source.replace(/\r\n?/g, "\n").split("\n"));
