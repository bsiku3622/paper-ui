import { tex } from "../../lib/text";
import {
  allMarked,
  blockLength,
  closestTextblock,
  isElement,
  isTextblock,
  mapRange,
  parseRuns,
  placeSelection,
  readCarets,
  renderRuns,
  spans,
  textOf,
  topOf,
  type Caret,
  type Carets,
  type MarkName,
  type Marks,
} from "./dom";

export type BlockKind = "p" | "h1" | "h2" | "h3" | "code";
export type ListKind = "bullet" | "ordered" | "task";
export type Align = "left" | "center" | "right";
export type TableOp = "row-after" | "col-after" | "row-delete" | "col-delete" | "table-delete";

const WORDS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6"]);
const markable = (block: HTMLElement) => block.tagName !== "PRE";

export const changeMarks = (root: HTMLElement, change: (marks: Marks) => Marks): boolean => {
  const carets = readCarets(root);
  if (!carets || carets.collapsed) return false;
  const covered = spans(root, carets).filter((span) => markable(span.block));
  for (const span of covered) renderRuns(span.block, mapRange(parseRuns(span.block), span.from, span.to, change));
  placeSelection(carets.start, carets.end);
  return covered.length > 0;
};

export const toggleMark = (root: HTMLElement, name: MarkName): boolean => {
  const carets = readCarets(root);
  if (!carets || carets.collapsed) return false;
  const covered = spans(root, carets).filter((span) => markable(span.block));
  const states = covered.map((span) => allMarked(parseRuns(span.block), span.from, span.to, (marks) => Boolean(marks[name])));
  if (states.every((state) => state === null)) return false;
  const on = states.some((state) => state === false);
  for (const span of covered) renderRuns(span.block, mapRange(parseRuns(span.block), span.from, span.to, (marks) => ({ ...marks, [name]: on ? true : undefined })));
  placeSelection(carets.start, carets.end);
  return true;
};

export const setLink = (root: HTMLElement, href: string): boolean => changeMarks(root, (marks) => ({ ...marks, link: href || undefined }));

const carryStyle = (from: HTMLElement, to: HTMLElement) => {
  const style = from.getAttributeNode("style");
  if (!style) return;
  to.setAttributeNode(style.cloneNode() as Attr);
  to.style.marginTop = "";
  if (!to.getAttribute("style")) to.removeAttribute("style");
};

const carryCaret = (caret: Caret, from: HTMLElement, to: HTMLElement): Caret => (caret.block === from ? { block: to, offset: Math.min(caret.offset, blockLength(to)) } : caret);

export const setBlock = (root: HTMLElement, kind: BlockKind): boolean => {
  const carets = readCarets(root);
  if (!carets) return false;
  let { start, end } = carets;
  let changed = false;
  for (const span of spans(root, carets)) {
    const block = span.block;
    if (!WORDS.has(block.tagName) && block.tagName !== "PRE") continue;
    const tag = kind === "p" ? "P" : kind === "code" ? "PRE" : kind.toUpperCase();
    if (block.tagName === tag) continue;
    const next = document.createElement(tag.toLowerCase());
    if (kind === "code") {
      const code = document.createElement("code");
      code.textContent = textOf(parseRuns(block));
      next.append(code);
    } else if (block.tagName === "PRE") {
      next.textContent = block.textContent ?? "";
      if (!next.textContent) next.append(document.createElement("br"));
    } else {
      while (block.firstChild) next.append(block.firstChild);
      carryStyle(block, next);
    }
    block.replaceWith(next);
    start = carryCaret(start, block, next);
    end = carryCaret(end, block, next);
    changed = true;
  }
  if (changed) placeSelection(start, end);
  return changed;
};

export const setAlign = (root: HTMLElement, align: Align): boolean => {
  const carets = readCarets(root);
  if (!carets) return false;
  let changed = false;
  for (const span of spans(root, carets)) {
    if (!WORDS.has(span.block.tagName)) continue;
    if (span.block.style.textAlign !== align) {
      span.block.style.textAlign = align;
      changed = true;
    }
  }
  return changed;
};

const topsOf = (root: HTMLElement, carets: Carets): HTMLElement[] => {
  const first = topOf(root, carets.start.block);
  const last = topOf(root, carets.end.block);
  if (!first || !last) return [];
  const out: HTMLElement[] = [];
  for (let at: Element | null = first; at; at = at.nextElementSibling) {
    if (isElement(at)) out.push(at);
    if (at === last) break;
  }
  return out;
};

const isList = (node: Element | null | undefined): boolean => Boolean(node) && (node!.tagName === "UL" || node!.tagName === "OL");

export const listKindOf = (list: HTMLElement): ListKind => (list.dataset.type === "taskList" ? "task" : list.tagName === "OL" ? "ordered" : "bullet");

const makeList = (kind: ListKind) => {
  const list = document.createElement(kind === "ordered" ? "ol" : "ul");
  if (kind === "task") list.dataset.type = "taskList";
  return list;
};

const itemAs = (item: HTMLElement, kind: ListKind) => {
  if (kind === "task") {
    item.dataset.type = "taskItem";
    item.dataset.checked = item.dataset.checked ?? "false";
  } else {
    delete item.dataset.type;
    delete item.dataset.checked;
  }
};

const paragraphOf = (block: HTMLElement): HTMLElement => {
  if (block.tagName === "P") return block;
  const paragraph = document.createElement("p");
  while (block.firstChild) paragraph.append(block.firstChild);
  carryStyle(block, paragraph);
  return paragraph;
};

const joinNeighbours = (list: HTMLElement) => {
  const same = (other: Element | null): other is HTMLElement => isElement(other) && isList(other) && other.tagName === list.tagName && other.dataset.type === list.dataset.type;
  const next = list.nextElementSibling;
  if (same(next)) {
    while (next.firstChild) list.append(next.firstChild);
    next.remove();
  }
  const previous = list.previousElementSibling;
  if (same(previous)) {
    while (list.firstChild) previous.append(list.firstChild);
    list.remove();
  }
};

export const toggleList = (root: HTMLElement, kind: ListKind): boolean => {
  const carets = readCarets(root);
  if (!carets) return false;
  const tops = topsOf(root, carets);
  const only = tops.length === 1 ? tops[0]! : null;
  if (only && isList(only)) {
    if (listKindOf(only) === kind) {
      const out: HTMLElement[] = [];
      for (const item of Array.from(only.children)) {
        if (!isElement(item)) continue;
        const direct = Array.from(item.children).find((child) => child.tagName === "P") as HTMLElement | undefined;
        const paragraph = direct ?? paragraphOf(item);
        out.push(paragraph);
        for (const nested of Array.from(item.children)) if (isList(nested)) out.push(nested as HTMLElement);
      }
      only.replaceWith(...out);
      placeSelection(carets.start, carets.end);
      return true;
    }
    const next = makeList(kind);
    for (const item of Array.from(only.children)) {
      if (isElement(item)) itemAs(item, kind);
      next.append(item);
    }
    only.replaceWith(next);
    joinNeighbours(next);
    placeSelection(carets.start, carets.end);
    return true;
  }
  if (tops.length === 0 || !tops.every((top) => WORDS.has(top.tagName))) return false;
  const list = makeList(kind);
  tops[0]!.before(list);
  for (const top of tops) {
    const item = document.createElement("li");
    itemAs(item, kind);
    item.append(paragraphOf(top));
    list.append(item);
  }
  for (const top of tops) if (top.parentNode === root) top.remove();
  joinNeighbours(list);
  placeSelection(carets.start, carets.end);
  return true;
};

export const toggleQuote = (root: HTMLElement): boolean => {
  const carets = readCarets(root);
  if (!carets) return false;
  const tops = topsOf(root, carets);
  const only = tops.length === 1 ? tops[0]! : null;
  if (only && only.tagName === "BLOCKQUOTE") {
    only.replaceWith(...Array.from(only.children));
    placeSelection(carets.start, carets.end);
    return true;
  }
  if (tops.length === 0 || !tops.every((top) => WORDS.has(top.tagName) || isList(top) || top.tagName === "PRE")) return false;
  const quote = document.createElement("blockquote");
  tops[0]!.before(quote);
  quote.append(...tops);
  placeSelection(carets.start, carets.end);
  return true;
};

const paragraphAfter = (block: HTMLElement): HTMLElement => {
  const next = block.nextElementSibling;
  if (next && next.tagName === "P") return next as HTMLElement;
  const paragraph = document.createElement("p");
  paragraph.append(document.createElement("br"));
  block.after(paragraph);
  return paragraph;
};

const isEmptyParagraph = (block: HTMLElement | null) => Boolean(block) && block!.tagName === "P" && blockLength(block!) === 0;

const putBlock = (root: HTMLElement, block: HTMLElement): HTMLElement => {
  const carets = readCarets(root);
  const top = carets ? topOf(root, carets.end.block) : null;
  if (top && isEmptyParagraph(top)) {
    top.before(block);
    return top;
  }
  if (top) top.after(block);
  else root.append(block);
  return paragraphAfter(block);
};

const landIn = (block: HTMLElement) => placeSelection({ block, offset: 0 });

export const insertRule = (root: HTMLElement): boolean => {
  landIn(putBlock(root, document.createElement("hr")));
  return true;
};

export const insertImage = (root: HTMLElement, src: string, alt: string): boolean => {
  const image = document.createElement("img");
  image.setAttribute("src", src);
  image.setAttribute("alt", alt);
  landIn(putBlock(root, image));
  return true;
};

export const renderMath = (element: HTMLElement) => {
  element.contentEditable = "false";
  element.textContent = tex(element.dataset.latex ?? "");
};

export const insertBlockMath = (root: HTMLElement, latex: string): boolean => {
  const block = document.createElement("div");
  block.dataset.type = "block-math";
  block.dataset.latex = latex;
  renderMath(block);
  landIn(putBlock(root, block));
  return true;
};

export const insertInlineMath = (block: HTMLElement, offset: number, latex: string): boolean => {
  const runs = parseRuns(block);
  const atom = document.createElement("span");
  atom.dataset.type = "inline-math";
  atom.dataset.latex = latex;
  renderMath(atom);
  let at = 0;
  const next: ReturnType<typeof parseRuns> = [];
  let placed = false;
  for (const run of runs) {
    const length = run.kind === "text" ? run.text.length : 1;
    if (!placed && run.kind === "text" && offset >= at && offset <= at + length) {
      const cut = offset - at;
      if (cut > 0) next.push({ kind: "text", text: run.text.slice(0, cut), marks: run.marks });
      next.push({ kind: "atom", node: atom });
      if (cut < run.text.length) next.push({ kind: "text", text: run.text.slice(cut), marks: run.marks });
      placed = true;
    } else next.push(run);
    at += length;
  }
  if (!placed) next.push({ kind: "atom", node: atom });
  renderRuns(block, next);
  placeSelection({ block, offset: offset + 1 });
  return true;
};

export const updateMath = (element: HTMLElement, latex: string) => {
  element.dataset.latex = latex;
  renderMath(element);
};

export const insertTable = (root: HTMLElement): boolean => {
  const table = document.createElement("table");
  const body = document.createElement("tbody");
  for (let row = 0; row < 3; row++) {
    const tr = document.createElement("tr");
    for (let column = 0; column < 3; column++) tr.append(newCell(row === 0));
    body.append(tr);
  }
  table.append(body);
  const after = putBlock(root, table);
  const first = table.querySelector("p");
  if (first) placeSelection({ block: first as HTMLElement, offset: 0 });
  else landIn(after);
  return true;
};

const newCell = (header: boolean) => {
  const cell = document.createElement(header ? "th" : "td");
  const paragraph = document.createElement("p");
  paragraph.append(document.createElement("br"));
  cell.append(paragraph);
  return cell;
};

export const inTable = (root: HTMLElement): HTMLElement | null => {
  const carets = readCarets(root);
  const block = carets?.start.block;
  const table = block ? block.closest("table") : null;
  return table && root.contains(table) ? table : null;
};

export const tableOp = (root: HTMLElement, op: TableOp): boolean => {
  const carets = readCarets(root);
  const cell = carets?.start.block.closest("td,th") as HTMLElement | null;
  const table = cell?.closest("table") as HTMLElement | null | undefined;
  if (!cell || !table) return false;
  const row = cell.parentElement as HTMLTableRowElement;
  const rows = Array.from(table.querySelectorAll("tr"));
  const column = Array.from(row.children).indexOf(cell);
  const land = (target: Element | null | undefined) => {
    const paragraph = target?.querySelector("p");
    if (paragraph) placeSelection({ block: paragraph as HTMLElement, offset: 0 });
  };
  switch (op) {
    case "row-after": {
      const next = document.createElement("tr");
      for (let i = 0; i < row.children.length; i++) next.append(newCell(false));
      row.after(next);
      land(next.firstElementChild);
      return true;
    }
    case "col-after": {
      for (const tr of rows) {
        const header = tr.children[column]?.tagName === "TH";
        tr.children[column]?.after(newCell(header));
      }
      land(row.children[column + 1]);
      return true;
    }
    case "row-delete": {
      if (rows.length <= 1) return tableOp(root, "table-delete");
      const target = row.nextElementSibling ?? row.previousElementSibling;
      row.remove();
      land(target?.children[Math.min(column, target.children.length - 1)]);
      return true;
    }
    case "col-delete": {
      if (row.children.length <= 1) return tableOp(root, "table-delete");
      for (const tr of rows) tr.children[column]?.remove();
      land(row.children[Math.min(column, row.children.length - 1)]);
      return true;
    }
    case "table-delete": {
      const top = topOf(root, table);
      const next = top?.nextElementSibling;
      table.remove();
      if (next && isTextblock(next)) landIn(next as HTMLElement);
      else if (root.lastElementChild && isTextblock(root.lastElementChild)) landIn(root.lastElementChild as HTMLElement);
      return true;
    }
  }
};

export const toggleTask = (item: HTMLElement) => {
  item.dataset.checked = item.dataset.checked === "true" ? "false" : "true";
};

export const mathAt = (root: HTMLElement, target: EventTarget | null): HTMLElement | null => {
  const element = target instanceof Element ? target.closest<HTMLElement>("[data-type$='-math']") : null;
  return element && root.contains(element) ? element : null;
};

export const blockOfCaret = (root: HTMLElement): HTMLElement | null => {
  const carets = readCarets(root);
  return carets ? closestTextblock(root, carets.start.block) : null;
};
