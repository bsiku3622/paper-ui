# Paint

Paint Primitive는 Box 위에 색을 얹는 길입니다. 색이 오는 곳은 둘이고, 모든 색 규칙이 이 층에 있습니다. Surface는 면(fill) · 테두리 · 모서리 · 높이 · 테마를, Paint는 accent × variant와 hover 색을 맡습니다. 그래서 Box · Stack · Inline · Grid에는 색이 없고, Press · Select · Float도 색을 입히지 않습니다. 둘 다 Box를 렌더하므로 `as` · 여백 · 크기 · 잘림은 Box와 같습니다.

| 컴포넌트 | 공개 축 | 기본값 |
| --- | --- | --- |
| Surface | Box 전체 + `fill` canvas / raised / sunken · `border` · `radius` · `elevation` · `theme` | div. 면 · 테두리 · 모서리 · 높이는 모두 opt-in, 테마가 있으면 fill 없이도 그 모드의 canvas |
| Paint | Box 전체 + `accent` · `variant` · `hoverable` | div. accent가 없으면 칠하지 않음 |

Atom이 이 층에 닿는 길은 class 함수 둘뿐입니다. `surfaceClass({ fill, border, radius, elevation })`는 theme을 뺀 Surface의 class를, `paintClass({ accent, variant, hoverable })`는 Paint의 class를 돌려줍니다. theme은 context가 필요해서 class만으로 만들 수 없습니다. 높이만 필요한 요소는 Surface를 거치지 않고 공개 class 지도 `elevation`(`@studio-baeks/paper-ui`)에서 tier의 class를 직접 받습니다. Surface의 `elevation` prop도 같은 지도입니다.

## Surface — 면

Surface는 Box가 놓인 종이입니다. 어떤 면 위에 있는지(fill), 경계가 있는지(border), 모서리가 얼마나 둥근지(radius), 얼마나 떠 있는지(elevation), 어느 모드인지(theme)를 말합니다.

| prop | 값 | 출처 |
| --- | --- | --- |
| `fill` | canvas · raised · sunken (`SURFACE_FILLS`) | Color `bg.*` — 다크에서 sunken = canvas라, canvas 위에서는 border와 함께 |
| `border` | boolean | Color `border.base`, Shape `stroke.border` |
| `radius` | sm · md · lg · full (`SURFACE_RADII`) | Shape `radius.surface.*` · `radius.full` |
| `elevation` | lifted · sticky · overlay · modal · toast (`ELEVATIONS`) | Layout `elevation` class — position과 z와 그림자를 함께 |
| `theme` | light · dark · inverse (`SURFACE_THEMES`) | Color 모드 — 이 면과 안쪽만 그 모드. `inverse`는 주변 모드의 반대 |

[contract:primitives.surface.classes]: #
Surface의 `fill` · `border` · `radius` · `elevation`은 각자 지도 하나의 class가 되고, 주지 않은 축에는 class가 붙지 않습니다. `surfaceClass`는 같은 class를 theme만 빼고 돌려줍니다. `as`로 Stack · Inline · Grid 같은 primitive를 고르면 그 요소 하나가 면이 되어, `<Surface as={Stack} gap="md" fill="raised">`도 DOM 요소는 하나이고 Stack의 class와 prop이 그대로 남습니다. Box · Stack · Inline · Grid에 면 prop을 주면 타입이 막습니다.

[contract:primitives.surface.theme]: #
`theme`을 준 Surface는 자기 요소에 그 모드의 고유 역할을 걸고 안쪽을 그 모드로 읽게 합니다. `light` · `dark`는 주변과 무관하게 그 모드이고 `inverse`는 주변 모드의 반대라, 안쪽에 또 `inverse`를 두면 다시 뒤집힙니다. `fill`을 주지 않아도 그 모드의 `canvas`를 깔아 판이 늘 있고, 안쪽 글자 · Icon · Pressable과 Floating이 여는 층의 내용은 그 모드의 잉크를 받습니다. Surface 자신의 포커스 링과 그림자는 서 있는 바깥 지면의 모드로 그려집니다. `as={Stack}`처럼 Stack · Inline · Grid 위에서도 같고, 앱 전체의 테마는 [Theming](../get-started/theming.md)이 정합니다. 테마 속성을 `<html>` 아래에서 쓰는 길은 `theme/scope.ts`의 Surface와 [Portal](a11y.md#portal)뿐입니다.

여백과 곡률은 이름으로 짝을 맞추면 자연스럽습니다. 카드는 `padding="md" radius="md"`, 패널은 `padding="lg" radius="lg"`처럼 씁니다. `elevation`은 그림자만이 아니라 position과 쌓임 순서도 바꾸므로(`lifted`는 relative, `sticky`는 sticky), 실제로 겹쳐 떠 있는 면에만 줍니다. 그림자가 없는 `sticky`처럼 지면 위에 붙어 있어야 하는 면도 같은 prop으로 고르고, 지면에 붙은 면은 prop을 생략합니다.

```tsx
<Surface as="section" fill="raised" border radius="lg" padding="lg">…</Surface>
<Surface as={Stack} theme="inverse" radius="md" padding="lg" gap="md">…</Surface>
```

## Paint — accent × variant

Paint는 accent(의미)와 variant(시각 무게)를 고르면 그 조합의 색을 Box에 입힙니다. 조합은 지도 하나에서 오고, Button과 Badge가 같은 지도를 `paintClass`로 씁니다. 큰 면을 색으로 채우지 않는 것이 정체성이라, 의미가 있는 자리에만 씁니다.

[contract:primitives.paint.classes]: #
`accent`는 primary(중립)와 info · success · warning · error이고 `variant`는 solid · soft · hairline · ghost · muted입니다. variant를 생략하면 solid이고, accent를 주지 않으면 아무 것도 칠하지 않습니다. `paintClass`는 Atom이 accent class에 닿는 유일한 길이고, `hoverable`일 때만 hover gate를 함께 붙입니다.

[contract:primitives.paint.hover]: #
hover 색은 CSS가 그립니다. `hoverable` Paint는 `@media (hover: hover)` 안에서만, disabled · `aria-disabled` · `data-disabled`가 아닌 대상에만 tint를 입습니다. 터치는 hover가 없으므로 탭이 남기는 `:hover`로도 색이 뜨지 않고, 막힌 대상은 포인터가 올라와도 뜨지 않습니다. 어떤 컴포넌트도 hover 속성을 내보내지 않습니다. 표시용(Badge)은 `hoverable`을 주지 않아 색이 뜨지 않습니다.

```tsx
<Paint accent="info" variant="soft" hoverable padding="md">…</Paint>
```
