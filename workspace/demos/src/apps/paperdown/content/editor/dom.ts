// Content: how the editor reads and rewrites the words of a paper. Paper has no rich-text surface, and the original's is
// Tiptap (ProseMirror), which is not a dependency of this host; this is a small stand-in over `contenteditable`.
//
// A paper is HTML of the original's shape (see lib/markdown.ts). Its words live in "textblocks" (a paragraph, a heading, a
// code block, a list item that holds words itself). Inside a textblock the marks are read into runs, changed as data, and
// written back: that keeps the markup clean (one <strong> around a bold stretch, never <b> and <font> and nested spans).
// A position is a textblock and a number of UTF-16 units into it; a formula or a line break counts as one.

export type MarkName = "bold" | "italic" | "strike" | "highlight" | "code";

export type Marks = {
  bold?: true;
  italic?: true;
  strike?: true;
  highlight?: true;
  code?: true;
  link?: string;
  // A font size in points ("12pt") and a font stack, set on a stretch of words.
  size?: string;
  font?: string;
};

export type Run = { kind: "text"; text: string; marks: Marks } | { kind: "atom"; node: HTMLElement };

export type Caret = { block: HTMLElement; offset: number };

const TEXTBLOCKS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "PRE"]);
// These hold words directly only when they hold no block of their own.
const WORD_HOLDERS = new Set(["LI", "TD", "TH", "BLOCKQUOTE"]);
const BLOCKS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "TABLE", "TBODY", "THEAD", "TR", "TD", "TH", "HR", "DIV"]);

export const isElement = (node: unknown): node is HTMLElement => node instanceof HTMLElement;
// (Plain booleans, not type guards: a guard on a value that is an element already would narrow its other branch to nothing.)
export const isInlineMath = (node: Node | null | undefined): boolean => isElement(node) && node.dataset.type === "inline-math";
export const isBlockMath = (node: Node | null | undefined): boolean => isElement(node) && node.dataset.type === "block-math";
const isBlock = (node: Node): boolean => isElement(node) && BLOCKS.has(node.tagName) && !isInlineMath(node);

export const isTextblock = (node: Node | null | undefined): boolean => {
  if (!isElement(node)) return false;
  if (isBlockMath(node)) return false;
  if (TEXTBLOCKS.has(node.tagName)) return true;
  if (WORD_HOLDERS.has(node.tagName)) return !Array.from(node.children).some(isBlock);
  return false;
};

export const textblocks = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>("p,h1,h2,h3,h4,h5,h6,pre,li,td,th,blockquote")).filter(isTextblock);

export const closestTextblock = (root: HTMLElement, node: Node | null): HTMLElement | null => {
  for (let at: Node | null = node; at && at !== root; at = at.parentNode) if (isTextblock(at)) return at as HTMLElement;
  return null;
};

// The child of the root a node stands in.
export const topOf = (root: HTMLElement, node: Node | null): HTMLElement | null => {
  for (let at: Node | null = node; at && at.parentNode; at = at.parentNode) if (at.parentNode === root) return isElement(at) ? at : null;
  return null;
};

// ---------------------------------------------------------------------------------------------------------------
// Leaves: the pieces of a textblock a position is counted over.

type Leaf = { node: Text | HTMLElement; length: number };

// Whether nothing of the textblock's words follows a node (a block of its own, a nested list, is not words).
const endsBlock = (node: Node, block: HTMLElement): boolean => {
  for (let at: Node | null = node; at && at !== block; at = at.parentNode) {
    let next = at.nextSibling;
    while (next && isElement(next) && isBlock(next)) next = next.nextSibling;
    if (next) return false;
  }
  return true;
};

const leaves = (block: HTMLElement): Leaf[] => {
  const out: Leaf[] = [];
  const walk = (parent: Node) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const length = (child.textContent ?? "").length;
        if (length > 0) out.push({ node: child as Text, length });
      } else if (isElement(child)) {
        if (isInlineMath(child)) out.push({ node: child, length: 1 });
        // The last <br> of a textblock only holds an empty line open; it is not a character.
        else if (child.tagName === "BR") {
          if (!endsBlock(child, block)) out.push({ node: child, length: 1 });
        } else if (child.tagName === "IMG") out.push({ node: child, length: 1 });
        else if (!isBlock(child)) walk(child);
      }
    }
  };
  walk(block);
  return out;
};

export const blockLength = (block: HTMLElement) => leaves(block).reduce((sum, leaf) => sum + leaf.length, 0);

const indexOf = (node: Node) => (node.parentNode ? Array.prototype.indexOf.call(node.parentNode.childNodes, node) : 0);

// How far into a textblock a DOM position is.
export const offsetIn = (block: HTMLElement, node: Node, offset: number): number => {
  const probe = document.createRange();
  probe.setStart(node, offset);
  probe.collapse(true);
  let total = 0;
  for (const leaf of leaves(block)) {
    if (leaf.node.nodeType === Node.TEXT_NODE) {
      if (leaf.node === node) return total + offset;
      // A leaf that ends at or before the position is counted whole; one that ends after it (and is not the position's own
      // text) starts after it.
      if (probe.comparePoint(leaf.node, leaf.length) <= 0) total += leaf.length;
      else return total;
    } else {
      const parent = leaf.node.parentNode;
      if (!parent) continue;
      if (probe.comparePoint(parent, indexOf(leaf.node) + 1) <= 0) total += 1;
      else return total;
    }
  }
  return total;
};

// The DOM position of a number of units into a textblock. At the edge between two stretches it is the end of the first,
// so that a caret keeps the marks of the word it follows.
export const positionAt = (block: HTMLElement, offset: number): { node: Node; offset: number } => {
  let remaining = Math.max(0, offset);
  for (const leaf of leaves(block)) {
    if (leaf.node.nodeType === Node.TEXT_NODE) {
      if (remaining <= leaf.length) return { node: leaf.node, offset: remaining };
      remaining -= leaf.length;
    } else {
      const parent = leaf.node.parentNode ?? block;
      if (remaining === 0) return { node: parent, offset: indexOf(leaf.node) };
      remaining -= 1;
      if (remaining === 0) return { node: parent, offset: indexOf(leaf.node) + 1 };
    }
  }
  const last = block.lastChild;
  return { node: block, offset: last && isElement(last) && last.tagName === "BR" ? block.childNodes.length - 1 : block.childNodes.length };
};

export const placeSelection = (start: Caret, end: Caret = start) => {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  const a = positionAt(start.block, start.offset);
  const b = positionAt(end.block, end.offset);
  range.setStart(a.node, a.offset);
  range.setEnd(b.node, b.offset);
  selection.removeAllRanges();
  selection.addRange(range);
};

const caretAt = (root: HTMLElement, node: Node, offset: number, edge: "start" | "end"): Caret | null => {
  const block = closestTextblock(root, node);
  if (block) return { block, offset: offsetIn(block, node, offset) };
  // The position stands between blocks (in the root, a list or a table): the nearest textblock takes it.
  const all = textblocks(root);
  if (all.length === 0) return null;
  const probe = document.createRange();
  probe.setStart(node, offset);
  probe.collapse(true);
  if (edge === "start") {
    const after = all.find((block) => probe.comparePoint(block, 0) >= 0);
    if (after) return { block: after, offset: 0 };
    const last = all[all.length - 1]!;
    return { block: last, offset: blockLength(last) };
  }
  const before = [...all].reverse().find((block) => probe.comparePoint(block, block.childNodes.length) <= 0);
  if (before) return { block: before, offset: blockLength(before) };
  return { block: all[0]!, offset: 0 };
};

export type Carets = { start: Caret; end: Caret; collapsed: boolean };

export const readCarets = (root: HTMLElement): Carets | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const start = caretAt(root, range.startContainer, range.startOffset, "start");
  const end = range.collapsed && start ? start : caretAt(root, range.endContainer, range.endOffset, "end");
  if (!start || !end) return null;
  return { start, end, collapsed: range.collapsed };
};

// The textblocks a selection touches, first to last, with the stretch of each that it covers.
export type Span = { block: HTMLElement; from: number; to: number };

export const spans = (root: HTMLElement, carets: Carets): Span[] => {
  const all = textblocks(root);
  const first = all.indexOf(carets.start.block);
  const last = all.indexOf(carets.end.block);
  if (first < 0 || last < 0) return [];
  return all.slice(first, last + 1).map((block, index, list) => ({
    block,
    from: index === 0 ? carets.start.offset : 0,
    to: index === list.length - 1 ? carets.end.offset : blockLength(block),
  }));
};

// ---------------------------------------------------------------------------------------------------------------
// Runs: the marks of a textblock as data.

const sameMarks = (a: Marks, b: Marks) =>
  a.bold === b.bold && a.italic === b.italic && a.strike === b.strike && a.highlight === b.highlight && a.code === b.code && a.link === b.link && a.size === b.size && a.font === b.font;

const clean = (marks: Marks): Marks => Object.fromEntries(Object.entries(marks).filter(([, value]) => value !== undefined)) as Marks;

const push = (runs: Run[], run: Run) => {
  const last = runs[runs.length - 1];
  if (run.kind === "text" && last?.kind === "text" && sameMarks(last.marks, run.marks)) last.text += run.text;
  else runs.push(run);
};

export const parseRuns = (block: HTMLElement): Run[] => {
  const runs: Run[] = [];
  const keepBreaks = block.tagName === "PRE";
  const walk = (parent: Node, marks: Marks) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (text) push(runs, { kind: "text", text, marks });
        continue;
      }
      if (!isElement(child)) continue;
      if (isInlineMath(child)) {
        runs.push({ kind: "atom", node: child.cloneNode(true) as HTMLElement });
        continue;
      }
      if (child.tagName === "BR") {
        if (endsBlock(child, block)) continue;
        if (keepBreaks) push(runs, { kind: "text", text: "\n", marks });
        else runs.push({ kind: "atom", node: child.cloneNode(true) as HTMLElement });
        continue;
      }
      if (child.tagName === "IMG") {
        runs.push({ kind: "atom", node: child.cloneNode(true) as HTMLElement });
        continue;
      }
      if (isBlock(child)) continue;
      let next: Marks = marks;
      switch (child.tagName) {
        case "STRONG":
        case "B":
          next = { ...next, bold: true };
          break;
        case "EM":
        case "I":
          next = { ...next, italic: true };
          break;
        case "DEL":
        case "S":
        case "STRIKE":
          next = { ...next, strike: true };
          break;
        case "MARK":
          next = { ...next, highlight: true };
          break;
        case "CODE":
          next = { ...next, code: true };
          break;
        case "A":
          next = { ...next, link: child.getAttribute("href") ?? "" };
          break;
      }
      if (child.style.fontSize) next = { ...next, size: child.style.fontSize };
      if (child.style.fontFamily) next = { ...next, font: child.style.fontFamily };
      walk(child, next);
    }
  };
  walk(block, {});
  return runs;
};

const wrap = (text: string, marks: Marks): Node => {
  let node: Node = document.createTextNode(text);
  const around = (tag: string) => {
    const element = document.createElement(tag);
    element.append(node);
    node = element;
    return element;
  };
  if (marks.code) around("code");
  if (marks.highlight) around("mark");
  if (marks.strike) around("del");
  if (marks.italic) around("em");
  if (marks.bold) around("strong");
  if (marks.size || marks.font) {
    const span = around("span");
    if (marks.size) span.style.fontSize = marks.size;
    if (marks.font) span.style.fontFamily = marks.font;
  }
  if (marks.link !== undefined) {
    const anchor = around("a");
    anchor.setAttribute("href", marks.link);
    anchor.setAttribute("rel", "noopener noreferrer");
  }
  return node;
};

const MERGEABLE = new Set(["A", "SPAN", "STRONG", "EM", "DEL", "MARK", "CODE"]);

// Neighbouring elements of the same kind become one, so that a stretch made of several runs is one <strong>.
const mergeNeighbours = (parent: Node) => {
  let child = parent.firstChild;
  while (child) {
    const next: ChildNode | null = child.nextSibling;
    if (isElement(child) && isElement(next) && MERGEABLE.has(child.tagName) && child.tagName === next.tagName && child.cloneNode(false).isEqualNode(next.cloneNode(false))) {
      while (next.firstChild) child.append(next.firstChild);
      next.remove();
      continue;
    }
    if (isElement(child)) mergeNeighbours(child);
    child = child.nextSibling;
  }
};

export const renderRuns = (block: HTMLElement, runs: Run[]) => {
  // Anything the textblock holds that is not words (a nested list in an item) stays where it is, after the words.
  const keep = Array.from(block.children).filter(isBlock);
  block.replaceChildren();
  for (const run of runs) {
    if (run.kind === "atom") block.append(run.node);
    else if (run.text) block.append(wrap(run.text, run.marks));
  }
  mergeNeighbours(block);
  block.normalize();
  if (runs.length === 0) block.append(document.createElement("br"));
  for (const child of keep) block.append(child);
};

export const runsLength = (runs: Run[]) => runs.reduce((sum, run) => sum + (run.kind === "text" ? run.text.length : 1), 0);

// Change the marks of the text between two positions of a list of runs.
export const mapRange = (runs: Run[], from: number, to: number, change: (marks: Marks) => Marks): Run[] => {
  const out: Run[] = [];
  let at = 0;
  for (const run of runs) {
    if (run.kind === "atom") {
      push(out, run);
      at += 1;
      continue;
    }
    const end = at + run.text.length;
    const lo = Math.max(from, at) - at;
    const hi = Math.min(to, end) - at;
    if (hi <= lo) push(out, run);
    else {
      if (lo > 0) push(out, { kind: "text", text: run.text.slice(0, lo), marks: run.marks });
      push(out, { kind: "text", text: run.text.slice(lo, hi), marks: clean(change(run.marks)) });
      if (hi < run.text.length) push(out, { kind: "text", text: run.text.slice(hi), marks: run.marks });
    }
    at = end;
  }
  return out;
};

export const cutRange = (runs: Run[], from: number, to: number): Run[] => {
  const out: Run[] = [];
  let at = 0;
  for (const run of runs) {
    if (run.kind === "atom") {
      if (at < from || at >= to) push(out, run);
      at += 1;
      continue;
    }
    const end = at + run.text.length;
    const keepBefore = run.text.slice(0, Math.max(0, Math.min(run.text.length, from - at)));
    const keepAfter = run.text.slice(Math.max(0, Math.min(run.text.length, to - at)));
    if (keepBefore) push(out, { kind: "text", text: keepBefore, marks: run.marks });
    if (keepAfter) push(out, { kind: "text", text: keepAfter, marks: run.marks });
    at = end;
  }
  return out;
};

export const textOf = (runs: Run[], from = 0, to = Infinity): string => {
  let out = "";
  let at = 0;
  for (const run of runs) {
    if (run.kind === "atom") {
      at += 1;
      continue;
    }
    const end = at + run.text.length;
    out += run.text.slice(Math.max(0, from - at), Math.max(0, Math.min(run.text.length, to - at)));
    at = end;
  }
  return out;
};

// The marks of the words around a position: those of the character before it, or after it at the start of a textblock.
export const marksAt = (runs: Run[], offset: number): Marks => {
  let at = 0;
  let first: Marks | undefined;
  for (const run of runs) {
    const length = run.kind === "text" ? run.text.length : 1;
    if (run.kind === "text") {
      first ??= run.marks;
      if (offset > at && offset <= at + length) return run.marks;
    }
    at += length;
  }
  return offset === 0 ? (first ?? {}) : {};
};

// Whether every character in a stretch has a mark.
export const allMarked = (runs: Run[], from: number, to: number, has: (marks: Marks) => boolean): boolean | null => {
  let at = 0;
  let seen = false;
  for (const run of runs) {
    const length = run.kind === "text" ? run.text.length : 1;
    if (run.kind === "text" && Math.min(to, at + length) > Math.max(from, at)) {
      seen = true;
      if (!has(run.marks)) return false;
    }
    at += length;
  }
  return seen ? true : null;
};
