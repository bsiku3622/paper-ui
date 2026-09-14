# Component architecture

Molecule과 Component는 Atom을 크게 그린 것이 아닙니다. 화면에서 반복되는 관계를 맡고, 그 관계가 달라지는 축을 제한된 어휘로 제공합니다. 같은 모양을 한 개 더 추가하기보다, 기존 컴포넌트가 무엇을 바꿀 수 있고 무엇은 바꾸지 못하는지 먼저 정합니다.

## 일곱 축

Paper UI의 상위 레이어는 아래 일곱 축에서 필요한 것만 고릅니다. 모든 컴포넌트에 모든 축을 억지로 넣지 않습니다.

| 축 | 답하는 질문 | 어휘 |
| --- | --- | --- |
| `color` | 어떤 의미색인가 | `primary · info · success · warning · error` |
| shared `variant` | 의미색을 얼마나 무겁게 보이는가 | `solid · soft · plain · outline · hairline · quiet` |
| local `variant` | 상위 구조를 어떻게 구분하는가 | 컴포넌트별 유한 집합 |
| `density` | 같은 정보가 세로로 얼마나 촘촘한가 | `compact · default · comfortable` |
| `size` | 컨트롤 자체가 얼마나 큰가 | `sm · md · lg` |
| `shape` | 한 줄 컨트롤이 기본 곡선인가 알약인가 | `default · pill` |
| state | 지금 어떤 상태인가 | `open · selected · disabled · error` 등 |

`color × variant`는 레이어와 무관하게 의미색과 시각 무게를 표현하는 요소가 **하나의 `Variant` 타입으로 공유**합니다. Button·Badge·Alert가 같은 매트릭스를 씁니다. 여기서 `plain`은 `soft`의 옅은 면과 `outline`의 또렷한 선을 동시에 쓰는 공통 단계입니다. 지역 `variant`는 Table의 행 구분이나 Tabs의 navigation 구조처럼 shared 축으로 표현할 수 없는 경우에만 둡니다. 같은 prop 이름을 쓰더라도 shared `Variant`에 지역 선택지를 섞지 않습니다.

`density`와 `size`는 다릅니다. Table의 행 간격은 정보량이고, Pagination 버튼의 크기는 누르는 표적입니다. 표를 촘촘하게 만들려고 페이지 버튼까지 줄이지 않으며, 큰 버튼을 쓴다고 표의 행이 커지지도 않습니다.

## 시각 기준

새 축은 기존 palette 안에서만 움직입니다.

| 이름 | Light | 역할 |
| --- | --- | --- |
| `paper.raised` | `#ffffff` | 입력·모달의 순백 면 |
| `paper.canvas` | `#fcfcfc` | 페이지 기준면 |
| `paper.sunken` | `#f4f4f5` | 얕게 가라앉은 구조면 |
| `paper.well` | `#e2e2e5` | 세그먼트 트랙 |
| `ink.base` | `#18181b` | 본문·현재 상태 |
| `border.base` | `#e8e8ea` | 쉬는 괘선 |

서체와 위계도 바꾸지 않습니다. Pretendard를 기본으로 쓰고, body 14px을 밀도의 기준점으로 둡니다. 새 Component는 `title/heading/subheading/body/caption` 조합만 사용합니다. 새 색, 새 서체, 장식용 gradient, 지속 shadow는 추가하지 않습니다.

## 화면의 문장

데이터 화면은 다음 순서로 읽힙니다.

```text
┌─ PageHeader ───────────────────────────────────────┐
│ Breadcrumb / location                              │
│ 제목 · 설명                              주 행동  │
└────────────────────────────────────────────────────┘

┌─ Tabs / search Field / filters ────────────────────┐
│ 범위                                             조건│
└────────────────────────────────────────────────────┘

┌─ Table: variant × density ─────────────────────────┐
│ head                                               │
│ rows                                               │
│ rows                                               │
└────────────────────────────────────────────────────┘
Pagination
```

왼쪽 정렬이 기본입니다. 제목, 필터의 시작점, 첫 열이 같은 수직선에 서야 합니다. 중앙 정렬은 EmptyState처럼 읽을 데이터가 없고 다음 행동 하나만 남는 경우에 한정합니다.

붙은 면은 별도 Card 컴포넌트가 아니라 Box의 `surface · border · radius · padding`을 조합합니다. 콘텐츠마다 구조가 다른 일반명 Card에 고정 anatomy나 색 문법을 부여하지 않습니다.

```text
hairline          soft              plain             solid
┌──────────┐      ▒▒▒▒▒▒▒▒▒▒        ┏━━━━━━━━━━┓      ██████████
│ content  │      ▒ content ▒        ┃ content  ┃      █ content █
└──────────┘      ▒▒▒▒▒▒▒▒▒▒        ┗━━━━━━━━━━┛      ██████████
quiet rule        tinted surface    tint + strong rule full pigment
```

Table은 장식이 아니라 행을 구분하는 방식만 바꿉니다.

```text
plain             ruled             striped
row               row               row
row               ─────────         ▒▒▒▒▒
row               row               row
                  ─────────         ▒▒▒▒▒
```

## 컴포넌트별 축

### Prop naming

- 선택 상태를 소유하는 compound Root는 `value / defaultValue / onValueChange`를 기본 문법으로 씁니다. Tabs·RadioGroup·Menu·Steps·TableOfContents·Navbar·Sidebar·DropdownMenu·TreeNavigation이 같은 이름을 공유합니다.
- 열림 상태는 `open / defaultOpen / onOpenChange`입니다. 서로 다른 boolean 상태를 `active`, `shown`, `visible`로 바꾸어 부르지 않습니다.
- native input event는 React DOM 계약을 따라 `onChange`를 유지합니다. Field·Select·Checkbox의 event object와 compound Root의 값 callback을 같은 이름으로 섞지 않습니다.
- 값 하나로 환원되지 않는 도메인 상태는 대상을 이름에 남깁니다. Pagination은 `page / onPageChange`, CommandMenu 검색은 `query / defaultQuery / onQueryChange`, TreeNavigation branch는 `expandedValues / defaultExpandedValues / onExpandedValuesChange`입니다.
- `onSelect`는 상태 setter가 아니라 항목을 실행하는 사건에만 씁니다. 현재는 CommandMenu command activation이 이 경우입니다.
- 의미색은 shared `color`를 씁니다. 고정된 solid surface인 Banner도 별도 `tone` 대신 `color="primary | info | success | warning | error"`를 받습니다.

### Molecules

| 컴포넌트 | 축 | 결정 |
| --- | --- | --- |
| FormField | compound `Label · Control · Hint · Error` + `align` | 모든 입력의 유일한 form composition. 시각 status와 입력값 정렬은 control이 소유 |
| RadioGroup | compound `Item` + `orientation · size` | 세로 기본, 좁은 선택지는 가로 배치 가능 |
| Tabs | compound `Item` + `variant · size · shape` | `segmented · underline`. underline에서는 shape가 의미 없음 |
| Tooltip | compound `Trigger · Content`, placement 자동 결정 | 복합 내용을 허용하되 외형 variant는 없음 |
| Alert | compound `Icon · Title · Description`, `color × shared variant` | Button·Badge와 같은 6단 매트릭스를 유지 |
| Breadcrumb | compound `Item` + `separator` | location 계층을 JSX 순서로 소유. current를 명시 |
| Menu | compound `Item` + `value` | 한 열의 action/navigation과 키보드 이동을 소유 |
| Steps | compound `Item` + `value · orientation` | 실제 순서의 완료·현재·예정을 번호와 연결선으로 구분 |
| TableOfContents | compound `Item` + `value · depth` | 문서 내부 위치만 소유하고 깊이는 3단으로 제한 |

### Components

| 컴포넌트 | 축 | 결정 |
| --- | --- | --- |
| Table | compound `Header · Column · Body · Row · Cell` + local `variant · density` | 직각 plain이 기본. 데이터 편의는 별도 DataTable로 격리 |
| Modal | `size` | `sm · md · lg`. 종류가 아니라 담는 일의 폭 |
| Navbar | compound `Brand · Item · Actions` + `width` | 구조를 JSX에 노출. 외형 variant는 사이트 정체성을 불필요하게 분기 |
| Banner | compound `Content · Action`, `color` | primary 검정 기본 + 의미색. 양쪽 slot을 JSX로 노출 |
| PageHeader | compound `Location · Content · Title · Description · Actions` | 관계가 본체라 외형 variant 없음 |
| EmptyState | compound `Title · Description · Action` | 빈 상태는 장식 강도를 고르는 자리가 아님 |
| Pagination | local `variant`, `page` | `outline · soft · minimal`; Table density와 독립 |
| Sidebar | compound `Group · Item · Badge` + `value` | JSX로 local navigation 계층과 release 표식을 조합. selected badge의 soft 면에도 같은 neutral overlay를 합성 |
| DropdownMenu | compound `Trigger · Content · Item` + `align · open` | 떠 있는 action surface의 열기·닫기·포커스와 overlay shadow를 소유 |
| CommandMenu | compound `Group · Item · Empty` + `query` | 검색 Field와 키보드 선택 listbox를 결합 |
| TreeNavigation | 중첩 compound `Item` + `value · expandedValues` | JSX 중첩이 실제 계층이며 branch 확장과 leaf 선택을 분리 |

## 금지 조합

- Box로 만든 붙은 면에 interactive hover나 지속 shadow를 열지 않습니다. shadow는 Modal·Tooltip처럼 뜬 것의 표식입니다.
- Table의 `striped`에 행 divider를 함께 넣지 않습니다. 행 구분을 두 번 말하게 됩니다.
- `Tabs variant="underline"`에는 `shape="pill"`을 적용하지 않습니다. 선형 탭에는 닫힌 실루엣이 없습니다.
- FormField의 `error`가 control의 pigment를 몰래 바꾸지 않습니다. Field·Textarea의 `status`와 Select의 API는 서로 다르므로 접근성 관계만 공통화합니다.
- Component variant에 `blue`, `gray` 같은 색 이름을 넣지 않습니다. 색은 의미를 질 때만 `color`로 고릅니다.

## 검증 기준

Table은 한 화면의 행 리듬을 정하므로 지역 variant를 나란히 둡니다. Tabs와 RadioGroup은 시각 차이뿐 아니라 키보드 이동과 배치가 유지되는지 보고, Modal은 세 폭 모두 viewport 안에서 본문만 scroll되는지 확인합니다. 선택지가 있다는 사실이 아니라 선택지마다 맡은 문장이 다르다는 것을 computed style과 접근성 동작으로 고정합니다.

마지막으로 실제 이슈 트래커 데모에 한 가지 variant만 선택해 사용합니다. 데모가 모든 선택지를 한꺼번에 쓰면 시스템 검증이 아니라 갤러리가 됩니다. Playground는 폭을 보여주고, Demo는 판단을 보여줍니다.
