# Select

Select Primitive는 선택 상태와 그것을 알리는 aria를 맡는 2차 primitive입니다. 선택을 가진 button(Selectable), 선택을 묶는 그룹(SelectableGroup)과 그 hook을 제공합니다. 상태와 aria만 다루고 색은 입히지 않습니다 — 선택된 모습은 `data-selected`를 읽는 쪽의 stylesheet가 그립니다. Selectable은 native button이고 `onClick`으로 선택을 바꾸므로 press를 안에 두지 않습니다. SelectableGroup은 Tab 정지가 하나라 [Focus](focus.md)의 RovingFocus 위에 섭니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Selectable | useSelectable | selected / defaultSelected / onSelectedChange, role, current + native button의 onClick | false, role이 정하는 aria 속성 하나와 data-selected |
| SelectableGroup | useSelectableGroup | selectionMode, selectedValues 계열, selectionRequired, disabled | single / 빈 선택. focus와 선택 분리 |

## Selectable

[contract:primitives.selectable.input-paths]: #
Selectable은 유지되는 boolean 선택 상태를 native button에 연결합니다. selected가 있으면 controlled, defaultSelected를 주면 uncontrolled이며 기본값은 false입니다. 변경 요청은 onSelectedChange(boolean)로 전달합니다. Disabled일 때 입력과 상태 변경을 막습니다.

useSelectable은 SelectableOptions를 받아 isSelected · setSelected(boolean) · toggle() · selectProps를 반환합니다. press는 안에 없습니다 — 호출자가 toggle을 자기 click이나 press에 연결합니다. Selectable은 `useSelectable`과 `<button type="button">`을 묶은 컴포넌트이고, `onClick`에서 선택을 바꿉니다. children 함수는 `{ isSelected, isDisabled }`(`SelectableState`)를 받습니다. 호출자의 `onClick`이 먼저 실행되고 그다음에 선택이 바뀌어 `onSelectedChange`가 불리며, 호출자가 `onClick`에서 `preventDefault()`를 부르면 선택은 바뀌지 않습니다([합성 도구](README.md#합성-도구)). 선택은 role이 정하는 aria 속성 하나와 `data-selected`로 알립니다. `current`를 주면 선택된 동안 `aria-current`만 답니다.

| role | 선택을 알리는 속성 |
| --- | --- |
| radio · checkbox · switch · menuitemradio · menuitemcheckbox | `aria-checked` |
| tab · option · gridcell · row · treeitem | `aria-selected` |
| 그 밖의 role, 또는 role 없음 | `aria-pressed` |
| `current`(`page` · `step` · `location` · `date` · `time` · `true`) | `aria-current` 하나 |

Controlled selectable을 만드는 예시입니다.

```tsx
<Selectable selected={selected} onSelectedChange={setSelected}>
  {({ isSelected }) => isSelected ? "선택됨" : "선택 안 됨"}
</Selectable>
```

`as`로 다른 대상을 고를 수 있고 [공통 계약](README.md#공통-계약)의 투영을 따릅니다. `<Selectable as="div">`는 `role="button"`과 tabIndex 0, `aria-pressed`를 얻고 Enter · Space로도 눌립니다. 비활성이면 대상에 `data-disabled`가 붙고 native로 막을 수 없는 대상은 클릭과 키를 받지 않습니다.

Selectable은 click만 받는 native button이라 `onPress`와 `data-active` · `data-focus-visible`이 없고, Safari에서는 마우스·터치 뒤의 focus도 없습니다. 이것들이 필요하면 [Press](press.md)의 Pressable에 `as`로 올립니다.

```tsx
<Pressable as={Selectable} onPress={log} defaultSelected>
  {({ isActive }) => isActive ? "누르는 중" : "선택"}
</Pressable>
```

요소는 하나이고 press 장치도 하나입니다. Pressable이 낸 click을 Selectable이 받아 선택을 한 번만 바꿉니다(press 한 번은 늘 click 한 번입니다). Pressable의 children 함수는 `PressableState`만 받으므로 선택 상태는 `data-selected`나 `aria-*`, 또는 제어하는 쪽의 `selected`로 읽습니다. `disabled`는 Selectable의 native button까지 전달됩니다.

직접 구현한 요소에 선택을 연결하는 예시입니다.

```tsx
const { selectProps, isSelected, toggle } = useSelectable({ role: "tab" });
const { pressProps } = usePressable({ onPress: toggle });

return <button {...pressProps} {...selectProps} role="tab" type="button">홈</button>;
```

이 기반은 role만 바꿀 뿐 위젯의 의미론을 대신하지 않습니다. Checkbox · Radio · Switch처럼 native 입력이 있는 위젯은 native 의미론을 지키고 `useFocusRing` · `useFormFieldControl` hook만 씁니다. 그룹 선택 정책은 [SelectableGroup](#selectablegroup)이나 상위 컴포넌트가 연결합니다. 선택의 색은 Select가 입히지 않습니다 — `data-selected`를 읽는 쪽이 입힙니다.

## SelectableGroup

SelectableGroup은 Selectable들의 선택 상태와 [RovingFocus](focus.md)를 연결합니다. 항목 목록은 RovingFocus 등록부 하나뿐이라 SelectableGroup은 자기 목록을 두지 않고, 같은 value의 항목은 먼저 등록된 쪽만 인정합니다([Focus](focus.md#그룹-focus-탐색)). children은 노드이거나 `{ selectedValues, isDisabled }`(`SelectableGroupState`)를 받는 함수입니다. Item은 Selectable이라 role을 주면(`role="radio"` 등) 그 role의 aria 속성으로 선택을 알리고, 주지 않으면 aria-pressed를 가진 button입니다. 방향키는 focus만 이동하고 선택은 click으로 변경합니다. Radio · Tab · Option의 의미론은 role을 주는 쪽이 책임집니다.

Controlled 단일 선택 그룹을 만드는 예시입니다.

```tsx
<SelectableGroup aria-label="정렬" selectedValues={alignment}
  onSelectedValuesChange={setAlignment} selectionRequired>
  <SelectableGroup.Item value="left">왼쪽</SelectableGroup.Item>
  <SelectableGroup.Item value="center">가운데</SelectableGroup.Item>
</SelectableGroup>
```

[contract:primitives.selectable-group.single]: #
[contract:primitives.selectable-group.multiple]: #
selectionMode는 single / multiple이며 기본값은 single입니다. selectedValues/defaultSelectedValues는 문자열 배열이고 onSelectedValuesChange는 다음 배열을 받습니다. Single은 최대 하나를 선택합니다. selectionRequired는 사용자가 마지막 선택을 해제하는 것을 막으며 초기 항목을 자동 선택하지는 않습니다. 선택 항목 자체를 제거하면 빈 선택도 허용합니다.

Root disabled는 전체 입력과 변경을 막고 Item disabled는 해당 버튼만 막습니다. Disabled는 기존 선택을 지우지 않습니다. 제거된 value는 정리하며 controlled 상태에서는 변경을 요청합니다. 중복 value를 사용하지 않습니다(개발 오류이고 한 항목만 인정합니다). Root의 orientation·dir·loop·currentValue 계약은 [RovingFocus](focus.md#그룹-focus-탐색)와 같습니다.

useSelectableGroup은 같은 상태 옵션과 선택적인 values 목록을 받고 selectedValues·isValueSelected(value)·setValueSelected(value, boolean)·toggleValue(value)을 반환합니다. 같은 상태가 한 요소(`useSelectable`)에도 있어서 이름을 갈랐습니다. Values를 제공하면 없는 key를 정리합니다. Hook 자체는 DOM·role·focus를 만들지 않습니다.
