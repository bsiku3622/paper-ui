// Color profile — variant 가 어떤 색 자리를 쓰는지의 정의 (studio-ui accentColorProfile 대응).
//
// styles/color.css.ts 만 이 프로파일을 소비해 클래스를 emit 한다. resolver 는 이걸
// 보지 않는다 (resolver 는 이름만, emitter 는 실체). 값은 tokens 의 var 참조라 실제
// hex 는 theme.css.ts 한 곳에서만 산다.

import { tokens } from "../tokens";
import type { Variant } from "../resolvers/color";

export type ColorSpec = {
  background: string;
  color: string;
  borderColor: string;
  hoverBackground: string;
  hoverColor?: string;
};

// 뉴트럴 (status=default) — 색이 아니라 검정·회색으로. 큰 면을 채우는 건 solid(검정)뿐.
export const neutralProfile: Record<Variant, ColorSpec> = {
  solid: {
    background: tokens.color.primary.base,
    color: tokens.color.primary.fg,
    borderColor: "transparent",
    hoverBackground: tokens.color.primary.hover, // 검정은 hover 때 밝아진다
  },
  soft: {
    background: tokens.color.paper.muted,
    color: tokens.color.ink.base,
    borderColor: "transparent",
    hoverBackground: tokens.color.border.strong, // 회색 스케일 한 단 아래
  },
  outline: {
    background: tokens.color.paper.base,
    color: tokens.color.ink.base,
    borderColor: tokens.color.border.base,
    hoverBackground: tokens.color.paper.muted,
  },
  quiet: {
    background: "transparent",
    color: tokens.color.ink.soft,
    borderColor: "transparent",
    hoverBackground: tokens.color.paper.muted,
    hoverColor: tokens.color.ink.base,
  },
};

// status × variant — accent 색 c(4 자리 solid/ink/wash/edge)로 뉴트럴을 덮는다.
// 색 면은 그 색의 의미를 짊어질 때만 (danger 삭제 · success 완료).
type Accent = { solid: string; ink: string; wash: string; edge: string };

export const statusProfile = (c: Accent): Record<Variant, ColorSpec> => ({
  solid: {
    background: c.solid,
    color: tokens.color.primary.fg,
    borderColor: "transparent",
    hoverBackground: c.ink,
  },
  soft: {
    background: c.wash,
    color: c.ink,
    borderColor: "transparent",
    hoverBackground: c.edge,
  },
  outline: {
    background: tokens.color.paper.base,
    color: c.ink,
    borderColor: c.edge,
    hoverBackground: c.wash,
  },
  quiet: {
    background: "transparent",
    color: c.ink,
    borderColor: "transparent",
    hoverBackground: c.wash,
  },
});
