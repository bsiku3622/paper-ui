// markup.ts — the wiki's markup, read into a tree. Nothing here draws; render/ turns the tree into Paper parts.
// The grammar is the one authors read in the 도움말/문법 article; keep the two in step. The file has no imports so a
// script can load it on its own.

export type ArtKind = "photo" | "cover" | "document" | "pattern";
export type Align = "start" | "center" | "end";
export type Format = "b" | "i" | "s" | "mark" | "sup" | "sub";

export type Inline =
  | { t: "text"; v: string }
  | { t: "fmt"; f: Format; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; to: string; anchor: string; c: Inline[] }
  | { t: "ext"; href: string; c: Inline[] }
  | { t: "category"; name: string; c: Inline[] }
  | { t: "fn"; n: number }
  | { t: "br" };

export type ListBlock = { t: "list"; ordered: boolean; items: { c: Inline[]; sub: ListBlock | null }[] };
export type Row = { k: string; c: Inline[] };

export type Block =
  | { t: "h"; level: 2 | 3 | 4; num: string; id: string; section: number; text: string; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | ListBlock
  | { t: "quote"; c: Inline[] }
  | { t: "hr" }
  | { t: "code"; lang: string; v: string }
  | { t: "table"; align: Align[]; head: Inline[][] | null; rows: Inline[][][] }
  | { t: "note"; kind: "ref" | "warn" | "info"; c: Inline[] }
  | { t: "figure"; seed: string; kind: ArtKind; ratio: string; caption: Inline[] }
  | { t: "infobox"; title: string; picture: { seed: string; caption: Inline[] } | null; rows: Row[] }
  | { t: "navbox"; title: string; rows: Row[] };

export type TocEntry = { level: 2 | 3 | 4; num: string; id: string; text: string };

export type Parsed = {
  blocks: Block[];
  footnotes: Inline[][];
  toc: TocEntry[];
  // Titles this text links to (no anchors, no categories).
  links: string[];
  categories: string[];
  redirect: string | null;
  // The text without markup, for search and snippets.
  plain: string;
};

type Ctx = { footnotes: Inline[][]; links: Set<string>; categories: Set<string> };

export const cleanTitle = (title: string) => title.replace(/_/g, " ").replace(/\s+/g, " ").trim();

const PAIRS = [
  ["'''", "b"],
  ["''", "i"],
  ["~~", "s"],
  ["==", "mark"],
  ["^^", "sup"],
  [",,", "sub"],
] as const;

// The `]` that closes a bracket opened just before `from`, counting the brackets inside (links in a footnote).
const closeBracket = (src: string, from: number) => {
  let depth = 1;
  for (let k = from; k < src.length; k++) {
    const c = src[k];
    if (c === "\\") {
      k++;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return k;
    }
  }
  return -1;
};

const parseLink = (inner: string, ctx: Ctx): Inline | null => {
  const raw = inner.trim();
  // [[:분류:이름]] is a link to a category page; [[분류:이름]] puts the article into the category.
  const toCategory = /^:\s*분류\s*:\s*([^|]+?)\s*(?:\|(.*))?$/.exec(raw);
  if (toCategory) {
    const name = cleanTitle(toCategory[1]!);
    const label = toCategory[2]?.trim();
    return { t: "category", name, c: label ? parseInline(label, ctx, false) : [{ t: "text", v: name }] };
  }
  const category = /^분류\s*:\s*(.+)$/.exec(raw);
  if (category) {
    ctx.categories.add(cleanTitle(category[1]!));
    return null;
  }
  if (/^https?:\/\//.test(raw)) {
    const bar = raw.indexOf("|");
    const href = (bar >= 0 ? raw.slice(0, bar) : raw).trim();
    return { t: "ext", href, c: bar >= 0 ? parseInline(raw.slice(bar + 1), ctx, false) : [{ t: "text", v: href }] };
  }
  const bar = raw.indexOf("|");
  const target = (bar >= 0 ? raw.slice(0, bar) : raw).trim();
  const label = bar >= 0 ? raw.slice(bar + 1).trim() : "";
  const hash = target.indexOf("#");
  const to = cleanTitle(hash >= 0 ? target.slice(0, hash) : target);
  const anchor = hash >= 0 ? target.slice(hash + 1).trim() : "";
  if (to) ctx.links.add(to);
  const shown = label || (to ? `${to}${anchor ? `#${anchor}` : ""}` : anchor);
  return { t: "link", to, anchor, c: label ? parseInline(label, ctx, false) : [{ t: "text", v: shown }] };
};

const parseInline = (src: string, ctx: Ctx, allowNote = true): Inline[] => {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push({ t: "text", v: buf });
      buf = "";
    }
  };
  let i = 0;
  scan: while (i < src.length) {
    const ch = src[i]!;
    if (ch === "\\" && i + 1 < src.length && !/\s/.test(src[i + 1]!)) {
      buf += src[i + 1];
      i += 2;
      continue;
    }
    if (ch === "`") {
      const j = src.indexOf("`", i + 1);
      if (j > i + 1) {
        flush();
        out.push({ t: "code", v: src.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
    }
    if (ch === "[") {
      if (src.startsWith("[[", i)) {
        const j = src.indexOf("]]", i + 2);
        if (j > i + 2) {
          const node = parseLink(src.slice(i + 2, j), ctx);
          flush();
          if (node) out.push(node);
          i = j + 2;
          continue;
        }
      } else if (src.startsWith("[*", i) && allowNote) {
        const j = closeBracket(src, i + 2);
        if (j > i + 2) {
          const content = parseInline(src.slice(i + 2, j).trim(), ctx, false);
          ctx.footnotes.push(content);
          flush();
          out.push({ t: "fn", n: ctx.footnotes.length });
          i = j + 1;
          continue;
        }
      } else if (src.startsWith("[br]", i)) {
        flush();
        out.push({ t: "br" });
        i += 4;
        continue;
      } else if (/^\[https?:\/\//.test(src.slice(i, i + 9))) {
        const j = src.indexOf("]", i);
        if (j > i) {
          const inner = src.slice(i + 1, j);
          const space = inner.search(/\s/);
          const href = space < 0 ? inner : inner.slice(0, space);
          const label = space < 0 ? href : inner.slice(space).trim();
          flush();
          out.push({ t: "ext", href, c: parseInline(label, ctx, false) });
          i = j + 1;
          continue;
        }
      }
    }
    for (const [open, f] of PAIRS) {
      if (!src.startsWith(open, i)) continue;
      const from = i + open.length;
      const j = src.indexOf(open, from);
      if (j <= from) continue;
      const inner = src.slice(from, j);
      if (f === "mark" && (/^\s|\s$/.test(inner) || inner.includes("=="))) continue;
      flush();
      out.push({ t: "fmt", f, c: parseInline(inner, ctx, allowNote) });
      i = j + open.length;
      continue scan;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
};

// A line typed into a discussion: the same inline markup as an article, without footnotes.
export const parseComment = (source: string): Inline[] => parseInline(source, { footnotes: [], links: new Set(), categories: new Set() }, false);

export const inlineText = (nodes: readonly Inline[]): string =>
  nodes
    .map((node) => {
      if (node.t === "text" || node.t === "code") return node.v;
      if (node.t === "br") return " ";
      if (node.t === "fn") return "";
      return inlineText(node.c);
    })
    .join("");

const hasContent = (nodes: readonly Inline[]) => nodes.some((node) => node.t !== "text" || node.v.trim() !== "");

// A cell split at the `|` that are not inside a [[link|label]].
const splitCells = (line: string) => {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells: string[] = [];
  let buf = "";
  let depth = 0;
  for (let k = 0; k < s.length; k++) {
    const ch = s[k]!;
    if (ch === "\\" && s[k + 1] === "|") {
      buf += "|";
      k++;
    } else if (s.startsWith("[[", k)) {
      depth++;
      buf += "[[";
      k++;
    } else if (s.startsWith("]]", k) && depth > 0) {
      depth--;
      buf += "]]";
      k++;
    } else if (ch === "|" && depth === 0) {
      cells.push(buf.trim());
      buf = "";
    } else buf += ch;
  }
  cells.push(buf.trim());
  return cells;
};

const splitBars = (text: string) => {
  const parts: string[] = [];
  let buf = "";
  let depth = 0;
  for (let k = 0; k < text.length; k++) {
    if (text.startsWith("[[", k)) {
      depth++;
      buf += "[[";
      k++;
    } else if (text.startsWith("]]", k) && depth > 0) {
      depth--;
      buf += "]]";
      k++;
    } else if (text[k] === "|" && depth === 0) {
      parts.push(buf.trim());
      buf = "";
    } else buf += text[k];
  }
  parts.push(buf.trim());
  return parts;
};

const HEADING = /^(={2,4}) (.+?) \1\s*$/;
const LIST = /^( *)(\*|\d{1,2}\.) +(\S.*)$/;
const RULE = /^-{4,}\s*$/;
const isBlockStart = (line: string) =>
  line.trim() === "" || HEADING.test(line) || RULE.test(line) || line.startsWith("```") || line.startsWith("{{") || line.startsWith("|") || line.startsWith(">") || LIST.test(line);

const NOTE_KIND = { 참고: "ref", 주의: "warn", 안내: "info" } as const;
const ART_KINDS: readonly ArtKind[] = ["photo", "cover", "document", "pattern"];

const buildList = (rows: { level: number; ordered: boolean; c: Inline[] }[], start: number, level: number): [ListBlock, number] => {
  const list: ListBlock = { t: "list", ordered: rows[start]!.ordered, items: [] };
  let k = start;
  while (k < rows.length) {
    const row = rows[k]!;
    if (row.level < level) break;
    if (row.level === level) {
      if (row.ordered !== list.ordered) break;
      list.items.push({ c: row.c, sub: null });
      k++;
    } else {
      const [sub, next] = buildList(rows, k, row.level);
      const last = list.items[list.items.length - 1];
      if (last && !last.sub) last.sub = sub;
      else list.items.push({ c: [], sub });
      k = next;
    }
  }
  return [list, k];
};

const rowsOf = (body: string[], ctx: Ctx) => {
  const rows: Row[] = [];
  let pictureSeed = "";
  let pictureCaption = "";
  for (const line of body) {
    const m = /^\|\s*([^=|]+?)\s*=\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const key = m[1]!;
    const value = m[2]!.trim();
    if (key === "그림") pictureSeed = value;
    else if (key === "그림설명") pictureCaption = value;
    else rows.push({ k: key, c: parseInline(value, ctx) });
  }
  return { rows, pictureSeed, pictureCaption };
};

const plainOf = (blocks: readonly Block[]) => {
  const parts: string[] = [];
  const list = (block: ListBlock) => {
    for (const item of block.items) {
      parts.push(inlineText(item.c));
      if (item.sub) list(item.sub);
    }
  };
  for (const block of blocks) {
    if (block.t === "h" || block.t === "p" || block.t === "quote" || block.t === "note") parts.push(inlineText(block.c));
    else if (block.t === "list") list(block);
    else if (block.t === "table") {
      for (const cell of block.head ?? []) parts.push(inlineText(cell));
      for (const row of block.rows) for (const cell of row) parts.push(inlineText(cell));
    } else if (block.t === "infobox" || block.t === "navbox") {
      parts.push(block.title);
      for (const row of block.rows) parts.push(`${row.k} ${inlineText(row.c)}`);
    } else if (block.t === "figure") parts.push(inlineText(block.caption));
    else if (block.t === "code") parts.push(block.v);
  }
  return parts.join("\n");
};

export const parse = (source: string): Parsed => {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const ctx: Ctx = { footnotes: [], links: new Set(), categories: new Set() };
  const blocks: Block[] = [];
  const toc: TocEntry[] = [];

  const redirect = /^#\s*(?:넘겨주기|redirect)\s+\[\[(.+?)\]\]/i.exec((lines[0] ?? "").trim());
  if (redirect) {
    const to = cleanTitle(redirect[1]!.split("#")[0]!.split("|")[0]!);
    return { blocks: [], footnotes: [], toc: [], links: to ? [to] : [], categories: [], redirect: to, plain: "" };
  }

  const counters = [0, 0, 0];
  let section = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i++;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1]!.length as 2 | 3 | 4;
      const at = level - 2;
      counters[at] = (counters[at] ?? 0) + 1;
      for (let d = at + 1; d < counters.length; d++) counters[d] = 0;
      const num = counters
        .slice(0, at + 1)
        .map((n) => n || 1)
        .join(".");
      const c = parseInline(heading[2]!, ctx, false);
      section++;
      const id = `s-${num.replace(/\./g, "-")}`;
      const text = inlineText(c).trim();
      blocks.push({ t: "h", level, num, id, section, text, c });
      toc.push({ level, num, id, text });
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    const fence = /^```\s*(\S*)\s*$/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? "")) {
        body.push(lines[i] ?? "");
        i++;
      }
      i++;
      blocks.push({ t: "code", lang: fence[1] ?? "", v: body.join("\n") });
      continue;
    }

    if (line.startsWith("{{")) {
      const note = /^\{\{(참고|주의|안내)\s+(.*)\}\}\s*$/.exec(line.trim());
      if (note) {
        blocks.push({ t: "note", kind: NOTE_KIND[note[1] as keyof typeof NOTE_KIND], c: parseInline(note[2]!, ctx) });
        i++;
        continue;
      }
      const figure = /^\{\{그림\s+(.*)\}\}\s*$/.exec(line.trim());
      if (figure) {
        const [seed = "", caption = "", kind = "", ratio = ""] = splitBars(figure[1]!);
        blocks.push({
          t: "figure",
          seed: seed || "그림",
          kind: ART_KINDS.find((k) => k === kind) ?? "photo",
          ratio: /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(ratio) ? ratio : "16 / 9",
          caption: caption ? parseInline(caption, ctx) : [],
        });
        i++;
        continue;
      }
      const multi = /^\{\{(정보상자|틀)(?:\s+(.*))?$/.exec(line.trim());
      if (multi && !/\}\}\s*$/.test(line.trim())) {
        const body: string[] = [];
        i++;
        while (i < lines.length && (lines[i] ?? "").trim() !== "}}") {
          body.push(lines[i] ?? "");
          i++;
        }
        i++;
        const title = (multi[2] ?? "").trim();
        const { rows, pictureSeed, pictureCaption } = rowsOf(body, ctx);
        if (multi[1] === "정보상자") {
          blocks.push({
            t: "infobox",
            title,
            picture: pictureSeed ? { seed: pictureSeed, caption: pictureCaption ? parseInline(pictureCaption, ctx) : [] } : null,
            rows,
          });
        } else blocks.push({ t: "navbox", title, rows });
        continue;
      }
    }

    if (line.startsWith("|")) {
      const raw: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("|")) {
        raw.push(lines[i] ?? "");
        i++;
      }
      const cells = raw.map(splitCells);
      const isRule = (row: string[]) => row.length > 0 && row.every((cell) => /^:?-{2,}:?$/.test(cell));
      const hasHead = cells.length >= 2 && isRule(cells[1]!);
      const width = Math.max(...cells.map((row) => row.length));
      const pad = (row: string[]) => Array.from({ length: width }, (_, k) => row[k] ?? "");
      const align: Align[] = hasHead
        ? pad(cells[1]!).map((cell) => (cell.startsWith(":") && cell.endsWith(":") ? "center" : cell.endsWith(":") ? "end" : "start"))
        : Array.from({ length: width }, () => "start" as Align);
      const toInline = (row: string[]) => pad(row).map((cell) => parseInline(cell, ctx));
      const body = (hasHead ? cells.slice(2) : cells).filter((row) => !isRule(row));
      blocks.push({ t: "table", align, head: hasHead ? toInline(cells[0]!) : null, rows: body.map(toInline) });
      continue;
    }

    if (line.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith(">")) {
        const text = (lines[i] ?? "").replace(/^>\s?/, "").trim();
        parts.push(text === "" ? "[br]" : text);
        i++;
      }
      blocks.push({ t: "quote", c: parseInline(parts.join(" "), ctx) });
      continue;
    }

    if (LIST.test(line)) {
      const rows: { level: number; ordered: boolean; c: Inline[] }[] = [];
      while (i < lines.length) {
        const m = LIST.exec(lines[i] ?? "");
        if (!m) break;
        rows.push({ level: Math.floor(m[1]!.length / 2), ordered: m[2] !== "*", c: parseInline(m[3]!.trim(), ctx) });
        i++;
      }
      let k = 0;
      while (k < rows.length) {
        const [list, next] = buildList(rows, k, rows[k]!.level);
        blocks.push(list);
        k = next;
      }
      continue;
    }

    const buf = [line.trim()];
    i++;
    while (i < lines.length && !isBlockStart(lines[i] ?? "")) {
      buf.push((lines[i] ?? "").trim());
      i++;
    }
    const c = parseInline(buf.join(" "), ctx);
    if (hasContent(c)) blocks.push({ t: "p", c });
  }

  return {
    blocks,
    footnotes: ctx.footnotes,
    toc,
    links: [...ctx.links],
    categories: [...ctx.categories],
    redirect: null,
    plain: plainOf(blocks),
  };
};
