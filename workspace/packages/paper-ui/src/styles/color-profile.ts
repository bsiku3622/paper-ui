// Color profile — color × variant 가 어떤 색 자리를 쓰는지의 정의 (studio-ui
// accentColorProfile 대응). styles/color.css.ts 만 이걸 소비해 클래스를 emit 한다.
// 값은 tokens 의 var 참조라 실제 hex 는 theme.css.ts 한 곳에서만 산다(테마 자동 추종).

import { tokens } from "../tokens";
import { type Color, type Variant } from "../resolvers/color";

export type ColorSpec = {
  background: string;
  color: string;
  borderColor: string;
  // 색·검정 solid 은 hover 때 배경을 교체(hoverBackground). 중립 면(회색·흰·투명)은
  // 교체 대신 interaction 오버레이(hoverOverlay)를 base 색 위에 얹어 어두워진다.
  hoverBackground?: string;
  hoverOverlay?: string;
  hoverColor?: string;
};

// ── primary — 검정 일꾼 색 family ────────────────────────────────────────────
// solid=검정 채움 · soft=회색 secondary · outline=흰 면+테두리 · quiet=글자만.
// "큰 면을 채우는 건 검정뿐" 이라는 정체성의 자리. hover 는 오버레이(중립)·교체(solid).
const primaryProfile: Record<Variant, ColorSpec> = {
  solid: {
    background: tokens.color.primary.base,
    color: tokens.color.primary.fg,
    borderColor: "transparent",
    hoverBackground: tokens.color.primary.hover, // 검정은 hover 때 밝아진다(solid 교체)
  },
  soft: {
    background: tokens.color.paper.well,
    color: tokens.color.ink.base,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.hover,
  },
  // outline 은 **면을 칠하지 않는다** — 테두리만 두르고 밑면이 그대로 비친다.
  // raised 를 칠하고 있었는데, 이 팔레트에서는 raised(#ffffff)와 canvas(#fcfcfc)가
  // 거의 같아 티가 안 났을 뿐 이름과는 어긋난 자리였다.
  //
  // 테두리는 border.base — **카드 헤어라인·빈 Field 와 같은 선이다.** 화면의 회색 선은
  // 한 벌이라, 이 자리만 진하게 하면 같은 화면에 회색이 두 종류가 된다. 더 또렷하게
  // 하려면 이 자리가 아니라 border 표를 올린다.
  outline: {
    background: "transparent",
    color: tokens.color.ink.base,
    borderColor: tokens.color.border.base,
    hoverOverlay: tokens.color.interaction.hover,
  },
  quiet: {
    background: "transparent",
    color: tokens.color.ink.soft,
    borderColor: "transparent",
    hoverOverlay: tokens.color.interaction.hover,
    hoverColor: tokens.color.ink.base,
  },
};

// ── accent — 의미 4색 ────────────────────────────────────────────────────────
// solid=채운 색면 · soft=옅은 면(wash) · outline=흰 면+색 테두리 · quiet=색 글자만.
// 색 면은 그 색의 의미를 짊어질 때만 (error 버튼처럼). hover 는 색 스텝(오버레이 아님).
// solid 위 글자는 각 색의 solidFg(on-solid 대비쌍) — 배경 밝기 따라 흰/어두운 잉크가 갈린다.
type AccentTones = { solid: string; solidFg: string; ink: string; wash: string; edge: string; edgeStrong: string };

const accentProfile = (c: AccentTones): Record<Variant, ColorSpec> => ({
  solid: {
    background: c.solid,
    color: c.solidFg,
    borderColor: "transparent",
    // 진한 색면 위에 어둠을 얹어(darken) hover — solid 가 ink(700톤)와 같아 색 교체로는
    // hover 가 안 뜬다. 검정 틴트라 라이트·다크 어느 색면에서도 한 단 어두워진다(비테마).
    hoverOverlay: "rgba(0, 0, 0, 0.14)",
  },
  soft: {
    background: c.wash,
    color: c.ink,
    borderColor: "transparent",
    hoverBackground: c.edge,
  },
  // 테두리는 edge(wash 의 괘선)가 아니라 edgeStrong 이다. 두 자리가 요구하는 세기가
  // 다르다 — wash 의 괘선은 이미 색이 깔린 면의 가장자리지만, outline 은 그 선이 곧
  // 컴포넌트라 흰 면 위에서 혼자 형태를 만들어야 한다.
  outline: {
    background: "transparent", // 면을 칠하지 않는다 — 밑면이 비친다
    color: c.ink,
    borderColor: c.edgeStrong,
    hoverBackground: c.wash,
  },
  quiet: {
    background: "transparent",
    color: c.ink,
    borderColor: "transparent",
    hoverBackground: c.wash,
  },
});

// color 하나를 받아 variant→spec 표를 고른다. (primary·accent 두 family — 면은 여기 없다.)
export const colorProfile = (color: Color, variant: Variant): ColorSpec =>
  color === "primary" ? primaryProfile[variant] : accentProfile(tokens.color.accent[color])[variant];
