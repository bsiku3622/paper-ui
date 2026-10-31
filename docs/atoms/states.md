# States

Atom이 hover·focus·selected·disabled에 어떻게 반응하는지 정합니다. 상태 변화는 **깊이를 새로 만드는 장식**이 아니라, 사용자의 현재 위치를 짧게 알려주는 신호입니다. 기본 면과 구조선은 그대로 두고, 컴포넌트가 가진 의미에 맞는 피드백 하나만 올립니다. 색은 [Color](../foundations/color.md)의 interaction 역할, 포커스 링의 두께는 [Shape](../foundations/shape.md), 전이 시간은 [Motion](../foundations/motion.md)에서 옵니다.

## 우선순위

상태는 다음 순서로 읽습니다.

1. `disabled` — 모든 interaction을 끕니다.
2. `focus` — 키보드 탐색이면 파란 focus ring을 우선합니다.
3. `selected` / `active` — 현재 선택된 항목의 면을 유지합니다.
4. `hover` — 포인터가 올라온 동안만 일시적인 피드백을 보여줍니다.

포인터 클릭은 키보드 focus와 다릅니다. 클릭한 Field·Select·Textarea에는 caret이나 native 열림 상태만 남고 focus ring을 그리지 않습니다. ring은 React Aria의 입력 modality가 키보드로 판정한 포커스에만 표시합니다 — Tab으로 들어오거나 Shift+Tab으로 돌아온 경우이고, 텍스트 입력은 글자를 치는 것만으로는 ring이 생기지 않습니다. 클릭한 뒤에 누른 키도 키보드로 판정합니다: 클릭한 Select에서 키를 누르면(Escape로 목록을 닫을 때도) ring이 뜨고, 클릭한 텍스트 입력에서는 Escape를 누르면 ring이 뜹니다.

## 표준 hover 규칙

| 대상 | resting | hover | focus | 비고 |
|---|---|---|---|---|
| `Button` 같은 눌리는 shared accent 컴포넌트 | `accent × variant` | variant profile의 tint 또는 경계 | keyboard ring | `hoverable`일 때만 적용(Button은 주고 Badge는 주지 않음) |
| primary `solid` | `accent.primary.solid` | `interaction.bgHover.onPrimarySolid` tint | keyboard ring | 검정 면은 더 어두워질 수 없어 한 단계 밝힘 |
| neutral `Field`·`Select`·`Textarea` | `border.base` | `border.hover` | keyboard ring | 배경은 바꾸지 않음 |
| pointer-focused neutral Form | `border.base` | `border.hover` | ring 없음 | 클릭한 입력은 경계를 바꾸지 않음 |
| 비활성 `Field`·`Select`·`Textarea` | `border.base`, `opacity.disabled` | 없음 | 해당 없음 | `not-allowed` 커서. Field의 보기 버튼도 그려진 채 반응하지 않음 |
| semantic Form (`info`·`success`·`warning`·`error`) | 해당 accent `ink` 경계 | 같은 경계 유지 | keyboard ring | 상태색 경계로 의미를 계속 표시 |
| 선택 가능한 행·항목 | base 면 | `interaction.bgHover.onSurface` tint | keyboard ring 또는 selected state | selected 면이 hover보다 우선 |
| Link | `interaction.link` 잉크, 밑줄(`underline="always"` 기본) | 밑줄 없이 시작한 Link(`underline="hover"`)만 가리킬 때 밑줄 | keyboard ring | 면을 만들지 않음 |
| Badge·상태 점·정적 표시 | 그대로 | 없음 | 해당 없음 | 정보 표식에 hover를 추가하지 않음 |

neutral Form의 `border.hover`는 `border.base`·`border.strong`보다 진하고 잉크보다 옅은 전용 경계 역할로, 입력 상자의 존재만 잠깐 강조합니다. semantic Form은 처음부터 의미 색을 쓰므로 같은 선을 한 번 더 올리지 않고 hover에서도 같은 경계를 유지합니다.

[contract:atoms.field.frame]: #
Field · Select의 wrapper와 Textarea 자신이 입력의 틀(`inputFrame`)입니다. 틀은 테두리 · 모서리 · 포커스 링 · 비활성을 지고, 색은 `fieldPaint`, 면은 Surface `fill`(기본 raised, 또는 sunken)이 입힙니다. 틀의 상태는 속성으로 말합니다 — `data-status`(`status`를 줬거나 오류 상태일 때의 error), `data-invalid`, `data-disabled`, `data-focus-visible`. 그래서 중립 틀의 경계는 포인터가 올라갈 수 있고 막히지 않은 틀에서만 `border.hover`로 오르고, status를 가진 틀은 같은 경계를 지키며, 비활성 틀은 `opacity.disabled`와 `not-allowed` 커서를 갖고 오르지 않습니다. 틀의 경계와 배경은 Motion `state`(130ms)로 전이합니다. Field의 지우기와 보기 버튼은 `ink.tertiary`로 서 있다가 포인터가 올라오면 `ink.primary`가 되고(`hover`, 100ms), 막힌 보기 버튼에는 `not-allowed` 커서만 남습니다. 틀의 stylesheet는 geometry만 갖고 `:hover` · `:focus-visible` · 포인터 포커스 표지를 스스로 쓰지 않습니다.

## Tint와 색 profile

[contract:atoms.button.tint]: #
눌리는 컨트롤(`hoverable`)의 `soft`·`ghost`·`muted`와 solid는 면(`backgroundColor`)을 직접 바꾸지 않습니다. 면 위에 `--pui-state-tint` 한 겹(`linear-gradient`)이 깔려 있고, hover가 그 변수를 `tokens.color.interaction.bgHover`로 옮깁니다. 그래서 raised·canvas·sunken 어느 면 위에서도 같은 방향으로 읽히고, 변수가 등록된 `<color>`라 면은 그대로 둔 채 tint만 전이합니다. `hairline`은 면 대신 경계를 `border.hover`로 올립니다. hover는 가장 약한 상태라 selector에 특정도를 더하지 않습니다.

선택될 수 있는 variant(`hairline` · `ghost` · `muted`)는 `data-selected`나 `aria-current`가 있으면 그 accent의 `soft` 면을 입고, 그 위의 hover는 경계를 올리지 않고 tint만 얹습니다. 면이 이미 있는 `solid`와 `soft`에는 selected가 없습니다. 고대비(`forced-colors`)에서는 선택된 면이 Highlight 면이 되고 hover는 Highlight 경계를 얻으며, `prefers-contrast: more`에서는 선택된 면에 잉크 머리카락 선이 더해집니다. 중립 항목(행 · 메뉴 항목 · 분절)은 같은 일을 `stateStyle.item`이 합니다 — 눌림 > 선택 > hover 순으로 `--pui-state-tint`를 바꾸고, 선택된 항목의 글자는 `ink.primary`입니다([상태 recipe](../foundations/README.md#상태-recipe)).

이 규칙은 `tokens/color-recipes.ts`가 정의하고 `styles/color.css.ts`가 `ACCENTS × VARIANTS` 전체에 방출합니다. 표시 전용 컴포넌트는 `hoverable`을 받지 않으므로 Badge처럼 hover가 의미 없는 곳에는 tint 층도 hover 색도 없습니다. hover 색은 `@media (hover: hover)` 안에서, disabled · `aria-disabled` · `data-disabled`가 아닌 대상에만 뜹니다 — 터치는 hover가 없고 막힌 대상은 포인터가 올라와도 반응하지 않습니다([Paint](../primitives/paint.md#paint--accent--variant)).

## 눌림과 비활성

[contract:atoms.button.press]: #
Button · IconButton은 눌리는 동안 한 단계(`motion.press`의 변위, 1px) 내려앉습니다. 마우스는 `:active`로, 키보드(Enter · Space)는 Pressable이 다는 `data-active`로 같은 모습을 얻고, 이 모습은 [Pressable의 `motion="press"`](../primitives/press.md)가 입힙니다. Button은 눌림의 색을 따로 갖지 않으므로 hover tint가 눌리는 동안에도 그대로입니다.

[contract:atoms.button.disabled]: #
비활성(disabled)이거나 로딩 중인 Button은 모두 `data-disabled`를 달고 흐려지며(`opacity.disabled`) `not-allowed` 커서를 보이고, hover tint를 받지 않습니다. 링크 모양의 Button도 같습니다. 그 모습은 비활성 recipe(`stateStyle.disabled`) 하나가 입히고, `<a>`가 된 Button은 `aria-disabled`와 클릭 차단으로 이동하지 않습니다. 로딩의 접근성은 하나로 정합니다 — 혼자 서는 Spinner는 라벨이 있는 progressbar이고, 컨트롤 안의 Spinner는 장식이며 컨트롤이 `aria-busy`를 답니다.

## Focus와 transition

focus ring은 패키지 전체가 하나의 스타일(`focusRing`)을 씁니다 — 색은 `interaction.focus`, 폭과 offset은 Shape의 `focus.width`·`focus.offset`(2px · 2px)입니다. Form wrapper가 focus의 주인이므로 안쪽 native control은 자기 outline을 끕니다. 링 주인이 없는 요소는 전역 baseline `:where(:focus-visible)`이 링만 그리고 요소의 모양은 바꾸지 않으므로, 링은 요소 자신의 곡률을 따릅니다([Shape](../foundations/shape.md#stroke--focus)). 전이 시간은 Motion의 역할이 정합니다. Button · IconButton은 속성 묶음마다 역할을 고릅니다 — hover tint와 테두리는 `hover`(100ms), 면(`background-color`)과 글자색은 `state`(130ms), 눌림은 `press`(100ms)이고, 정본은 [Motion](../foundations/motion.md)입니다. `prefers-reduced-motion: reduce`에서는 전이가 즉시 끝납니다.

[contract:atoms.focus.ring]: #
Button · IconButton · Link는 키보드 포커스를 `useFocusRing`(Pressable 안에서도 같은 것)으로 판정해 자기 요소에 `data-focus-visible`을 달고, 링은 그 속성에서 자신의 곡률로 그립니다 — 알약 Button의 링은 알약이고 Link의 링은 `radius.control`입니다. 포인터로 포커스한 요소에는 링이 없습니다. 로딩 중인 Button도 포커스를 받으므로 키보드가 닿으면 링을 그립니다. Field · Select · Textarea도 같은 판정을 쓰며 링 주인이 입력의 틀입니다: 안쪽 native control이 `useFocusRing`(텍스트 입력은 `textInput`)을 받고 틀이 `data-focus-visible`을 답니다. Textarea는 틀이 자기 자신입니다. Field의 지우기나 보기 버튼에서 Shift+Tab으로 input에 돌아오면 wrapper가 링을 다시 그리고, 버튼의 링은 버튼 자신의 곡률(`radius.control`)을 따릅니다.

새 컴포넌트는 다음 질문에 답한 뒤 hover를 추가합니다.

- 이것은 사용자가 눌러 상태를 바꾸는 interactive control인가?
- 면을 바꾸는가, 선을 바꾸는가, 아니면 tint만 얹는가?
- selected/semantic 상태가 hover보다 우선해야 하는가?
- 정적 표식에 hover를 넣어 정보 위계를 흐리게 만들고 있지는 않은가?

답이 없으면 hover를 추가하지 않습니다. 상태를 그림자로 표현하지도 않습니다 — 그림자는 실제로 떠 있는 tier만 갖고, 그 tier는 [Layout](../foundations/layout.md)의 elevation이 정합니다.
