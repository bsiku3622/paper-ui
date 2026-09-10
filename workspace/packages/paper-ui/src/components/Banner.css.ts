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
// ⚠ status 면 위 글자는 같은 hue의 반대 끝인 **`wash`** 다. 예전엔 `paper.raised` 를
// 하드코딩해 다크에서 무너졌고, 별도 solidFg는 wash와 자리가 겹쳤다. wash는 테마별로
// solid와 반대 방향에 있어 한 슬롯으로 양쪽 대비를 만든다.
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
        color: tokens.color.accent[STATUS_ACCENT[s]].wash,
      },
    ]),
  ) as Record<StatusName, { background: string; color: string }>),
});
