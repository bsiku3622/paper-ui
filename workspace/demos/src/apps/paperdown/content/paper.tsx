import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { Surface, Text } from "@studio-baeks/paper-ui";

import { useFace } from "../../../kit";
import { PX_PER_MM, clamp, dimensions, type FontFace, type Settings } from "../lib/types";
import {
  changeMarks,
  inTable,
  insertBlockMath,
  insertImage,
  insertRule,
  insertTable,
  mathAt,
  setAlign,
  setBlock,
  setLink,
  tableOp,
  toggleList,
  toggleMark,
  toggleQuote,
  toggleTask,
  updateMath,
  type Align,
  type BlockKind,
  type ListKind,
  type TableOp,
} from "./editor/commands";
import {
  cutRange,
  isBlockMath,
  isElement,
  isInlineMath,
  isTextblock,
  mapRange,
  marksAt,
  parseRuns,
  placeSelection,
  readCarets,
  renderRuns,
  textOf,
  type MarkName,
  type Marks,
} from "./editor/dom";
import { History, capture, cleanHtml, load, restore } from "./editor/history";
import { paginate } from "./editor/paginate";
import { applyRules } from "./editor/rules";
import { SANS_STACK, SERIF_STACK } from "./fonts.css";
import * as css from "./paper.css";

export type { Align, BlockKind, ListKind, MarkName, TableOp };

export type EditorState = {
  block: BlockKind;
  bold: boolean;
  italic: boolean;
  strike: boolean;
  highlight: boolean;
  code: boolean;
  link: string | null;
  align: Align | null;
  bullet: boolean;
  ordered: boolean;
  task: boolean;
  quote: boolean;
  table: boolean;
  font: FontFace | null;
  size: number | null;
  collapsed: boolean;
  selection: string;
  canUndo: boolean;
  canRedo: boolean;
};

export const NO_STATE: EditorState = {
  block: "p", bold: false, italic: false, strike: false, highlight: false, code: false, link: null, align: null, bullet: false, ordered: false, task: false, quote: false, table: false,
  font: null, size: null, collapsed: true, selection: "", canUndo: false, canRedo: false,
};

export type SlashInfo = { filter: string; left: number; top: number; bottom: number };
export type MathTarget = { latex: string; inline: boolean; element: HTMLElement };

export type Command =
  | { type: "undo" }
  | { type: "redo" }
  | { type: "block"; kind: BlockKind }
  | { type: "font"; font: FontFace }
  | { type: "size"; pt: number }
  | { type: "mark"; mark: MarkName }
  | { type: "link"; href: string }
  | { type: "align"; align: Align }
  | { type: "list"; kind: ListKind }
  | { type: "quote" }
  | { type: "image"; src: string; alt: string }
  | { type: "table"; op?: TableOp }
  | { type: "math"; latex: string; target?: HTMLElement }
  | { type: "rule" };

export type PaperHandle = {
  run: (command: Command) => void;
  focus: () => void;
  collapsed: () => boolean;
  html: () => string;
  text: () => string;
  deleteSlash: () => void;
};

type Props = {
  docKey: string;
  html: string;
  settings: Settings;
  caption: ReactNode;
  footer: ReactNode;
  onContent: (html: string, text: string, user: boolean) => void;
  onState: (state: EditorState) => void;
  onSlash: (info: SlashInfo | null) => void;
  onMath: (target: MathTarget) => void;
  onPages: (count: number) => void;
  onImage: (file: File) => void;
};

const HEADING_HINT = "제목";
const PARAGRAPH_HINT = "글을 쓰거나 / 로 블록을 추가하세요";

const PAGE_GAP = 24;
const AVAILABLE = 1100;

const FACES: Record<FontFace, string> = { myeongjo: SERIF_STACK, sans: SANS_STACK };

const faceOf = (stack: string | undefined): FontFace | null => {
  if (!stack) return null;
  if (/pretendard|sans-serif/i.test(stack) && !/batang|myungjo|serif ?$/i.test(stack.replace(/sans-serif/i, ""))) return "sans";
  return /batang|noto serif|myungjo|serif/i.test(stack) ? "myeongjo" : null;
};

export const plainText = (root: HTMLElement): string => {
  let out = "";
  let first = true;
  const enter = () => {
    if (!first) out += "\n";
    first = false;
  };
  const walk = (parent: Node) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.textContent ?? "";
        continue;
      }
      if (!isElement(child) || isInlineMath(child)) continue;
      const tag = child.tagName;
      if (isBlockMath(child)) {
        enter();
        continue;
      }
      if (tag === "BR") {
        if (child.nextSibling) out += "\n";
        continue;
      }
      const block = /^(P|H[1-6]|UL|OL|LI|BLOCKQUOTE|PRE|TABLE|TR|TD|TH|HR)$/.test(tag) || (tag === "IMG" && parent === root);
      if (block) {
        enter();
        if (isTextblock(child) && !/^(P|H[1-6]|PRE)$/.test(tag)) enter();
      }
      if (tag !== "HR" && tag !== "IMG") walk(child);
    }
  };
  walk(root);
  return out;
};

const INLINE_TAGS = new Set(["SPAN", "STRONG", "EM", "B", "I", "U", "DEL", "S", "STRIKE", "MARK", "CODE", "A", "BR", "FONT"]);

const normalizeRoot = (root: HTMLElement) => {
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if ((child.textContent ?? "").trim() === "") continue;
      const paragraph = document.createElement("p");
      child.replaceWith(paragraph);
      paragraph.append(child);
    } else if (isElement(child)) {
      if (child.tagName === "DIV" && !isBlockMath(child)) {
        const paragraph = document.createElement("p");
        while (child.firstChild) paragraph.append(child.firstChild);
        if (!paragraph.firstChild) paragraph.append(document.createElement("br"));
        child.replaceWith(paragraph);
      } else if (INLINE_TAGS.has(child.tagName)) {
        const paragraph = document.createElement("p");
        child.replaceWith(paragraph);
        paragraph.append(child);
      }
    }
  }
  if (root.children.length === 0) {
    const paragraph = document.createElement("p");
    paragraph.append(document.createElement("br"));
    root.replaceChildren(paragraph);
    placeSelection({ block: paragraph, offset: 0 });
  }
};

export const Paper = forwardRef<PaperHandle, Props>(function Paper(props, ref) {
  const { docKey, settings, caption, footer } = props;
  const face = useFace();
  const root = useRef<HTMLDivElement>(null);
  const lane = useRef<HTMLDivElement>(null);
  const history = useRef<History | null>(null);
  const saved = useRef<Range | null>(null);
  const stored = useRef<{ patch: Partial<Record<MarkName, boolean>>; block: HTMLElement; offset: number } | null>(null);
  const composing = useRef(false);
  const slash = useRef<SlashInfo | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const callbacks = useRef(props);
  callbacks.current = props;

  const [available, setAvailable] = useState(AVAILABLE);
  const [pageCount, setPageCount] = useState(1);

  const dim = dimensions(settings);
  const widthPx = dim.width * PX_PER_MM;
  const heightPx = dim.height * PX_PER_MM;
  const marginPx = settings.margin * PX_PER_MM;
  const zoom = settings.zoom === "fit" ? clamp((available - 48) / widthPx, 0.25, 1.5) : settings.zoom / 100;
  const continuous = settings.mode === "continuous";

  const stateNow = useCallback((): EditorState => {
    const element = root.current;
    const past = history.current;
    const base = { ...NO_STATE, canUndo: past?.canUndo ?? false, canRedo: past?.canRedo ?? false };
    if (!element) return base;
    const carets = readCarets(element);
    const block = carets?.start.block ?? textblocks0(element);
    if (!block) return base;
    const runs = parseRuns(block);
    const has = (name: MarkName): boolean => {
      const patch = stored.current?.patch[name];
      if (carets?.collapsed && patch !== undefined && stored.current?.block === block) return patch;
      if (carets && !carets.collapsed && carets.start.block === carets.end.block) return covered(runs, carets.start.offset, carets.end.offset, name);
      return Boolean(marksAt(runs, carets?.start.offset ?? 0)[name]);
    };
    const marks = marksAt(runs, carets?.start.offset ?? 0);
    const tag = block.tagName;
    const align = block.style.textAlign;
    const inside = (selector: string) => Boolean(block.closest(selector));
    const selection = window.getSelection();
    return {
      ...base,
      block: tag === "H1" ? "h1" : tag === "H2" ? "h2" : tag === "H3" ? "h3" : tag === "PRE" ? "code" : "p",
      bold: has("bold"),
      italic: has("italic"),
      strike: has("strike"),
      highlight: has("highlight"),
      code: has("code"),
      link: marks.link ?? null,
      align: align === "left" || align === "center" || align === "right" ? align : null,
      bullet: inside("ul:not([data-type='taskList'])"),
      ordered: inside("ol"),
      task: inside("ul[data-type='taskList']"),
      quote: inside("blockquote"),
      table: inside("table"),
      font: faceOf(marks.font),
      size: marks.size ? parseFloat(marks.size) || null : null,
      collapsed: carets ? carets.collapsed : true,
      selection: carets && !carets.collapsed && selection ? selection.toString().replace(/\n+$/, "") : "",
    };
  }, []);

  const report = useCallback(() => callbacks.current.onState(stateNow()), [stateNow]);

  const placeholders = useCallback(() => {
    const element = root.current;
    if (!element) return;
    for (const old of Array.from(element.querySelectorAll(".is-empty"))) {
      old.classList.remove("is-empty");
      old.removeAttribute("data-placeholder");
      if (!old.getAttribute("class")) old.removeAttribute("class");
    }
    const carets = readCarets(element);
    const block = carets?.start.block;
    if (block && block.parentElement === element && /^(P|H[1-3])$/.test(block.tagName) && parseRuns(block).length === 0) {
      block.classList.add("is-empty");
      block.setAttribute("data-placeholder", block.tagName === "P" ? PARAGRAPH_HINT : HEADING_HINT);
    }
  }, []);

  const slashNow = useCallback(() => {
    const element = root.current;
    let next: SlashInfo | null = null;
    if (element && document.activeElement === element) {
      const carets = readCarets(element);
      if (carets?.collapsed) {
        const before = textOf(parseRuns(carets.start.block), 0, carets.start.offset);
        const match = /(?:^|\s)\/([^\s/]*)$/.exec(before);
        const range = window.getSelection()?.getRangeAt(0);
        if (match && range) {
          let rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) rect = carets.start.block.getBoundingClientRect();
          next = { filter: match[1]!, left: rect.left, top: rect.top, bottom: rect.bottom };
        }
      }
    }
    const was = slash.current;
    if (was?.filter === next?.filter && was?.left === next?.left && was?.bottom === next?.bottom) return;
    slash.current = next;
    callbacks.current.onSlash(next);
  }, []);

  const schedule = useRef(0);
  const layout = useCallback(() => {
    cancelAnimationFrame(schedule.current);
    schedule.current = requestAnimationFrame(() => {
      const element = root.current;
      if (!element) return;
      const s = settingsRef.current;
      const d = dimensions(s);
      const count = paginate(element, { enabled: s.mode === "pages", height: d.height * PX_PER_MM, margin: s.margin * PX_PER_MM, gap: PAGE_GAP });
      setPageCount((now) => (now === count ? now : count));
      callbacks.current.onPages(count);
    });
  }, []);

  const content = useCallback((user: boolean) => {
    const element = root.current;
    if (!element) return;
    callbacks.current.onContent(cleanHtml(element), plainText(element), user);
  }, []);

  const changed = useCallback((kind: "type" | "edit") => {
    const element = root.current;
    if (!element) return;
    normalizeRoot(element);
    history.current?.record(capture(element), kind);
    placeholders();
    content(true);
    report();
    layout();
    slashNow();
  }, [content, layout, placeholders, report, slashNow]);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    load(element, callbacks.current.html);
    history.current = new History(capture(element));
    document.execCommand("defaultParagraphSeparator", false, "p");
    stored.current = null;
    placeholders();
    content(false);
    report();
    layout();
  }, [docKey, content, layout, placeholders, report]);

  useEffect(() => {
    layout();
  }, [settings.mode, settings.paper, settings.width, settings.height, settings.landscape, settings.margin, settings.font, settings.sizePt, settings.leading, zoom, layout]);

  useEffect(() => {
    const element = root.current;
    const wrapper = lane.current;
    if (!element || !wrapper) return;
    const watchLane = new ResizeObserver(([entry]) => setAvailable(entry?.contentRect.width ?? AVAILABLE));
    watchLane.observe(wrapper);
    setAvailable(wrapper.getBoundingClientRect().width);
    const watchPaper = new ResizeObserver(() => layout());
    watchPaper.observe(element);
    void document.fonts.ready.then(layout);
    return () => {
      watchLane.disconnect();
      watchPaper.disconnect();
      cancelAnimationFrame(schedule.current);
    };
  }, [layout]);

  const keep = useCallback((): boolean => {
    const element = root.current;
    const selection = window.getSelection();
    if (!element || !selection || selection.rangeCount === 0 || !element.contains(selection.anchorNode)) return false;
    saved.current = selection.getRangeAt(0).cloneRange();
    return true;
  }, []);

  const sync = useCallback(() => {
    const element = root.current;
    if (!element || !keep()) return;
    const carets = readCarets(element);
    const pending = stored.current;
    if (pending && !composing.current && (!carets || !carets.collapsed || carets.start.block !== pending.block || carets.start.offset !== pending.offset)) stored.current = null;
    placeholders();
    report();
    slashNow();
  }, [keep, placeholders, report, slashNow]);

  useEffect(() => {
    document.addEventListener("selectionchange", sync);
    return () => document.removeEventListener("selectionchange", sync);
  }, [sync]);

  const settle = useCallback(() => {
    const element = root.current;
    if (!element) return;
    const selection = window.getSelection();
    const inside = Boolean(selection && selection.rangeCount > 0 && element.contains(selection.anchorNode));
    element.focus({ preventScroll: true });
    if (!inside && saved.current && selection) {
      selection.removeAllRanges();
      selection.addRange(saved.current.cloneRange());
    }
  }, []);

  const move = useCallback((snap: ReturnType<History["undo"]>) => {
    const element = root.current;
    if (!element || !snap) return;
    restore(element, snap);
    placeholders();
    content(true);
    report();
    layout();
  }, [content, layout, placeholders, report]);

  const undo = useCallback(() => {
    const element = root.current;
    if (element) move(history.current?.undo(capture(element)) ?? null);
  }, [move]);
  const redo = useCallback(() => {
    const element = root.current;
    if (element) move(history.current?.redo(capture(element)) ?? null);
  }, [move]);

  const run = useCallback((command: Command) => {
    const element = root.current;
    if (!element) return;
    settle();
    // A pressed button takes the focus back after its click, so refocus the paper for the next key.
    window.setTimeout(() => element.focus({ preventScroll: true }), 0);
    if (command.type === "undo") return undo();
    if (command.type === "redo") return redo();
    const carets = readCarets(element);
    let did = false;
    switch (command.type) {
      case "block":
        did = setBlock(element, command.kind);
        break;
      case "font":
        did = changeMarks(element, (marks) => ({ ...marks, font: FACES[command.font] }));
        break;
      case "size":
        did = changeMarks(element, (marks) => ({ ...marks, size: `${command.pt}pt` }));
        break;
      case "mark": {
        if (carets && carets.collapsed) {
          const now = stateNow();
          const key = command.mark;
          const patch = { ...(stored.current?.block === carets.start.block ? stored.current.patch : {}), [key]: !now[key] };
          stored.current = { patch, block: carets.start.block, offset: carets.start.offset };
          report();
          return;
        }
        did = toggleMark(element, command.mark);
        break;
      }
      case "link": {
        if (carets && carets.collapsed) {
          const anchor = (window.getSelection()?.anchorNode?.parentElement ?? null)?.closest("a");
          if (anchor && element.contains(anchor)) {
            if (command.href) anchor.setAttribute("href", command.href);
            else anchor.replaceWith(...Array.from(anchor.childNodes));
            did = true;
          }
        } else did = setLink(element, command.href);
        break;
      }
      case "align":
        did = setAlign(element, command.align);
        break;
      case "list":
        did = toggleList(element, command.kind);
        break;
      case "quote":
        did = toggleQuote(element);
        break;
      case "image":
        did = insertImage(element, command.src, command.alt);
        break;
      case "table":
        did = command.op ? tableOp(element, command.op) : inTable(element) ? false : insertTable(element);
        break;
      case "math":
        if (command.target) {
          updateMath(command.target, command.latex);
          did = true;
        } else did = insertBlockMath(element, command.latex);
        break;
      case "rule":
        did = insertRule(element);
        break;
    }
    if (did) changed("edit");
  }, [changed, redo, report, settle, stateNow, undo]);

  useImperativeHandle(ref, () => ({
    run,
    focus: settle,
    collapsed: () => {
      const element = root.current;
      if (!element) return true;
      const selection = window.getSelection();
      const inside = Boolean(selection && selection.rangeCount > 0 && element.contains(selection.anchorNode));
      const range = inside ? selection!.getRangeAt(0) : saved.current;
      return range ? range.collapsed : true;
    },
    html: () => (root.current ? cleanHtml(root.current) : ""),
    text: () => (root.current ? plainText(root.current) : ""),
    deleteSlash: () => {
      const element = root.current;
      const info = slash.current;
      if (!element || !info) return;
      settle();
      const carets = readCarets(element);
      if (!carets) return;
      const { block, offset } = carets.start;
      const from = offset - info.filter.length - 1;
      renderRuns(block, cutRange(parseRuns(block), from, offset));
      placeSelection({ block, offset: from });
      slash.current = null;
      callbacks.current.onSlash(null);
    },
  }), [run, settle]);

  const applyStored = useCallback(() => {
    const element = root.current;
    const pending = stored.current;
    if (!element || !pending) return;
    const carets = readCarets(element);
    if (!carets?.collapsed || carets.start.block !== pending.block || carets.start.offset <= pending.offset) return;
    const block = pending.block;
    const from = pending.offset;
    const to = carets.start.offset;
    renderRuns(block, mapRange(parseRuns(block), from, to, (marks) => {
      const next: Marks = { ...marks };
      for (const [name, on] of Object.entries(pending.patch) as [MarkName, boolean][]) next[name] = on ? true : undefined;
      return next;
    }));
    placeSelection({ block, offset: to });
    stored.current = { ...pending, offset: to };
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const onBeforeInput = (event: InputEvent) => {
      if (event.inputType === "historyUndo") {
        event.preventDefault();
        undo();
      } else if (event.inputType === "historyRedo") {
        event.preventDefault();
        redo();
      }
    };
    const onInput = (event: Event) => {
      const input = event as InputEvent;
      if (input.isComposing || composing.current) {
        placeholders();
        content(true);
        report();
        return;
      }
      if (input.inputType === "insertText") {
        applyRules(element, (pending) => {
          stored.current = pending;
        });
      } else if (input.inputType === "insertParagraph") {
        const item = readCarets(element)?.start.block.closest<HTMLElement>("li[data-type='taskItem']");
        if (item && item.dataset.checked === "true" && item.textContent === "") item.dataset.checked = "false";
      }
      applyStored();
      changed("type");
    };
    const onCompositionStart = () => {
      composing.current = true;
    };
    const onCompositionEnd = () => {
      composing.current = false;
      queueMicrotask(() => {
        applyStored();
        changed("type");
      });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (event.key === "Enter" && !event.shiftKey && !mod && !event.isComposing) {
        const carets = readCarets(element);
        const block = carets?.collapsed ? carets.start.block : null;
        const quote = block?.parentElement;
        if (block && quote && quote.tagName === "BLOCKQUOTE" && block.tagName === "P" && parseRuns(block).length === 0 && block === quote.lastElementChild) {
          event.preventDefault();
          quote.after(block);
          if (quote.children.length === 0) quote.remove();
          placeSelection({ block, offset: 0 });
          changed("edit");
          return;
        }
      }
      if (mod && !event.altKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (mod && !event.altKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      const math = mathAt(element, target);
      if (math) {
        event.preventDefault();
        callbacks.current.onMath({ latex: math.dataset.latex ?? "", inline: isInlineMath(math), element: math });
        return;
      }
      for (const old of Array.from(element.querySelectorAll("img[data-selected]"))) old.removeAttribute("data-selected");
      if (target instanceof HTMLImageElement && element.contains(target)) target.setAttribute("data-selected", "");
      const item = target instanceof Element ? target.closest<HTMLElement>("ul[data-type='taskList'] > li") : null;
      if (item && element.contains(item) && target instanceof Element && target.closest("li") === item) {
        const box = item.getBoundingClientRect();
        const scale = box.width / (item.offsetWidth || box.width) || 1;
        const size = parseFloat(getComputedStyle(item).fontSize) * scale;
        if (event.clientX - box.left < size * 1.4 && event.clientY - box.top < size * 1.8) {
          toggleTask(item);
          changed("edit");
        }
      }
    };
    const onPaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((entry) => entry.type.startsWith("image/"));
      if (file) {
        event.preventDefault();
        callbacks.current.onImage(file);
        return;
      }
      const text = event.clipboardData?.getData("text/plain");
      if (text === undefined) return;
      event.preventDefault();
      text.replace(/\r\n?/g, "\n").split("\n").forEach((line, index) => {
        if (index > 0) document.execCommand("insertParagraph");
        if (line) document.execCommand("insertText", false, line);
      });
    };
    const onDrop = (event: DragEvent) => {
      const file = Array.from(event.dataTransfer?.files ?? []).find((entry) => entry.type.startsWith("image/"));
      if (file) {
        event.preventDefault();
        callbacks.current.onImage(file);
      }
    };
    const onBlur = () => {
      keep();
      window.setTimeout(slashNow, 0);
    };

    element.addEventListener("mouseup", sync);
    element.addEventListener("keyup", sync);
    element.addEventListener("beforeinput", onBeforeInput);
    element.addEventListener("input", onInput);
    element.addEventListener("compositionstart", onCompositionStart);
    element.addEventListener("compositionend", onCompositionEnd);
    element.addEventListener("keydown", onKeyDown);
    element.addEventListener("click", onClick);
    element.addEventListener("paste", onPaste);
    element.addEventListener("drop", onDrop);
    element.addEventListener("blur", onBlur);
    return () => {
      element.removeEventListener("mouseup", sync);
      element.removeEventListener("keyup", sync);
      element.removeEventListener("beforeinput", onBeforeInput);
      element.removeEventListener("input", onInput);
      element.removeEventListener("compositionstart", onCompositionStart);
      element.removeEventListener("compositionend", onCompositionEnd);
      element.removeEventListener("keydown", onKeyDown);
      element.removeEventListener("click", onClick);
      element.removeEventListener("paste", onPaste);
      element.removeEventListener("drop", onDrop);
      element.removeEventListener("blur", onBlur);
    };
  }, [applyStored, changed, content, keep, placeholders, redo, report, slashNow, sync, undo]);

  const [sheet, setSheet] = useState<CSSProperties>({});
  useLayoutEffect(() => {
    setSheet({
      "--pd-width": `${widthPx}px`,
      "--pd-height": `${heightPx}px`,
      "--pd-margin": `${marginPx}px`,
      "--pd-font": FACES[settings.font],
      "--pd-size": `${settings.sizePt}pt`,
      "--pd-leading": String(settings.leading),
      "--pd-content-height": continuous ? "none" : `${heightPx - 2 * marginPx}px`,
      "--pd-page-gap": `${PAGE_GAP}px`,
      "--pd-zoom": String(zoom),
      ...(continuous ? {} : { "--pd-stack-min": `${pageCount * heightPx + (pageCount - 1) * PAGE_GAP}px` }),
    } as CSSProperties);
  }, [widthPx, heightPx, marginPx, settings.font, settings.sizePt, settings.leading, continuous, zoom, pageCount]);

  const body = (
    <>
      {continuous ? null : (
        <div key="pages" className={css.pages} aria-hidden>
          {Array.from({ length: pageCount }, (_, index) => (
            <Surface key={index} {...face} border className={css.page} style={{ "--pd-index": index } as CSSProperties}>
              <div className={css.number}>
                <Text as="span" variant="label" strong={false} ink="tertiary">{index + 1}</Text>
              </div>
            </Surface>
          ))}
        </div>
      )}
      <div
        key="doc"
        ref={root}
        className={`${css.doc} ${continuous ? css.tall : css.sheet}`}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-label="문서 편집기"
        aria-multiline="true"
      />
    </>
  );

  return (
    <div ref={lane} className={css.lane}>
      <div className={css.stage} style={sheet}>
        <div className={css.caption}>{caption}</div>
        {continuous ? <Surface {...face} border className={css.stack}>{body}</Surface> : <Surface className={css.stack}>{body}</Surface>}
        <div className={css.end}>{footer}</div>
      </div>
    </div>
  );
});

const textblocks0 = (root: HTMLElement): HTMLElement | undefined => {
  const first = root.querySelector<HTMLElement>("p,h1,h2,h3,pre,li");
  return first ?? undefined;
};

const covered = (runs: ReturnType<typeof parseRuns>, from: number, to: number, name: MarkName): boolean => {
  let at = 0;
  let seen = false;
  for (const run of runs) {
    const length = run.kind === "text" ? run.text.length : 1;
    if (run.kind === "text" && Math.min(to, at + length) > Math.max(from, at)) {
      seen = true;
      if (!run.marks[name]) return false;
    }
    at += length;
  }
  return seen;
};
