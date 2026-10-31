# Focus

Focus Primitive는 그룹 하나에 Tab 정지 하나를 두는 탐색을 맡는 2차 primitive입니다. RovingFocus는 등록한 항목 중 하나만 Tab 진입점으로 두고 방향키로 실제 DOM focus를 옮깁니다. 선택은 하지 않으므로 색도 선택 상태도 없습니다. 선택을 묶는 [Select](select.md)의 SelectableGroup이 이 위에 섭니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| RovingFocus | useRovingFocusItem | orientation, dir, loop, disabled, currentValue 계열, children(노드 또는 스냅샷 함수) | horizontal / dir 상속 / loop=false. 하나의 Tab 진입점과 DOM focus 이동 |

## 그룹 focus 탐색

[contract:primitives.roving-focus.tab-stop]: #
RovingFocus는 등록한 항목 중 하나만 Tab 진입점으로 유지합니다. 방향키로 실제 DOM focus를 옮기며 Tab은 그룹 밖으로 나갑니다. FocusScope의 contain과는 다른 동작입니다. Item은 native button이며 as로 다른 요소나 ref를 전달하는 컴포넌트를 지정합니다. button이 아닌 태그는 role 없이 그대로 그려지므로 role은 쓰는 쪽이 줍니다. 컴포넌트는 [공통 계약](README.md#공통-계약)의 투영을 따릅니다.

Toolbar의 비활성 항목을 건너뛰고 양 끝에서 순환하는 예시입니다.

```tsx
<RovingFocus role="toolbar" aria-label="서식" loop>
  <RovingFocus.Item value="bold">굵게</RovingFocus.Item>
  <RovingFocus.Item value="italic" disabled>기울임</RovingFocus.Item>
  <RovingFocus.Item as={Pressable} value="underline">밑줄</RovingFocus.Item>
</RovingFocus>
```

| Root 옵션 | 기본값 | 계약 |
| --- | --- | --- |
| orientation | horizontal | horizontal / vertical / both |
| dir | 상속 | ltr / rtl; 줄 때만 DOM에 쓰고, 생략하면 페이지에서 물려받은 방향으로 가로 방향 결정 |
| loop | false | 끝에서 반대쪽으로 순환 |
| disabled | false | 그룹 탐색과 기본 Item 비활성화 |
| currentValue / defaultCurrentValue | 첫 활성 항목 | controlled / uncontrolled Tab 진입점 |
| onCurrentValueChange | 없음 | focus된 항목의 value 전달 |

[contract:primitives.roving-focus.direction]: #
`dir`은 줄 때만 DOM에 쓰고, 가로 방향키는 항목이 서 있는 자리의 방향을 따릅니다 — 가장 가까운 `dir` 속성(`ltr` · `rtl`), 없으면 계산된 `direction`, 그것도 없으면 `ltr`입니다. 그래서 `dir="rtl"`인 조상이나 `<html dir="rtl">` 아래에서는 `dir`을 주지 않아도 ArrowLeft가 다음 항목으로 갑니다. 명시한 `dir`은 물려받은 방향보다 앞섭니다.

[contract:primitives.roving-focus.registry]: #
등록은 RovingFocus root 하나가 가진 항목 목록이 유일한 정본입니다. 이미 등록된 value로 다른 항목이 오면 등록을 거절하고(개발 오류 한 번, 먼저 등록된 쪽이 이깁니다) 거절된 항목은 Tab 진입점이 되지 않으므로 Tab 정지는 늘 하나입니다. 중복 항목을 떼어도 원래 항목의 탐색과 선택은 그대로입니다. SelectableGroup은 같은 목록을 읽어 선택값을 정리합니다. children 함수는 `{ currentValue, isDisabled }`(`RovingFocusState`)를 받습니다.

[contract:primitives.roving-focus.keys]: #
[contract:primitives.roving-focus.removal]: #
Value는 그룹 안에서 고유해야 합니다. Home·End는 첫·마지막 활성 항목으로 이동하고 순서는 현재 DOM을 따릅니다. 현재 항목이 제거되거나 비활성화되면 다음 이웃, 마지막 항목이었다면 이전 이웃으로 이동합니다. 모두 사라지면 root로 옮깁니다. 이미 바깥으로 옮긴 focus는 되돌리지 않습니다. CurrentValue를 외부에서 바꿔도 DOM focus를 강제로 빼앗지 않습니다.

useRovingFocusItem({ value, disabled })은 root 안에서 `itemProps`와 `isCurrent`를 반환합니다. itemProps에는 ref·tabIndex·onFocus·onKeyDown·data-roving-item(값은 항목의 value)이 들어 있어 실제 focus 대상에 펼치고, 외부 ref와는 `mergeRefs`로, 외부 handler와는 `composeEventHandlers`로 잇습니다. isCurrent는 그룹의 Tab 진입점인 항목에서 true입니다. root 밖에서 쓰면 개발 오류입니다. 기본 Item과 disabled를 받는 custom component에는 비활성 상태를 전달하며, 일반 div 같은 custom control의 실행 차단은 해당 구현이 담당합니다. 자손 입력에서 발생한 방향키와 수정키 조합은 가로채지 않습니다. 등록하지 않은 자손의 Tab 진입은 바꾸지 않습니다. Aria-activedescendant·typeahead·위젯별 선택 정책은 상위 컴포넌트가 연결합니다.
