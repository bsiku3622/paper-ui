import { style, styleVariants } from "@vanilla-extract/css";

import { tokens, STATUS, STATUS_ACCENT } from "../tokens";
import type { StatusName } from "../tokens";

// 얇은 풀폭 바. 색·크기만 — flex 레이아웃은 Inline 이, 좌우 슬롯은 Banner 가 짠다.
// 배경은 채워진 면(solid)이라 "색은 점" 의 예외 자리 — 검정(primary)은 언제나, status
// 색은 그 색의 *의미를 짊어질 때*(공지·경고)만. 그래서 기본 tone 은 solid(검정).
export const bannerRoot = style({
  width: "100%",
  minHeight: tokens.shape.height.lg.interaction, // 40 — 얇은 chrome 바
  paddingInline: tokens.shape.padding.xl.interaction, // 24
  paddingBlock: tokens.shape.padding.xs.interaction, // 2 (두 줄로 자라면 숨 쉬게)
  fontFamily: tokens.text.font.sans,
  fontSize: tokens.text.size.caption,
});

// tone — solid(검정) 기본 + status 색 면. 채운 면 위 흰 글자.
export const bannerTone = styleVariants({
  solid: { background: tokens.color.ink.base, color: tokens.color.paper.base },
  ...(Object.fromEntries(
    STATUS.map((s) => [
      s,
      { background: tokens.color.accent[STATUS_ACCENT[s]].solid, color: tokens.color.paper.base },
    ]),
  ) as Record<StatusName, { background: string; color: string }>),
});
