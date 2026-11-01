# Overview

Atom은 한 가지 역할을 하는 완성 컨트롤입니다. Primitive 위에서 Foundations의 역할을 골라 그리고, 앱은 Atom을 조합해 화면을 만듭니다. 패키지는 14개를 공개합니다.

## 공통 축

Atom은 같은 축 몇 개로 말합니다. 축의 값은 모두 Foundations에서 옵니다.

[contract:atoms.contract.common-axes]: #

| 축 | 값 | 출처 |
| --- | --- | --- |
| `size` | sm · md · lg, 기본 md | Shape control 사다리 — 높이 30 · 32 · 36 |
| `accent` | primary · info · success · warning · error | Color accent |
| `variant` | solid · soft · hairline · ghost · muted | Color [accent × variant](../foundations/color.md#accent--variant) |
| `status` (입력) | info · success · warning · error, 생략하면 중립. Field · Textarea · Select가 같은 축을 씀 | Color accent `ink` 경계 |
| `status` (선택 표식) | error만(`ChoiceStatus`), 생략하면 중립. Checkbox · Radio · Switch가 같은 축을 씀 | Color accent `error.ink` 테 |
| `fill` (입력) | raised · sunken, 기본 raised. Field · Textarea · Select가 같은 축을 씀 | Color [Surface](../foundations/color.md) 면 — 다크에서 sunken은 canvas와 같은 단계 |
| `shape` | rounded · pill, 기본 rounded | Shape `radius.control` · `radius.full` |
| `fontSize` | `label` · `caption` · `body` (`CONTROL_FONT_SIZES`) | Typography — 글자 크기만 바꾸는 탈출구. 컨트롤 상자가 담을 수 있는 역할만 받음 |

[contract:atoms.field.neutral-status]: #
축마다 중립값은 이름이 아니라 기본값이나 생략입니다. `accent`의 중립은 `primary`, Divider `level`의 중립은 `base`이고, 입력과 선택 표식의 `status`는 생략하면 중립이라 `default`라는 값이 없습니다. Field · Textarea · Select는 `status`를 줬을 때(또는 오류 상태가 됐을 때의 error)만 입력의 틀에 `data-status`를 그리고, `status="error"`는 `aria-invalid`도 설정합니다.

[contract:atoms.contract.font-size]: #
`size`는 geometry를 고르고, 글자는 Typography의 [Control preset](../foundations/typography.md#control-preset)에서 따로 고릅니다. 같은 size의 Button · Field · Select는 같은 높이에 서고 글자 높이도 맞습니다. `fontSize`로 글자를 바꿔도 geometry는 고른 size를 따릅니다.

## 목록

[contract:atoms.contract.axes]: #

| Atom | 고유 축 | 기본값·동작 |
| --- | --- | --- |
| Button | as · accent · variant · size · fontSize · shape · selected · loading · loadingLabel · fullWidth | button / primary / solid / md / rounded, type=button. solid는 strong preset, 나머지는 medium. selected는 hairline · ghost · muted에서 aria-pressed와 선택된 면. loading은 spinner·aria-busy, 포커스는 유지하고 누름과 제출만 막음 |
| IconButton | as · accent · variant · size · shape · disabled · iconSize · 필수 aria-label · 단일 children | 정사각형, 높이가 변. 안의 Icon은 iconSize를 주지 않으면 컨트롤 높이를 따라 16 · 18 · 20. loading · fullWidth · fontSize는 없음 |
| Field | status · size · fill · fontSize · shape · numeric · align · leading / trailing · clearable · clearLabel · showPasswordToggle · showPasswordLabel · onClear | 중립 / md / raised / rounded, type=text. wrapper가 면·높이·상태·포커스를 소유. 지우기와 보기 버튼의 이름은 locale 문구이고 label prop으로 바꿈. 브라우저의 search 취소 ×와 Edge 비밀번호 보기 장치는 Field가 소유해 숨기고, number 증감·date 선택 장치는 브라우저에 남음 |
| Textarea | status · size · fill · fontSize · rows · native textarea props | 중립 / md / raised, 기본 4줄. rows가 높이를 정하고(최소 높이 없음) 한 줄 = 같은 size Field, 세로 resize. pill 없음 |
| Select | status · size · fill · fontSize · shape · children · native select props | 중립 / md / raised / rounded. native select와 Option·Group, multiple 없음. 화살표는 trailing Icon. className · style · data-testid는 wrapper |
| Checkbox | status · size · indeterminate · native input props | md. 상자 = 컨트롤 높이의 절반, 체크는 그 절반. 꺼진 경계는 `ink.tertiary` 테이고 `status="error"`면 error 잉크. 24px hit area |
| Radio | status · size · native input props | md. Checkbox와 같은 상자, 점은 상자의 절반. name·선택은 호출자가 조립. 한 묶음의 Radio는 모두 같은 `status`를 줌 |
| Switch | status · size · native input props | md. input type=checkbox + role=switch. 트랙 폭 = 컨트롤 높이. 꺼진 트랙은 `ink.tertiary` 안쪽 테를 두름. 손잡이는 `inset-inline-start`로 움직여 RTL에서 저절로 뒤집힘 |
| Label | children · ref · native label props | Text의 label 역할 그대로. htmlFor 또는 내부 control로 연결 |
| Badge | accent · variant · size · fontSize · dot · shape · ref | primary / soft / md / rounded. `Paint as="span"`이고 표시용이라 hover 없음. 높이 20 · 22 · 24, 글자 12 고정 |
| Spinner | size(sm · md · lg · inline) · ink(inherit) · label · decorative | md, label은 locale 문구('불러오는 중' · 'Loading'), role=progressbar. 지름 16 · 18 · 20, inline은 글자만큼. decorative는 aria-hidden |
| Divider | orientation=horizontal/vertical · level=base/strong · ref · native hr props | horizontal / base. `Box as="hr"` + aria-orientation. 선은 border로 긋고 level은 선의 색(`border.base` · `border.strong`), 두께는 border stroke |
| Marker | native 속성 · ref | mark. 칠은 `marker.fill`, 글자는 `marker.ink`이고 글자의 크기와 굵기는 둘러싼 글자를 따름 |
| Link | as · underline(always · hover) · native anchor props | a, `interaction.link` 잉크, 늘 밑줄(`always`), 단독 링크는 hover 때만(`hover`). 라우터의 Link는 `as`로 받음 |

[contract:atoms.select.anatomy]: #
Select.Option과 Select.Group은 Select의 anatomy라 따로 세지 않습니다. 이 둘은 `Select.Option` · `Select.Group` 하나의 경로로만 쓰고, 따로 export하지 않습니다. 각 Atom의 치수가 어디서 나오는지는 [Shape](../foundations/shape.md#recipe--컴포넌트-anatomy)의 recipe 표에 있습니다.

[contract:atoms.divider.orientation-level]: #
Divider의 `orientation`은 선의 방향을 고르고 `aria-orientation`으로 그대로 전달됩니다. `level`은 선의 색을 고릅니다.

## Primitive 위의 Atom

Atom은 Primitive와 hook, 공용 recipe 위에 서고, native control이 있는 자리에서는 그 control이 의미를 가진 요소로 남습니다. Primitive는 두 차수입니다 — 1차(Element · Content · A11y)는 바탕이라 서로 기대지 않고, 2차는 Box에 능력 하나를 더한 것이며 Atom이 hook과 class 함수로 묶습니다([Primitives](../primitives/README.md)). 색은 모두 `primitives/paint/`에서 오므로 Atom의 stylesheet는 geometry만 갖고 `tokens.color`를 읽지 않습니다.

[contract:atoms.contract.stands-on]: #

| Atom | 서 있는 곳 (stands on) | 색 |
| --- | --- | --- |
| Button · IconButton | `Pressable as={대상}`(부품도 대상일 뿐입니다) · `motion="press"` · `useSelectable` | `paintClass` |
| Link | 자기 대상 태그 · `useFocusRing` | `linkPaint` |
| Marker | native `mark` | `markerPaint` |
| Field · Textarea · Select | `useFormFieldControl` · `useFocusRing`(`atoms/input-control.ts`) · 입력 틀 `inputFrame` · Icon · 액션은 Pressable, 비밀번호 토글은 `Pressable as={Selectable}` | `fieldPaint` |
| Checkbox · Radio · Switch | native input · `useFocusRing` · `useFormFieldControl`(`atoms/input-control.ts`) | `markPaint` |
| Label | Text | Text label 역할의 잉크 |
| Badge | `Paint as="span"` | `paintClass`(Paint가 입힘) |
| Divider | `Box as="hr"` | `linePaint` |
| Spinner | `Box as="span"` · `loop.spin` | `spinnerPaint` |

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

[contract:atoms.icon-button.axes]: #
IconButton은 정사각 anatomy와 부딪히지 않는 축만 엽니다 — `as` · accent · variant · size · shape · disabled · iconSize와 필수 `aria-label`. loading · fullWidth · fontSize는 타입에서 막힙니다. 안의 Icon은 `size`를 주지 않으면 컨트롤 높이를 따라 16 · 18 · 20이고, `iconSize`는 컨트롤 안 모든 Icon의 크기를, Icon의 `size`는 그 Icon 하나의 크기를 정합니다(Button 안의 Icon도 같습니다).

[contract:atoms.spinner.roles]: #
Spinner는 혼자 서면 `role="progressbar"`와 `aria-label`을 갖습니다. 값(`aria-valuenow`)이 없어 얼마나 걸릴지 모르는 진행이고, progressbar는 이름을 만든 사람의 글에서 받으므로 숨은 라벨 요소를 두지 않습니다. `decorative`면 `aria-hidden`이고 role도 이름도 없습니다. 컨트롤 안의 Spinner가 그렇습니다. 회전은 Motion의 `loop.spin` 하나(패키지에 `@keyframes spin`은 하나)이고, 크기는 control icon 사다리(`inline`은 글자만큼)가, 색은 `ink`가 정합니다 — 기본은 옅은 링에 잉크색 호, `inherit`는 둘러싼 글자색의 호입니다.

[contract:atoms.link.underline]: #
Link는 늘 밑줄을 긋습니다(`underline="always"`). 문장 안 링크는 색만으로 본문과 3:1이 되지 않아 밑줄이 링크임을 알리는 단서입니다. 메뉴처럼 위치가 링크임을 말해 주는 단독 링크만 `underline="hover"`로 가리킬 때 긋습니다. 터치에는 hover가 없습니다. 문서 페이지의 본문 링크도 Link Atom으로 그려져 같은 규칙을 따릅니다.

[contract:atoms.link.target]: #
Link는 `as`로 라우터의 Link 같은 컴포넌트를 받아 태그 하나만 그립니다. 키보드 포커스는 `useFocusRing`이 판정해 링크 자신에 `data-focus-visible`을 달고, 링은 링크 자신의 곡률(`radius.control`)을 따릅니다.

## ref와 스타일 대상

[contract:atoms.contract.targets]: #
모든 Atom은 같은 계약을 따릅니다. `ref`와 native 속성(`id` · `data-*` · `aria-describedby`)은 의미를 가진 요소에, `className` · `style` · `data-testid`는 눈에 보이는 상자에 건넵니다. 둘이 한 요소인 Atom이 대부분이고, 둘이 갈리는 것은 틀을 따로 가진 Field와 Select뿐입니다. Label은 Text의 `label` 역할과 같은 class를 그립니다.

[contract:atoms.field.target]: #
Field · Textarea · Select는 `ref`와 native 속성을 안쪽 native control에, `className` · `style` · `data-testid`를 눈에 보이는 틀에 건넵니다. Textarea는 틀이 control 자신이라 모두 한 요소입니다.

[contract:atoms.contract.target-table]: #

| Atom | ref · native 속성 대상 | className · style 대상 | data-testid 대상 |
| --- | --- | --- | --- |
| Button · IconButton | 선택한 root element | 같은 root | 같은 root |
| Link | 선택한 root element(기본 a) | 같은 root | 같은 root |
| Marker | mark | 같은 mark | 같은 mark |
| Spinner | span | 같은 span | 같은 span |
| Field | 안쪽 input | 보이는 div wrapper | wrapper |
| Select | 안쪽 select | 보이는 span wrapper | wrapper |
| Textarea · Checkbox · Radio · Switch · Badge · Label · Divider | 각 native element(Label은 label, Divider는 hr) | 같은 element | 같은 element |
| Select.Option · Select.Group | option · optgroup | 같은 element | 같은 element |

[contract:atoms.label.text-role]: #
Label은 `<Text as="label" variant="label">`입니다. ref와 native label 속성은 label 요소로 가고, 글자 크기·굵기·잉크는 Text의 `label` 역할이 정합니다.

[contract:atoms.badge.paint]: #
Badge는 `Paint as="span"` 위에 서서 accent × variant 면을 Paint에서 받고, `hoverable`을 주지 않으므로 hover 색도 tint 층도 없습니다. ref와 native 속성은 span으로 갑니다.

[contract:atoms.divider.border]: #
Divider는 `Box as="hr"`이고 선을 background가 아니라 border로 긋습니다. ref와 native 속성은 hr로 가고, 가로는 높이가 0인 hr의 위쪽 border 한 줄, 세로는 폭이 0인 hr의 시작 쪽 border 한 줄이라 `stroke.border`만큼만 자리를 차지합니다. 색은 `linePaint`(`border.base` · `border.strong`)이고, 선이 border라 색을 OS가 정하는 모드에서도 CanvasText로 남습니다.

[contract:atoms.select.native-form]: #
className으로 넘긴 앱 class는 패키지 CSS가 든 레이어 밖에 있어, 로드 순서와 무관하게 Atom의 상태 규칙까지 이깁니다([우선순위](../get-started/install.md#우선순위)). Field와 Select는 wrapper가 면·테두리·포커스 링을 갖고, label 연결·폼 제출·value·disabled·ref는 native 요소에 남습니다. Select 화살표는 포커스를 받거나 클릭을 가로채지 않습니다.

## 상태와 접근성

[contract:atoms.field.invalid]: #
Field · Textarea · Select는 오류를 하나의 규칙으로 말합니다. [FormField](../primitives/field.md#입력과-설명의-관계) 안에 두면 field의 id · 설명 · 오류 · disabled · required를 context로 받아 `controlProps`로 마지막에 펼치고, 밖에서는 자기 props만 씁니다. `aria-invalid`는 직접 준 값이 이기고, 없으면 `status="error"`이거나 field가 invalid일 때 `true`입니다. 둘 중 하나만 주면 되고, `status`를 안 줘도 field가 invalid면 틀이 error 경계를 그립니다. 직접 준 `aria-invalid={false}`는 속성을 `false`로 두면서 `status="error"`의 경계는 그대로 둡니다. 틀은 오류일 때 `data-invalid`를, 상태가 있을 때 `data-status`를 답니다. Checkbox · Radio · Switch도 같은 hook을 부릅니다.

[contract:atoms.field.actions]: #
Field의 지우기는 값이 있고 Field를 쓸 수 있을 때만 보이는 버튼이고, 이름은 `clearLabel`(없으면 locale의 '지우기' · 'Clear')입니다. 누르면 native setter와 input 이벤트로 controlled · uncontrolled 양쪽의 `onChange`를 발화하고 `onClear`를 부른 뒤 포커스를 input으로 되돌립니다. 보기 토글은 `type="password"`와 `showPasswordToggle`일 때만 보이며 이름은 늘 같고(`showPasswordLabel`, 없으면 '비밀번호 보기' · 'Show password') 눌림 여부는 `aria-pressed`가 알립니다. Field가 비활성이면(FormField의 disabled 포함) 토글은 그려진 채 비활성이라 반응도 Tab 정지도 없고 지우기는 숨습니다. 두 버튼의 아이콘은 `size`를 주지 않으면 컨트롤 높이를 따라 16 · 18 · 20이며(leading · trailing 어도먼트 안의 Icon도 같습니다), 보이는 크기와 별도로 24px hit area를 가집니다(WCAG 2.5.8) — 나란한 두 버튼의 hit area는 겹치지 않습니다. 지우기(검색창의 ×)와 비밀번호 보기는 Field가 소유하므로 브라우저가 같은 일로 입력 안에 그리는 장치(search 취소 ×, Edge 보기)는 숨깁니다. number의 증감과 date의 선택 장치는 브라우저에 남습니다.

[contract:atoms.textarea.rows]: #
Textarea의 높이는 `rows`(기본 4)가 정하고 최소 높이는 없습니다. 한 줄(`rows={1}`)은 같은 size의 Field와 같은 높이이고, 기본 4줄은 sm 90 · md 92 · lg 96입니다. 면은 Field와 같은 `fill`(raised 기본, sunken)이 고르며, 틀은 Field · Select와 같은 `inputFrame`이라 Field의 stylesheet에는 기대지 않습니다.

[contract:atoms.mark.roles]: #
Checkbox · Radio · Switch는 native input입니다. Checkbox는 `type=checkbox`, Radio는 `type=radio`이고, Switch는 `type=checkbox`에 `role=switch`를 붙여 켬/끔으로 읽힙니다. 선택 상태는 input 자신의 `checked`가 말하고 `aria-checked`로 한 번 더 쓰지 않으며, 같은 `name`의 Radio는 하나만 서고 폼은 그 값을 읽습니다. 비활성은 native `disabled`입니다.

[contract:atoms.mark.invalid]: #
Checkbox · Radio · Switch의 `status`는 `error`뿐입니다(`ChoiceStatus`). 오류는 입력과 같은 규칙으로 말합니다 — `aria-invalid`는 직접 준 값이 이기고, 없으면 `status="error"`이거나 FormField가 invalid일 때 `true`이며, 선택 표식 자신이 `data-invalid`와 `data-status`를 답니다. 직접 준 `aria-invalid={false}`는 속성을 `false`로 두면서 `status="error"`의 테는 그대로 둡니다. 꺼진 표식의 테만 error 잉크가 되고 켜진 표식은 그대로이며, 오류는 색만으로 알리지 않고 `aria-invalid`와 FormField의 오류 문구가 함께 알립니다. 한 묶음의 Radio는 모두 같은 `status`를 주거나 radiogroup에 `aria-invalid`를 줍니다.

[contract:atoms.mark.paint]: #
선택 표식의 stylesheet는 geometry만 갖습니다 — 색은 `markPaint`(`primitives/paint/recipes.css.ts`)가 입히고, 키보드 링과 비활성은 상태 recipe(`stateStyle.focusVisible` · `stateStyle.disabled`)가 입히며, hover는 없습니다(눌리는 자리는 표식이 아니라 라벨과 행입니다). 꺼진 표식은 raised 면 안의 `ink.tertiary` 테입니다 — 어느 면 위에서도 3:1이 되는 가장 옅은 잉크라, 입력 경계(`border.base`)와 달리 표식의 존재 자체가 이 테에 달려 있기 때문입니다([비텍스트 대비](../foundations/color.md#대비-계약)). Switch의 꺼진 트랙은 같은 잉크의 1px 안쪽 테(`strokeRing`)를 두르고, 켜진 표식은 primary solid 면입니다.

[contract:atoms.checkbox.indeterminate]: #
Checkbox의 `indeterminate`는 속성이 아니라 DOM 프로퍼티라 layout effect가 input에 직접 세웁니다. 넘어온 ref는 그대로 두므로 값이 바뀌어도 callback ref는 다시 불리지 않습니다.

[contract:atoms.mark.target]: #
선택 표식과 Field 액션은 보이는 크기와 별도로 24px hit area를 가집니다(WCAG 2.5.8). Checkbox · Radio는 상자 둘레로, Switch는 트랙 위아래로 넓어지는 보이지 않는 `::before`이고(가로는 트랙이 이미 충분합니다), 색을 칠하지 않습니다. 표식 중심에서 hit area의 절반인 12px 안쪽의 포인터는 그 표식에 닿고 14px 밖은 닿지 않습니다. 문장 안 Link는 inline 예외입니다.

[contract:atoms.focus.input-modality]: #
Field · Select · Textarea는 React Aria의 입력 modality 하나로 키보드 포커스를 판정하고, 링을 그리는 틀(Field · Select는 wrapper, Textarea는 자기 자신)에 `data-focus-visible`을 답니다. 포인터 포커스에는 링이 없고 Tab이나 Shift+Tab으로 오면 2px 링이 틀에 뜹니다. Checkbox · Radio · Switch도 같은 판정을 쓰되 링 주인이 input 자신이라 자기 곡률로 링을 그리고, 비활성은 native `disabled`와 `data-disabled`로 `opacity.disabled`와 `not-allowed` 커서를 얻습니다. IconButton의 aria-label은 타입에서 필수이고, Badge의 점과 Select 화살표는 장식으로 숨깁니다. hover·focus·selected의 우선순위는 [상태와 피드백](states.md)에 있습니다.

동작 예제는 Playground의 [Atoms](/playground/button) 목록에서 확인합니다.
