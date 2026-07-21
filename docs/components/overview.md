# 컴포넌트

스무 개입니다. 각 컴포넌트를 눈으로 훑고 prop을 만져보려면 [플레이그라운드](/playground)로 가세요 — 이 문서는 무엇이 있고 어느 레이어에 사는지를 잡아줍니다.

레이어는 자기보다 아래만 씁니다. `Tokens → Primitives → Atoms → Molecules → Components`.

## Primitives (4)

raw HTML을 렌더하는 유일한 레이어입니다.

- **Box** — 면 하나. `paper`(면색) · `ink`(잉크) · 간격 · `radius` · `shadow`를 말할 수 있습니다. `as`로 어떤 태그든 되지만, 상위 레이어가 raw 태그에 닿는 유일한 통로이기도 합니다.
- **Stack** — 세로로 쌓습니다.
- **Inline** — 가로로 늘어놓습니다. `justify` · `align` · `wrap`.
- **Text** — 여섯 variant로 위계를 정합니다. `variant`가 크기·굵기·서체·잉크를 한 번에 결정합니다.

## Atoms (9)

단일 컨트롤·표시 단위입니다.

- **Button** — `solid`(검정 채움) · `outline` · `quiet` 3종 + `danger`.
- **Field** — 한 줄 입력. 옅은 면으로 정의되고, 포커스 때만 파란 링.
- **Label** · **Checkbox** · **Icon** · **Divider** · **Link**(파랑).
- **Badge** — 상태 한 낱말. `status`를 주면 옅은 색 면(wash)이 붙습니다.
- **Select** — native `<select>`를 종이 결로 감싼 것.

## Molecules (4)

Primitive + Atom 합성입니다.

- **Card** — 옅은 면으로 정의되는 칸. 선도 그림자도 없습니다.
- **TextField** — Label + Field + 도움말 한 묶음. id 연결을 대신합니다.
- **Tabs** — 세그먼트 컨트롤. 활성은 흰 pill.
- **Tooltip** — 잠깐 뜨는 쪽지. 위 공간이 없으면 자동으로 아래로 뒤집습니다.

## Components (3)

복잡한 상태를 가질 수 있는 고수준 UI입니다.

- **Table** — column을 data로 받습니다. `numeric` 열은 mono·우측정렬이 자동입니다.
- **Modal** — 떠 있는 것만 그림자를 갖습니다. Esc로 닫힙니다.
- **Navbar** — 지면 맨 위 한 줄.

## 스무 개인 이유

늘리려면 *실제 화면에서 두 번 이상 필요했다는 증거*가 있어야 합니다. "있으면 좋을 것 같아서"는 증거가 아닙니다. Avatar가 필요하면 Box 조합으로 이니셜 원을 만들 수 있고(데모가 그렇게 합니다), Popover가 필요하면 그게 정말 두 번 이상 나왔는지 먼저 봅니다. 선택지를 늘리는 방향은 시스템의 목표에 역행한다고 봅니다 — 자세히는 [원칙](../get-started/principles.md)의 "고를 것을 줄인다".
