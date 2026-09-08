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

- **Button** — `color`(primary + `info`·`success`·`warning`·`error`) × `variant`(면의 무게: `solid`·`soft`·`outline`·`hairline`·`quiet`) 두 축이 직교합니다. 흰/회색 기본 버튼은 색이 아니라 primary 의 무게(`hairline`·`soft`)로 나오고, solid 는 모노크로매틱(진한 채움 + 옅은 같은 색 글자)입니다. 큰 면을 채우는 색은 검정(primary)뿐, accent 는 뜻을 질 때만. `shape="pill"`로 알약이 되는데, 곡선의 크기를 고르는 게 아니라 알약이냐 아니냐만 고릅니다 — 화면에서 가장 중요한 행동 한둘에 씁니다. 누르면 이동하는 자리라면 `as`로 태그를 갈아 끼웁니다(`<Button as={Link} to="/docs">`). 버튼을 링크로 감싸면 `<a>` 안에 `<button>`이 들어가 탭이 같은 자리에서 두 번 멈추고, 포커스 링도 두 모양으로 잡힙니다.
- **Field** — 한 줄 입력 그룹. 상태는 `status` 축 하나로(invalid boolean 아님), 양옆에 `leading`/`trailing` 어도먼트(아이콘·$·단위)와 `clearable`(×)·`showPasswordToggle`(👁). 포커스 때만 파란 링. `shape="pill"`은 Button·Badge와 같은 어휘이고, 검색창이 그 본진입니다 — 반경이 래퍼 하나에만 있고 포커스 링이 `outline`이라 링이 곡선을 저절로 따라갑니다.
- **Textarea** — 여러 줄 입력. Field와 같은 `status`·`size` 축, 세로로만 resize. `shape="pill"`은 **없습니다** — 알약은 "높이의 절반"이라는 규칙이라 한 줄짜리 컨트롤에서만 성립합니다. 96px짜리 상자에 걸면 반경이 48이 되어 경기장 모양이 나오고, 첫 줄과 마지막 줄이 곡선 아래로 밀려 왼쪽 정렬이 무너집니다. 어휘가 여기서 멈추는 것은 빠뜨린 게 아니라 경계입니다. `size`가 움직이는 것은 여백과 글자뿐입니다 — 높이는 `rows`가 정하고, 첫 줄은 같은 `size`의 Field와 같은 자리에서 시작합니다. 가로 여백은 Field·Select와 같은 `inputPaddingX`라 글자가 사방 같은 거리에 앉습니다.
- **Select** — native `<select>`를 종이 결로 감싼 것.
- **Checkbox** · **Switch**(켬/끔 토글) · **Radio**(하나 고르기) — 켜지면 검정(색이 아니라 primary). 셋은 폼 한 줄에서 같은 열에 앉도록 묶여 있습니다: Radio는 Checkbox의 변 사다리를 그대로 쓰고, Switch의 손잡이는 Checkbox 변 − 2여서 트랙이 Checkbox + 2로 앉습니다.
- **Label** · **Icon** · **Divider** · **Link**(파랑).
- **Badge** — 짧은 표식. Button과 같은 `color × variant`(기본 `soft`) + `dot`(상태 점). `solid`=카운트·강조, `outline`=또렷한 테두리 태그, `hairline`=조용한 테두리 태그, `quiet`=글자만. Button과 같은 `shape="pill"`을 받아 두 알약이 나란히 서도 곡선이 갈리지 않습니다. `size`는 높이(20·22·24)만 움직이고 글자는 12로 고정입니다.
- **Spinner** — 진행 중 표시. 주기는 motion 토큰. Icon과 같은 사다리(16·18·20)라 나란히 두면 크기가 맞습니다. 속이 빈 링이라 같은 지름의 채운 사각형보다 가볍게 읽히는데, 그건 스피너가 지고 가는 성질이라 지름으로 보정하지 않습니다.

## Molecules (6)

Primitive + Atom 합성입니다. raw HTML 없이 하위 레이어 조합만.

- **Card** — 흰 면 + 헤어라인으로 정의되는 칸. 그림자로 뜨지 않고, 회색은 그 아래 well에만 옵니다.
- **TextField** — Label + Field + 도움말 한 묶음. id 연결을 대신합니다. `error` 문구가 있으면 그것만으로 error 상태(테두리 빨강 + `aria-invalid`).
- **RadioGroup** — Radio + Label을 `options`로 묶어 한 그룹으로.
- **Tabs** — 세그먼트 컨트롤. 활성은 흰 면, 화살표·Home/End로 이동(roving tabindex). `shape`은 Button·Badge·Field·Select와 같은 어휘인데, 여기서는 한 축이 **두 곡선**을 함께 정합니다 — 그릇(트랙)과 알맹이(항목)가 겹쳐 있어 따로 놀면 초승달 빈틈이 생기거나 활성 면이 트랙 밖으로 삐져나갑니다. 각진 쪽 안쪽 반경은 상수가 아니라 `바깥 반경 − 트랙 여백`(6 − 3 = 3)으로 **동심**을 맞춥니다. 알약은 계산이 필요 없습니다 — 999는 크기가 아니라 높이의 절반이라 저절로 동심이 됩니다.
- **Tooltip** — 잠깐 뜨는 쪽지. 위 공간이 없으면 자동으로 아래로 뒤집습니다.
- **Alert** — 상태 한 줄을 색이 깔린 면으로. Button·Badge와 **같은 `color × variant` 매트릭스**를 그대로 뭅니다(`color`는 `primary`까지 다섯, `variant`는 기본 `soft`). Alert만을 위한 surface 축을 새로 세우지 않은 이유는, 이 시스템의 `variant`가 이미 *면의 무게* 축이기 때문입니다 — `solid`(채운 면)·`soft`(옅은 면)·`outline`·`hairline`(테두리만)·`quiet`(면 없음)은 글자 스타일이 아니라 면의 종류입니다. 축을 하나 더 만들면 같은 뜻을 두 이름으로 부르게 됩니다. `error`·`warning`은 `role="alert"`, 나머지는 `role="status"`이고, 색으로만 뜻을 전하지 않도록 스크린리더용 접두어("오류:" 등)를 함께 심습니다.

## Components (4)

복잡한 상태를 가질 수 있는 고수준 UI입니다.

- **Table** — column을 data로 받습니다. `numeric` 열은 sans 그대로 tabular-nums·우측정렬이 자동입니다(등폭 아님).
- **Modal** — 떠 있는 것만 그림자를 갖습니다. body로 portal해 배경을 inert로 잠그고 포커스를 가둡니다(trap) — 열면 포커스 진입, Esc·배경 클릭으로 닫히며 트리거로 복귀. 패널에는 **높이 상한**이 있고 넘치는 것은 본문만 구릅니다. backdrop이 `fixed`인 데다 열려 있는 동안 body 스크롤도 잠기므로, 패널이 뷰포트보다 커지면 넘친 부분에 닿을 방법이 없습니다 — 700px 화면에서 패널이 1069px로 자라 확인·취소 버튼이 화면 밖에 있던 적이 있습니다. 제목과 푸터는 붙박이입니다.
- **Navbar** — 지면 맨 위 한 줄. **항목은 버튼일 수도 링크일 수도 있습니다.** `as`로 태그를 갈아 끼우면 나머지 키(`href`·`to`·`target`)가 그대로 흘러가고, 활성 표시는 양쪽 다 `aria-current="page"`입니다. 오래 `<button>`만 그렸는데, 그러면 실제 사이트의 GNB를 이걸로 못 짭니다 — 가운데 클릭으로 새 탭을 못 열고, 주소가 없어 크롤러도 못 따라가고, 라우터와도 안 붙습니다. 이 저장소의 사이트 헤더 자체가 그래서 라이브러리를 안 쓰고 손으로 다시 짜고 있었습니다. Button의 `as`와 같은 결함이고 같은 해법입니다. `width`는 **안쪽 줄의 폭만** 정합니다 — `full`은 제품 chrome, `content`는 본문 격자에 맞춘 사이트 헤더이고, 면과 괘선은 어느 쪽이든 화면 끝까지 갑니다. 항목 크기는 컨트롤 사다리 `md`라 옆의 Button·Field와 같은 열에 섭니다.
- **Banner** — 지면 맨 위에 붙는 얇은 풀폭 바. 검정 solid가 기본이고, 공지·경고를 짊어질 때만 status 색을 채웁니다.

## 스물일곱 개인 이유

폼(Textarea·Switch·Radio)·피드백(Alert)·로딩(Spinner)까지, 시스템이 실제 화면을 완결할 수 있는 기준선입니다. 더 늘리는 잣대는 단계로 갈립니다 — 정식 배포(v1) 이후엔 *실제 화면에서 두 번 이상 필요했다는 증거*가 있어야 하고, v1로 가는 지금은 아직 소비자가 없어 "표준 primitive인가, 실제 semantic 공백을 메우는가"를 봅니다(그래도 기존 것의 확장을 먼저). "있으면 좋을 것 같아서"는 어느 단계에서도 증거가 아닙니다. Avatar가 필요하면 Box 조합으로 이니셜 원을 만들 수 있고(데모가 그렇게 합니다), Popover가 필요하면 그게 정말 두 번 이상 나왔는지 먼저 봅니다. 선택지를 늘리는 방향은 시스템의 목표에 역행한다고 봅니다 — 자세히는 [원칙](../get-started/philosophy.md)의 "시스템이 형태를 정한다".
