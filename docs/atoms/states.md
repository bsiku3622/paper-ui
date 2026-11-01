# States

Atom이 hover·focus·active·selected·disabled·invalid에 어떻게 반응하는지 정합니다. 상태 변화는 **깊이를 새로 만드는 장식**이 아니라, 사용자의 현재 위치를 짧게 알려주는 신호입니다. 기본 면과 구조선은 그대로 두고, 컴포넌트가 가진 의미에 맞는 피드백 하나만 올립니다. 색은 [Color](../foundations/color.md)의 interaction 역할, 포커스 링의 두께는 [Shape](../foundations/shape.md), 전이 시간은 [Motion](../foundations/motion.md)에서 옵니다.

## 상태 어휘

[contract:atoms.states.vocabulary]: #
상태의 이름과 속성은 `tokens/state.ts` 한 곳이 적고, 컴포넌트가 다는 이름과 stylesheet가 읽는 이름이 어긋나지 않도록 패키지의 다른 어느 파일도 이 속성을 직접 쓰지 않습니다. 상태는 켜져 있는 동안만 속성이 있는 boolean이고, 접두어 없는 `data-*`입니다(`data-pui-*`는 테마 속성만 씁니다).

[contract:atoms.states.names]: #

| 상태 | 속성 | 뜻 |
| --- | --- | --- |
| `active` | `data-active` | 눌리는 동안의 순간 상태. `pressed`는 `aria-pressed`만 뜻하고 이 이름과 겹치지 않습니다 |
| `focused` · `focusVisible` | `data-focused` · `data-focus-visible` | 포커스가 있음 · 키보드가 포커스를 줬음(링이 그려지는 때) |
| `focusWithin` | `data-focus-within` | 포커스가 요소 안에 있음 |
| `selected` | `data-selected` | 선택됨. 현재 항목의 `aria-current`도 같은 선택으로 읽습니다 |
| `disabled` | `data-disabled` | 입력을 받지 않음. 막힌 대상은 늘 이 속성을 답니다 |
| `invalid` | `data-invalid` | 오류 상태 |
| `required` | `data-required` | 필수 |
| `dragging` · `dropTarget` | `data-dragging` · `data-drop-target` | 끌리는 중 · 떨어뜨릴 자리 |

[contract:atoms.states.value-attributes]: #
값을 가진 속성은 `data-status`(error 같은 틀의 상태 단어), `data-presence`(`entering` · `exiting`), `data-presentation`, `data-placement`, `data-part`, `data-orientation`이고, 코드가 DOM을 걷기 위한 표지는 `data-roving-item`과 `data-drag-ignore`입니다. hover는 CSS이고 속성이 없습니다 — `@media (hover: hover)` 안에서, 막히지 않은 대상에만 걸립니다.

## 우선순위

한 면 안에서 상태는 다음 순서로 읽습니다.

[contract:atoms.states.priority]: #
1. `disabled` — 모든 interaction을 끕니다.
2. `active` — 눌리는 동안의 면과 변위입니다.
3. `selected` — 현재 선택된 항목의 면을 유지합니다.
4. `hover` — 포인터가 올라온 동안만 일시적인 피드백을 보여줍니다.

[contract:atoms.states.ring-channel]: #
포커스 링은 이 사슬의 밖에 있는 별도 채널이라 면 상태와 무관하게 키보드가 닿으면 늘 그려집니다.

[contract:atoms.states.pointer-focus]: #
포인터 클릭은 키보드 focus와 다릅니다. 클릭한 Field·Select·Textarea에는 caret이나 native 열림 상태만 남고 focus ring을 그리지 않습니다. ring은 React Aria의 입력 modality가 키보드로 판정한 포커스에만 표시합니다 — Tab으로 들어오거나 Shift+Tab으로 돌아온 경우이고, 텍스트 입력은 글자를 치는 것만으로는 ring이 생기지 않습니다. 클릭한 뒤에 누른 키도 키보드로 판정합니다: 클릭한 Select에서 키를 누르면(Escape로 목록을 닫을 때도) ring이 뜨고, 클릭한 텍스트 입력에서는 Escape를 누르면 ring이 뜹니다.

## 상태가 그려지는 길

상태는 네 걸음을 지나 Atom에 닿습니다. [Color](../foundations/color.md)의 역할(`interaction.bgHover` · `selected` · `active` · `focus`, `control.track`, `ink.tertiary`)을 `tokens/color-recipes.ts`의 profile(`accentProfile` · `outlinedControlProfile` · `itemProfile` · `markProfile` · `markForcedProfile`)이 면 · 잉크 · 경계로 고르고, `tokens/state-recipes.ts`의 상태 조각(`stateStyle`)이 그 profile을 속성 selector에 묶으며, 색을 칠하는 조각은 paint 층(`primitives/paint/`)만 spread해 `paintClass` · `recipes.css.ts`의 class로 내놓고, Atom이 그 class를 합성합니다. 상태가 면을 바꾸는 방식은 하나입니다 — 면(`backgroundColor`) 위에 깔린 tint(`--pui-state-tint`)를 옮깁니다.

전이는 상태마다 Motion 역할이 정합니다. hover는 tint · hover 경계 · hover 잉크(`hover`, 100ms), state는 선택된 면과 켜진 표식(`state`, 130ms), press는 1px 변위(`press`, 100ms)입니다.

## 표준 hover 규칙

[contract:atoms.states.hover-table]: #

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

[contract:atoms.states.hover-border]: #
neutral Form의 `border.hover`는 `border.base`·`border.strong`보다 진하고 잉크보다 옅은 전용 경계 역할로, 입력 상자의 존재만 잠깐 강조합니다. semantic Form은 처음부터 의미 색을 쓰므로 같은 선을 한 번 더 올리지 않고 hover에서도 같은 경계를 유지합니다.

[contract:atoms.field.frame]: #
Field · Select의 wrapper와 Textarea 자신이 입력의 틀(`inputFrame`)입니다. 틀은 테두리 · 모서리 · 포커스 링 · 비활성을 지고, 색은 `fieldPaint`, 면은 Surface `fill`(기본 raised, 또는 sunken)이 입힙니다. 틀의 상태는 속성으로 말합니다 — `data-status`(`status`를 줬거나 오류 상태일 때의 error), `data-invalid`, `data-disabled`, `data-focus-visible`. 그래서 중립 틀의 경계는 포인터가 올라갈 수 있고 막히지 않은 틀에서만 `border.hover`로 오르고, status를 가진 틀은 같은 경계를 지키며, 비활성 틀은 `opacity.disabled`와 `not-allowed` 커서를 갖고 오르지 않습니다. 틀의 경계는 Button의 경계처럼 Motion `hover`(100ms)로, 배경은 `state`(130ms)로 전이합니다. Field의 지우기와 보기 버튼은 `ink.tertiary`로 서 있다가 포인터가 올라오면 `ink.primary`가 되고(`hover`, 100ms), 막힌 보기 버튼에는 `not-allowed` 커서만 남습니다. 틀의 stylesheet는 geometry만 갖고 `:hover` · `:focus-visible` · 포인터 포커스 표지를 스스로 쓰지 않습니다. 틀은 prop과 FormField의 disabled만 읽고, 조상 `<fieldset disabled>`의 비활성은 읽지 않습니다.

## Tint와 색 profile

[contract:atoms.button.tint]: #
눌리는 컨트롤(`hoverable`)의 `soft`·`ghost`·`muted`와 solid는 면(`backgroundColor`)을 직접 바꾸지 않습니다. 면 위에 `--pui-state-tint` 한 겹(`linear-gradient`)이 깔려 있고, hover가 그 변수를 `tokens.color.interaction.bgHover`로 옮깁니다. 그래서 raised·canvas·sunken 어느 면 위에서도 같은 방향으로 읽히고, 변수가 등록된 `<color>`라 면은 그대로 둔 채 tint만 전이합니다. `hairline`은 면 대신 경계를 `border.hover`로 올립니다. hover는 가장 약한 상태라 selector에 특정도를 더하지 않습니다.

선택될 수 있는 variant(`hairline` · `ghost` · `muted`)는 `data-selected`나 `aria-current`가 있으면 그 accent의 `soft` 면을 입고, 그 위의 hover는 경계를 올리지 않고 tint만 얹습니다. 면이 이미 있는 `solid`와 `soft`에는 selected가 없습니다. 고대비(`forced-colors`)에서는 선택된 면이 Highlight 면이 되고 hover는 Highlight 경계를 얻으며, `prefers-contrast: more`에서는 선택된 면에 잉크 머리카락 선이 더해집니다. 중립 항목(행 · 메뉴 항목 · 분절)은 같은 일을 `stateStyle.item`이 합니다 — 눌림 > 선택 > hover 순으로 `--pui-state-tint`를 바꾸고, 선택된 항목의 글자는 `ink.primary`입니다([상태 recipe](../foundations/README.md#상태-recipe)).

이 규칙은 `tokens/color-recipes.ts`가 정의하고 `styles/color.css.ts`가 `ACCENTS × VARIANTS` 전체에 방출합니다. 표시 전용 컴포넌트는 `hoverable`을 받지 않으므로 Badge처럼 hover가 의미 없는 곳에는 tint 층도 hover 색도 없습니다. hover 색은 `@media (hover: hover)` 안에서, disabled · `aria-disabled` · `data-disabled`가 아닌 대상에만 뜹니다 — 터치는 hover가 없고 막힌 대상은 포인터가 올라와도 반응하지 않습니다([Paint](../primitives/paint.md#paint--accent--variant)).

## 눌림, 비활성, 선택 표식

[contract:atoms.button.press]: #
Button · IconButton은 눌리는 동안 한 단계(`motion.press`의 변위, 1px) 내려앉습니다. 마우스는 `:active`로, 키보드(Enter · Space)는 Pressable이 다는 `data-active`로 같은 모습을 얻고, 이 모습은 [Pressable의 `motion="press"`](../primitives/press.md)가 입힙니다. Button은 눌림의 색을 따로 갖지 않으므로 hover tint가 눌리는 동안에도 그대로입니다.

[contract:atoms.button.disabled]: #
비활성(disabled)이거나 로딩 중인 Button은 모두 `data-disabled`를 달고 흐려지며(`opacity.disabled`) `not-allowed` 커서를 보이고, hover tint를 받지 않습니다. 링크 모양의 Button도 같습니다. 그 모습은 비활성 recipe(`stateStyle.disabled`) 하나가 입히고, `<a>`가 된 Button은 `aria-disabled`와 클릭 차단으로 이동하지 않습니다. 로딩의 접근성은 하나로 정합니다 — 혼자 서는 Spinner는 라벨이 있는 progressbar이고, 컨트롤 안의 Spinner는 장식이며 컨트롤이 `aria-busy`를 답니다.

[contract:atoms.mark.ring]: #
꺼진 Checkbox · Radio는 raised 면 안의 `ink.tertiary` 테로 서고, 포인터가 올라가도 테는 그대로입니다. 켜지거나 부분 선택이면 primary solid 면과 테, 오류면 꺼진 표식의 테만 error 잉크입니다. 꺼진 Switch는 `control.track` 트랙을 같은 잉크의 1px 안쪽 테(`strokeRing`)가 두르고, 이 테는 박스 안에 그려져 크기를 늘리지 않습니다. 켜진 Switch는 primary solid 트랙에 `bg.raised` 손잡이가 앉고, 테는 투명해져 트랙의 가장자리에 아무것도 덧칠하지 않으면서 전이는 이어집니다.

[contract:atoms.mark.disabled]: #
비활성 Checkbox · Radio · Switch는 켜져 있든 아니든 `data-disabled`를 달고 `opacity.disabled`로 흐려지며 `not-allowed` 커서를 보입니다. 그 모습은 비활성 recipe(`stateStyle.disabled`) 하나가 입히고, 표식 stylesheet에는 opacity 숫자가 없습니다. 비활성이 아닌 표식은 불투명하고 포인터 커서입니다.

## Atom별 상태 표

열 하나가 상태 하나이고, 아래 [검증](#검증)이 열마다 그 열을 지키는 테스트를 가리킵니다.

[contract:atoms.states.atom-table]: #

| Atom | 링 주인 | hover | active(눌림) | selected | disabled | invalid | forced colors | target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Button | 자신(자신의 곡률) | variant profile의 tint, hairline은 `border.hover` | 1px 변위 | `selected`(hairline · ghost · muted) · `aria-current` → soft 면 | `opacity.disabled` · `not-allowed`. 링크형은 `aria-disabled` · Tab 제외, 로딩은 포커스 유지 | — | hover는 Highlight 경계, selected는 Highlight 면, 비활성은 GrayText, 링은 Highlight | 높이 30 이상 |
| IconButton | Button과 같음 | Button과 같음 | Button과 같음 | Button과 같음 | Button과 같음 | — | Button과 같음 | 정사각형, 한 변이 컨트롤 높이 |
| Field | 틀(wrapper) | status가 없을 때만 `border.hover` | — | — | 틀이 `opacity.disabled` · `not-allowed`, 보기 버튼은 그려진 채 반응 없음 | `status` · `aria-invalid` → 상태 잉크 경계 | 경계 CanvasText, hover는 Highlight | 지우기 · 보기 버튼 24px |
| Textarea | 자신 | Field와 같음 | — | — | Field와 같음 | Field와 같음 | Field와 같음 | 컨트롤 전체 |
| Select | 틀(wrapper) | Field와 같음 | — | — | Field와 같음 | Field와 같음(`status` 있음) | Field와 같음 | 컨트롤 전체 |
| Checkbox | 자신(상자 곡률) | 없음 — 라벨과 행이 맡음 | — | checked · indeterminate → primary solid 면 | `opacity.disabled` · `not-allowed` | `status="error"`(`ChoiceStatus`) → 꺼진 상자의 테가 error 잉크 | Canvas 면 · ButtonText 테, 켜지면 Highlight 면 · HighlightText 표식, 비활성은 GrayText | 24px hit area |
| Switch | 자신(트랙) | 없음 | — | checked → primary solid 트랙 | Checkbox와 같음 | `status="error"` → 꺼진 트랙의 안쪽 테가 error 잉크 | ButtonFace 트랙 · ButtonText 테 · 손잡이, 켜지면 Highlight 트랙 · HighlightText 손잡이 | 트랙 위아래로 24px hit area |
| Radio | 자신(원) | 없음 | — | checked → primary solid 테와 점 | Checkbox와 같음 | Checkbox와 같음 | Canvas 면 · ButtonText 테, 켜지면 Highlight 테와 점 | 24px hit area |
| Label | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 글자는 OS가 정함 | 해당 없음 |
| Badge | 포커스 없음 | 없음 — `hoverable`을 주지 않아 hover 색이 없음 | 없음 | 없음 | 해당 없음 | 해당 없음 | 테두리로 남음, 점은 CanvasText | 해당 없음 |
| Spinner | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 링 GrayText, 호 CanvasText | 해당 없음 |
| Divider | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | border라 CanvasText로 남음 | 해당 없음 |
| Link | 자신(`radius.control`) | `underline="hover"`면 밑줄이 뜸 | — | — | 링크에는 disabled가 없음 | — | LinkText | inline 예외 |
| Marker | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | OS의 Mark · MarkText | 해당 없음 |

## Focus와 transition

focus ring은 패키지 전체가 하나의 스타일(`focusRing`)을 씁니다 — 색은 `interaction.focus`, 폭과 offset은 Shape의 `focus.width`·`focus.offset`(2px · 2px)입니다. Form wrapper가 focus의 주인이므로 안쪽 native control은 자기 outline을 끕니다. Pressable은 자기 판정에서 링을 그립니다([Press](../primitives/press.md#press)). 링 주인이 없는 요소는 전역 baseline `:where(:focus-visible)`이 링만 그리고 요소의 모양은 바꾸지 않으므로, 링은 요소 자신의 곡률을 따릅니다([Shape](../foundations/shape.md#stroke--focus)). 전이 시간은 Motion의 역할이 정합니다. Button · IconButton은 속성 묶음마다 역할을 고릅니다 — hover tint와 테두리는 `hover`(100ms), 면(`background-color`)과 글자색은 `state`(130ms), 눌림은 `press`(100ms)이고, 정본은 [Motion](../foundations/motion.md)입니다. `prefers-reduced-motion: reduce`에서는 전이가 즉시 끝납니다.

[contract:atoms.focus.ring]: #
Button · IconButton · Link는 키보드 포커스를 `useFocusRing`(Pressable 안에서도 같은 것)으로 판정해 자기 요소에 `data-focus-visible`을 달고, 링은 그 속성에서 자신의 곡률로 그립니다 — 알약 Button의 링은 알약이고 Link의 링은 `radius.control`입니다. 포인터로 포커스한 요소에는 링이 없습니다. 로딩 중인 Button도 포커스를 받으므로 키보드가 닿으면 링을 그립니다. Field · Select · Textarea도 같은 판정을 쓰며 링 주인이 입력의 틀입니다: 안쪽 native control이 `useFocusRing`(텍스트 입력은 `textInput`)을 받고 틀이 `data-focus-visible`을 답니다. Textarea는 틀이 자기 자신입니다. Field의 지우기나 보기 버튼에서 Shift+Tab으로 input에 돌아오면 wrapper가 링을 다시 그리고, 버튼의 링은 버튼 자신의 곡률(`radius.control`)을 따릅니다. Checkbox · Radio · Switch도 같은 판정을 쓰고 링 주인이 input 자신이라, 링이 상자 · 원 · 트랙의 곡률을 따릅니다.

## 대비 · forced colors · prefers-contrast · target

글자는 4.5:1, 컨트롤과 그 상태를 알리는 표식은 3:1을 지킵니다 — 선택 표식의 테, Switch 트랙의 테와 켜진 트랙, 켜진 면과 그 위의 표식, 포커스 링, 오류 테. 명시된 예외 셋(입력 경계, 옅은 selected 면, 꺼진 Switch의 손잡이)과 그 보완은 [대비 계약](../foundations/color.md#대비-계약)에 있고, 수치는 단위 테스트가 두 테마에서 지킵니다.

OS가 색을 정하는 모드(`forced-colors: active`)에서는 대부분의 요소를 OS에 맡깁니다. 상태가 배경에만 기대는 자리 — 선택 표식, Spinner, selected 면, Badge의 점 — 만 `forced-color-adjust: none`으로 빼고 시스템 색(`SYSTEM_COLORS`)으로 직접 그립니다. hover는 Highlight 경계, 비활성은 GrayText, 포커스 링은 Highlight이고, Divider는 border라 그대로 남습니다([Color](../foundations/color.md#forced-colors)). 오류는 이 모드에서 색을 고르지 못하므로 `aria-invalid`와 오류 문구가 알립니다.

[contract:atoms.mark.forced-colors]: #
forced colors에서 꺼진 Switch는 ButtonFace 트랙을 ButtonText 테와 손잡이가 두르고 켜진 Switch는 Highlight 트랙과 HighlightText 손잡이이며, Checkbox는 Canvas 면과 ButtonText 테에서 켜지거나 부분 선택이면 Highlight 면과 HighlightText 체크 · 대시, Radio는 켜지면 Highlight 테와 점입니다. 비활성 표식은 켜져 있든 아니든 GrayText이고, Spinner의 호와 링은 서로 다른 색(CanvasText · GrayText)이며 Divider는 1px 실선으로 남습니다.

[contract:atoms.button.forced-colors]: #
forced colors에서 선택된 Button은 Highlight 면과 HighlightText 글자, hover한 Button은 Highlight 경계, 비활성 Button은 GrayText 글자이고 키보드 링은 Highlight입니다.

[contract:atoms.field.forced-colors]: #
forced colors에서 입력 틀(Field · Textarea · Select)의 경계는 CanvasText이고, 포인터가 올라가면 Highlight입니다.

[contract:atoms.label.forced-colors]: #
forced colors에서 Label의 글자는 OS가 정한 CanvasText입니다.

[contract:atoms.link.forced-colors]: #
forced colors에서 Link는 OS가 정한 LinkText입니다.

[contract:atoms.marker.forced-colors]: #
forced colors에서 Marker는 OS가 정한 Mark 면과 MarkText 글자이고, 띠를 그리는 이미지는 없어집니다.

[contract:atoms.badge.forced-colors]: #
forced colors에서 Badge는 면이 사라져도 1px 실선 테두리로 남습니다. 평소에 테두리가 투명한 variant도 같습니다. 앞에 붙는 점은 면뿐이라 CanvasText로 직접 그려 남깁니다.

[contract:atoms.mark.contrast-more]: #
`prefers-contrast: more`에서는 경계 역할(`border.*`)과 `ink.tertiary`가 한 단계 짙은 팔레트 값으로 올라 `border.base`가 raised 면과 3:1이 되고, 옅은 selected 면은 `ink.primary` 1px 안쪽 테를 얻습니다.

표식과 Field 액션은 보이는 크기와 별도로 24px hit area를 가집니다([Shape](../foundations/shape.md#target)). 문장 안 Link는 inline 예외입니다.

## 새 컴포넌트

새 컴포넌트는 다음 질문에 답한 뒤 hover를 추가합니다.

- 이것은 사용자가 눌러 상태를 바꾸는 interactive control인가?
- 면을 바꾸는가, 선을 바꾸는가, 아니면 tint만 얹는가?
- selected/semantic 상태가 hover보다 우선해야 하는가?
- 정적 표식에 hover를 넣어 정보 위계를 흐리게 만들고 있지는 않은가?
- `data-*` 상태를 내는가? 그 이름은 `tokens/state.ts`에서 오는가?
- 링 주인은 누구인가? 키보드 판정은 `useFocusRing` 하나인가?

답이 없으면 hover를 추가하지 않습니다. 상태를 그림자로 표현하지도 않습니다 — 그림자는 실제로 떠 있는 tier만 갖고, 그 tier는 [Layout](../foundations/layout.md)의 elevation이 정합니다.

## 검증

표의 열마다 그 열을 지키는 테스트가 있고, 문서의 계약 문장은 같은 이름의 테스트와 1:1로 묶입니다(`pnpm test`의 `check-contracts`).

| 열 | 테스트 |
| --- | --- |
| 링 주인 | `tests/atoms/focus.spec.ts`의 `atoms.focus.ring` — Button 계열, 입력 틀, 선택 표식이 키보드로만 링을 그리는지 |
| hover | `tests/atoms/states.spec.ts`의 `atoms.button.tint` · `atoms.field.frame` · `atoms.mark.ring`(표식은 hover해도 테가 그대로), `atoms.link.underline` |
| active | `atoms.button.press` — 포인터와 Enter가 같은 1px 변위를 만듦 |
| selected | `atoms.button.selected` · `atoms.button.tint` · `atoms.mark.ring` |
| disabled | `atoms.button.disabled` · `atoms.field.frame` · `atoms.mark.disabled` |
| invalid | `atoms/contract.test.tsx`의 `atoms.field.invalid` · `atoms.mark.invalid`, 오류 테 색은 `atoms.mark.ring` |
| forced colors | `tests/atoms/forced-colors.spec.ts`의 `atoms.mark.forced-colors` · `atoms.button.forced-colors` · `atoms.field.forced-colors` · `atoms.label.forced-colors` · `atoms.link.forced-colors` · `atoms.badge.forced-colors` |
| target | `atoms.mark.target`(표식), `foundations.shape.target-reach`(Field 액션), `foundations.shape.control-geometry`(Button 높이와 정사각 IconButton) |
| 대비 | `tokens/color.test.ts`의 `foundations.color.non-text-contrast`, `prefers-contrast: more`는 `atoms.mark.contrast-more` |
| 상태 철자 | `styles/states.test.ts`의 `foundations.state.source-scan` — `:hover` · `:active` · `:focus-visible`은 상태 recipe와 paint 층에만, 상태 속성은 `tokens/state.ts`에만 있음 |
