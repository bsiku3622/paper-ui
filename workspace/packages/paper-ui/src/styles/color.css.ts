// color.css — 색 축의 이름이 가리키는 class 의 실체. 면(fill) · 잉크(ink) · accent × variant 가
// 각자 지도 하나로 굳는다.
//
// 컴포넌트는 resolver 로 이 지도를 인덱싱할 뿐 class 이름을 짓지 않는다. 키는 어휘를 돌며
// 만들어지니 조합이 빠질 수 없고, 어휘 밖의 이름은 타입에서 걸린다. 이 파일은 resolver 를
// import 하지 않는다 — 지도가 아래, resolver 가 위다.

import { tokens, ACCENTS, STATUSES, VARIANTS, ENABLED_SELECTOR, SELECTED_SELECTOR, type Accent, type Ink, type Status, type Variant } from "../tokens";
import { layered } from "../tokens/layers.css";
import { accentProfile, itemProfile } from "../tokens/color-recipes";

const utilities = layered("utilities");
const components = layered("components");

// ───── fill — 면 (Surface 의 구조 축) ───────────────────────────────────────
//
// 깊이 사다리(앞에서 뒤로): raised — canvas — sunken. 색이 아니라 지면이다. 라이트는 세 단계, 다크는 두 단계다 —
// 페이지(canvas)가 이미 가장 깊은 단계라 sunken 이 같은 neutral.950 을 쓴다. canvas 위의 sunken 은 border 로 구분되고,
// raised 위에서는 두 모드 모두 물러나 보인다.
// 카드 테두리는 별도(Surface 의 border prop). hover 는 면이 아니라 앱의 interaction 이 맡는다.

export const fillClass = utilities.styleVariants(tokens.color.bg, (background) => ({ backgroundColor: background }));

// ───── ink — 마크(Text · Icon)가 소유하는 색 ───────────────────────────────
//
// 한 축에 잉크 농도(primary·secondary·tertiary)와 의미색(info·success·warning·error)을 함께 둔다.
// 의미색 글자는 그 accent 의 ink tone 이다 — "soft 한 빨강 글자"는 거의 안 쓰여 농도×색 직교(죽은 셀)를 만들지 않는다.
// inherit 는 색을 정하지 않는다: 색이 깔린 면(Alert 의 solid · soft) 안의 Text 가 variant 기본 잉크로
// 면의 글자색을 덮어쓰는 걸 막는다.

const STATUS_INK = Object.fromEntries(STATUSES.map((status) => [status, tokens.color.accent[status].ink])) as Record<Status, string>;
const INK_COLOR: Record<Ink, string> = { ...tokens.color.ink, ...STATUS_INK, inherit: "inherit" };

export const inkClass = utilities.styleVariants(INK_COLOR, (color) => ({ color }));

// ───── accent × variant — Paint 와 그 위의 Atom(Button · Badge)의 색 ───────
//
// hover 는 hoverGate 가 함께 있을 때만 문다 — 눌리는 것(Button)만 gate 를 붙이고,
// 표시용(Badge)에는 안 붙여 hover 색이 뜨지 않는다. gate 는 paintClass({ hoverable }) 말고는
// 닿는 길이 없다(primitives/paint 밖에서는 import 하지 않는다). 터치는 hover 가 없으므로
// `(hover: hover)` 안에서만, 눌릴 수 있는 대상(disabled · aria-disabled · data-disabled 가 아닌)에만 문다.

export const hoverGate = components.style({});

const tintLayer = (tint: string) => `linear-gradient(0deg, ${tint}, ${tint})`;

const accentClass = (accent: Accent, variant: Variant): string => {
  const spec = accentProfile(accent, variant);
  // 중립: base 색은 두고 tint 레이어(backgroundImage)만 얹는다 — 어느 면 위든 합성돼 어두워진다.
  // 색·검정 solid 도 같은 방식으로 한 단계 반응하고, hairline 은 경계가 한 단계 진해진다.
  const hover = "tint" in spec.hover ? { backgroundImage: tintLayer(spec.hover.tint) } : { borderColor: spec.hover.border };
  const gated = `&.${hoverGate}:hover${ENABLED_SELECTOR}`;
  return components.style({
    background: spec.face,
    color: spec.ink,
    borderColor: spec.border,
    // 선택은 data-selected 나 aria-current 가 알린다. 선택된 면은 hover 로 경계가 올라오지 않고, 면 위에 tint 만 얹는다.
    ...(spec.selected
      ? { selectors: { [`&${SELECTED_SELECTOR}`]: { backgroundColor: spec.selected.face, color: spec.selected.ink, borderColor: spec.selected.border } } }
      : {}),
    "@media": {
      "(hover: hover)": {
        selectors: {
          [gated]: hover,
          ...(spec.selected
            ? { [`&.${hoverGate}${SELECTED_SELECTOR}:hover${ENABLED_SELECTOR}`]: { backgroundImage: tintLayer(itemProfile.hoverTint), borderColor: spec.selected.border } }
            : {}),
        },
      },
    },
  });
};

export const accentVariantClass = Object.fromEntries(
  ACCENTS.map((accent) => [accent, Object.fromEntries(VARIANTS.map((variant) => [variant, accentClass(accent, variant)]))]),
) as Record<Accent, Record<Variant, string>>;
