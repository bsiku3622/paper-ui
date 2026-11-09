# Calendar · DatePicker

Calendar는 한 달 격자에서 날짜 하나를 고르는 Component이고, DatePicker는 입력 틀 모습의 단추가 Calendar를 팝업으로 여는 Component입니다. 같은 짝이 기간에도 있습니다 — RangeCalendar와 DateRangePicker([기간](#기간))입니다. 날짜를 직접 치는 칸, 시간, 여러 달을 한꺼번에 보이는 것은 이번 판에 없습니다. 키보드 이동 · 포커스 · 달력 계산은 React Aria의 달력에 맡기고([React Aria 경계](../primitives/a11y.md)), 그리는 일은 모두 Paper가 합니다.

| Component | 주요 prop | 기본값 | 책임 |
| --- | --- | --- | --- |
| Calendar | value · defaultValue · onValueChange · min · max · isDateUnavailable · marked · size · shape · disabled · focusOnMount | size xs / shape rounded, 값 없음 | 달 격자 · 달 넘기기 · 날 고르기 · 키보드. 면은 입히지 않음 |
| DatePicker | Calendar의 값 prop들 · placeholder · name · form · status · size · fontSize · shape · variant · fill · shadow · disabled · required | size md / shape rounded / hairline, 비어 있음 | 단추 · 팝업 · 닫을 때 포커스 복귀 · 폼 값 |
| RangeCalendar | Calendar와 같으나 값이 `{ start, end }` | size xs / shape rounded, 값 없음 | 시작과 끝 두 번 누르기 · 이어진 띠 · 미리 보기. 면은 입히지 않음 |
| DateRangePicker | RangeCalendar의 값 prop들 · placeholder · startName · endName · form · DatePicker의 축들 · required | DatePicker와 같음 | 단추 · 팝업 · 끝을 고르면 닫고 포커스 복귀 · 폼 값 둘 |

## 값

[contract:components.calendar.selection]: #
날짜는 `"YYYY-MM-DD"` 문자열입니다. `value`는 controlled, `defaultValue`는 uncontrolled이고(`null`은 비어 있는 값), 날을 고르면 `onValueChange(value)`가 같은 모양의 문자열로 불립니다. 읽을 수 없는 문자열은 값 없음으로 읽습니다. 고른 날은 primary의 solid 면, 오늘은 면 없이 hairline 선 하나에 굵은 글자이고, 그 밖의 날은 면 없는 ghost입니다. 보이는 달 밖의 칸은 비워 둡니다. 달은 값이 있으면 그 달을, 없으면 오늘의 달을 먼저 보입니다.

[contract:components.calendar.limits]: #
`min` · `max`(같은 문자열)를 벗어난 날과 `isDateUnavailable(date)`가 참이라고 하는 날은 비활성 상태로 그려지고 눌리지 않습니다. 이전 · 다음 단추도 `min` · `max`로 가로막힌 달 쪽에서는 비활성이 됩니다. 비활성 모습은 다른 컨트롤과 같은 disabled 상태입니다. `min`과 `max`는 한계일 뿐이라 그 사이를 따로 칠하지 않습니다.

[contract:components.calendar.marked]: #
`marked`는 날짜 문자열의 목록이고, 그 날의 숫자 아래 칸 바닥 가까이에 4px 점이 붙습니다. 점은 Badge의 `dot`과 같은 칠을 쓰고 글자색을 따라가므로 고른 날 위에서도 읽힙니다. 점은 눈으로만 알리는 장식(`aria-hidden`)이라, 점이 뜻하는 바를 읽어 줘야 하는 화면은 날 옆에 글로 적습니다.

## 키보드와 locale

[contract:components.calendar.keyboard]: #
날 하나만 탭 정지이고, 안에서는 방향키가 하루 · 한 주씩, PageUp · PageDown이 한 달씩, Home · End가 그 달의 첫날과 끝날로 옮깁니다. Enter와 Space가 고릅니다. 달을 넘어가면 보이는 달도 따라가고, 이전 · 다음 단추가 있는 머리는 Tab으로 닿습니다.

[contract:components.calendar.locale]: #
달 이름 · 요일 이름 · 한 주의 시작 · 날의 이름표(`aria-label`)는 [PaperProvider](../primitives/README.md)의 `locale`(없으면 문서의 `lang`)을 따릅니다. `ko`는 일요일 시작, `en-GB`는 월요일 시작입니다. 이전 · 다음 단추의 이름도 locale 문구이고 Paper의 `messages` 목록에는 없습니다. 날짜 표기는 `Intl`이 정합니다.

## 모양

[contract:components.calendar.layout]: #
날 칸은 Control의 icon anatomy라 `size`의 사다리를 그대로 따릅니다 — 기본은 xs(32)이고, 머리의 이전 · 다음 `IconButton`(`muted`)도 같은 size입니다. `shape`는 앱의 [controlShape](../foundations/shape.md)를 따르고 기본은 rounded입니다. Calendar는 면을 입히지 않는 격자라서, 카드에 놓을 때는 부모가 면을 정합니다(DatePicker의 팝업은 raised 면). `ref`는 바깥 요소로, `className` · `data-testid`와 나머지 attribute는 같은 요소로 갑니다. `disabled`면 날과 단추가 모두 비활성이 됩니다.

## DatePicker

[contract:components.date-picker.trigger]: #
단추는 [Field · Select](../atoms/README.md#공통-축)와 같은 입력 틀에 고른 날을 locale의 medium 날짜(`Intl.DateTimeFormat`, 예 `Nov 20, 2026` · `2026. 11. 20.`)로 적고 오른쪽에 달력 아이콘을 둡니다. 값이 없으면 `placeholder`를 tertiary 잉크로 적고, 주지 않으면 비워 둡니다. 단추는 `aria-haspopup="dialog"`와 `aria-expanded`를 알리고, 열리면 `aria-controls`가 팝업의 id를 가리킵니다. 팝업의 이름은 단추의 `aria-label`이나 연결된 `<label>`의 글자입니다. 열리면 포커스가 Calendar의 고른 날(없으면 오늘)로 갑니다.

[contract:components.date-picker.pick]: #
팝업은 [Floating](../primitives/float.md)의 popover(role dialog)이고 raised 면에 Calendar를 담습니다. 날을 고르면 값이 정해지고 `onValueChange`가 불리며 팝업이 닫히고 포커스가 단추로 돌아옵니다. Escape와 바깥 누름은 값을 바꾸지 않고 닫습니다. `min` · `max` · `isDateUnavailable` · `marked`는 Calendar로 전해집니다. `value`가 있으면 앱이 값을 쥐고, 고른 날은 `onValueChange`로만 알립니다.

[contract:components.date-picker.form]: #
`name`을 주면 숨은 입력이 ISO 값을 폼에 실어 보내고(`form`으로 다른 폼에 붙일 수도 있습니다), 값이 없으면 빈 문자열입니다. `required`인 빈 DatePicker는 폼 검사에서 값 없음이고, 브라우저가 가리키는 포커스는 단추로 옵니다. 폼이 reset되면 `defaultValue`로 돌아갑니다. `disabled`면 열리지 않고 값도 보내지 않습니다. [FormField](../primitives/field.md) 안에서는 `id` · `disabled` · `required` · `aria-invalid` · `aria-describedby`와 상태 가장자리를 Field처럼 받습니다.

[contract:components.date-picker.layout]: #
`status` · `size` · `fontSize` · `shape` · `variant` · `fill` · `shadow`는 Field · Select와 같은 축이고 같은 뜻입니다. `ref`는 단추로, `className` · `style` · `data-testid`는 입력 틀(바깥 요소)로 갑니다. 폭은 부모를 가득 채우므로 앱이 정합니다.

```tsx
<DatePicker
  aria-label="마감일"
  name="due"
  min="2026-11-01"
  marked={["2026-11-12"]}
  onValueChange={save}
/>
```

## 기간

[contract:components.range-calendar.selection]: #
RangeCalendar는 Calendar와 같은 격자에서 기간을 고릅니다. 값은 `{ start, end }`(둘 다 `"YYYY-MM-DD"`)이고 `null`은 비어 있는 값이며, `value` · `defaultValue` · `onValueChange`가 Calendar와 같은 짝입니다. 첫 번째 누름이 시작이고 두 번째가 끝입니다 — 두 번째가 더 이르면 두 날이 자리를 바꾸고, 같은 날을 두 번 누르면 하루짜리 기간입니다. `onValueChange`는 끝이 정해진 때 한 번만 불리고, 시작만 정한 사이에는 불리지 않습니다. `value`가 있으면 앱이 값을 쥡니다.

[contract:components.range-calendar.band]: #
시작부터 끝까지(양끝 포함) soft 띠 하나가 이어집니다. 칸이 가로로 맞붙어 띠가 끊기지 않고, 주가 바뀌는 줄 끝에서는 곧게 잘립니다. 시작과 끝 날은 solid이고 바깥쪽 모서리는 둥글며 띠와 만나는 안쪽 모서리는 각이 져서 띠에 이어 붙습니다. 하루짜리 기간은 사방이 둥글습니다. 오늘이 끝 날이 아니면 오늘의 고리가 띠 위에 그대로 남고, `marked`의 점도 띠 위에서 같은 자리에 붙습니다.

[contract:components.range-calendar.preview]: #
끝을 기다리는 동안에는 시작 날부터 포인터나 포커스가 닿은 날까지 띠가 미리 그려지고, 그 날이 시작보다 이르면 띠도 거꾸로 뻗습니다. 키보드로 시작을 정하면 포커스가 하루 앞으로 옮겨 가 띠가 바로 보이고, 방향키로 끝을 고른 뒤 Enter로 정합니다. 미리 보기는 값이 아니라서 `onValueChange`를 부르지 않습니다.

[contract:components.range-calendar.limits]: #
`min` · `max`를 벗어난 날과 `isDateUnavailable`이 참이라고 하는 날은 Calendar처럼 비활성이고 시작으로도 끝으로도 눌리지 않습니다. 사이에 막힌 날이 끼는 기간은 이어 고를 수 없습니다.

[contract:components.range-calendar.layout]: #
`size` · `shape` · `disabled` · `marked` · ref · `className`은 Calendar와 같은 뜻입니다. `focusOnMount`이면 포커스가 값의 시작 날(없으면 오늘)로 갑니다.

[contract:components.date-range-picker.trigger]: #
단추는 DatePicker와 같은 입력 틀에 기간을 locale의 medium 날짜 범위(`Intl.DateTimeFormat`의 `formatRange`, 예 `Nov 5 – 12, 2026` · `2026. 11. 5. ~ 2026. 12. 12.`)로 한 줄에 적고, 하루짜리면 날짜 하나로 적습니다. 값이 없으면 `placeholder`입니다. `aria-haspopup="dialog"` · `aria-expanded` · `aria-controls`는 DatePicker와 같고, 열리면 포커스가 RangeCalendar의 시작 날로 갑니다.

[contract:components.date-range-picker.pick]: #
팝업은 DatePicker와 같은 Floating popover입니다. 첫 번째 누름에는 열려 있고, 두 번째로 끝이 정해지면 값이 정해지고 `onValueChange`가 불리며 팝업이 닫히고 포커스가 단추로 돌아옵니다. Escape와 바깥 누름은 값을 바꾸지 않고 닫습니다. `min` · `max` · `isDateUnavailable` · `marked`는 RangeCalendar로 전해지고, `value`가 있으면 앱이 값을 쥡니다.

[contract:components.date-range-picker.form]: #
`startName` · `endName`을 주면 숨은 입력 둘이 각각 ISO 날짜를 폼에 실어 보내고(`form`으로 다른 폼에 붙일 수 있고), 값이 없으면 빈 문자열입니다. `required`인 빈 DateRangePicker는 폼 검사에서 값 없음이며 브라우저가 가리키는 포커스는 단추로 옵니다. 폼이 reset되면 `defaultValue`로 돌아가고, `disabled`면 열리지 않고 값도 보내지 않습니다. [FormField](../primitives/field.md) 안에서는 DatePicker처럼 `id` · `disabled` · `required` · `aria-invalid` · `aria-describedby`를 받습니다.

[contract:components.date-range-picker.layout]: #
`status` · `size` · `fontSize` · `shape` · `variant` · `fill` · `shadow`는 DatePicker와 같은 축이고 같은 뜻입니다. ref는 단추로, `className` · `style` · `data-testid`는 입력 틀로 갑니다.

```tsx
<DateRangePicker
  aria-label="숙박 기간"
  startName="from"
  endName="to"
  defaultValue={{ start: "2026-11-05", end: "2026-11-12" }}
  onValueChange={save}
/>
```
