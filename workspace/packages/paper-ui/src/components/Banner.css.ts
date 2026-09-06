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

// tone — solid(검정) 기본 + status 색 면. 채운 면 위 대비쌍 글자.
//
// ⚠ status 면 위 글자는 **`solidFg`** 다. 예전엔 `paper.raised` 를 하드코딩했는데
// ("종이색" 이라는 뜻이었다), 다크에서 raised 는 최암(#151515)이라 색면 위 글자가
// **2.24~2.45** 까지 떨어져 있었다 — 조용한 AA 실패였다. 채움 위 글자의 정본은
// 처음부터 각 색의 on-solid 대비쌍이다(→ tokens/colors.ts 의 solidFg).
//
// 중립 tone 만 `paper.raised` 를 그대로 쓴다. 거기 배경은 `ink.base` 인데 둘이 테마마다
// 함께 뒤집혀(검정 면/흰 글자 ↔ 흰 면/검정 글자) 저절로 맞는다.
export const bannerTone = styleVariants({
  solid: { background: tokens.color.ink.base, color: tokens.color.paper.raised },
  ...(Object.fromEntries(
    STATUS.map((s) => [
      s,
      {
        background: tokens.color.accent[STATUS_ACCENT[s]].solid,
        color: tokens.color.accent[STATUS_ACCENT[s]].solidFg,
      },
    ]),
  ) as Record<StatusName, { background: string; color: string }>),
});
