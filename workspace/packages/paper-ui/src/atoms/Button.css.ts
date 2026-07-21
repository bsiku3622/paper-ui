import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, STATUS, STATUS_ACCENT } from "../tokens";
import type { StatusName } from "../tokens";

export const buttonRoot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.space.sm,
  height: tokens.shape.height.control,
  paddingInline: tokens.shape.space.md,
  borderRadius: tokens.shape.radius.sm,
  borderWidth: tokens.shape.borderWidth.base,
  borderStyle: "solid",
  borderColor: "transparent",
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.body,
  fontWeight: tokens.text.weight.medium,
  letterSpacing: tokens.text.tracking.body,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background 130ms ease, border-color 130ms ease, color 130ms ease",
  selectors: {
    "&:disabled": { cursor: "not-allowed", opacity: 0.4 },
  },
});

// ───── variant — 시각 무게 (status=default 기준) ────────────────────────────
//
// solid  면을 채운다 (검정 primary — 이 시스템에서 색이 아니라 검정이 채운다)
// soft   옅은 회색 면 (secondary — solid 와 quiet 사이 위계)
// outline 흰 면 + 거의 안 보이는 괘선
// quiet  선도 면도 없음 — hover 때만 회색
export const buttonVariant = styleVariants({
  solid: {
    background: tokens.color.primary.base,
    color: tokens.color.primary.fg,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.primary.hover } },
  },
  soft: {
    background: tokens.color.paper.muted,
    color: tokens.color.ink.base,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.border.strong } },
  },
  outline: {
    background: tokens.color.paper.base,
    borderColor: tokens.color.border.base,
    color: tokens.color.ink.base,
    selectors: { "&:hover:not(:disabled)": { background: tokens.color.paper.muted } },
  },
  quiet: {
    background: "transparent",
    color: tokens.color.ink.soft,
    selectors: {
      "&:hover:not(:disabled)": { background: tokens.color.paper.muted, color: tokens.color.ink.base },
    },
  },
});

export type ButtonVariant = keyof typeof buttonVariant;
const VARIANTS = ["solid", "soft", "outline", "quiet"] as const satisfies readonly ButtonVariant[];

// ───── status × variant — 의미 색 ───────────────────────────────────────────
//
// status 가 있으면 variant 의 뉴트럴 색 위로 그 색이 덮인다. 색 면은 그 색의
// 의미를 짊어질 때만 (danger 삭제 · success 완료) — 장식이 아니다.
export const buttonColor = {} as Record<ButtonVariant, Record<StatusName, string>>;

for (const v of VARIANTS) {
  buttonColor[v] = {} as Record<StatusName, string>;
  for (const s of STATUS) {
    const c = tokens.color.accent[STATUS_ACCENT[s]];
    const spec =
      v === "solid"
        ? { background: c.solid, color: tokens.color.primary.fg, selectors: { "&:hover:not(:disabled)": { background: c.ink } } }
        : v === "soft"
          ? { background: c.wash, color: c.ink, selectors: { "&:hover:not(:disabled)": { background: c.edge } } }
          : v === "outline"
            ? { background: tokens.color.paper.base, borderColor: c.edge, color: c.ink, selectors: { "&:hover:not(:disabled)": { background: c.wash } } }
            : { background: "transparent", color: c.ink, selectors: { "&:hover:not(:disabled)": { background: c.wash } } };
    buttonColor[v][s] = style(spec);
  }
}
