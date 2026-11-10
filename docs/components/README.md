# Overview

Component는 Atom과 Primitive를 엮어 한 가지 일을 끝내는 완성 부품입니다. Atom이 한 가지 역할의 컨트롤이라면 Component는 여럿이 함께 서야 뜻이 있는 것입니다. 항목 · 묶음 · 서랍이 한 계약으로 움직이는 사이드바, 격자와 팝업이 함께 움직이는 날짜 선택이 그렇습니다. 색 · 선 · 크기는 새로 만들지 않고 Foundations의 역할과 Atom의 축을 그대로 쓰며, 색은 `primitives/paint/`의 recipe에서만 빌립니다. 패키지는 지금 5개를 공개합니다.

| Component | 하는 일 | 문서 |
| --- | --- | --- |
| Sidebar | 넓은 화면에서는 레일, 좁은 화면에서는 서랍이 되는 내비게이션 | [아래](#sidebar) |
| Calendar | 한 달 격자에서 날짜 하나를 고름 | [Calendar · DatePicker](date-picker.md) |
| DatePicker | 입력 틀 모습의 단추가 Calendar를 팝업으로 엶 | [Calendar · DatePicker](date-picker.md) |
| RangeCalendar | 한 달 격자에서 기간(시작과 끝)을 고름 | [Calendar · DatePicker](date-picker.md#기간) |
| DateRangePicker | 입력 틀 모습의 단추가 RangeCalendar를 팝업으로 엶 | [Calendar · DatePicker](date-picker.md#기간) |

## Sidebar

Sidebar는 내비게이션 `<nav>`입니다. 넓은 화면에서는 화면 옆에 붙어 따라오는 레일이고, `collapseBelow` breakpoint 아래에서는 스크림과 함께 미끄러져 나오는 서랍이 됩니다. 항목(`Sidebar.Item`)과 묶음(`Sidebar.Group`), 구분선(`Sidebar.Divider`), 아래에 고정되는 자리(`Sidebar.Footer`)로 짭니다.

```tsx
import { useState } from "react";
import { Icon, IconButton, Sidebar } from "@studio-baeks/paper-ui";

export function Shell({ upload }: { upload: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton aria-label="메뉴" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
        <Icon><path d="M4 6h16M4 12h16M4 18h16" /></Icon>
      </IconButton>

      <Sidebar id="main-nav" label="Main" open={open} onOpenChange={setOpen} offset="3.5rem">
        <Sidebar.Group title="Printer">
          <Sidebar.Item as="a" href="/" current icon={<Icon><path d="M4 11 12 4l8 7v9H4z" /></Icon>}>Dashboard</Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Divider />
        <Sidebar.Footer>
          <Sidebar.Item onClick={upload}>Upload</Sidebar.Item>
        </Sidebar.Footer>
      </Sidebar>
    </>
  );
}
```

[contract:components.sidebar.landmark]: #
뿌리는 `label`로 이름을 받는 `<nav>`이고 ref를 그대로 전달합니다. 제목을 준 `Sidebar.Group`은 `role="group"`이며 그 제목이 이름이 됩니다. 제목이 없는 Group은 항목을 쌓는 래퍼일 뿐이라 role이 없습니다.

[contract:components.sidebar.fold]: #
`Sidebar.Group`에 `collapsible`을 주면 제목은 그대로 글자로 남고, 제목 줄 끝에 작은 ghost 아이콘 버튼(xs)이 붙어 접습니다. 제목이 꼭 있어야 하고, 없으면 개발 중에 오류를 냅니다. 버튼은 제목이 이름(`aria-labelledby`)이 되고, `aria-expanded`와 `aria-controls`로 항목 목록에 이어지며, 안의 화살표는 열리면 아래를, 접히면 끝 쪽(RTL에서는 반대)을 가리킵니다(줄어든 모션에서도 돌아갑니다). 제목 줄 높이는 이 버튼의 높이이고 제목 글자는 항목 글자와 같은 선에서 시작합니다. 접힌 목록은 `hidden`이라 항목이 탭 순서와 접근성 트리에서 빠집니다. `open` · `defaultOpen`(기본 열림) · `onOpenChange`로 제어와 비제어 모두 쓸 수 있습니다. `collapsible`이 아닌 Group은 그대로 제목만 있는 `role="group"`입니다.

[contract:components.sidebar.current]: #
`Sidebar.Item`은 Button 위에 서므로 `as`로 라우터 Link, `a`, `button`을 받습니다. `current`이면 `aria-current="page"`를 달고 variant가 `muted`, 글자가 `strong`이 되며, 아니면 `ghost`에 보통 굵기입니다. 크기는 Sidebar의 `size`(기본 `sm`, 36)를 따릅니다. `icon`은 앞에, `badge`는 줄의 끝에 앉습니다. `accent` · `variant` · `shape`(기본 rounded)는 덮어쓸 수 있습니다.

[contract:components.sidebar.rail]: #
breakpoint 이상에서는 레일입니다. `offset` 아래에 sticky로 붙고, 높이는 뷰포트에서 `offset`을 뺀 만큼이며, 넘치면 안에서 스크롤합니다. 레일의 끝 쪽 가장자리에 `border.base` 선 하나가 걸리고 스크롤바는 그 선 안쪽에 앉습니다. 폭은 `width`(Dimension, 기본 `lg`)입니다.

[contract:components.sidebar.drawer]: #
breakpoint 아래에서는 서랍입니다. `collapseBelow="always"`면 폭과 상관없이 늘 서랍이라, 메뉴 버튼으로만 여는 앱이나 틀 안의 미리보기에 씁니다. 화면 시작 쪽에 fixed로 서고(RTL에서는 거울처럼 반대편), 폭은 레일보다 좁아지지 않는 선에서 화면 끝에 `layout.gap.3xl`(48)을 남기며 `dimension.width.xl`(360)까지 넓어집니다 — 폰에서는 화면 대부분을 쓰고, 남은 띠는 눌러서 닫는 스크림입니다. 닫혀 있으면 화면 밖에 있으면서 `inert`라 포커스도 읽기 도구도 닿지 않습니다. 열리면 제자리로 들어오고 포커스를 서랍 안에 가두며, 닫으면 포커스를 서랍을 연 요소로 돌려줍니다. 열려 있는 동안 페이지 스크롤은 잠기고, 아래 여백은 기기의 safe area를 지킵니다. 움직임은 Motion의 `state` 역할이라 줄인 모션에서도 이동은 남습니다.

[contract:components.sidebar.dismiss]: #
서랍은 Escape, 스크림 누르기, `Sidebar.Item` 누르기 어느 것으로든 `onOpenChange(false)`를 부릅니다. 항목을 누르면 닫히므로 경로가 바뀔 때 따로 닫을 필요가 없습니다. 레일일 때는 항목을 눌러도 아무것도 부르지 않습니다. 열기 버튼은 앱의 것입니다 — `aria-expanded`와 `aria-controls`를 직접 이어 주고, Sidebar는 `id`를 받습니다.

[contract:components.sidebar.offset]: #
`offset`은 위에 놓인 바의 높이(CSS 길이)이고 비우면 0입니다. 값은 CSS 변수 하나로 쓰이고, 레일의 sticky 위치와 서랍의 위쪽과 스크림의 안쪽 가장자리가 모두 이 한 변수를 읽어서 서로 어긋날 수 없습니다.

| prop | 값 | 기본값 |
| --- | --- | --- |
| `label` | 필수. `<nav>`의 이름 | — |
| `open` · `defaultOpen` · `onOpenChange` | 서랍의 열림. 제어와 비제어 모두 | 닫힘 |
| `collapseBelow` | `sm` · `md` · `lg` · `xl` · `never` · `always` | `md` |
| `offset` | 위 바의 높이(CSS 길이) | 없음(0) |
| `width` | Dimension | `lg` |
| `size` | 모든 `Sidebar.Item`의 컨트롤 크기. 레일 안쪽 여백은 `sm` | `sm` |
| `Sidebar.Group` `collapsible` | 제목 줄 끝에 접는 아이콘 버튼이 붙음. `title` 필수 | 아님 |
| `Sidebar.Group` `open` · `defaultOpen` · `onOpenChange` | `collapsible`일 때 접힘 상태. 제어와 비제어 모두 | 열림 |
