// color.css — 색 축의 이름이 가리키는 class 의 실체. 면(surface) · 잉크(ink) · accent × variant 가
// 각자 지도 하나로 굳는다.
//
// 컴포넌트는 resolver 로 이 지도를 인덱싱할 뿐 class 이름을 짓지 않는다. 키는 어휘를 돌며
// 만들어지니 조합이 빠질 수 없고, 어휘 밖의 이름은 타입에서 걸린다. 이 파일은 resolver 를
// import 하지 않는다 — 지도가 아래, resolver 가 위다.

import { tokens, ACCENTS, STATUSES, VARIANTS, type Accent, type Ink, type Status, type Variant } from "../tokens";
import { layered } from "../tokens/layers.css";
import { accentProfile } from "../tokens/color-recipes";

const utilities = layered("utilities");
const components = layered("components");

// ───── surface — 면 (Box 전용 구조 축) ──────────────────────────────────────
//
// 깊이 사다리(앞에서 뒤로): raised — canvas — sunken. 색이 아니라 지면이다. 라이트는 세 단계, 다크는 두 단계다 —
// 페이지(canvas)가 이미 가장 깊은 단계라 sunken 이 같은 neutral.950 을 쓴다. canvas 위의 sunken 은 border 로 구분되고,
// raised 위에서는 두 모드 모두 물러나 보인다.
// 카드 테두리는 별도(Box 의 border prop). hover 는 면이 아니라 앱의 interaction 이 맡는다.

export const surfaceClass = utilities.styleVariants(tokens.color.bg, (background) => ({ backgroundColor: background }));

// ───── ink — 마크(Text · Icon)가 소유하는 색 ───────────────────────────────
//
// 한 축에 잉크 농도(primary·secondary·tertiary)와 의미색(info·success·warning·error)을 함께 둔다.
// 의미색 글자는 그 accent 의 ink tone 이다 — "soft 한 빨강 글자"는 거의 안 쓰여 농도×색 직교(죽은 셀)를 만들지 않는다.
// inherit 는 색을 정하지 않는다: 색이 깔린 면(Alert 의 solid · soft) 안의 Text 가 variant 기본 잉크로
// 면의 글자색을 덮어쓰는 걸 막는다.

const STATUS_INK = Object.fromEntries(STATUSES.map((status) => [status, tokens.color.accent[status].ink])) as Record<Status, string>;
const INK_COLOR: Record<Ink, string> = { ...tokens.color.ink, ...STATUS_INK, inherit: "inherit" };

export const inkClass = utilities.styleVariants(INK_COLOR, (color) => ({ color }));

// ───── accent × variant — Button · Badge 의 색 ─────────────────────────────
//
// hover 는 interactiveClass 가 함께 있을 때만 문다 — 눌리는 것(Button)만 gate 를 붙이고,
// 표시용(Badge)에는 안 붙여 hover 색이 뜨지 않는다.

export const interactiveClass = components.style({});

const accentClass = (accent: Accent, variant: Variant): string => {
  const spec = accentProfile(accent, variant);
  return components.style({
    background: spec.background,
    color: spec.color,
    borderColor: spec.borderColor,
    selectors: {
      [`&.${interactiveClass}:hover:not(:disabled)`]: {
        // 중립: base 색은 두고 tint 레이어(backgroundImage)만 얹는다 — 어느 면 위든
        // 합성돼 어두워진다. 색·검정 solid 도 같은 방식으로 한 단계 반응한다.
        ...(spec.hoverTint ? { backgroundImage: `linear-gradient(0deg, ${spec.hoverTint}, ${spec.hoverTint})` } : {}),
        ...(spec.hoverBorderColor ? { borderColor: spec.hoverBorderColor } : {}),
      },
    },
  });
};

export const accentVariantClass = Object.fromEntries(
  ACCENTS.map((accent) => [accent, Object.fromEntries(VARIANTS.map((variant) => [variant, accentClass(accent, variant)]))]),
) as Record<Accent, Record<Variant, string>>;
