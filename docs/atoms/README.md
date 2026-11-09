# Overview

Atom은 한 가지 역할을 하는 완성 컨트롤입니다. Primitive 위에서 Foundations의 역할을 골라 그리고, 앱은 Atom을 조합해 화면을 만듭니다. 패키지는 16개를 공개합니다.

## 공통 축

Atom은 같은 축 몇 개로 말합니다. 축의 값은 모두 Foundations에서 옵니다.

[contract:atoms.contract.common-axes]: #

| 축 | 값 | 출처 |
| --- | --- | --- |
| `size` | xs · sm · md · lg · xl, 기본 md | Shape control 사다리(높이 32 · 36 · 40 · 44 · 48). xs는 아이콘이 줄지어 서는 도구막대의 자리 |
| `accent` | primary · info · success · warning · error | Color accent |
| `variant` | solid · soft · hairline · dashed · ghost · muted | Color [accent × variant](../foundations/color.md#accent--variant) |
| `variant` (입력) | hairline · ghost, 기본 hairline. Field · Textarea · Select가 같은 축을 씀 | ghost는 선 없음, hairline은 Color `border.base` 경계. 상태의 선은 ghost에서도 남음 |
| `variant` (고르는 줄) | track · outline, 기본 track. SegmentControl만 받음 | track은 Color `control.track` 홈 위의 `control.thumb` 칸, outline은 입력 틀과 같은 `control.field` 면 · `border.base` 선에 고른 칸의 `control.chosen` 면 |
| `status` (입력) | info · success · warning · error, 생략하면 중립. Field · Textarea · Select가 같은 축을 씀 | Color accent `ink` 경계 |
| `status` (선택 표식) | error만(`ChoiceStatus`), 생략하면 중립. Checkbox · Radio · Switch · Slider가 같은 축을 씀 | Color accent `error.ink` 테 |
| `fill` | raised · canvas · sunken. Button · IconButton · Badge는 hairline · dashed · ghost · muted에서만 받고 안 주면 투명, Field · Textarea · Select는 안 주면 `control.field` 흰 면 | Color [Surface](../foundations/color.md) 면 — 다크에서 sunken은 canvas와 같은 단계 |
| `shadow` | boolean. 면이 있을 때만 받음. Field · Textarea · Select는 생략하면 그림자가 없고 `true`면 제자리 그림자를 얹음 | Layout [resting 깊이](../foundations/layout.md#elevation--위치와-쌓임과-그림자는-한-단위다) |
| `shape` | rounded · pill. 누르는 것(Button · IconButton)과 고르는 줄(SegmentControl), Badge는 기본 pill이고, 값을 받는 틀(Field · Select)은 기본 rounded. pill 틀은 값과 화살표를 Button과 같은 넓은 inset에 둠 | Shape `radius.control` · `radius.pill`, [pill inset](../foundations/shape.md#radius) |
| `fontSize` | `label` · `caption` · `body` (`CONTROL_FONT_SIZES`) | Typography — 글자 크기만 바꾸는 탈출구. 컨트롤 상자가 담을 수 있는 역할만 받음 |

[contract:atoms.field.neutral-status]: #
축마다 중립값은 이름이 아니라 기본값이나 생략입니다. `accent`의 중립은 `primary`, Divider `level`의 중립은 `base`이고, 입력과 선택 표식의 `status`는 생략하면 중립이라 `default`라는 값이 없습니다. Field · Textarea · Select는 `status`를 줬을 때(또는 오류 상태가 됐을 때의 error)만 입력의 틀에 `data-status`를 그리고, `status="error"`는 `aria-invalid`도 설정합니다.

[contract:atoms.contract.font-size]: #
`size`는 geometry를 고르고, 글자는 Typography의 [Control preset](../foundations/typography.md#control-preset)에서 따로 고릅니다. 같은 size의 Button · Field · Select는 같은 높이에 서고 글자 높이도 맞습니다. `fontSize`로 글자를 바꿔도 geometry는 고른 size를 따릅니다.

## 목록

[contract:atoms.contract.axes]: #

| Atom | 고유 축 | 기본값·동작 |
| --- | --- | --- |
| Button | as · accent · variant · fill · shadow · size · fontSize · strong · shape · selected · loading · loadingLabel · fullWidth · gap · align · justify · badge | button / primary / solid / md / rounded, type=button. 글자는 variant와 무관하게 `button` preset. selected는 hairline · ghost · muted에서 aria-pressed와 선택된 면. loading은 spinner·aria-busy, 포커스는 유지하고 누름과 제출만 막음 |
| IconButton | as · accent · variant · fill · shadow · size · shape · disabled · iconSize · badge · 필수 aria-label · 단일 children | 정사각형, 높이가 변. 안의 Icon은 iconSize를 주지 않으면 컨트롤 높이를 따름. loading · fullWidth · fontSize는 없음 |
| Field | status · size · variant · fill · shadow · fontSize · shape · numeric · textAlign · gap · leading / trailing · clearable · clearLabel · showPasswordToggle · showPasswordLabel · onClear | 중립 / md / hairline / 흰 면(`control.field`) / rounded, type=text. wrapper가 면·높이·상태·포커스를 소유. 지우기와 보기 버튼의 이름은 locale 문구이고 label prop으로 바꿈. 브라우저의 search 취소 ×와 Edge 비밀번호 보기 장치는 Field가 소유해 숨기고, number 증감·date 선택 장치는 브라우저에 남음 |
| Textarea | status · size · variant · fill · shadow · fontSize · rows · native textarea props | 중립 / md / hairline / 흰 면(`control.field`), 기본 4줄. rows가 높이를 정하고(최소 높이 없음) 한 줄 = 같은 size Field, 세로 resize. pill 없음 |
| Select | status · size · variant · fill · shadow · fontSize · shape · children · native select props | 중립 / md / hairline / 흰 면(`control.field`) / rounded. 버튼(combobox)이 값을 보이고 Paper가 그린 목록(listbox)이 열림. Option·Group, multiple 없음. 폼과 ref는 보이지 않는 native select. 화살표는 trailing Icon. className · style · data-testid는 wrapper |
| Checkbox | status · size · indeterminate · native input props | md. 상자는 `selection.size`, 체크는 그 절반. 꺼진 면은 `control.mark` 흰 면에 `border.base` 선이고 `status="error"`면 error 잉크 테. 켜지면 primary solid 면. 누르는 동안 바깥에 눌림 고리. 24px hit area |
| Switch | status · size · native input props | md. input type=checkbox + role=switch. 트랙 폭 = 높이의 1.5배(`anatomy.switch.length`). 꺼진 트랙은 `control.track` 면이고 선이 없음. 손잡이는 사방 테만큼 안쪽에 앉는 원이고, `inset-inline-start`로 움직여 RTL에서 저절로 뒤집힘. 누르는 동안 바깥에 눌림 고리 |
| Radio | status · size · native input props | md. Checkbox와 같은 상자. 켜지면 primary solid 면에 wash 점이 앉고 점은 상자의 0.4. name·선택은 호출자가 조립. 한 묶음의 Radio는 모두 같은 `status`를 줌 |
| Label | children · ref · native label props | Text의 label 역할 그대로. htmlFor 또는 내부 control로 연결 |
| Badge | accent · variant · size · fontSize · dot · shape · gap · align · justify · ref | primary / soft / md / pill. `Paint as="span"`이고 표시용이라 hover 없음. 높이는 Shape의 배지 사다리, 글자는 크기와 무관하게 고정 |
| Spinner | size(xs · sm · md · lg · xl · inline) · ink(inherit) · label · decorative | md, label은 locale 문구('불러오는 중' · 'Loading'), role=progressbar. 지름은 컨트롤 아이콘 사다리, inline은 글자만큼. decorative는 aria-hidden |
| Divider | orientation=horizontal/vertical · level=base/strong · ref · native hr props | horizontal / base. `Box as="hr"` + aria-orientation. 선은 border로 긋고 level은 선의 색(`border.base` · `border.strong`), 두께는 border stroke |
| Link | as · underline(always · hover) · native anchor props | a, `interaction.link` 잉크, 늘 밑줄(`always`), 단독 링크는 hover 때만(`hover`). 라우터의 Link는 `as`로 받음 |
| Marker | native 속성 · ref | mark. 칠은 `marker.fill`, 글자는 `marker.ink`이고 글자의 크기와 굵기는 둘러싼 글자를 따름 |
| SegmentControl | value · defaultValue · onValueChange · variant · size · shape · fullWidth · disabled · native div props, SegmentControl.Item은 value · disabled | track / md / pill. `role=radiogroup`이고 높이는 컨트롤 높이. track은 칸이 트랙 안쪽으로 inset xs에 앉고, outline은 칸이 틀 안을 채우며 칸 사이에 같은 선을 그음. 고르지 않은 칸의 글자는 읽어야 할 선택지라 `ink.secondary`, 고른 칸은 `ink.primary`. 글자가 폭을 정하고, fullWidth면 칸이 폭을 같게 나눔 |
| Slider | status · size · value · defaultValue · min · max · origin · native input props | md, 0 ~ 100. input type=range. 막대는 Switch 트랙과 같은 높이, 손잡이는 지름이 막대 높이인 원(흰 면에 emphasis 테). 끌기와 키보드는 native |

[contract:atoms.select.anatomy]: #
Select.Option과 Select.Group은 Select의 anatomy라 따로 세지 않습니다. 이 둘은 `Select.Option` · `Select.Group` 하나의 경로로만 쓰고, 따로 export하지 않습니다. SegmentControl.Item도 같습니다. 각 Atom의 치수가 어디서 나오는지는 [Shape](../foundations/shape.md#recipe--컴포넌트-anatomy)의 recipe 표에 있습니다.

[contract:atoms.divider.orientation-level]: #
Divider의 `orientation`은 선의 방향을 고르고 `aria-orientation`으로 그대로 전달됩니다. `level`은 선의 색을 고릅니다.

## Primitive 위의 Atom

Atom은 Primitive와 hook, 공용 recipe 위에 서고, native control이 있는 자리에서는 그 control이 의미를 가진 요소로 남습니다. Primitive는 두 차수입니다 — 1차(Element · Content · A11y)는 바탕이라 서로 기대지 않고, 2차는 Box에 능력 하나를 더한 것이며 Atom이 hook과 class 함수로 묶습니다([Primitives](../primitives/README.md)). 색은 모두 `primitives/paint/`에서 오므로 Atom의 stylesheet는 geometry만 갖고 `tokens.color`를 읽지 않습니다.

[contract:atoms.contract.stands-on]: #

| Atom | 서 있는 곳 (stands on) | 색 |
| --- | --- | --- |
| Button · IconButton | `Pressable as={대상}`(부품도 대상일 뿐입니다) · `motion="press"` · `useSelectable` · `controlClass` | `paintClass` |
| Link | 자기 대상 태그 · `useFocusRing` | `linkPaint` |
| Marker | native `mark` | `markerPaint` |
| Field · Textarea · Select | `useFormFieldControl` · `useFocusRing`(`atoms/input-control.ts`) · 입력 틀 `inputFrame` · `controlClass` · Icon · 액션은 Pressable, 비밀번호 토글은 `Pressable as={Selectable}` · Select의 목록은 `Floating`(listbox) | `fieldPaint`, Select의 목록은 `selectOptionPaint` · `selectCheckPaint` |
| Checkbox · Radio · Switch | native input · `useFocusRing` · `useFormFieldControl`(`atoms/input-control.ts`) · `controlClass` | `markPaint` |
| Label | Text | Text label 역할의 잉크 |
| Badge | `Paint as="span"` · `controlClass` | `paintClass`(Paint가 입힘) |
| Divider | `Box as="hr"` | `linePaint` |
| Spinner | `Box as="span"` · `loop.spin` · `controlClass` | `spinnerPaint` |

Spinner는 숨은 라벨 요소를 두지 않고 `aria-label`로 스스로 이름을 붙입니다. progressbar의 이름은 만든 사람의 글에서 받고, 값이 없는 진행이라 따로 가리킬 본문이 없기 때문입니다.

## `as` — 같은 자리의 역할을 바꾸는 축

[contract:atoms.button.as-link]: #
Button · IconButton · Link에는 `as`가 있습니다(`<Button as={RouterLink} to="/docs">`, `<Link as={RouterLink} to="/demo">`). raw 태그를 뚫는 구멍이 아니라 같은 자리의 역할을 바꾸는 축입니다. 버튼처럼 생겼지만 하는 일이 이동이라면 그것은 링크여야 하고, 그렇다고 `<Link>`로 `<Button>`을 감싸면 `<a>` 안에 `<button>`이 들어가 Tab 정지가 둘이 됩니다. 태그 하나만 그리게 하는 것이 `as`의 몫입니다. 태그가 갈리면 `type`과 `disabled`도 갈리므로, `<a>`가 된 버튼은 `aria-disabled`와 `tabIndex=-1`, 클릭 차단으로 비활성을 표현합니다. 링크 모양에 필요한 리셋(밑줄 없음)은 Button의 stylesheet가 소유합니다.

[contract:atoms.button.target]: #
Button과 IconButton은 늘 [Pressable](../primitives/press.md) 하나로 그려지고, `as`는 그 Pressable의 대상입니다. 태그든 라우터 Link든 행동 부품이든 눌림 장치는 그 요소에 한 벌만 얹힙니다. Atom의 모습을 행동에 입히는 길은 `<Button as={부품}>`이 하나뿐이고 — `<Button as={Floating.Trigger}>` · `<Button as={Floating.Close}>` · `<Button as={Selectable}>` · `<Button as={SelectableGroup.Item}>` — 부품의 동작(열기, 선택)은 그대로 한 번만 일어납니다. 이 길에서는 부품의 prop을 그대로 씁니다. `<Button as={Pressable}>`은 Pressable 하나를 그립니다. 반대 방향인 `<Floating.Trigger as={Button}>`은 한 요소에 press 장치가 둘이 되므로 개발 모드 오류이고, `<Button as={Draggable.Handle}>`도 오류입니다(손잡이의 키보드 끌기는 손잡이에 닿는 click을 취소로 읽습니다). 비활성 링크 대상은 이동하지 않습니다.

## Marker

[contract:atoms.marker.element]: #
Marker는 형광펜입니다. 문장 안의 `mark` 요소 하나를 그리고, ref와 className과 native 속성을 그 요소가 받습니다. 글자의 크기와 굵기는 둘러싼 글자를 따르므로 `Text` 안에 그대로 놓습니다.

[contract:atoms.marker.band]: #
칠은 글자 상자 전체가 아니라 줄 상자를 지나는 띠입니다. 높이와 자리는 원본 `anatomy.marker`에 있습니다. 줄이 넘어가면 줄마다 띠가 이어지고, 띠가 글자 밖으로 조금 나간 만큼 margin이 되돌려 낱말의 자리는 문장 그대로입니다.

[contract:atoms.marker.decoration]: #
Marker는 장식입니다. 포커스를 받지 않고 상태를 말하지 않습니다. 선택 · 오류 같은 신호에는 쓰지 않습니다. 라임과 흰 면의 대비가 1.09:1이라 칠만으로는 경계가 보이지 않기 때문입니다.

## Button · IconButton · Spinner · Link

[contract:atoms.button.selected]: #
Button의 `selected`는 hairline · ghost · muted에서만 줄 수 있고(타입이 막습니다), role이 정하는 aria 속성 하나(기본 aria-pressed, `tab`은 aria-selected, `switch`는 aria-checked)와 `data-selected`로 선택을 알립니다. 선택된 면은 prop이 아니라 그 속성을 읽는 CSS가 입히며 그 accent의 `soft` 면입니다. `selected`를 주지 않은 Button은 aria-pressed를 달지 않고, 현재 항목은 `aria-current`가 같은 선택된 면을 입힙니다. 토글은 `<Button as={Selectable}>`이, 여럿 중 하나는 `<Button as={SelectableGroup.Item}>`이 맡습니다. Selectable에는 `selected`와 `onSelectedChange`가 그대로 건너가 제어되고, SelectableGroup.Item의 선택은 그룹이 정합니다.

[contract:atoms.button.loading]: #
Button의 loading은 포커스를 잃지 않습니다. native `disabled`를 달지 않고 `aria-busy` · `aria-disabled` · `data-disabled`를 달며, 누름과 암묵적 제출(Enter)은 막힙니다. 스피너는 장식(`<Spinner size="inline" ink="inherit" decorative />`)이고 알림은 컨트롤이 aria-busy로 맡습니다. loading이 시작될 때 포커스가 그 Button에 있으면 `loadingLabel`(기본은 locale의 '불러오는 중' · 'Loading')을 한 번 알립니다. disabled는 native button을 비활성화합니다. 둘이 겹치면 disabled가 이깁니다.

[contract:atoms.button.strong]: #
`strong`은 라벨의 강조 한 비트입니다. preset이 이미 강조된 굵기라 `false`만 뜻이 있고 라벨이 regular가 됩니다. 상자의 높이와 여백은 그대로입니다. 사이드바처럼 버튼이 여럿 나란히 서는 자리에서 `strong={here}`로 씁니다.

[contract:atoms.button.justify]: #
`justify`는 내용의 가로 배치입니다(`JUSTIFIES`, 기본은 가운데). 버튼이 내용보다 넓을 때 뜻이 생깁니다 — 사이드바의 항목은 `fullWidth justify="start"`, 끝에 숫자가 붙는 항목은 `justify="between"`입니다. `gap`과 `align`도 크기와 따로 고르는 [내용 배치](../primitives/control.md#내용-배치)입니다. 아이콘 전용 IconButton에는 없습니다.

[contract:atoms.button.badge]: #
`badge`는 버튼의 바깥 모서리에 걸치는 표식입니다. 알림 숫자처럼 버튼에 딸린 작은 표시를 버튼의 크기를 바꾸지 않고 얹고, 표식 위를 눌러도 버튼이 눌립니다. 값은 보통 `Badge` 하나이고 색과 크기는 그 Badge가 정합니다. RTL에서는 왼쪽 모서리로 갑니다. IconButton의 이름은 `aria-label`이 말하므로 숫자도 거기에 적습니다.

[contract:atoms.icon-button.axes]: #
IconButton은 정사각 anatomy와 부딪히지 않는 축만 엽니다 — `as` · accent · variant · size · shape · disabled · iconSize · badge와 필수 `aria-label`. loading · fullWidth · fontSize는 타입에서 막힙니다. 안의 Icon은 `size`를 주지 않으면 컨트롤 높이를 따릅니다(`control.icon`).

[contract:atoms.icon-button.keeps-square]: #
IconButton은 줄이 꽉 차도 정사각형을 지킵니다. 폭이 모자라면 옆의 글자가 먼저 줄어듭니다.

[contract:atoms.spinner.roles]: #
Spinner는 혼자 서면 `role="progressbar"`와 `aria-label`을 갖습니다. 값(`aria-valuenow`)이 없어 얼마나 걸릴지 모르는 진행이고, progressbar는 이름을 만든 사람의 글에서 받으므로 숨은 라벨 요소를 두지 않습니다. `decorative`면 `aria-hidden`이고 role도 이름도 없습니다. 컨트롤 안의 Spinner가 그렇습니다. 회전은 Motion의 `loop.spin` 하나(패키지에 `@keyframes spin`은 하나)이고, 크기는 control icon 사다리(`inline`은 글자만큼)가, 색은 `ink`가 정합니다 — 기본은 primary 잉크의 호, `inherit`는 둘러싼 글자색의 호이고, 어느 쪽이든 꼬리가 옅어집니다.

[contract:atoms.link.underline]: #
Link는 늘 밑줄을 긋습니다(`underline="always"`). 문장 안 링크는 색만으로 본문과 3:1이 되지 않아 밑줄이 링크임을 알리는 단서입니다. 메뉴처럼 위치가 링크임을 말해 주는 단독 링크만 `underline="hover"`로 가리킬 때 긋습니다. 터치에는 hover가 없습니다. 문서 페이지의 본문 링크도 Link Atom으로 그려져 같은 규칙을 따릅니다.

[contract:atoms.link.target]: #
Link는 `as`로 라우터의 Link 같은 컴포넌트를 받아 태그 하나만 그립니다. `as="button"`이면 `type="button"`과 Pressable이 쓰는 button reset을 받아, 브라우저의 버튼 모습 없이 링크와 같은 글자 · 잉크 · 밑줄로 그려집니다. 키보드 포커스는 `useFocusRing`이 판정해 링크 자신에 `data-focus-visible`을 달고, 링은 링크 자신의 곡률(`radius.control`)을 따릅니다.

## ref와 스타일 대상

[contract:atoms.contract.targets]: #
모든 Atom은 같은 계약을 따릅니다. `ref`와 native 속성(`id` · `data-*` · `aria-describedby`)은 의미를 가진 요소에, `className` · `style` · `data-testid`는 눈에 보이는 상자에 건넵니다. 둘이 한 요소인 Atom이 대부분이고, 둘이 갈리는 것은 틀을 따로 가진 Field와 Select뿐입니다. Select의 의미를 가진 요소는 둘입니다 — 접근성과 키보드는 값을 보이는 버튼(combobox)이, 폼은 보이지 않는 native select가 맡으므로 `id` · `data-*` · `aria-*`와 핸들러는 버튼에, `ref`와 폼 속성은 native select에 갑니다. Label은 Text의 `label` 역할과 같은 class를 그립니다.

[contract:atoms.field.target]: #
Field · Textarea는 `ref`와 native 속성을 안쪽 native control에, `className` · `style` · `data-testid`를 눈에 보이는 틀에 건넵니다. Textarea는 틀이 control 자신이라 모두 한 요소입니다. Select는 `ref`와 폼 속성(`name` · `value` · `defaultValue` · `required` · `form` · `autoComplete`)과 `onChange`를 보이지 않는 native select에, 나머지 native 속성과 핸들러를 버튼에, `className` · `style` · `data-testid`를 틀에 건넵니다.

[contract:atoms.contract.target-table]: #

| Atom | ref · native 속성 대상 | className · style 대상 | data-testid 대상 |
| --- | --- | --- | --- |
| Button · IconButton | 선택한 root element | 같은 root | 같은 root |
| Link | 선택한 root element(기본 a) | 같은 root | 같은 root |
| Marker | mark | 같은 mark | 같은 mark |
| Spinner | span | 같은 span | 같은 span |
| Field | 안쪽 input | 보이는 div wrapper | wrapper |
| Select | ref · 폼 속성은 보이지 않는 native select, id · aria · data-* · 핸들러는 버튼(combobox) | 보이는 span wrapper | wrapper |
| Textarea · Checkbox · Radio · Switch · Slider · Badge · Label · Divider | 각 native element(Label은 label, Divider는 hr) | 같은 element | 같은 element |
| SegmentControl | radiogroup div | 같은 div | 같은 div |
| Select.Option · Select.Group | native select 안의 option · optgroup | 같은 element | 같은 element |

[contract:atoms.label.text-role]: #
Label은 `<Text as="label" variant="label">`입니다. ref와 native label 속성은 label 요소로 가고, 글자 크기·굵기·잉크는 Text의 `label` 역할이 정합니다.

[contract:atoms.badge.paint]: #
Badge는 `Paint as="span"` 위에 서서 accent × variant 면을 Paint에서 받고, `hoverable`을 주지 않으므로 hover 색도 tint 층도 없습니다. ref와 native 속성은 span으로 갑니다.

[contract:atoms.divider.border]: #
Divider는 `Box as="hr"`이고 선을 background가 아니라 border로 긋습니다. ref와 native 속성은 hr로 가고, 가로는 높이가 0인 hr의 위쪽 border 한 줄, 세로는 폭이 0인 hr의 시작 쪽 border 한 줄이라 `stroke.border`만큼만 자리를 차지합니다. 색은 `linePaint`(`border.base` · `border.strong`)이고, 선이 border라 색을 OS가 정하는 모드에서도 CanvasText로 남습니다.

[contract:atoms.select.native-form]: #
className으로 넘긴 앱 class는 패키지 CSS가 든 레이어 밖에 있어, 로드 순서와 무관하게 Atom의 상태 규칙까지 이깁니다([우선순위](../get-started/install.md#우선순위)). Field와 Select는 wrapper가 면·테두리·포커스 링을 갖습니다. Select의 폼은 보이지 않는 native select가 맡습니다 — Option · Group이 그 안에 그대로 그려지고, 목록에서 고르면 그 select의 값이 바뀌며 native `input` · `change` 이벤트가 납니다. 그래서 `name` · `required` · `form` · reset · FormData, `onChange`의 `e.currentTarget.value`, `ref`가 native select와 같습니다. 같은 항목을 다시 고르면 아무 이벤트도 나지 않습니다. 그 select는 접근성 트리와 Tab 순서에 없고, 무엇이 그리로 포커스를 보내면(빈 필수값을 가리키는 폼) 버튼이 받습니다. Select 화살표는 포커스를 받거나 클릭을 가로채지 않습니다.

[contract:atoms.select.listbox]: #
값을 보이는 버튼은 `role=combobox` · `aria-haspopup=listbox` · `aria-expanded`입니다. 열리면 `aria-controls`가 목록을, `aria-activedescendant`가 목록에서 가리키는 항목을 가리키고, 포커스는 버튼에 머뭅니다. 목록은 [Floating](../primitives/float.md)의 listbox panel로 틀 아래 시작 쪽에 열리고(아래에 자리가 없으면 위로), 틀보다 좁지 않되 창의 `layout.gutter` 안쪽을 넘지 않습니다. 항목은 Select의 size 높이로 inset xs 안쪽에 섭니다. 항목은 `role=option`과 `aria-selected`이고, 고를 수 없는 항목은 `aria-disabled`로 흐려지며, Group은 이름이 있는 `role=group`입니다. 고른 항목은 앞의 체크로, 가리키는 항목은 hover tint로 보여 둘이 섞이지 않습니다. 체크 자리는 모든 항목에 비워 두어 글자가 한 줄에서 시작합니다. 목록의 이름은 Select의 이름과 같습니다.

[contract:atoms.select.keyboard]: #
닫혀 있을 때 ↓ · ↑ · Enter · Space는 고른 항목을 가리킨 채 목록을 열고, Home · End는 처음 · 마지막 항목을 가리키며 엽니다. 열려 있으면 ↓ · ↑가 한 칸씩(끝에서 돌지 않음), Home · End가 양 끝으로, PageDown · PageUp이 열 칸씩 옮기고, 고를 수 없는 항목은 건너뜁니다. Enter · Space · Alt+↑는 가리키는 항목을 고르고 닫으며, Escape는 고르지 않고 닫고(Select가 선 dialog는 닫지 않습니다), Tab은 고르지 않고 닫은 뒤 포커스를 넘깁니다. 글자를 치면 열려 있든 닫혀 있든 그 글자로 시작하는 다음 항목을 가리키며, 잠깐(0.5초) 사이에 이어 친 글자는 한 낱말이 되고 같은 글자를 되풀이하면 그 글자로 시작하는 항목을 차례로 돕니다. 낱말을 치는 동안의 Space는 고르지 않고 글자가 됩니다.

[contract:atoms.select.pointer]: #
버튼을 누르면 목록이 열리고 다시 누르면 닫힙니다. 항목을 누르면 고르고 닫히며, 목록 밖을 누르면 고르지 않고 닫힙니다. 목록을 누르는 동안에도 포커스는 버튼에 있어 키보드가 이어집니다. 포인터가 지나는 항목이 가리키는 항목이 됩니다.

[contract:atoms.select.natural-width]: #
폭을 정해 주지 않은 자리(Grid의 `auto` 칸)에서 Select는 가장 긴 선택지만큼 넓어집니다. 폭이 있는 자리에서는 그 폭을 채웁니다. 값의 안쪽 여백은 버튼이 갖고 버튼이 틀을 채우므로, 틀 어디를 눌러도 열립니다. 모든 선택지의 글자가 한 칸에 겹쳐 서고 고른 것만 보이므로, 값을 바꿔도 틀이 움직이지 않습니다.

## 상태와 접근성

[contract:atoms.field.invalid]: #
Field · Textarea · Select는 오류를 하나의 규칙으로 말합니다. [FormField](../primitives/field.md#입력과-설명의-관계) 안에 두면 field의 id · 설명 · 오류 · disabled · required를 context로 받아 `controlProps`로 마지막에 펼치고, 밖에서는 자기 props만 씁니다. `aria-invalid`는 직접 준 값이 이기고, 없으면 `status="error"`이거나 field가 invalid일 때 `true`입니다. 둘 중 하나만 주면 되고, `status`를 안 줘도 field가 invalid면 틀이 error 경계를 그립니다. 직접 준 `aria-invalid={false}`는 속성을 `false`로 두면서 `status="error"`의 경계는 그대로 둡니다. 틀은 오류일 때 `data-invalid`를, 상태가 있을 때 `data-status`를 답니다. Checkbox · Radio · Switch도 같은 hook을 부릅니다.

[contract:atoms.field.actions]: #
Field의 지우기는 값이 있고 Field를 쓸 수 있을 때만 보이는 버튼이고, 이름은 `clearLabel`(없으면 locale의 '지우기' · 'Clear')입니다. 누르면 native setter와 input 이벤트로 controlled · uncontrolled 양쪽의 `onChange`를 발화하고 `onClear`를 부른 뒤 포커스를 input으로 되돌립니다. 보기 토글은 `type="password"`와 `showPasswordToggle`일 때만 보이며 이름은 늘 같고(`showPasswordLabel`, 없으면 '비밀번호 보기' · 'Show password') 눌림 여부는 `aria-pressed`가 알립니다. Field가 비활성이면(FormField의 disabled 포함) 토글은 그려진 채 비활성이라 반응도 Tab 정지도 없고 지우기는 숨습니다. 두 버튼의 아이콘은 `size`를 주지 않으면 컨트롤 높이를 따르며(leading · trailing 어도먼트 안의 Icon도 같습니다), 보이는 크기와 별도로 최소 target까지 넓은 hit area를 가집니다(WCAG 2.5.8) — 나란한 두 버튼의 hit area는 겹치지 않습니다. 지우기(검색창의 ×)와 비밀번호 보기는 Field가 소유하므로 브라우저가 같은 일로 입력 안에 그리는 장치(search 취소 ×, Edge 보기)는 숨깁니다. number의 증감과 date의 선택 장치는 브라우저에 남습니다.

[contract:atoms.textarea.rows]: #
[contract:atoms.input.face]: #
Field · Textarea · Select의 틀은 `variant`(hairline · ghost)로 선을, `fill`(raised · canvas · sunken)로 면을 고릅니다. 기본은 `hairline`이고 면은 `control.field`(흰 면)라, 흰 카드 위에서도 선이 경계를 세웁니다. hairline Button과 같은 가장자리입니다. 검색칸처럼 면의 색이 경계가 되는 자리는 `variant="ghost"`에 `fill="sunken"`을 줍니다. 글자를 넣는 칸이라 면이 늘 있으므로 `shadow`를 언제든 받지만 기본 그림자는 없습니다. `ghost`도 상태의 선은 그립니다.

[contract:atoms.input.ground]: #
면을 고르지 않은 입력 틀과 꺼진 Checkbox · Radio는 어디에 놓이든 같은 모습입니다. 입력 틀은 `control.field`, 꺼진 표식은 `control.mark` 흰 면에 회색 선 한 줄(`border.base`)로 서고, 그림자는 없습니다. 흰 카드 안에서도 선이 경계를 세웁니다. 다크에서는 두 면이 카드보다 한 단계 밝은 neutral.875입니다. 회색은 화면이 고릅니다 — `variant="ghost"`에 `fill="sunken"`을 준 입력 틀은 선 없는 회색 면입니다. 면이 놓인 바닥을 읽어 모습을 바꾸지 않습니다. Switch와 SegmentControl의 트랙은 어디에 놓이든 inset 그림자를 갖는 홈입니다(Slider는 hit area 여백 때문에 아직 없습니다).

Textarea의 높이는 `rows`(기본 4)가 정하고 최소 높이는 없습니다. 한 줄(`rows={1}`)은 같은 size의 Field와 같은 높이이고, 기본 4줄은 xs 88 · sm 92 · md 96 · lg 100 · xl 104입니다. 면은 Field와 같은 `fill`이 고르고 안 주면 `control.field` 흰 면이며, 틀은 Field · Select와 같은 `inputFrame`이라 Field의 stylesheet에는 기대지 않습니다.

[contract:atoms.mark.roles]: #
Checkbox · Radio · Switch는 native input입니다. Checkbox는 `type=checkbox`, Radio는 `type=radio`이고, Switch는 `type=checkbox`에 `role=switch`를 붙여 켬/끔으로 읽힙니다. 선택 상태는 input 자신의 `checked`가 말하고 `aria-checked`로 한 번 더 쓰지 않으며, 같은 `name`의 Radio는 하나만 서고 폼은 그 값을 읽습니다. 비활성은 native `disabled`입니다.

[contract:atoms.mark.invalid]: #
Checkbox · Radio · Switch의 `status`는 `error`뿐입니다(`ChoiceStatus`). 오류는 입력과 같은 규칙으로 말합니다 — `aria-invalid`는 직접 준 값이 이기고, 없으면 `status="error"`이거나 FormField가 invalid일 때 `true`이며, 선택 표식 자신이 `data-invalid`와 `data-status`를 답니다. 직접 준 `aria-invalid={false}`는 속성을 `false`로 두면서 `status="error"`의 테는 그대로 둡니다. 꺼진 표식의 테만 error 잉크가 되고 켜진 표식은 그대로이며, 오류는 색만으로 알리지 않고 `aria-invalid`와 FormField의 오류 문구가 함께 알립니다. 한 묶음의 Radio는 모두 같은 `status`를 주거나 radiogroup에 `aria-invalid`를 줍니다.

[contract:atoms.mark.paint]: #
선택 표식의 stylesheet는 geometry만 갖습니다 — 색은 `markPaint`(`primitives/paint/recipes.css.ts`)가 입히고, 키보드 링과 비활성은 상태 recipe(`stateStyle.focusVisible` · `stateStyle.disabled`)가 입히며, hover는 없습니다(포인터가 올라가는 자리는 표식이 아니라 라벨과 행입니다). 표식을 누르는 동안에는 바깥에 눌림 고리(`markPressPaint`)가 섭니다([눌림, 비활성, 선택 표식](states.md#눌림-비활성-선택-표식)). 꺼진 표식은 `control.mark` 흰 면에 `border.base` 선 한 줄을 두르고, 그 선은 3:1 아래인 문서화된 예외입니다([비텍스트 대비](../foundations/color.md#대비-계약)). Switch의 꺼진 트랙은 `control.track` 면이고, 켜진 표식은 primary solid 면입니다.

[contract:atoms.segment.radiogroup]: #
SegmentControl은 `role=radiogroup`이고 SegmentControl.Item은 `role=radio`입니다. Tab 정지는 고른 칸 하나이고 방향키가 고르는 칸을 옮기며, 고른 칸을 다시 눌러도 선택이 비지 않습니다. `value`를 주면 호출자가 값을 쥐고 `onValueChange`로 변경을 요청받습니다. `disabled`는 묶음 전체를, Item의 `disabled`는 그 칸만 막습니다. 칸의 자리는 고른 항목을 재서 얻으므로 글자 폭이 달라도 맞습니다. 가로를 채우는 묶음(`fullWidth`)은 폭을 칸마다 같게 나누되, 어느 칸도 제 글자(outline의 고른 칸은 체크까지)보다 좁아지지 않습니다 — 더 필요한 칸은 제 폭을 갖고 나머지 칸이 남은 폭을 나눕니다.

[contract:atoms.segment.outline]: #
`variant="outline"`인 SegmentControl은 Field · Select의 틀과 같은 모습으로 섭니다 — `control.field` 흰 면에 `border.base` 선 한 줄, 같은 size Field와 같은 높이와 곡률입니다. 미끄러지는 칸은 없고, 둘째 칸부터 시작 쪽에 같은 선을 그어 칸을 나눕니다. 고른 칸은 틀의 선 안쪽을 `control.chosen` 면으로 채우고 글자 앞에 체크를 둡니다. 체크는 `aria-hidden`이라 칸의 이름은 글자 그대로입니다. 칸이 자기 아이콘을 가져오면 고른 동안에는 그 자리를 체크에 내줍니다. 폼 곁(Props 패널처럼 Select · Field와 한 줄에 놓이는 자리)에 씁니다. 기본은 `track`이고, `shape` 기본값(pill)은 variant와 따로 갑니다.

[contract:atoms.slider.native]: #
Slider는 native `input type=range`입니다. 끌기 · 방향키 · 폼 제출은 브라우저가 맡고, `min` · `max` · `step`은 native 뜻 그대로입니다. FormField의 관계와 오류는 다른 입력과 같은 규칙으로 받습니다.

[contract:atoms.slider.fill]: #
채워진 부분은 값이 선 자리까지입니다. 값이 없으면 native range와 같은 가운데에서 시작하고, 범위를 벗어난 값은 막대 안에 머뭅니다.

[contract:atoms.slider.origin]: #
`origin`을 주면 채움이 그 값의 자리에서 손잡이까지 이어지고, 손잡이가 어느 쪽에 있든 그 사이만 칠합니다. -100 ~ 100처럼 0이 "바꾸지 않음"인 값은 `origin={0}`으로 가운데에서 채웁니다. 주지 않으면 채움은 `min`에서 시작합니다.

[contract:atoms.checkbox.indeterminate]: #
Checkbox의 `indeterminate`는 속성이 아니라 DOM 프로퍼티라 layout effect가 input에 직접 세웁니다. 넘어온 ref는 그대로 두므로 값이 바뀌어도 callback ref는 다시 불리지 않습니다.

[contract:atoms.mark.target]: #
선택 표식과 Field 액션은 보이는 크기와 별도로 24px hit area를 가집니다(WCAG 2.5.8). Checkbox · Radio는 상자 둘레로, Switch는 트랙 위아래로 넓어지는 보이지 않는 `::before`이고(가로는 트랙이 이미 충분합니다), 색을 칠하지 않습니다. 표식 중심에서 hit area의 절반인 12px 안쪽의 포인터는 그 표식에 닿고 14px 밖은 닿지 않습니다. 문장 안 Link는 inline 예외입니다.

[contract:atoms.focus.input-modality]: #
Field · Select · Textarea는 React Aria의 입력 modality 하나로 키보드 포커스를 판정하고, 링을 그리는 틀(Field · Select는 wrapper, Textarea는 자기 자신)에 `data-focus-visible`을 답니다. 포인터 포커스에는 링이 없고 Tab이나 Shift+Tab으로 오면 2px 링이 틀에 뜹니다. Checkbox · Radio · Switch도 같은 판정을 쓰되 링 주인이 input 자신이라 자기 곡률로 링을 그리고, 비활성은 native `disabled`와 `data-disabled`로 `opacity.disabled`와 `not-allowed` 커서를 얻습니다. IconButton의 aria-label은 타입에서 필수이고, Badge의 점과 Select 화살표는 장식으로 숨깁니다. hover·focus·selected의 우선순위는 [상태와 피드백](states.md)에 있습니다.

동작 예제는 Playground의 [Atoms](/playground/button) 목록에서 확인합니다.
