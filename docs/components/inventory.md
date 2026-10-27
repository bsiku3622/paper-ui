# Component inventory

2026-10-26 구현 기준의 현재 목록과 공개 계약입니다. 다음 명세 검토에서 이 문서를 기준으로 컴포넌트의 책임·props·상태·접근성을 다듬습니다. 아래 항목은 현재 구현을 기록하며, 신규 컴포넌트나 추가 동작을 제안하지 않습니다.

## 공통 어휘

| 축 | 값 |
| --- | --- |
| Space | xs / sm / md / lg / xl |
| ControlSize | sm / md / lg, 기본 md |
| Surface | canvas / raised / sunken |
| Accent | primary / info / success / warning / error |
| Variant | solid / soft / hairline / ghost / muted |
| Ink | base / soft / faint / info / success / warning / error / inherit |
| TextVariant | display / title / heading / subheading / body / caption / label |
| Control shape | rounded / pill, 기본 rounded |

Size는 geometry를 선택하고 typography는 역할별 preset에서 선택합니다. `fontSize`가 있는 컨트롤은 글자 크기만 TextVariant로 바꾸는 escape를 제공합니다. 패키지의 기본 스타일은 CSS class를 사용하며, native props를 받는 컴포넌트의 caller `style`은 유지합니다.

## Primitives — 17개

| 컴포넌트 | 책임과 공개 축 | 기본값·적용 계약 |
| --- | --- | --- |
| Box | `as`, surface, padding / paddingX / paddingY / gap, border, radius, elevation, inverse, width / minWidth / maxWidth / height / minHeight / maxHeight, overflow / overflowX / overflowY | div. 면·간격·모서리는 opt-in. radius=sm/md/lg/full은 surface radius 선택. elevation=raised/sticky/overlay/modal/toast는 z와 그림자를 함께 선택. inverse는 주변 반대 테마. padding은 Shape inset, gap은 Layout gap 단계(xs~3xl). dimension은 xs~xl 이름·full/fit/min-content/max-content·CSS 길이·number 허용 |
| Grid | Box 전체 축 + columns/rows, autoFlow, align/justify, rowGap/columnGap | columns=1, align/justify=stretch. 정수 또는 CSS track 문자열 |
| Stack | Box 전체 축 + `align` start/center/end/stretch | 세로 flex, align 미지정 시 CSS stretch. gap은 명시적으로 선택 |
| Inline | Box 전체 축 + `align` start/center/end/baseline, `justify` start/center/end/between, `wrap` | 가로 flex, align=center, justify 미지정, nowrap |
| Text | `as`, variant, ink, family=sans/mono | variant=body, family=sans. 기본 태그는 display/title=h1, heading=h2, subheading=h3, body/caption=p, label=span. HTML 의미와 시각 위계는 별도 선택 |
| Icon | size=label/caption/body/subheading, ink, SVG children, className, aria-label | size=body. artboard14/16/18/20px, viewBox24, 기본 currentColor. aria-label이 없으면 장식으로 숨김 |

Layout·Text·Hoverable은 선택한 native tag의 속성과 ref를 전달합니다. Icon은 native SVG 속성과 ref를 전달합니다. Interaction·A11y의 구체적인 props, hook과 사용 예는 [Primitives](primitives.md)를 따릅니다.

| 컴포넌트 | 책임과 공개 축 | 기본값·적용 계약 |
| --- | --- | --- |
| Pressable | onPress lifecycle, disabled, native button props | native button, type=button. pressed/hovered/focus-visible 상태 |
| Hoverable | as, hover lifecycle, disabled | div, 별도 button 역할·tab stop 없음 |
| Toggleable | selected/defaultSelected/onSelectedChange + Pressable | false, native aria-pressed 및 data-selected |
| Draggable | mode, activation, disabled, move 또는 transfer 옵션 | move / surface. move 좌표 또는 getItems 기반 transfer. Handle은 별도 입력 대상 |
| Droppable | 허용 작업과 onDrop lifecycle, disabled | keyboard 접근 가능한 div. native/keyboard transfer item 전달 |
| FocusScope | contain/restoreFocus/autoFocus | 각 기능 opt-in. 범위의 초기 포커스·유지·복귀 |
| VisuallyHidden | as, isFocusable, children | span. 접근성 트리에 남기며 isFocusable은 skip link용 |
| RovingFocus | orientation, dir, loop, disabled, currentValue/defaultCurrentValue/onCurrentValueChange | horizontal / ltr / loop=false. Item·hook으로 하나의 Tab 진입점과 DOM focus 이동 관리 |
| ToggleGroup | selectionMode, selectedValues/defaultSelectedValues/onSelectedValuesChange, selectionRequired, disabled | single / 빈 선택. Item은 native toggle button, focus와 선택 분리 |
| Overlay | open/defaultOpen/onOpenChange, modal | non-modal. Trigger·Content·Close로 Portal·배치·닫기·focus 연결, modal은 inert와 스크롤 잠금 |
| FormField | label, id, description, error, invalid, required, disabled, children 함수 | div wrapper. ControlProps로 실제 입력의 label·설명·오류 관계 연결 |

mergeProps·mergeRefs·composeEventHandlers는 별도 컴포넌트로 세지 않는 합성 도구입니다. 그룹 상태·입력 관계는 useToggleGroup·useOverlay·useField, focus 항목은 useRovingFocusItem으로도 조립합니다.


## Atoms — 13개

| 컴포넌트 | 공개 축·고유 props | 기본값·동작 |
| --- | --- | --- |
| Button | as, accent, variant, size, fontSize, shape, loading, fullWidth | button / primary / solid / md / rounded. native type=button. solid는 strong typography, 나머지는 regular. loading은 spinner·aria-busy·disabled 상태 적용 |
| IconButton | Button의 button 계약에서 children·fontSize 제외, iconSize, 필수 aria-label, 단일 ReactElement children | iconSize=body. 정사각형. children이 Paper Icon이면 iconSize를 전달. native button ref |
| Field | status=default/Status, size, surface=raised/sunken, fontSize, shape, numeric, align=start/center/end, leading/trailing, clearable, showPasswordToggle, onClear | status=default, md, raised, rounded, type=text. wrapper가 면·높이·상태·focus를 소유. clear와 password toggle은 opt-in |
| Textarea | status, size, fontSize, native textarea props | default / md. 최소 높이96px, rows와 내용에 따른 높이, 세로 resize. input inset과 typography에서 block inset 계산. pill 축 없음 |
| Select | size, fontSize, shape, children, native select props | md / rounded. native select. Option·Group 제공. value="" option 선택은 placeholder ink. wrapper의 장식 화살표는 semantic ink를 사용 |
| Checkbox | size, indeterminate, native input props | md. checked/defaultChecked는 native 동작. indeterminate는 DOM property로 전달. 공통 selection 외곽과 private mark recipe |
| Radio | size, native input props | md. name·checked/defaultChecked·onChange 등 native group 계약은 호출자가 조립. Checkbox와 같은 selection 외곽, 독립 dot recipe |
| Switch | size, native input props | md. input type=checkbox + role=switch. checked/defaultChecked는 native 동작. track·thumb·travel은 selection에서 파생 |
| Label | children, className, native label props | native label + label typography. htmlFor 또는 label 내부 control로 연결 |
| Badge | accent, variant, size, fontSize, dot, shape, native span props | primary / soft / md / rounded. 표시용이라 hover gate 없음. 높이20/22/24, inset6/8/10, 글자12px 고정 preset |
| Spinner | size, label, native span props(children 제외) | md, label="불러오는 중". role=status. artboard16/18/20, reduced-motion 규칙 적용 |
| Divider | axis=horizontal/vertical, weight=base/strong, className | horizontal / base. hr + aria-orientation. 두 weight는 선의 색을 선택하며 두께는 border stroke |
| Link | children, className, native anchor props | a, info ink, hover underline. typography는 상속. routing은 href 또는 소비 앱의 조합 책임 |

Select.Option은 native option props와 string/number children을 받습니다. Select.Group은 필수 label과 ReactNode children을 받아 native optgroup을 만듭니다. 이 둘은 Select anatomy이며 별도의 Atom 개수에 넣지 않습니다.

## Ref와 스타일 대상

| 컴포넌트 | ref / native 속성 대상 | className / style 대상 |
| --- | --- | --- |
| Button | 선택한 root element | 같은 root |
| IconButton | button | button |
| Field | 안쪽 input | 보이는 div wrapper. data-testid도 wrapper |
| Select | 안쪽 select | 보이는 span wrapper |
| Textarea / Checkbox / Radio / Switch / Badge | 각각 native textarea/input/span | 같은 element |

Select의 wrapper는 이번 Shape/Color 이관에서 추가했습니다. 기존 `className`·`style`이 native select를 직접 꾸민다고 가정한 CSS selector는 wrapper 계약에 맞춰 검토해야 합니다. label 연결·폼 제출·value·disabled·ref는 native select에 유지합니다. Select 화살표는 포커스를 받거나 클릭을 가로채지 않습니다.

Layout·Content·Interaction은 native ref를 전달합니다. Label·Spinner·Divider·Link는 현재 별도의 ref forwarding 계약을 제공하지 않습니다. Native 속성의 전달 범위는 각 props 타입을 따릅니다. 특히 Divider는 명시한 세 prop만 제공합니다.

## 상태와 접근성

Button은 loading·disabled일 때 native button을 비활성화합니다. `as`로 다른 element를 렌더하면 aria-disabled와 tabIndex=-1, pointer-events로 차단합니다. 비 native element의 별도 activation handler 계약은 다음 명세 검토 대상입니다.

Field·Textarea의 error status는 aria-invalid도 설정합니다. 설명·오류 문구의 DOM과 aria-describedby는 FormField/useField로 연결하거나 호출자가 직접 조립합니다. Field는 controlled/uncontrolled 입력을 지원하며 clear 후 input 이벤트와 onClear를 전달하고 input으로 포커스를 되돌립니다. Password toggle은 해당 type에서만 표시합니다.

Field·Select·Textarea는 pointer focus와 keyboard focus를 구분하고 keyboard 탐색 때 wrapper 또는 control 바깥에 ring을 표시합니다. Checkbox·Radio·Switch는 native focus·disabled·checked 동작을 유지합니다. Radio group의 이름과 선택 상태, 입력의 accessible label은 소비 화면이 제공합니다.

IconButton의 aria-label은 타입에서 필수입니다. Icon은 자체 label이 없으면 aria-hidden입니다. Badge의 dot과 Select의 화살표도 장식으로 숨깁니다. Spinner는 자체 status label을 제공합니다.

## 테마 도구

ThemeScope와 PaperProvider는 위 17+13 목록과 별도의 테마 도구입니다. ThemeScope는 theme=light/dark/inverse와 children/className을 받으며 display:contents로 부분 테마를 적용합니다. PaperProvider는 앱의 테마 상태와 전역 스타일 연결을 담당합니다.

## 다음 검토에서 결정할 범위

현재 공개 컴포넌트를 유지·통합·제거할지, 각 prop의 책임과 기본값이 적절한지, native 속성과 escape를 어디까지 열지 검토합니다. 특히 Field와 Select의 wrapper 계약, Icon의 크기 이름, loading·disabled의 activation, form의 label·description·error 조립 방식은 명세에서 확정할 항목입니다. 제품별 상위 조합은 반복된 공통 요구가 확인된 뒤 별도로 판단합니다.
