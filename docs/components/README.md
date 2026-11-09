# Overview

Component는 Atom을 조합해 만든, 앱 화면의 한 덩어리입니다. Atom이 한 가지 역할의 컨트롤이라면 Component는 여럿이 함께 서야 뜻이 있는 것 — 내비게이션 사이드바처럼 항목, 묶음, 구분선, 서랍이 한 계약으로 움직이는 부품입니다. Primitive와 Atom 위에 서고, 색은 `primitives/paint/`의 recipe에서만 빌립니다. 패키지는 지금 1개를 공개합니다.

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

[contract:components.sidebar.current]: #
`Sidebar.Item`은 Button 위에 서므로 `as`로 라우터 Link, `a`, `button`을 받습니다. `current`이면 `aria-current="page"`를 달고 variant가 `muted`, 글자가 `strong`이 되며, 아니면 `ghost`입니다. `icon`은 앞에, `badge`는 줄의 끝에 앉습니다. `accent` · `variant` · `shape`(기본 rounded)는 덮어쓸 수 있습니다.

[contract:components.sidebar.rail]: #
breakpoint 이상에서는 레일입니다. `offset` 아래에 sticky로 붙고, 높이는 뷰포트에서 `offset`을 뺀 만큼이며, 넘치면 안에서 스크롤합니다. 레일의 끝 쪽 가장자리에 `border.base` 선 하나가 걸리고 스크롤바는 그 선 안쪽에 앉습니다. 폭은 `width`(Dimension, 기본 `lg`)입니다.

[contract:components.sidebar.drawer]: #
breakpoint 아래에서는 서랍입니다. 같은 폭으로 화면 시작 쪽에 fixed로 서고(RTL에서는 거울처럼 반대편), 닫혀 있으면 화면 밖에 있으면서 `inert`라 포커스도 읽기 도구도 닿지 않습니다. 열리면 제자리로 들어오고 포커스를 서랍 안에 가두며, 닫으면 포커스를 서랍을 연 요소로 돌려줍니다. 열려 있는 동안 페이지 스크롤은 잠기고, 아래 여백은 기기의 safe area를 지킵니다. 움직임은 Motion의 `state` 역할이라 줄인 모션에서도 이동은 남습니다.

[contract:components.sidebar.dismiss]: #
서랍은 Escape, 스크림 누르기, `Sidebar.Item` 누르기 어느 것으로든 `onOpenChange(false)`를 부릅니다. 항목을 누르면 닫히므로 경로가 바뀔 때 따로 닫을 필요가 없습니다. 레일일 때는 항목을 눌러도 아무것도 부르지 않습니다. 열기 버튼은 앱의 것입니다 — `aria-expanded`와 `aria-controls`를 직접 이어 주고, Sidebar는 `id`를 받습니다.

[contract:components.sidebar.offset]: #
`offset`은 위에 놓인 바의 높이(CSS 길이)이고 비우면 0입니다. 값은 CSS 변수 하나로 쓰이고, 레일의 sticky 위치와 서랍의 위쪽과 스크림의 안쪽 가장자리가 모두 이 한 변수를 읽어서 서로 어긋날 수 없습니다.

[contract:components.sidebar.touch]: #
터치 화면(폰은 세워도 눕혀도)에서는 항목이 lg 컨트롤 높이(44px)에 서고 아이콘이 한 단계 커집니다. 글자 크기는 그대로입니다. JavaScript로 prop을 바꾸지 않고 CSS 미디어 쿼리 하나가 컨트롤 크기 변수를 바꾸므로 첫 화면부터 맞습니다. 조건은 Layout의 breakpoint `sm` 아래 또는 `sm` 높이 아래의 coarse pointer입니다.

| prop | 값 | 기본값 |
| --- | --- | --- |
| `label` | 필수. `<nav>`의 이름 | — |
| `open` · `defaultOpen` · `onOpenChange` | 서랍의 열림. 제어와 비제어 모두 | 닫힘 |
| `collapseBelow` | `sm` · `md` · `lg` · `xl` · `never` | `md` |
| `offset` | 위 바의 높이(CSS 길이) | 없음(0) |
| `width` | Dimension | `lg` |
