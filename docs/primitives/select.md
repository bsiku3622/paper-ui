# Select

Select Primitive는 선택 상태와 그것을 알리는 aria를 맡는 2차 primitive입니다. 선택을 가진 button(Selectable), 선택을 묶는 그룹(SelectableGroup)과 그 hook을 제공합니다. 상태와 aria만 다루고 색은 입히지 않습니다 — 선택된 모습은 `data-selected`를 읽는 쪽의 stylesheet가 그립니다. Selectable과 SelectableGroup.Item은 눌리는 대상이라 [Press](press.md) 위에 서고, SelectableGroup은 Tab 정지가 하나라 [Focus](focus.md)의 RovingFocus 위에 섭니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Selectable | useSelectable | selected / defaultSelected / onSelectedChange, role, current + Pressable | false, role이 정하는 aria 속성 하나와 data-selected |
| SelectableGroup | useSelectableGroup | selectionMode, selectedValues 계열, selectionRequired, disabled | single / 빈 선택. focus와 선택 분리 |

## Selectable

[contract:primitives.selectable.input-paths]: #
Selectable은 유지되는 boolean 선택 상태를 native button에 연결합니다. selected가 있으면 controlled, defaultSelected를 주면 uncontrolled이며 기본값은 false입니다. 변경 요청은 onSelectedChange(boolean)로 전달합니다. Disabled일 때 입력과 상태 변경을 막습니다.

useSelectable은 SelectableOptions를 받아 isSelected · setSelected(boolean) · toggle() · selectProps를 반환합니다. press는 안에 없습니다 — 호출자가 toggle을 자기 press에 연결합니다. Selectable은 Pressable과 useSelectable을 묶은 컴포넌트이고, children 함수에는 Pressable 상태와 isSelected를 함께 전달합니다. 선택은 role이 정하는 aria 속성 하나와 `data-selected`로 알립니다. `current`를 주면 선택된 동안 `aria-current`만 답니다.

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

직접 구현한 요소에 선택을 연결하는 예시입니다.

```tsx
const { selectProps, isSelected, toggle } = useSelectable({ role: "tab" });
const { pressProps } = usePressable({ onPress: toggle });

return <button {...pressProps} {...selectProps} role="tab" type="button">홈</button>;
```

이 기반은 role만 바꿀 뿐 위젯의 의미론을 대신하지 않습니다. Checkbox · Radio처럼 native 입력이 있는 위젯은 그 입력을 쓰고, 그룹 선택 정책은 [SelectableGroup](#selectablegroup)이나 상위 컴포넌트가 연결합니다. 각 Atom을 자동으로 이 button으로 바꾸지 않습니다. 선택의 색은 Select가 입히지 않습니다 — `data-selected`를 읽는 쪽이 입힙니다.

## SelectableGroup

SelectableGroup은 Selectable들의 선택 상태와 [RovingFocus](focus.md)를 연결합니다. Item은 Selectable이라 role을 주면(`role="radio"` 등) 그 role의 aria 속성으로 선택을 알리고, 주지 않으면 aria-pressed를 가진 button입니다. 방향키는 focus만 이동하고 선택은 press로 변경합니다. Radio · Tab · Option의 의미론은 role을 주는 쪽이 책임집니다.

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

Root disabled는 전체 입력과 변경을 막고 Item disabled는 해당 버튼만 막습니다. Disabled는 기존 선택을 지우지 않습니다. 제거된 value는 정리하며 controlled 상태에서는 변경을 요청합니다. 중복 value를 사용하지 않습니다. Root의 orientation·dir·loop·currentValue 계약은 [RovingFocus](focus.md#그룹-focus-탐색)와 같습니다.

useSelectableGroup은 같은 상태 옵션과 선택적인 values 목록을 받고 selectedValues·isSelected(value)·setSelected(value, boolean)·toggle(value)을 반환합니다. Values를 제공하면 없는 key를 정리합니다. Hook 자체는 DOM·role·focus를 만들지 않습니다.
