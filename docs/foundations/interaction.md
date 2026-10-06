# Interaction

paper-ui의 interaction은 **깊이를 새로 만드는 장식**이 아니라, 사용자의 현재 위치를
짧게 알려주는 상태 변화입니다. 기본 면과 구조선은 그대로 두고, 컴포넌트가 가진 의미에
맞는 한 가지 피드백만 올립니다.

## 우선순위

상태는 다음 순서로 읽습니다.

1. `disabled` — 모든 interaction을 끕니다.
2. `focus` — 키보드 탐색이면 파란 focus ring을 우선합니다.
3. `selected` / `active` — 현재 선택된 항목의 면을 유지합니다.
4. `hover` — 포인터가 올라온 동안만 일시적인 피드백을 보여줍니다.

포인터 클릭은 키보드 focus와 다릅니다. 클릭한 Field·Select·Textarea에는 caret/native
open state와 `ink.soft` edge만 남기고 focus ring을 그리지 않습니다. ring은
`:focus-visible`을 통과한 키보드 탐색에만 표시합니다.

## 표준 hover 규칙

| 대상 | resting | hover | focus | 비고 |
|---|---|---|---|---|
| `Button`·interactive `Badge` 등 shared accent 컴포넌트 | `accent × variant` | variant profile의 overlay 또는 hover color/background | keyboard ring | `.pui-interactive`가 있을 때만 적용 |
| primary `solid` | `primary.base` | `interaction.bgHover.onPrimarySolid`로 배경 교체 | keyboard ring | 검정 면은 어두워지지 않아 한 단계 밝힘 |
| neutral `Field`·`Select`·`Textarea` | `border.base` | `border.hover` | keyboard ring | 배경은 바꾸지 않음 |
| pointer-focused neutral Form | `border.hover` | — | `ink.soft` edge | 클릭에는 ring 없음 |
| semantic Form (`info`·`success`·`warning`·`error`) | 해당 accent `solid` edge | 같은 경계 유지 | keyboard ring | 상태색 경계로 의미를 계속 표시 |
| Sidebar·Menu·Tree·CommandMenu·Table row | base 면 | `interaction.bgHover.onSurface` overlay | keyboard ring 또는 selected state | selected 면이 hover보다 우선 |
| Link | 본문 잉크 | underline/색 변화 | keyboard ring | 면을 만들지 않음 |
| Badge·상태 점·정적 표시 | 그대로 | 없음 | 해당 없음 | 정보 표식에 hover를 추가하지 않음 |

neutral Form의 `border.hover`는 `border.base`와 `primary` 사이의 전용 경계 토큰입니다.
shared variant의 `hairline`과 같은 선을 쓰는 것이 아니라, 입력 중인 상자의 존재만 잠깐
강조합니다. semantic Form은 resting 상태부터 의미 색을 사용하므로 같은 선을 한 번 더
올리지 않고 hover에서도 같은 경계를 유지합니다.

## Overlay와 색 profile

중립 면(`soft`, `hairline`, `ghost`)의 hover는 배경을 직접 교체하지 않고
`tokens.color.interaction.bgHover`를 `backgroundImage` overlay로 합성합니다. 이 방식은
raised·canvas·sunken 중 어느 면 위에서도 같은 방향으로 읽힙니다. accent profile이
`hoverBackground`를 명시한 경우에는 그 색 family의 wash/hover 색으로 교체합니다.

이 규칙은 `styles/color-profile.ts`가 정의하고 `styles/color.css.ts`가
`COLORS × VARIANTS` 전체에 방출합니다. 표시 전용 컴포넌트는 `.pui-interactive`를
받지 않으므로 Badge처럼 hover가 의미 없는 컴포넌트에 상태색이 번지지 않습니다.

## Focus와 transition

focus ring은 전역 `:focus-visible`의 `interaction.focus` 하나로 통일하며, 기본 폭은 2px,
offset은 2px입니다. Form wrapper가 focus의 주인이므로 내부 native control은 자체
outline을 끕니다. 모든 상태 전이는 `tokens.motion.role.hover`의 짧은 duration을
따르고, `prefers-reduced-motion: reduce`에서는 전역으로 즉시 전환됩니다.

새 컴포넌트는 다음 질문에 답한 뒤 hover를 추가합니다.

- 이것은 사용자가 눌러 상태를 바꾸는 interactive control인가?
- 면을 바꾸는가, 선을 바꾸는가, 아니면 overlay만 얹는가?
- selected/semantic 상태가 hover보다 우선해야 하는가?
- 정적 표식에 hover를 넣어 정보 위계를 흐리게 만들고 있지는 않은가?

답이 없으면 hover를 추가하지 않습니다. 지속 그림자는 실제로 떠 있는 overlay surface에만
둡니다.
