# Calendar · DatePicker

Calendar는 한 달 격자에서 날짜 하나를 고르는 Component이고, DatePicker는 입력 틀 모습의 단추가 Calendar를 팝업으로 여는 Component입니다. 범위는 날짜 하나입니다 — 날짜를 직접 치는 칸, 기간 선택, 시간, 여러 달을 한꺼번에 보이는 것은 이번 판에 없습니다. 키보드 이동 · 포커스 · 달력 계산은 React Aria의 달력에 맡기고([React Aria 경계](../primitives/a11y.md)), 그리는 일은 모두 Paper가 합니다.

| Component | 주요 prop | 기본값 | 책임 |
| --- | --- | --- | --- |
| Calendar | value · defaultValue · onValueChange · min · max · isDateUnavailable · marked · size · shape · disabled · focusOnMount | size xs / shape rounded, 값 없음 | 달 격자 · 달 넘기기 · 날 고르기 · 키보드. 면은 입히지 않음 |
| DatePicker | Calendar의 값 prop들 · placeholder · name · form · status · size · fontSize · shape · variant · fill · shadow · disabled · required | size md / shape rounded / hairline, 비어 있음 | 단추 · 팝업 · 닫을 때 포커스 복귀 · 폼 값 |

## 값

[contract:components.calendar.selection]: #
날짜는 `"YYYY-MM-DD"` 문자열입니다. `value`는 controlled, `defaultValue`는 uncontrolled이고(`null`은 비어 있는 값), 날을 고르면 `onValueChange(value)`가 같은 모양의 문자열로 불립니다. 읽을 수 없는 문자열은 값 없음으로 읽습니다. 고른 날은 primary의 solid 면, 오늘은 면 없이 hairline 선 하나에 굵은 글자이고, 그 밖의 날은 면 없는 ghost입니다. 보이는 달 밖의 칸은 비워 둡니다. 달은 값이 있으면 그 달을, 없으면 오늘의 달을 먼저 보입니다.

[contract:components.calendar.limits]: #
`min` · `max`(같은 문자열)를 벗어난 날과 `isDateUnavailable(date)`가 참이라고 하는 날은 비활성 상태로 그려지고 눌리지 않습니다. 이전 · 다음 단추도 `min` · `max`로 가로막힌 달 쪽에서는 비활성이 됩니다. 비활성 모습은 다른 컨트롤과 같은 disabled 상태입니다.

[contract:components.calendar.range]: #
`min`과 `max`가 둘 다 있으면 그 사이를 soft 띠 하나로 이어 깔아, 열린 날짜 창이 한눈에 보이게 합니다. 칸은 가로로 맞붙어 있어 띠가 끊기지 않고, 띠는 `min`에서 둥글게 시작해 `max`에서 둥글게 닫힙니다. 주가 바뀌는 줄 끝에서는 곧게 잘립니다. 날 단추는 띠 위에 그대로 서서 오늘은 고리, 고른 날은 solid이고, 막아 둔 날은 띠 위에서 비활성으로 보입니다. 한쪽 끝만 있으면 띠를 깔지 않습니다. 그 너머의 날이 모두 칠해지기 때문입니다.

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
