// utility.css.ts — resolver 가 뱉는 클래스의 실체.
//
// resolver 는 이름만 만들고(`paper-red-wash`), 그 이름이 무엇인지는 여기서 굳는다.
// 두 자리가 같은 토큰 트리를 돌기 때문에 조합이 빠질 수 없다.

import { globalStyle } from "@vanilla-extract/css";

import { tokens, ACCENT_NAMES, SPACE_KEYS } from "../tokens";
import { SURFACES, INKS } from "../resolvers";

// ───── surface — 파인 면 ───────────────────────────────────────────────────

const SURFACE_TOKEN = {
  base: tokens.color.paper.base,
  sunk: tokens.color.paper.sunk,
  deep: tokens.color.paper.deep,
} as const;

for (const s of SURFACES) {
  globalStyle(`.paper-surface-${s}`, { background: SURFACE_TOKEN[s] });
}

// ───── ink — 잉크 농도 ─────────────────────────────────────────────────────

const INK_TOKEN = {
  base: tokens.color.ink.base,
  soft: tokens.color.ink.soft,
  faint: tokens.color.ink.faint,
} as const;

for (const i of INKS) {
  globalStyle(`.paper-ink-${i}`, { color: INK_TOKEN[i] });
}

// ───── accent — 가끔 등장하는 잉크 ─────────────────────────────────────────
//
// ink  = 글자·선만 그 색. 종이는 건드리지 않는다.
// wash = 옅은 면 + 같은 색 괘선 + 그 색 글자.

const ACCENT_TOKEN = {
  red: tokens.color.accent.red,
  green: tokens.color.accent.green,
  orange: tokens.color.accent.orange,
} as const;

for (const a of ACCENT_NAMES) {
  const t = ACCENT_TOKEN[a];
  globalStyle(`.paper-${a}-ink`, { color: t.ink });
  globalStyle(`.paper-${a}-wash`, {
    background: t.wash,
    color: t.ink,
    borderColor: t.edge,
  });
}

// ───── space — 간격 ────────────────────────────────────────────────────────

for (const s of SPACE_KEYS) {
  globalStyle(`.paper-p-${s}`, { padding: tokens.shape.space[s] });
  globalStyle(`.paper-px-${s}`, { paddingInline: tokens.shape.space[s] });
  globalStyle(`.paper-py-${s}`, { paddingBlock: tokens.shape.space[s] });
  globalStyle(`.paper-gap-${s}`, { gap: tokens.shape.space[s] });
}
