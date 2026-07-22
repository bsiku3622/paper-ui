// utility.css.ts — resolver 가 뱉는 클래스의 실체.
//
// resolver 는 이름만 만들고(`pui-blue-wash`), 그 이름이 무엇인지는 여기서 굳는다.
// 두 자리가 같은 토큰 트리를 돌기 때문에 조합이 빠질 수 없다.

import { globalStyle } from "@vanilla-extract/css";

import { tokens, ACCENT_NAMES, SPACE_KEYS } from "../tokens";
import { PAPERS, INKS } from "../resolvers";

// ───── paper — 면 ────────────────────────────────────────────────────────

const PAPER_TOKEN = {
  base: tokens.color.paper.base,
  subtle: tokens.color.paper.subtle,
  muted: tokens.color.paper.muted,
} as const;

for (const s of PAPERS) {
  globalStyle(`.pui-paper-${s}`, { background: PAPER_TOKEN[s] });
}

// ───── ink — 잉크 농도 ─────────────────────────────────────────────────────

const INK_TOKEN = {
  base: tokens.color.ink.base,
  soft: tokens.color.ink.soft,
  faint: tokens.color.ink.faint,
} as const;

for (const i of INKS) {
  globalStyle(`.pui-ink-${i}`, { color: INK_TOKEN[i] });
}

// ───── accent — 작게 얹는 색 ───────────────────────────────────────────────
//
// ink  = 글자·아이콘만 그 색.
// wash = 옅은 면 + 같은 색 괘선 + 그 색 글자.
// dot  = 작은 채운 점 (배경/글자에 solid).

for (const a of ACCENT_NAMES) {
  const t = tokens.color.accent[a];
  globalStyle(`.pui-${a}-ink`, { color: t.ink });
  globalStyle(`.pui-${a}-wash`, {
    background: t.wash,
    color: t.ink,
    borderColor: t.edge,
  });
  globalStyle(`.pui-${a}-dot`, { background: t.solid, color: t.solid });
}

// ───── space — 간격 ────────────────────────────────────────────────────────

for (const s of SPACE_KEYS) {
  globalStyle(`.pui-p-${s}`, { padding: tokens.shape.padding[s].interaction });
  globalStyle(`.pui-px-${s}`, { paddingInline: tokens.shape.padding[s].interaction });
  globalStyle(`.pui-py-${s}`, { paddingBlock: tokens.shape.padding[s].interaction });
  globalStyle(`.pui-gap-${s}`, { gap: tokens.shape.gap[s] });
}
