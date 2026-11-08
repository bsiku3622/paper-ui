import { useCallback, useRef, useState } from "react";

const isHangul = (char: string) => {
  const code = char.charCodeAt(0);
  return (code >= 0x1100 && code <= 0x11ff) || (code >= 0x3130 && code <= 0x318f) || (code >= 0xac00 && code <= 0xd7a3);
};
const span = (char: string) => (isHangul(char) ? 11.6 : /\d/.test(char) ? 6.9 : /[A-Z]/.test(char) ? 7.9 : /[()]/.test(char) ? 4.1 : 6.3);
const widthOf = (text: string) => Array.from(text).reduce((sum, char) => sum + span(char), 0);
const ELLIPSIS = 10;

export const fit = (text: string, room: number) => {
  if (room <= 0 || widthOf(text) <= room) return text;
  let out = "";
  for (const char of Array.from(text)) {
    if (widthOf(out + char) + ELLIPSIS > room) break;
    out += char;
  }
  return `${out}…`;
};

export const cellRoom = (inner: number, days = 5) => (inner > 0 ? (inner - 24 - days * 4) / days - 4 : 0);

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
