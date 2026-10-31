# Overview

Atom은 한 가지 역할을 하는 완성 컨트롤입니다. Primitive 위에서 Foundations의 역할을 골라 그리고, 앱은 Atom을 조합해 화면을 만듭니다. 패키지는 13개를 공개합니다.

## 공통 축

Atom은 같은 축 몇 개로 말합니다. 축의 값은 모두 Foundations에서 옵니다.

| 축 | 값 | 출처 |
| --- | --- | --- |
| `size` | sm · md · lg, 기본 md | Shape control 사다리 — 높이 30 · 32 · 36 |
| `accent` | primary · info · success · warning · error | Color accent |
| `variant` | solid · soft · hairline · ghost · muted | Color [accent × variant](../foundations/color.md#accent--variant) |
| `status` (입력) | info · success · warning · error, 생략하면 중립 | Color accent `ink` 경계 |
| `shape` | rounded · pill, 기본 rounded | Shape `radius.control` · `radius.full` |
| `fontSize` | `label` · `caption` · `body` (`CONTROL_FONT_SIZES`) | Typography — 글자 크기만 바꾸는 탈출구. 컨트롤 상자가 담을 수 있는 역할만 받음 |

[contract:atoms.field.neutral-status]: #
축마다 중립값은 이름이 아니라 기본값이나 생략입니다. `accent`의 중립은 `primary`, Divider `level`의 중립은 `base`이고, 입력의 `status`는 생략하면 중립이라 `default`라는 값이 없습니다. Field와 Textarea는 `status`를 줬을 때만 `data-status`를 그리고, `status="error"`는 `aria-invalid`도 설정합니다.

`size`는 geometry를 고르고, 글자는 Typography의 [Control preset](../foundations/typography.md#control-preset)에서 따로 고릅니다. 같은 size의 Button · Field · Select는 같은 높이에 서고 글자 높이도 맞습니다. `fontSize`로 글자를 바꿔도 geometry는 고른 size를 따릅니다.

## 목록

| Atom | 고유 축 | 기본값·동작 |
| --- | --- | --- |
| Button | as · accent · variant · size · fontSize · shape · selected · loading · loadingLabel · fullWidth | button / primary / solid / md / rounded, type=button. solid는 strong preset, 나머지는 medium. selected는 hairline · ghost · muted에서 aria-pressed와 선택된 면. loading은 spinner·aria-busy, 포커스는 유지하고 누름과 제출만 막음 |
| IconButton | as · accent · variant · size · shape · disabled · iconSize · 필수 aria-label · 단일 children | 정사각형, 높이가 변. 안의 Icon은 iconSize를 주지 않으면 컨트롤 높이를 따라 16 · 18 · 20. loading · fullWidth · fontSize는 없음 |
| Field | status · size · fill=raised/sunken(다크에서 sunken은 canvas와 같은 단계) · fontSize · shape · numeric · align · leading / trailing · clearable · showPasswordToggle · onClear | default / md / raised / rounded, type=text. wrapper가 면·높이·상태·포커스를 소유 |
| Textarea | status · size · fontSize · native textarea props | default / md. 한 줄 높이 = 같은 size Field, 최소 높이 96, 세로 resize. pill 없음 |
| Select | size · fontSize · shape · children · native select props | md / rounded. native select와 Option·Group. 화살표는 trailing Icon |
| Checkbox | size · indeterminate · native input props | md. 상자 = 컨트롤 높이의 절반, 체크는 그 절반 |
| Radio | size · native input props | md. Checkbox와 같은 상자, 점은 상자의 절반. name·선택은 호출자가 조립 |
| Switch | size · native input props | md. input type=checkbox + role=switch. 트랙 폭 = 컨트롤 높이 |
| Label | children · native label props | label typography. htmlFor 또는 내부 control로 연결 |
| Badge | accent · variant · size · fontSize · dot · shape | primary / soft / md / rounded. 표시용이라 hover 없음. 높이 20 · 22 · 24, 글자 12 고정 |
| Spinner | size(sm · md · lg · inline) · ink(inherit) · label · decorative | md, label은 locale 문구('불러오는 중' · 'Loading'), role=progressbar. 지름 16 · 18 · 20, inline은 글자만큼. decorative는 aria-hidden |
| Divider | orientation=horizontal/vertical · level=base/strong | horizontal / base. hr + aria-orientation. level은 선의 색(`border.base` · `border.strong`), 두께는 border stroke |
| Link | as · underline(always · hover) · native anchor props | a, `interaction.link` 잉크, 늘 밑줄(`always`), 단독 링크는 hover 때만(`hover`). 라우터의 Link는 `as`로 받음 |

Select.Option과 Select.Group은 Select의 anatomy라 따로 세지 않습니다. 이 둘은 `Select.Option` · `Select.Group` 하나의 경로로만 쓰고, 따로 export하지 않습니다. 각 Atom의 치수가 어디서 나오는지는 [Shape](../foundations/shape.md#recipe--컴포넌트-anatomy)의 recipe 표에 있습니다.

[contract:atoms.divider.orientation-level]: #
Divider의 `orientation`은 선의 방향을 고르고 `aria-orientation`으로 그대로 전달됩니다. `level`은 선의 색을 고릅니다.

## `as` — 같은 자리의 역할을 바꾸는 축

Button · IconButton · Link에는 `as`가 있습니다(`<Button as={RouterLink} to="/docs">`, `<Link as={RouterLink} to="/demo">`). raw 태그를 뚫는 구멍이 아니라 같은 자리의 역할을 바꾸는 축입니다. 버튼처럼 생겼지만 하는 일이 이동이라면 그것은 링크여야 하고, 그렇다고 `<Link>`로 `<Button>`을 감싸면 `<a>` 안에 `<button>`이 들어가 Tab 정지가 둘이 됩니다. 태그 하나만 그리게 하는 것이 `as`의 몫입니다. 태그가 갈리면 `type`과 `disabled`도 갈리므로, `<a>`가 된 버튼은 `aria-disabled`와 `tabIndex=-1`, 클릭 차단으로 비활성을 표현합니다. 링크 모양에 필요한 리셋(밑줄 없음)은 Button의 stylesheet가 소유합니다.

[contract:atoms.button.target]: #
Button과 IconButton은 늘 [Pressable](../primitives/press.md) 하나로 그려지고, `as`는 그 Pressable의 대상입니다. 태그든 라우터 Link든 행동 부품이든 눌림 장치는 그 요소에 한 벌만 얹힙니다. Atom의 모습을 행동에 입히는 길은 `<Button as={부품}>`이 하나뿐이고 — `<Button as={Floating.Trigger}>` · `<Button as={Floating.Close}>` · `<Button as={Selectable}>` · `<Button as={SelectableGroup.Item}>` — 부품의 동작(열기, 선택)은 그대로 한 번만 일어납니다. 이 길에서는 부품의 prop을 그대로 씁니다. `<Button as={Pressable}>`은 Pressable 하나를 그립니다. 반대 방향인 `<Floating.Trigger as={Button}>`은 한 요소에 press 장치가 둘이 되므로 개발 모드 오류이고, `<Button as={Draggable.Handle}>`도 오류입니다(손잡이의 키보드 끌기는 손잡이에 닿는 click을 취소로 읽습니다). 비활성 링크 대상은 이동하지 않습니다.

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

| Atom | ref · native 속성 대상 | className · style 대상 |
| --- | --- | --- |
| Button · IconButton | 선택한 root element | 같은 root |
| Link | 선택한 root element(기본 a) | 같은 root |
| Spinner | span | 같은 span |
| Field | 안쪽 input | 보이는 div wrapper (data-testid도 wrapper) |
| Select | 안쪽 select | 보이는 span wrapper |
| Textarea · Checkbox · Radio · Switch · Badge | 각 native element | 같은 element |

[contract:atoms.select.native-form]: #
className으로 넘긴 앱 class는 패키지 CSS가 든 레이어 밖에 있어, 로드 순서와 무관하게 Atom의 상태 규칙까지 이깁니다([우선순위](../get-started/install.md#우선순위)). Field와 Select는 wrapper가 면·테두리·포커스 링을 갖고, label 연결·폼 제출·value·disabled·ref는 native 요소에 남습니다. Select 화살표는 포커스를 받거나 클릭을 가로채지 않습니다. Label · Divider는 별도의 ref 전달 계약을 두지 않습니다.

## 상태와 접근성

Field · Textarea의 error status는 `aria-invalid`도 설정합니다. Field · Textarea · Select · Checkbox · Radio · Switch는 [FormField](../primitives/field.md#입력과-설명의-관계) 안에 두면 field의 id · 설명 · 오류 · disabled · required를 context로 받아 `controlProps`로 마지막에 펼치고, 밖에서는 자기 props만 씁니다. aria-invalid는 직접 준 값이 이기고, 없으면 error status이거나 field가 invalid일 때 `true`입니다. Field는 clear 뒤 input 이벤트와 onClear를 보내고 포커스를 input으로 되돌리며, password toggle은 그 type에서만 보입니다.

Field · Select · Textarea는 포인터 포커스와 키보드 포커스를 구분해, 키보드로 왔을 때만 바깥에 포커스 링을 그립니다. Checkbox · Radio · Switch는 native 포커스·비활성·checked 동작을 그대로 씁니다. IconButton의 aria-label은 타입에서 필수이고, Badge의 점과 Select 화살표는 장식으로 숨깁니다. hover·focus·selected의 우선순위는 [상태와 피드백](states.md)에 있습니다.

동작 예제는 Playground의 [Atoms](/playground/button) 목록에서 확인합니다.
