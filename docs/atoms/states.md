# States

Atom이 hover·focus·selected·disabled에 어떻게 반응하는지 정합니다. 상태 변화는 **깊이를 새로 만드는 장식**이 아니라, 사용자의 현재 위치를 짧게 알려주는 신호입니다. 기본 면과 구조선은 그대로 두고, 컴포넌트가 가진 의미에 맞는 피드백 하나만 올립니다. 색은 [Color](../foundations/color.md)의 interaction 역할, 포커스 링의 두께는 [Shape](../foundations/shape.md), 전이 시간은 [Motion](../foundations/motion.md)에서 옵니다.

## 우선순위

상태는 다음 순서로 읽습니다.

1. `disabled` — 모든 interaction을 끕니다.
2. `focus` — 키보드 탐색이면 파란 focus ring을 우선합니다.
3. `selected` / `active` — 현재 선택된 항목의 면을 유지합니다.
4. `hover` — 포인터가 올라온 동안만 일시적인 피드백을 보여줍니다.

포인터 클릭은 키보드 focus와 다릅니다. 클릭한 Field·Select·Textarea에는 caret이나 native 열림 상태만 남고 focus ring을 그리지 않습니다. ring은 `:focus-visible`을 통과한 키보드 탐색에만 표시합니다.

## 표준 hover 규칙

| 대상 | resting | hover | focus | 비고 |
|---|---|---|---|---|
| `Button`·interactive `Badge` 등 shared accent 컴포넌트 | `accent × variant` | variant profile의 tint 또는 경계 | keyboard ring | `hoverable`일 때만 적용(Button은 주고 Badge는 주지 않음) |
| primary `solid` | `accent.primary.solid` | `interaction.bgHover.onPrimarySolid` tint | keyboard ring | 검정 면은 더 어두워질 수 없어 한 단계 밝힘 |
| neutral `Field`·`Select`·`Textarea` | `border.base` | `border.hover` | keyboard ring | 배경은 바꾸지 않음 |
| pointer-focused neutral Form | `border.base` | `border.hover` | ring 없음 | 클릭한 입력은 경계를 바꾸지 않음 |
| semantic Form (`info`·`success`·`warning`·`error`) | 해당 accent `ink` 경계 | 같은 경계 유지 | keyboard ring | 상태색 경계로 의미를 계속 표시 |
| 선택 가능한 행·항목 | base 면 | `interaction.bgHover.onSurface` tint | keyboard ring 또는 selected state | selected 면이 hover보다 우선 |
| Link | `interaction.link` 잉크 | underline | keyboard ring | 면을 만들지 않음 |
| Badge·상태 점·정적 표시 | 그대로 | 없음 | 해당 없음 | 정보 표식에 hover를 추가하지 않음 |

neutral Form의 `border.hover`는 `border.base`·`border.strong`보다 진하고 잉크보다 옅은 전용 경계 역할로, 입력 상자의 존재만 잠깐 강조합니다. semantic Form은 처음부터 의미 색을 쓰므로 같은 선을 한 번 더 올리지 않고 hover에서도 같은 경계를 유지합니다.

## Tint와 색 profile

`soft`·`ghost`·`muted`와 solid의 hover는 배경을 직접 바꾸지 않고 `tokens.color.interaction.bgHover`를 `backgroundImage` tint로 겹칩니다. 그래서 raised·canvas·sunken 어느 면 위에서도 같은 방향으로 읽힙니다. `hairline`은 면 대신 경계를 `border.hover`로 올립니다.

선택될 수 있는 variant(`hairline` · `ghost` · `muted`)는 `data-selected`나 `aria-current`가 있으면 그 accent의 `soft` 면을 입고, 그 위의 hover는 경계를 올리지 않고 tint만 얹습니다. 면이 이미 있는 `solid`와 `soft`에는 selected가 없습니다. 중립 항목(행 · 메뉴 항목 · 분절)은 같은 일을 `stateStyle.item`이 합니다 — 눌림 > 선택 > hover 순으로 `--pui-state-tint`를 바꾸고, 선택된 항목의 글자는 `ink.primary`입니다([상태 recipe](../foundations/README.md#상태-recipe)).

이 규칙은 `tokens/color-recipes.ts`가 정의하고 `styles/color.css.ts`가 `ACCENTS × VARIANTS` 전체에 방출합니다. 표시 전용 컴포넌트는 `hoverable`을 받지 않으므로 Badge처럼 hover가 의미 없는 곳에 상태색이 번지지 않습니다. hover 색은 `@media (hover: hover)` 안에서, disabled · `aria-disabled` · `data-disabled`가 아닌 대상에만 뜹니다 — 터치는 hover가 없고 막힌 대상은 포인터가 올라와도 반응하지 않습니다([Paint](../primitives/paint.md#paint--accent--variant)).

## Focus와 transition

focus ring은 패키지 전체가 하나의 스타일(`focusRing`)을 씁니다 — 색은 `interaction.focus`, 폭과 offset은 Shape의 `focus.width`·`focus.offset`(2px · 2px)입니다. Form wrapper가 focus의 주인이므로 안쪽 native control은 자기 outline을 끕니다. 링 주인이 없는 요소는 전역 baseline `:where(:focus-visible)`이 링만 그리고 요소의 모양은 바꾸지 않으므로, 링은 요소 자신의 곡률을 따릅니다([Shape](../foundations/shape.md#stroke--focus)). 전이 시간은 Motion의 역할이 정합니다. hover 반응(테두리·글자색)은 `hover`(100ms), 켜진 채 머무는 상태와 면의 전이는 `state`(130ms)이고, 정본은 [Motion](../foundations/motion.md)입니다. `prefers-reduced-motion: reduce`에서는 전이가 즉시 끝납니다.

새 컴포넌트는 다음 질문에 답한 뒤 hover를 추가합니다.

- 이것은 사용자가 눌러 상태를 바꾸는 interactive control인가?
- 면을 바꾸는가, 선을 바꾸는가, 아니면 tint만 얹는가?
- selected/semantic 상태가 hover보다 우선해야 하는가?
- 정적 표식에 hover를 넣어 정보 위계를 흐리게 만들고 있지는 않은가?

답이 없으면 hover를 추가하지 않습니다. 상태를 그림자로 표현하지도 않습니다 — 그림자는 실제로 떠 있는 tier만 갖고, 그 tier는 [Layout](../foundations/layout.md)의 elevation이 정합니다.
