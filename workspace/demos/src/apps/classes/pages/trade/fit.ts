// NOT USED ANY MORE — safe to delete (the task rules forbid deleting files, so it stays). It was written while the shared
// SlotGrid centred a name longer than its cell and cut it off on both sides; the grid now ends such a name in an ellipsis itself.
//
// Names in the cells of a narrow grid: the grid's width is measured and each name is cut to what a cell can hold, with an
// ellipsis at the end.

import { useCallback, useRef, useState } from "react";

// About how wide a character of a 12px semibold label is: a syllable nearly fills its em, a digit .58 of it, a capital .66,
// a bracket .34.
const isHangul = (char: string) => {
  const code = char.charCodeAt(0);
  return (code >= 0x1100 && code <= 0x11ff) || (code >= 0x3130 && code <= 0x318f) || (code >= 0xac00 && code <= 0xd7a3);
};
const span = (char: string) => (isHangul(char) ? 11.6 : /\d/.test(char) ? 6.9 : /[A-Z]/.test(char) ? 7.9 : /[()]/.test(char) ? 4.1 : 6.3);
const widthOf = (text: string) => Array.from(text).reduce((sum, char) => sum + span(char), 0);
const ELLIPSIS = 10;

// `text` as it fits in `room` pixels, or whole when the room is not known (0).
export const fit = (text: string, room: number) => {
  if (room <= 0 || widthOf(text) <= room) return text;
  let out = "";
  for (const char of Array.from(text)) {
    if (widthOf(out + char) + ELLIPSIS > room) break;
    out += char;
  }
  return `${out}…`;
};

// What one cell of the grid can hold, from the width inside the card: the period column and the gaps are SlotGrid's. The
// padding of a cell is left to the name, which may touch it but not the edge.
export const cellRoom = (inner: number, days = 5) => (inner > 0 ? (inner - 24 - days * 4) / days - 4 : 0);

// A callback ref that reports the width of the content box of what it is put on, and keeps reporting as it changes.
export const useWidth = <T extends HTMLElement>() => {
  const [width, setWidth] = useState(0);
  const watcher = useRef<ResizeObserver | null>(null);
  const ref = useCallback((node: T | null) => {
    watcher.current?.disconnect();
    watcher.current = null;
    if (!node) return;
    const next = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    next.observe(node);
    watcher.current = next;
  }, []);
  return [ref, width] as const;
};
