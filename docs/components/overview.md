# Overview

마흔 개입니다. 한 화면에서 훑으려면 [플레이그라운드](/playground)로, 한 컴포넌트의 prop을 토글하며 코드까지 보려면 사이드바에서 그 컴포넌트의 상세(`/playground/<이름>`)로 들어가세요 — 이 문서는 무엇이 있고 어느 레이어에 사는지를 잡아줍니다. 상위 레이어의 variant가 무엇을 바꾸고 어디서 멈추는지는 [컴포넌트 축](../foundations/component-architecture.md)에 따로 정리했습니다.

레이어는 자기보다 아래만 씁니다. `Tokens → Primitives → Atoms → Molecules → Components`.

## Primitives (4)

raw HTML을 렌더하는 유일한 레이어입니다.

- **Box** — 면 하나. `surface`(면 깊이) · `border`(헤어라인) · `inverse`(검은 판) · 간격 · `radius` · `shadow`를 말할 수 있습니다 — 색·잉크는 없습니다(면은 색을 채우지 않는다). `as`로 어떤 태그든 되지만, 상위 레이어가 raw 태그에 닿는 유일한 통로이기도 합니다.
- **Stack** — 세로로 쌓습니다. `gap`.
- **Inline** — 가로로 늘어놓습니다. `gap` · `justify` · `align` · `wrap`.
- **Text** — 일곱 variant로 위계를 정합니다. `variant`가 크기·굵기·잉크(농도·의미색)를 한 번에 정하고, 서체는 별도의 `family` 축(sans·mono)으로 어느 variant에도 교차합니다. 제목 위계가 셋(title·heading·subheading = h1·h2·h3)입니다.

## Atoms (13)

단일 컨트롤·표시 단위입니다.

- **Button** — `color`(primary + `info`·`success`·`warning`·`error`) × 공유 `variant`(면의 무게: `solid`·`soft`·`plain`·`outline`·`hairline`·`quiet`) 두 축이 직교합니다. `plain`은 soft의 옅은 면과 outline의 또렷한 선을 함께 듭니다. 흰/회색 기본 버튼은 색이 아니라 primary의 무게로 나오고, solid는 모노크로매틱(진한 채움 + 옅은 같은 색 글자)입니다. 큰 면을 채우는 색은 검정(primary)뿐, accent는 뜻을 질 때만. `shape="pill"`로 알약이 되는데, 곡선의 크기를 고르는 게 아니라 알약이냐 아니냐만 고릅니다 — 화면에서 가장 중요한 행동 한둘에 씁니다. 누르면 이동하는 자리라면 `as`로 태그를 갈아 끼웁니다(`<Button as={Link} to="/docs">`). 버튼을 링크로 감싸면 `<a>` 안에 `<button>`이 들어가 탭이 같은 자리에서 두 번 멈추고, 포커스 링도 두 모양으로 잡힙니다.
- **Field** — 한 줄 입력 그룹. 상태는 `status` 축 하나로(invalid boolean 아님), 양옆에 `leading`/`trailing` 어도먼트(아이콘·$·단위)와 `clearable`(×)·`showPasswordToggle`(👁). neutral은 쉬는 `border.base`에서 hover 시 primary `solid` 선으로 올라갑니다. semantic은 처음부터 accent `solid` 선을 쓰고 hover에서 같은 pigment가 중앙 shadow로 번집니다. 이 shadow는 semantic Form에만 있으며 포커스 때는 꺼지고 바깥의 파란 링이 대신합니다. `shape="pill"`은 Button·Badge와 같은 어휘이고, 검색창이 그 본진입니다 — 반경이 래퍼 하나에만 있고 포커스 링이 `outline`이라 링이 곡선을 저절로 따라갑니다.
- **Textarea** — 여러 줄 입력. Field와 같은 `status`·`size` 축, 세로로만 resize. `shape="pill"`은 **없습니다** — 알약은 "높이의 절반"이라는 규칙이라 한 줄짜리 컨트롤에서만 성립합니다. 96px짜리 상자에 걸면 반경이 48이 되어 경기장 모양이 나오고, 첫 줄과 마지막 줄이 곡선 아래로 밀려 왼쪽 정렬이 무너집니다. 어휘가 여기서 멈추는 것은 빠뜨린 게 아니라 경계입니다. `size`가 움직이는 것은 여백과 글자뿐입니다 — 높이는 `rows`가 정하고, 첫 줄은 같은 `size`의 Field와 같은 자리에서 시작합니다. 가로 여백은 Field·Select와 같은 `inputPaddingX`라 글자가 사방 같은 거리에 앉습니다.
- **Select** — native `<select>`를 종이 결로 감싼 것.
- **Checkbox** · **Switch**(켬/끔 토글) · **Radio**(하나 고르기) — 켜지면 검정(색이 아니라 primary). 셋은 폼 한 줄에서 같은 열에 앉도록 묶여 있습니다: Radio는 Checkbox의 변 사다리를 그대로 쓰고, Switch의 손잡이는 Checkbox 변 − 2여서 트랙이 Checkbox + 2로 앉습니다.
- **Label** · **Icon** · **Divider** · **Link**(파랑).
- **Badge** — 짧은 표식. Button과 같은 공유 `color × variant`(기본 `soft`) + `dot`(상태 점). `solid`=카운트·강조, `plain`=옅은 면+또렷한 선, `outline`=또렷한 테두리 태그, `hairline`=조용한 테두리 태그, `quiet`=글자만. Button과 같은 `shape="pill"`을 받아 두 알약이 나란히 서도 곡선이 갈리지 않습니다. `size`는 높이(20·22·24)만 움직이고 글자는 12로 고정입니다.
- **Spinner** — 진행 중 표시. 주기는 motion 토큰. Icon과 같은 사다리(16·18·20)라 나란히 두면 크기가 맞습니다. 속이 빈 링이라 같은 지름의 채운 사각형보다 가볍게 읽히는데, 그건 스피너가 지고 가는 성질이라 지름으로 보정하지 않습니다.

## Molecules (12)

Primitive + Atom 합성입니다. raw HTML 없이 하위 레이어 조합만.

- **Card** — Button·Badge·Alert와 같은 공유 `color × variant`를 씁니다. 기본은 `primary × hairline`이고, 상태를 담는 Card는 `info · success · warning · error`와 여섯 shared variant를 그대로 조합합니다. 단, Card는 정적인 면이라 hover gate와 shadow를 붙이지 않습니다. `padding`과 `radius`는 내용의 호흡과 상자의 곡선일 뿐 색의 무게와 섞이지 않습니다.
- **TextField** — Label + Field + 도움말 한 묶음. id 연결을 대신합니다. `error` 문구가 있으면 그것만으로 error 상태(테두리 빨강 + `aria-invalid`).
- **FormField** — Select·Textarea처럼 Field가 아닌 컨트롤까지 Label·설명·오류의 세로 리듬으로 묶습니다. control의 기존 `id`·`aria-describedby`는 보존하고, 없으면 연결을 자동으로 만듭니다. 시각적인 `status`는 계속 각 Atom의 책임입니다.
- **SearchField** — `Field`의 돋보기·`type="search"`·clear 동작을 묶은 검색 입력입니다. 별도 형태는 없고 Field의 size·shape·status를 그대로 받습니다.
- **RadioGroup** — `RadioGroup.Item`으로 Radio + Label을 한 그룹 안에 조합합니다. 질문지는 세로가 기본이고, 짧고 서로 대등한 선택지는 `orientation="horizontal"`로 한 줄에 둡니다. 좁은 화면에서는 wrap합니다.
- **Tabs** — `variant="segmented"`는 닫힌 트랙 안에서 범위를 바꾸고, `underline`은 넓은 페이지의 형제 구역을 가릅니다. 화살표·Home/End 이동(roving tabindex)은 둘이 같습니다. `shape`은 segmented에서만 Button·Badge·Field·Select와 같은 어휘로 작동합니다. 한 축이 **두 곡선**을 함께 정합니다 — 그릇(트랙)과 알맹이(항목)가 겹쳐 있어 따로 놀면 초승달 빈틈이 생기거나 활성 면이 트랙 밖으로 삐져나갑니다. 각진 쪽 안쪽 반경은 상수가 아니라 `바깥 반경 − 트랙 여백`(6 − 3 = 3)으로 **동심**을 맞춥니다. underline에는 닫힌 실루엣이 없으므로 shape를 무시합니다.
- **Tooltip** — 잠깐 뜨는 쪽지. `content`가 `ReactNode`라 제목·설명·단축키 같은 조합을 담을 수 있고, 위 공간이 없으면 자동으로 아래로 뒤집습니다.
- **Alert** — 상태 한 줄을 색이 깔린 면으로. Button·Badge와 **같은 `color × variant` 매트릭스**를 그대로 뭅니다(`color`는 `primary`까지 다섯, `variant`는 기본 `soft`). Alert만을 위한 surface 축을 새로 세우지 않은 이유는, 이 시스템의 `variant`가 이미 *면의 무게* 축이기 때문입니다 — `solid`(채운 면)·`soft`(옅은 면)·`outline`·`hairline`(테두리만)·`quiet`(면 없음)은 글자 스타일이 아니라 면의 종류입니다. 축을 하나 더 만들면 같은 뜻을 두 이름으로 부르게 됩니다. `error`·`warning`은 `role="alert"`, 나머지는 `role="status"`이고, 색으로만 뜻을 전하지 않도록 스크린리더용 접두어("오류:" 등)를 함께 심습니다.
- **Breadcrumb** — `Breadcrumb.Item` 순서가 현재 위치의 계층을 그대로 드러냅니다. 현재 항목은 `current`, 앞 항목은 `as`를 통해 router Link나 anchor로 바꿉니다.
- **Menu** — action과 navigation을 한 열에 놓는 기본 목록입니다. 현재 위치·설명·단축키·위험·비활성 상태를 한 item 문법으로 다루고 방향키·Home·End로 이동합니다.
- **Steps** — 실제 순서가 있는 흐름의 완료·현재·예정을 번호와 연결선으로 표시합니다. 가로·세로 방향은 같은 상태 문법을 공유합니다.
- **TableOfContents** — 한 문서 안의 현재 위치를 깊이 3단으로 제한해 보여줍니다. 전체 사이트 계층을 맡지 않고 문서 내부 navigation에만 머뭅니다.

## Components (11)

복잡한 상태를 가질 수 있는 고수준 UI입니다.

- **Table** — 외곽 Card 없이 직각으로 서는 `Table.Header/Column/Body/Row/Cell` compound anatomy가 기본 API입니다. `variant`는 행 구분법(`plain · ruled · striped`), `density`는 같은 14px 정보를 담는 높이(`compact · default · comfortable`)이며, `align`과 `numeric`은 Column과 Cell이 명시적으로 소유합니다. 데이터 어댑터가 필요한 경우에만 별도 `DataTable`을 사용합니다.
- **Modal** — `Modal.Header/Title/Description/Body/Footer/Close`로 구조가 드러나는 compound dialog입니다. `size="sm · md · lg"`는 확인 한 줄, 일반 form, 비교·복합 form처럼 **담는 일의 폭**을 고릅니다. body로 portal해 배경을 inert로 잠그고 포커스를 가둡니다(trap) — 열면 포커스 진입, Esc·배경 클릭으로 닫히며 트리거로 복귀. 제목·설명의 접근성 연결은 compound part가 자동으로 만들고, 패널 높이를 넘는 것은 Body만 구릅니다.
- **Navbar** — `Navbar.Brand/Item/Actions`가 한 줄의 구조를 그대로 드러냅니다. Item은 `as`로 버튼과 링크를 오가며 활성 표시는 양쪽 다 `aria-current="page"`입니다. `width`는 안쪽 줄의 폭만 정하고 면과 괘선은 화면 끝까지 갑니다.
- **Banner** — 지면 맨 위에 붙는 얇은 풀폭 바. 검정 solid가 기본이고, 공지·경고를 짊어질 때만 status 색을 채웁니다.
- **PageHeader** — `location` → 큰 제목 → 설명 → 행동의 읽기 순서를 만듭니다. hero나 card를 강요하지 않고, 폭이 좁아지면 자연스럽게 두 줄로 풀립니다.
- **EmptyState** — 빈 결과를 막다른 곳으로 두지 않습니다. 왜 비었는지와 다음 행동 하나를 남기되, 새 색면·카드는 만들지 않습니다.
- **Pagination** — 현재 위치와 앞뒤 이동. `outlined · soft · minimal` variant로 주변 데이터 화면의 밀도에 맞추되, 어느 쪽도 page state와 섞이지 않습니다.
- **Sidebar** — `Sidebar.Group/Item/Badge`를 조합하는 compound local navigation rail입니다. JSX가 실제 계층과 항목 안의 구성을 그대로 드러내며, Item의 `as`를 바꿔 button과 router Link를 모두 지원합니다. Badge는 selected 상태에서도 `soft` pigment를 유지하되 행과 같은 neutral selected overlay를 한 겹 더 받습니다.
- **DropdownMenu** — trigger에 `Menu`를 붙이는 떠 있는 action surface입니다. 바깥 클릭·Escape·초기 포커스·선택 후 닫힘을 맡고, navigation 계열 중 실제로 떠 있는 이 surface만 overlay shadow를 갖습니다.
- **CommandMenu** — 검색 Field와 키보드 선택 listbox를 묶습니다. label·keywords 검색, group·설명·단축키를 지원해 빠른 이동과 실행을 맡습니다.
- **TreeNavigation** — 깊은 정보 구조를 접고 펴는 계층 navigation입니다. branch의 expanded state와 leaf의 active state를 분리하고 방향키로 탐색합니다.

## 마흔 개인 이유

폼의 구조(FormField)·검색(SearchField)·피드백(Alert)·로딩(Spinner)과 데이터 화면의 위치·순서·명령·계층 탐색·빈 상태·이동까지, 시스템이 실제 화면을 완결할 수 있는 기준선입니다. 더 늘리는 잣대는 단계로 갈립니다 — 정식 배포(v1) 이후엔 *실제 화면에서 두 번 이상 필요했다는 증거*가 있어야 하고, v1로 가는 지금은 아직 소비자가 없어 "표준 primitive인가, 실제 semantic 공백을 메우는가"를 봅니다(그래도 기존 것의 확장을 먼저). "있으면 좋을 것 같아서"는 어느 단계에서도 증거가 아닙니다. Avatar가 필요하면 Box 조합으로 이니셜 원을 만들 수 있고(데모가 그렇게 합니다), Popover가 필요하면 그게 정말 두 번 이상 나왔는지 먼저 봅니다. 선택지를 늘리는 방향은 시스템의 목표에 역행한다고 봅니다 — 자세히는 [원칙](../get-started/philosophy.md)의 "시스템이 형태를 정한다".
