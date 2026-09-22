// Color resolver — 색·면의 이름 규칙의 주인.
//
// 두 어휘를 **종류로 나눈다** (한 prop 에 욱여넣지 않는다):
//   surface — 면의 깊이. Box 가 입는 구조 축. 색이 아니라 지면이다.
//   color × variant — 잉크색의 무게. Button·Badge·Alert 가 입는다.
// paper-ui 정체성("색으로 면을 안 채운다 — 큰 면은 검정 primary 만")상 Box 는 accent 색을
// 입을 일이 없어, 면(surface)과 잉크색(color)은 애초에 다른 종류다. 그래서 나눈다.
//
//   resolveSurface("raised")          → "pui-surface-raised"   (순백 면 — 카드 바닥)
//   resolveColor("primary", "solid")  → "pui-c-primary-solid"  (검정 채움 — 일꾼)
//   resolveColor("error",   "soft")   → "pui-c-error-soft"     (옅은 빨강 면)
//
// 잉크색 이름의 실체(background·color·border·hover)는 styles/color.css.ts 가, 면은
// styles/utility.css.ts 가 같은 축 배열을 걸어 굳힌다 — 조합이 어긋날 수 없다.

// 면(surface) — 깊이 사다리. Box 전용 구조 축.
export const SURFACES = ["raised", "canvas", "sunken", "well"] as const;
export type Surface = (typeof SURFACES)[number];

export const resolveSurface = (s: Surface | undefined): string => (s ? `pui-surface-${s}` : "");

// 의미 4색 — tokens.color.status 의 키와 같다. API의 color prop은 status를 짧게 부른다.
export const ACCENTS = ["info", "success", "warning", "error"] as const;
export type Accent = (typeof ACCENTS)[number];

// color 축 = 잉크색 = primary(검정 일꾼) ∪ accent 4색. 면(surface)은 여기 없다.
export const COLORS = ["primary", ...ACCENTS] as const;
export type Color = (typeof COLORS)[number];

// 면의 무게 9 단. 각 variant는 fg·bg·border·interaction 네 슬롯의 조합이다.
// Table의 구조 variant="plain"은 이 shared variant와 다른 타입이다.
// **테두리만 있는 자리가 셋**이고, 둘은 세기가 아니라 *어느 선이냐* 로 갈린다.
//
//   solid    채운 면
//   soft     옅은 면
//   outline  컨트롤이 소유한 또렷한 테두리 (color family 의 edgeStrong · 지면 대비 3:1)
//   hairline 지면이 소유한 헤어라인 (카드 · 빈 입력칸과 같은 선)
//   hairlineMuted  흐린 잉크·헤어라인. hover 때 ink와 선을 함께 세운다
//   softMuted    wash 면·무테·흐린 잉크
//   outlineMuted 투명 면·강한 선·흐린 잉크
//   ghost    면과 선 없이 잉크만
//   ghostMuted     면과 선 없이 흐린 잉크
//
// Muted 네 변형은 primary와 status 모두 같은 규칙이다: wash + mutedInk, 또는 투명
// 바탕에서 hover overlay로 ink·edge를 강화한다. 각 family는 어떤 pigment를 쓰는지만 다르다.
//
// ⚠ `outline` 의 뜻이 바뀌었다. 예전 outline 은 지금의 `hairline` 이다 — 헤어라인을 두르던
// 자리인데, 그것만으로는 "테두리가 곧 형태" 인 변형이 지면에서 안 떨어졌다(1.19:1).
// 강조가 필요한 자리를 위해 진한 쪽을 새로 열고 이름을 옮겼다.
export const VARIANTS = [
  "solid",
  "soft",
  "softMuted",
  "outline",
  "outlineMuted",
  "hairline",
  "hairlineMuted",
  "ghost",
  "ghostMuted",
] as const;
export type Variant = (typeof VARIANTS)[number];

export const resolveColor = (color: Color | undefined, variant: Variant = "solid"): string =>
  color ? `pui-c-${color}-${variant}` : "";

// hover/active 를 켜는 opt-in gate. Button 처럼 눌리는 것만 붙인다 — Badge 같은 표시용은
// 안 붙여 hover 색이 뜨지 않게 한다 (studio-ui 의 is-interactive).
export const INTERACTIVE = "pui-interactive";
