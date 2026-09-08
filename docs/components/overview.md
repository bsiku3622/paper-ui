# Overview

스물일곱 개입니다. 한 화면에서 훑으려면 [플레이그라운드](/playground)로, 한 컴포넌트의 prop을 토글하며 코드까지 보려면 사이드바에서 그 컴포넌트의 상세(`/playground/<이름>`)로 들어가세요 — 이 문서는 무엇이 있고 어느 레이어에 사는지를 잡아줍니다.

레이어는 자기보다 아래만 씁니다. `Tokens → Primitives → Atoms → Molecules → Components`.

## Primitives (4)

raw HTML을 렌더하는 유일한 레이어입니다.

- **Box** — 면 하나. `surface`(면 깊이) · `border`(헤어라인) · `inverse`(검은 판) · 간격 · `radius` · `shadow`를 말할 수 있습니다 — 색·잉크는 없습니다(면은 색을 채우지 않는다). `as`로 어떤 태그든 되지만, 상위 레이어가 raw 태그에 닿는 유일한 통로이기도 합니다.
- **Stack** — 세로로 쌓습니다. `gap`.
- **Inline** — 가로로 늘어놓습니다. `gap` · `justify` · `align` · `wrap`.
- **Text** — 일곱 variant로 위계를 정합니다. `variant`가 크기·굵기·잉크(농도·의미색)를 한 번에 정하고, 서체는 별도의 `family` 축(sans·mono)으로 어느 variant에도 교차합니다. 제목 위계가 셋(title·heading·subheading = h1·h2·h3)입니다.

## Atoms (13)

단일 컨트롤·표시 단위입니다.

- **Button** — `color`(primary + `info`·`success`·`warning`·`error`) × `variant`(시각 무게: `solid`·`soft`·`outline`·`quiet`) 두 축이 직교합니다. 흰/회색 기본 버튼은 색이 아니라 primary 의 무게(`outline`·`soft`)로 나오고, solid 는 모노크로매틱(진한 채움 + 옅은 같은 색 글자)입니다. 큰 면을 채우는 색은 검정(primary)뿐, accent 는 뜻을 질 때만. `shape="pill"`로 알약이 되는데, 곡선의 크기를 고르는 게 아니라 알약이냐 아니냐만 고릅니다 — 화면에서 가장 중요한 행동 한둘에 씁니다. 누르면 이동하는 자리라면 `as`로 태그를 갈아 끼웁니다(`<Button as={Link} to="/docs">`). 버튼을 링크로 감싸면 `<a>` 안에 `<button>`이 들어가 탭이 같은 자리에서 두 번 멈추고, 포커스 링도 두 모양으로 잡힙니다.
- **Field** — 한 줄 입력 그룹. 상태는 `status` 축 하나로(invalid boolean 아님), 양옆에 `leading`/`trailing` 어도먼트(아이콘·$·단위)와 `clearable`(×)·`showPasswordToggle`(👁). 포커스 때만 파란 링.
- **Textarea** — 여러 줄 입력. Field와 같은 `status` 축, 세로로만 resize.
- **Select** — native `<select>`를 종이 결로 감싼 것.
- **Checkbox** · **Switch**(켬/끔 토글) · **Radio**(하나 고르기) — 켜지면 검정(색이 아니라 primary).
- **Label** · **Icon** · **Divider** · **Link**(파랑).
- **Badge** — 짧은 표식. Button과 같은 `color × variant`(기본 `soft`) + `dot`(상태 점). `solid`=카운트·강조, `outline`=테두리 태그, `quiet`=글자만. Button과 같은 `shape="pill"`을 받아 두 알약이 나란히 서도 곡선이 갈리지 않습니다.
- **Spinner** — 진행 중 표시. 주기는 motion 토큰.

## Molecules (6)

Primitive + Atom 합성입니다. raw HTML 없이 하위 레이어 조합만.

- **Card** — 흰 면 + 헤어라인으로 정의되는 칸. 그림자로 뜨지 않고, 회색은 그 아래 well에만 옵니다.
- **TextField** — Label + Field + 도움말 한 묶음. id 연결을 대신합니다. `error` 문구가 있으면 그것만으로 error 상태(테두리 빨강 + `aria-invalid`).
- **RadioGroup** — Radio + Label을 `options`로 묶어 한 그룹으로.
- **Tabs** — 세그먼트 컨트롤. 활성은 흰 pill, 화살표·Home/End로 이동(roving tabindex).
- **Tooltip** — 잠깐 뜨는 쪽지. 위 공간이 없으면 자동으로 아래로 뒤집습니다.
- **Alert** — 상태 한 줄을 옅은 색 면(soft)으로 알립니다. `color`(accent 4색)를 받고 언제나 soft. error·warning은 `role="alert"`, info·success는 `role="status"`.

## Components (4)

복잡한 상태를 가질 수 있는 고수준 UI입니다.

- **Table** — column을 data로 받습니다. `numeric` 열은 sans 그대로 tabular-nums·우측정렬이 자동입니다(등폭 아님).
- **Modal** — 떠 있는 것만 그림자를 갖습니다. body로 portal해 배경을 inert로 잠그고 포커스를 가둡니다(trap) — 열면 포커스 진입, Esc·배경 클릭으로 닫히며 트리거로 복귀.
- **Navbar** — 지면 맨 위 한 줄.
- **Banner** — 지면 맨 위에 붙는 얇은 풀폭 바. 검정 solid가 기본이고, 공지·경고를 짊어질 때만 status 색을 채웁니다.

## 스물일곱 개인 이유

폼(Textarea·Switch·Radio)·피드백(Alert)·로딩(Spinner)까지, 시스템이 실제 화면을 완결할 수 있는 기준선입니다. 더 늘리는 잣대는 단계로 갈립니다 — 정식 배포(v1) 이후엔 *실제 화면에서 두 번 이상 필요했다는 증거*가 있어야 하고, v1로 가는 지금은 아직 소비자가 없어 "표준 primitive인가, 실제 semantic 공백을 메우는가"를 봅니다(그래도 기존 것의 확장을 먼저). "있으면 좋을 것 같아서"는 어느 단계에서도 증거가 아닙니다. Avatar가 필요하면 Box 조합으로 이니셜 원을 만들 수 있고(데모가 그렇게 합니다), Popover가 필요하면 그게 정말 두 번 이상 나왔는지 먼저 봅니다. 선택지를 늘리는 방향은 시스템의 목표에 역행한다고 봅니다 — 자세히는 [원칙](../get-started/philosophy.md)의 "시스템이 형태를 정한다".
