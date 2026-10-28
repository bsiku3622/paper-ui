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
| `fontSize` | Text 역할 이름 | Typography — 글자 크기만 바꾸는 탈출구 |

[contract:atoms.field.neutral-status]: #
축마다 중립값은 이름이 아니라 기본값이나 생략입니다. `accent`의 중립은 `primary`, Divider `level`의 중립은 `base`이고, 입력의 `status`는 생략하면 중립이라 `default`라는 값이 없습니다. Field와 Textarea는 `status`를 줬을 때만 `data-status`를 그리고, `status="error"`는 `aria-invalid`도 설정합니다.

`size`는 geometry를 고르고, 글자는 Typography의 [Control preset](../foundations/typography.md#control-preset)에서 따로 고릅니다. 같은 size의 Button · Field · Select는 같은 높이에 서고 글자 높이도 맞습니다. `fontSize`로 글자를 바꿔도 geometry는 고른 size를 따릅니다.

## 목록

| Atom | 고유 축 | 기본값·동작 |
| --- | --- | --- |
| Button | as · accent · variant · size · fontSize · shape · loading · fullWidth | button / primary / solid / md / rounded, type=button. solid는 strong preset, 나머지는 regular. loading은 spinner·aria-busy·disabled |
| IconButton | Button의 축에서 children·fontSize 제외 · iconSize · 필수 aria-label · 단일 children | iconSize=body. 정사각형. children이 Icon이면 iconSize를 전달 |
| Field | status · size · surface=raised/sunken · fontSize · shape · numeric · align · leading / trailing · clearable · showPasswordToggle · onClear | default / md / raised / rounded, type=text. wrapper가 면·높이·상태·포커스를 소유 |
| Textarea | status · size · fontSize · native textarea props | default / md. 한 줄 높이 = 같은 size Field, 최소 높이 96, 세로 resize. pill 없음 |
| Select | size · fontSize · shape · children · native select props | md / rounded. native select와 Option·Group. 화살표는 trailing Icon |
| Checkbox | size · indeterminate · native input props | md. 상자 = 컨트롤 높이의 절반, 체크는 그 절반 |
| Radio | size · native input props | md. Checkbox와 같은 상자, 점은 상자의 절반. name·선택은 호출자가 조립 |
| Switch | size · native input props | md. input type=checkbox + role=switch. 트랙 폭 = 컨트롤 높이 |
| Label | children · native label props | label typography. htmlFor 또는 내부 control로 연결 |
| Badge | accent · variant · size · fontSize · dot · shape | primary / soft / md / rounded. 표시용이라 hover 없음. 높이 20 · 22 · 24, 글자 12 고정 |
| Spinner | size · label | md, label="불러오는 중", role=status. 지름 16 · 18 · 20 |
| Divider | orientation=horizontal/vertical · level=base/strong | horizontal / base. hr + aria-orientation. level은 선의 색(`border.base` · `border.strong`), 두께는 border stroke |
| Link | children · native anchor props | a, `interaction.link` 잉크, hover 때 밑줄. 라우팅은 href 또는 앱의 조합 |

Select.Option과 Select.Group은 Select의 anatomy라 따로 세지 않습니다. 이 둘은 `Select.Option` · `Select.Group` 하나의 경로로만 쓰고, 따로 export하지 않습니다. 각 Atom의 치수가 어디서 나오는지는 [Shape](../foundations/shape.md#recipe--컴포넌트-anatomy)의 recipe 표에 있습니다.

[contract:atoms.divider.orientation-level]: #
Divider의 `orientation`은 선의 방향을 고르고 `aria-orientation`으로 그대로 전달됩니다. `level`은 선의 색을 고릅니다.

## `as` — 같은 자리의 역할을 바꾸는 축

Button에는 `as`가 있습니다(`<Button as={Link} to="/docs">`). raw 태그를 뚫는 구멍이 아니라 같은 자리의 역할을 바꾸는 축입니다. 버튼처럼 생겼지만 하는 일이 이동이라면 그것은 링크여야 하고, 그렇다고 `<Link>`로 `<Button>`을 감싸면 `<a>` 안에 `<button>`이 들어가 Tab 정지가 둘이 됩니다. 태그 하나만 그리게 하는 것이 `as`의 몫입니다. 태그가 갈리면 `type`과 `disabled`도 갈리므로, `<a>`가 된 버튼은 `aria-disabled`와 `tabIndex=-1`, pointer 차단으로 비활성을 표현합니다.

## ref와 스타일 대상

| Atom | ref · native 속성 대상 | className · style 대상 |
| --- | --- | --- |
| Button | 선택한 root element | 같은 root |
| IconButton | button | button |
| Field | 안쪽 input | 보이는 div wrapper (data-testid도 wrapper) |
| Select | 안쪽 select | 보이는 span wrapper |
| Textarea · Checkbox · Radio · Switch · Badge | 각 native element | 같은 element |

[contract:atoms.select.native-form]: #
className으로 넘긴 앱 class는 패키지 CSS가 든 레이어 밖에 있어, 로드 순서와 무관하게 Atom의 상태 규칙까지 이깁니다([우선순위](../get-started/install.md#우선순위)). Field와 Select는 wrapper가 면·테두리·포커스 링을 갖고, label 연결·폼 제출·value·disabled·ref는 native 요소에 남습니다. Select 화살표는 포커스를 받거나 클릭을 가로채지 않습니다. Label · Spinner · Divider · Link는 별도의 ref 전달 계약을 두지 않습니다.

## 상태와 접근성

Button은 loading·disabled일 때 native button을 비활성화합니다. Field · Textarea의 error status는 `aria-invalid`도 설정합니다. 설명·오류 문구의 연결은 [FormField](../primitives/a11y.md#입력과-설명의-관계)가 하거나 호출자가 직접 조립합니다. Field는 clear 뒤 input 이벤트와 onClear를 보내고 포커스를 input으로 되돌리며, password toggle은 그 type에서만 보입니다.

Field · Select · Textarea는 포인터 포커스와 키보드 포커스를 구분해, 키보드로 왔을 때만 바깥에 포커스 링을 그립니다. Checkbox · Radio · Switch는 native 포커스·비활성·checked 동작을 그대로 씁니다. IconButton의 aria-label은 타입에서 필수이고, Badge의 점과 Select 화살표는 장식으로 숨깁니다. hover·focus·selected의 우선순위는 [상태와 피드백](states.md)에 있습니다.

동작 예제는 Playground의 [Atoms](/playground/button) 목록에서 확인합니다.
