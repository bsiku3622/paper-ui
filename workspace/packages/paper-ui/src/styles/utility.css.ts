// utility.css.ts — resolver 가 뱉는 클래스의 실체.
//
// resolver 는 이름만 만들고(`pui-info-wash`), 그 이름이 무엇인지는 여기서 굳는다.
// 두 자리가 같은 토큰 트리를 돌기 때문에 조합이 빠질 수 없다.

import { tokens, STATUSES, SPACES, SURFACES } from "../tokens";
import { layered } from "../tokens/layers.css";
import { NEUTRAL_INKS } from "../resolvers";

const { globalStyle } = layered("utilities");

// ───── surface — 면 (Box 전용 구조 축) ──────────────────────────────────────
//
// 깊이 사다리: raised — canvas — sunken. 색이 아니라 지면이다.
// 카드 테두리는 별도(Box 의 border prop). hover 는 면이 아니라 앱의 interaction 이 맡는다.

for (const s of SURFACES) {
  globalStyle(`.pui-surface-${s}`, { background: tokens.color.bg[s] });
}

// ───── ink — 잉크 농도 ─────────────────────────────────────────────────────

const INK_TOKEN = {
  base: tokens.color.ink.primary,
  soft: tokens.color.ink.secondary,
  faint: tokens.color.ink.tertiary,
} as const;

for (const i of NEUTRAL_INKS) {
  globalStyle(`.pui-ink-${i}`, { color: INK_TOKEN[i] });
}

// ink="inherit" — 면이 정한 글자색을 그대로 받는다. Alert 처럼 색이 깔린 면 안의 Text 가
// variant 기본 잉크(ink.soft 등)로 면의 색을 덮어쓰는 걸 막는 자리.
globalStyle(".pui-ink-inherit", { color: "inherit" });

// ───── accent — 작게 얹는 색 ───────────────────────────────────────────────
//
// solid = 글자·아이콘만 그 색.
// wash = 옅은 면 + 같은 색 괘선 + 그 색 글자.
// dot  = 작은 채운 점 (배경/글자에 solid).

for (const status of STATUSES) {
  const t = tokens.color.accent[status];
  globalStyle(`.pui-${status}-solid`, { color: t.ink });
  globalStyle(`.pui-${status}-wash`, {
    background: t.soft,
    color: t.ink,
    borderColor: t.soft,
  });
  globalStyle(`.pui-${status}-dot`, { background: t.solid, color: t.solid });
}

// ───── space — 안쪽 여백은 Shape inset, 형제 사이는 Layout gap ─────────────

for (const s of SPACES) {
  globalStyle(`.pui-p-${s}`, { padding: tokens.shape.inset[s] });
  globalStyle(`.pui-px-${s}`, { paddingInline: tokens.shape.inset[s] });
  globalStyle(`.pui-py-${s}`, { paddingBlock: tokens.shape.inset[s] });
  globalStyle(`.pui-gap-${s}`, { gap: tokens.layout.gap[s] });
}
