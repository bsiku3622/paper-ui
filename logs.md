## 2026-09-15 — Widen Tooltip content through Box layout props

- 변경 파일: Box·Tooltip API, Playground registry, component docs·tests
- 요약: Tooltip의 shrink-to-fit 폭이 trigger 주변에서 세로로 찌그러지던 문제를 고치고, Box에 재사용 가능한 dimension·overflow API를 추가했습니다.

기존 Tooltip은 `max-width`만 정하고 실제 width를 두지 않아 absolute positioning의 shrink-to-fit 계산에 따라 긴 한국어 문장이 한두 글자씩 꺾였습니다. Content의 기본을 `width="max-content"`, `maxWidth="xl"`로 바꿔 짧은 설명은 가로로 읽고 긴 설명만 360px에서 줄바꿈하게 했습니다. `Tooltip.Content`는 Box props를 이어받으므로 `maxWidth="sm | md | lg | xl"`이나 앱 고유 CSS 길이로 정보량에 맞는 폭을 정할 수 있습니다.

Box는 임의의 CSS prop 전체를 복제하지 않고 box model의 크기와 잘림만 공통 API로 열었습니다. `width/minWidth/maxWidth`, `height/minHeight/maxHeight`, `overflow/overflowX/overflowY`가 그 범위이며, `xs~xl`은 기존 layout token으로 해석합니다. `full/fit/min-content/max-content`는 반복되는 intent, 그 밖의 CSS 길이는 저수준 primitive의 escape hatch입니다. position과 flex 배치는 소비처 className 및 Stack·Inline의 책임으로 남겨 Box가 두 번째 layout engine이 되지 않게 했습니다.

Playground의 Box 상세에서 width·maxWidth·overflow를, Tooltip 상세에서 maxWidth 사다리를 직접 바꿀 수 있습니다. 기본 Tooltip이 충분히 가로로 펼쳐지는지는 실제 bounding box와 360px 상한을 E2E로 고정했습니다.

## 2026-09-14 — Split segmented selection from Tabs

- 변경 파일: Tabs·SegmentedControl API, selection tokens, Playground·Demo·docs·tests
- 요약: 서로 다른 역할과 권장 크기를 한 variant 축에 묶던 Tabs를 panel navigation과 compact single-selection 두 컴포넌트로 분리했습니다.

기존 Tabs의 `segmented`와 `underline`은 단순한 외형 차이가 아니었습니다. segmented는 닫힌 track 안에서 값을 고르는 radio 관계이고 `sm`이 자연스러운 반면, underline은 실제 content panel을 전환하는 tab 관계이고 `md`가 기본입니다. 한 Root에서 variant로 바꾸면 shape가 한쪽에서만 의미를 갖고 기본 size도 역할에 따라 달라지는 invalid matrix가 생겼습니다.

따라서 `SegmentedControl.Item`은 `radiogroup/radio`, `size="sm"`, `shape="default | pill"`을 소유하고, Tabs는 `Tabs.List/Trigger/Content`, `tablist/tab/tabpanel`, `size="md"`만 소유합니다. 둘의 controlled 문법은 `value / defaultValue / onValueChange`로 유지했고 방향키·Home/End 이동도 각각의 접근성 역할 안에서 보존했습니다. Tabs.Content는 빈 wrapper로 끝내지 않고 trigger와 본문 사이의 12px 리듬, reduced-motion을 존중하는 짧은 reveal, keyboard focus box를 맡기되 surface는 강제하지 않았습니다. Playground에는 실제 heading과 body를 넣어 content composition도 함께 확인하도록 했습니다. SegmentedControl은 NEW, 재설계한 Tabs는 MOD로 표시합니다.

⚠ `Tabs.Item`, `variant="segmented | underline"`, Tabs의 `shape`는 제거된 breaking API입니다. 필터·보기 방식은 SegmentedControl로, 실제 panel 전환은 Tabs로 이관해야 합니다.

## 2026-09-14 — Remove generic Card abstraction

- 변경 파일: Card implementation·exports, Box Playground, component docs·tests
- 요약: Box와 책임이 겹치고 실제 제품 사용처가 없던 Card를 제거해 일반적인 붙은 면을 Box 조합 하나로 통일했습니다.

Card가 추가하던 것은 shared color variant, 기본 radius, Header·Body·Footer padding과 divider였지만 의미·상태·접근성 계약은 없었습니다. 실제 Demo에서는 사용되지 않고 Playground 표본만 존재했으며, semantic 색면은 Alert와 겹치고 고정 anatomy는 사용처마다 다른 card content를 제대로 설명하지 못했습니다. 따라서 더 강한 visual preset으로 확장하지 않고 public implementation과 export를 제거했습니다.

일반적인 붙은 면은 `Box surface + border + radius + padding`으로 조합합니다. semantic 상태는 Alert, 실제로 뜨는 surface는 Modal·Tooltip·DropdownMenu가 계속 맡습니다. E2E의 shared Card variant 검증은 제거했지만 화면의 헤어라인이 한 벌이라는 계약은 `Box border`를 기준으로 이관해 Field·Select·Textarea·hairline과 계속 비교합니다.

⚠ `Card`, `Card.Header/Body/Footer`, `CardProps`, `CardPartProps` export는 제거된 breaking API입니다. 기준선은 37개(Primitives 4 · Atoms 13 · Molecules 9 · Components 11)로 줄었고 Playground Sidebar와 문서의 수치도 함께 갱신했습니다.

## 2026-09-14 — Collapse form composition into FormField

- 변경 파일: FormField API, TextField·SearchField exports, Playground·Demo·docs·tests
- 요약: 겹치던 TextField와 SearchField를 제거하고, Field·Select·Textarea가 하나의 FormField compound 문법을 쓰도록 통합했습니다.

TextField는 `Field + Label + Hint/Error`를 prop으로 감싼 두 번째 문법이라 FormField와 책임이 겹쳤고, SearchField는 Field의 `type="search" + leading + clearable` 조합 외에 독립된 상태나 형태가 없었습니다. 두 컴포넌트를 public API와 구현에서 제거하고 기존 사용처를 각각 FormField composition과 Field recipe로 옮겼습니다. CommandMenu의 검색 input도 내부에서 Field anatomy를 직접 조합합니다.

FormField에는 `align="start | center | end | stretch"`를 추가했습니다. 이 align은 Label·Control·메시지 묶음의 배치를 정하고, Field의 기존 align은 입력값 정렬을 계속 맡습니다. 기본 `stretch`는 control이 가용 폭을 채우는 기존 폼 동작을 보존합니다. Playground 상세에서는 control을 Field·Select·Textarea로 바꿔 끼우고 align 네 값을 비교할 수 있습니다.

⚠ `TextField`, `TextFieldProps`, `SearchField`, `SearchFieldProps` export는 제거된 breaking API입니다. FormField는 임의 control을 받으므로 Error가 시각 pigment를 추측하지 않습니다. Error가 접근성 상태를 연결하고, Field·Textarea의 `status`는 해당 Atom이 명시적으로 소유하는 경계를 유지했습니다.

## 2026-09-14 — Unify component state prop naming

- 변경 파일: selection·navigation components, Banner·Pagination, Playground·docs·tests
- 요약: compound selection을 `value / defaultValue / onValueChange`로 통일하고, native event와 domain state의 이름 규칙을 분리했습니다.

Tabs·RadioGroup·Menu·Steps·TableOfContents·Navbar·Sidebar·DropdownMenu·TreeNavigation은 모두 같은 controlled/uncontrolled 문법을 씁니다. 반복 구현은 내부 `useControllableState`로 모아 callback 호출과 local state 전환도 동일하게 유지했습니다. `onChange`는 Field·Select·Checkbox처럼 React DOM event object를 그대로 전달하는 native control에만 남기고, `onSelect`는 CommandMenu의 command activation처럼 지속 상태가 아닌 실행 사건에만 남겼습니다.

값 하나로 환원되지 않는 상태는 대상을 이름에 보존했습니다. Pagination은 `page / onPageChange`, Tree branch는 `expandedValues / defaultExpandedValues / onExpandedValuesChange`, disclosure는 `open / defaultOpen / onOpenChange`를 씁니다. 의미색은 shared `color`로 통일해 Banner의 `tone`을 제거했고, Pagination의 local variant도 shared 철자인 `outline`에 맞췄습니다.

⚠ `active`, `current`, selection용 `onSelect/onChange`, Banner `tone`, Pagination `outlined`, Sidebar Badge `activeVariant`, Tree `expanded/defaultExpanded/onExpandedChange`는 제거된 breaking API입니다. Playground·Demo·문서와 테스트를 새 이름으로 함께 이관했습니다.

## 2026-09-14 — Make native Select anatomy compound

- 변경 파일: Select API·Playground·Demo·recipes·tests
- 요약: `options` 객체 배열을 제거하고 `Select.Option/Group`으로 native option 구조를 JSX에 드러냈습니다.

Select의 option은 단순 계산 결과처럼 보이지만 순서·disabled·optgroup이 실제 사용자 인터페이스 구조이므로, 다른 compound 컴포넌트와 같은 기준을 적용했습니다. API에서 받은 배열은 `options.map(option => <Select.Option …>)`으로 조립할 수 있어 별도 data adapter를 유지할 이유가 적습니다.

⚠ native `<select>`의 option은 rich content를 안정적으로 렌더링하지 못합니다. `Select.Option`의 children 타입을 `string | number`로 제한해 Badge·Icon 같은 조합이 가능하다는 잘못된 기대를 막았습니다. 빈 value option을 placeholder로 읽는 기존 색상 규칙은 실제 `<option>` 구조에서도 그대로 유지됩니다.

## 2026-09-14 — Expose remaining visible anatomy as compound parts

- 변경 파일: Tooltip·FormField·Card·Alert·Banner·PageHeader·EmptyState, Playground·Demo·docs·tests
- 요약: JSX prop 안에 숨었던 trigger/content와 title/description/action 구조를 이름 있는 compound parts로 옮겼습니다.

compound 전환 기준은 “사용자가 화면의 내부 anatomy를 직접 조립하는가”입니다. Tooltip은 `Trigger/Content`, FormField는 `Label/Control/Hint/Error`, PageHeader와 EmptyState는 각 content slot이 markup에 그대로 드러납니다. Card는 `Header/Body/Footer`를 제공하되 단순 컨테이너 용례의 raw children과 root padding도 유지해, 구조를 강요하지 않고 필요할 때만 anatomy를 사용합니다. Alert의 상태 아이콘은 기본값을 유지하면서 `Alert.Icon`으로 교체할 수 있게 했습니다.

Pagination의 page range와 SearchField의 검색 icon처럼 컴포넌트가 내부에서 계산하거나 목적상 고정한 구조는 compound로 바꾸지 않았습니다. 외부 데이터와 내부 구현까지 모두 parts로 노출하면 API가 길어질 뿐 의미가 늘지 않기 때문입니다.

⚠ `Tooltip content`, `FormField label/hint/error`, `Alert title`, `Banner action`, `PageHeader`와 `EmptyState`의 slot props는 제거한 breaking change입니다. Playground 전수·상세 화면, Demo, recipe와 접근성 테스트를 새 API로 함께 이관했습니다. FormField Root는 control id와 설명 관계를 소유하며 Error가 있으면 Hint를 숨기고 `aria-invalid`를 자동으로 연결합니다.

## 2026-09-14 — Make visible component anatomy compound by default

- 변경 파일: Table·Tabs·RadioGroup·Breadcrumb·Menu·Steps·TableOfContents·Navbar·DropdownMenu·CommandMenu·TreeNavigation, Playground·docs·tests
- 요약: 반복되는 화면 구조를 객체 배열에 숨기던 API를 JSX compound parts로 전환하고, Table의 기본 표본을 외곽 Card가 없는 직각형 데이터 표로 교체했습니다.

사용자가 화면에서 직접 읽고 조합하는 구조는 `Component.Item`, `Table.Column`, `Table.Cell`처럼 markup에 드러나야 Badge·Link·복합 content를 중첩 객체 없이 자연스럽게 넣을 수 있습니다. Root는 selection·keyboard·orientation 같은 공유 상태만 context로 소유하고, 각 part가 자기 semantic element와 content를 소유하도록 나눴습니다. Table은 이 구조를 기본 `Table` API로 삼았고, 단순 데이터 렌더링이 필요한 경우만 별도 `DataTable` adapter로 남겼습니다.

모든 배열 prop을 기계적으로 없애지는 않았습니다. Select의 native option과 Pagination의 계산된 page range처럼 화면 anatomy가 아니라 닫힌 데이터인 경우는 scalar/data API가 더 정확합니다. 반대로 TableOfContents·TreeNavigation처럼 계층 자체가 보이는 navigation은 compound API가 구조와 접근성 계약을 함께 보여줍니다.

⚠ 기존 `items`, `commands`, `columns/rows`, `brand/trailing` 기반 호출은 breaking change입니다. Playground 전수·상세 예제, Demo/Home, 문서와 테스트를 새 API로 함께 이관했습니다. Table 상세 preview는 showcase용 둥근 frame을 제거해 `paper.sunken` header와 선 없는 body가 실제 직각 silhouette로 보이게 했습니다.

## 2026-09-14 — Complete the navigation component family

- 변경 파일: Menu·Steps·TableOfContents·DropdownMenu·CommandMenu·TreeNavigation, Sidebar compound API, Playground·docs·tests
- 요약: 위치와 탐색의 빈 구간을 역할별 여섯 컴포넌트로 채우고, Sidebar를 구조가 JSX에 드러나는 compound API로 전환했습니다.

Menu는 한 열의 action/navigation, Steps는 실제 순서, TableOfContents는 문서 내부 위치로 역할을 좁혔습니다. 고수준에서는 DropdownMenu만 떠 있는 surface라 overlay shadow를 갖고, CommandMenu는 검색 가능한 listbox, TreeNavigation은 branch 확장과 leaf 선택을 분리합니다. 비슷해 보이는 목록을 하나의 범용 컴포넌트로 합치지 않은 이유는 ARIA role과 키보드 계약이 서로 다르기 때문입니다.

Sidebar의 `groups` data API는 항목 안에 Badge나 추가 요소를 넣을수록 중첩 객체가 UI 구조를 감추는 문제가 있었습니다. `Sidebar.Group/Item/Badge` compound parts로 바꾸어 실제 계층과 조합을 JSX에 남겼고, Root의 active/onSelect context와 selected badge overlay는 그대로 공유합니다. Playground 전수 화면과 각 상세 registry를 40개 기준으로 갱신했습니다.

## 2026-09-14 — Make Sidebar selection win immediately after click

- 변경 파일: Sidebar active style·Playground E2E
- 요약: 클릭 뒤 포인터가 같은 위치에 남아 있어도 일반 hover가 active 면을 덮지 못하게 하고, selected 배경을 badge overlay와 같은 프레임에 적용했습니다.

원인은 `.sidebarItem:hover`와 active class의 CSS 우선순위가 같아 hover 규칙이 selected background를 계속 이기던 것이었습니다. active 자체에 `:hover`를 명시해 selected 값을 다시 고정했고, active에서는 background transition도 제외해 badge의 selected overlay만 먼저 보이는 짧은 불일치를 없앴습니다. E2E는 Button 항목에서 Badge 항목을 실제로 클릭해 포인터가 남은 상태의 URL·배경·transition property를 함께 검증합니다.

## 2026-09-14 — Preserve soft Sidebar badges under selected overlay

- 변경 파일: Sidebar badge state style·unit test·component docs
- 요약: selected badge의 기본을 `quiet`로 낮추는 대신, `soft` pigment 위에 행과 같은 neutral selected overlay를 합성하는 안으로 교체했습니다.

`quiet`는 중첩 surface를 확실히 없애지만 NEW/MOD의 작은 색면까지 사라져 release 표식의 스캔성이 줄었습니다. 후속 시안은 색면을 유지하면서 같은 `interaction.selected` overlay를 행과 badge 양쪽에 적용해 서로 같은 조명 아래 놓인 것처럼 묶습니다. 명시적인 `activeVariant`가 `soft`가 아닐 때는 overlay를 더하지 않아 호출자의 선택을 보존합니다.

## 2026-09-14 — Integrate badges into selected Sidebar rows

- 변경 파일: Sidebar API·unit test·component docs
- 요약: 선택된 행에서는 badge를 `soft`에서 `quiet`로 낮춰, selected 면 위에 작은 색면이 별도 레이어처럼 뜨지 않게 했습니다.

비활성 badge는 목록을 훑을 때 변경 표식이 보여야 하므로 기존 `soft`를 유지합니다. 활성 행은 행 전체의 selected 면이 이미 상태를 말하므로 badge까지 면을 가지면 중첩 surface가 됩니다. 기본 전이는 `soft → quiet`이며, 특별한 navigation에서는 `badge.variant`와 `badge.activeVariant`로 두 상태를 shared variant 안에서 각각 지정할 수 있습니다.

## 2026-09-14 — Complete the shared component architecture

- 변경 파일: shared color profile, Card·Table·Modal·navigation components, Playground registry/sidebar, component docs/tests
- 요약: 상위 컴포넌트를 개별 시안 모음이 아니라 shared 축과 compound anatomy로 정리하고, 빠져 있던 location·navigation·empty/pagination 관계를 채웠습니다.

Card의 `outlined·filled·solid·plain` 지역 문법은 제거하고 Button·Badge·Alert와 같은 `color × variant`를 직접 받게 했습니다. 기본은 `primary × hairline`이며 semantic Card도 별도 status API 없이 `info · success · warning · error`를 그대로 조합합니다. Card는 정적인 면이므로 shared 색 profile만 재사용하고 interactive hover gate와 shadow는 의도적으로 제외했습니다. 지역 variant는 Table의 행 구분(`plain·ruled·striped`)이나 Tabs의 navigation 구조처럼 shared 색 무게로 표현할 수 없는 경우에만 남깁니다.

Table은 간단한 목록을 위한 data API와 `Root/Header/Body/Row/Column/Cell` compound API를 같은 스타일 계약으로 제공하며 열별 align·numeric을 소유합니다. Modal도 Header·Title·Description·Body·Footer·Close anatomy와 자동 aria 연결을 갖습니다. Tooltip content는 `ReactNode`로 넓혔고, Breadcrumb·PageHeader·Sidebar·EmptyState·Pagination을 추가했습니다. Playground navigation의 `NEW`·`MOD` 표식은 전용 마크업이 아니라 Sidebar item metadata로 전달합니다.

⚠ accent soft를 sRGB로 primary neutral과 섞으면 hue가 틀어지고 탁해졌습니다. 최종 값은 OKLCH에서 accent hue를 고정하고 lightness는 wash→primary soft의 75%, chroma는 wash→edge의 75%로 이동시켰습니다. darker surface에 맞춰 `softInk`를 분리해 색을 맑게 유지하면서 작은 글자 대비도 보존했습니다.

## 2026-09-13 — Finalize solid Form borders and semantic hover shadow

- 변경 파일: Field·Select·Textarea 스타일, shape helper, 관련 문서·Playground E2E
- 요약: Lab에서 비교한 `solid / solid / semantic Form only` 조합을 확정하고 실험 UI를 제거했습니다.

neutral Field·Select·Textarea는 쉬는 `border.base`를 유지하다 hover에서 `primary.base` solid 선으로 올라갑니다. semantic Field·Textarea는 처음부터 해당 accent의 `solid` 선을 쓰며, hover에서는 선을 더 진하게 만들지 않고 같은 pigment를 `0 0 12px / 22%` 중앙 halo로 번지게 합니다. focus/focus-within에서는 hover shadow를 끄고 기존 파란 outline만 남깁니다.

⚠ 색 shadow를 Button·navigation·data row·neutral Form까지 넓히는 안도 비교했지만, 모든 hover가 떠 보이면 elevation 문법이 흐려집니다. 상태선이 이미 최종 농도라 hover 변화를 선으로 만들 수 없는 semantic Form만 예외로 남겼습니다. geometry와 농도는 `semanticFormHoverShadow` helper에 모으고 status별 accent solid만 주입합니다.

결정이 끝난 `?lab=form-hover` UI, runtime data attribute, override stylesheet와 Lab 전용 E2E는 모두 제거했습니다. 영구 관계 테스트가 neutral Form 세 종류의 solid hover·무그림자와 semantic Field의 solid rest·중앙 pigment shadow를 검증합니다.

## 2026-09-10 — Add a Paper UI design lab for field and pigment decisions

- 변경 파일: `workspace/app/src/lab/`, Field·Textarea 상태 스타일, color token 및 관련 문서·테스트
- 요약: 기존 spacing·shape 작업을 `92f3c50`으로 먼저 고정한 뒤, Field geometry 4안과 light accent pigment 3안을 실제 Playground 전체에 적용해 비교하는 Lab을 추가했습니다.

Field hover는 쉬는 상태의 `border.base`를 유지하다 포인터가 올라온 순간에만 대비 1.60의 `border.strong`으로 이동합니다. semantic status는 기본부터 `solid`를 써서 상태가 내용보다 먼저 튀던 문제를 `edge → hover edgeStrong` 구조로 바꿨습니다.

아이콘 Field는 높이를 키우면 같은 size의 Button·Select와 정렬 계약이 깨집니다. 그래서 기본 토큰을 바로 확정하지 않고, 높이를 유지한 채 어도먼트가 있는 변만 안으로 당기는 안을 포함해 네 geometry를 `?lab=design`에서 비교하도록 했습니다. 팔레트 후보는 아직 light만 검산했으므로 dark selector를 덮지 않게 제한했습니다.

첫 비교 뒤에는 현재 accent의 진한 `solid`·`ink`가 가장 낫다는 판단을 반영해 후보를 다시 좁혔습니다. 새 Veil·Pulp는 진한 축과 hover용 `edgeStrong`을 고정하고, 넓게 닿는 `wash`·쉬는 `edge`에만 paper neutral을 각각 45%·65% 섞습니다. Geometry에는 높이 변경 없이 모든 Field의 x padding을 세로 여백과 맞추는 7·9·12px 안을 추가했습니다.

Veil을 최종 accent로 확정해 package의 light `wash`·`edge` 토큰에 반영하고 palette 선택 UI는 제거했습니다. Lab의 geometry도 Field 전용이 아니라 Form 공통 축으로 고쳤습니다. Form 정사각 후보는 `inputPaddingX`와 `textareaPaddingY` 변수를 함께 바꿔 Field·Select·Textarea를 동시에 움직이며, 아이콘 보정안은 그 위에서 Field 어도먼트와 Select chevron만 추가 보정합니다.

Hairline은 outline보다 선만 옅고 ink가 같아서 실제 시각 무게가 충분히 갈리지 않는다는 문제가 남았습니다. 전역 토큰을 바로 늘리지 않고, light AA를 지키는 hue별 `subInk` 후보를 Lab에 추가했습니다. 쉬는 hairline만 낮추고 interactive hover에서는 기존 ink로 복귀합니다.

별도 `solidFg`는 `wash`와 같은 hue의 끝점을 중복하면서 라이트 solid 위 대비가 더 약했습니다. 슬롯을 제거하고 solid 위 글자와 Banner가 `wash`를 재사용하도록 통일했습니다. Veil wash 기준 대비는 라이트 4.56~4.89, 다크 5.16~5.80입니다.

Ink 비교는 `ink / subInk 1 / subInk 2` 세 단계로 확장했습니다. subInk 1은 AA 여유를 둔 짙은 안, subInk 2는 `ink.faint`처럼 물러나되 normal text AA를 지키는 끝값입니다. 농도와 적용 범위를 섞지 않도록 `Hairline만 / + Form 값`을 별도 축으로 두었습니다. 후보는 아직 light 전용이며 확정 전까지 package 토큰에는 넣지 않습니다.

최종 선택은 `Form 정사각 + 기존 ink`입니다. `inputPaddingX`를 7/9/12, `textareaPaddingY`를 3.5/5.5/8.5로 확정해 Field·Select·Textarea가 함께 소비하도록 했습니다. subInk는 가독성과 위계가 흐려져 도입하지 않았습니다. 선택이 끝난 Lab 컴포넌트, runtime stylesheet, session state, 비교용 data attribute와 Lab 전용 테스트는 모두 제거하고 확정 토큰의 관계 테스트로 환원했습니다.
## 2026-09-13 — Select placeholder tone

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Select.css.ts` · `workspace/app/src/pages/Playground.tsx`
- 요약: 빈 value option이 선택된 Select는 label과 chevron을 `ink.faint`로 함께 낮췄다.

Native select에는 placeholder 속성이 없으므로 빈 value option을 그 상태의 계약으로 삼았다. `:has(option[value=""]:checked)`가 실제 선택값을 읽기 때문에 controlled와 uncontrolled Select가 별도 React 상태 없이 같은 규칙을 따르고, 선택 후에는 원래 ink·chevron 색으로 즉시 돌아온다. Playground에도 빈 선택 예시를 남겨 이 상태를 바로 검토할 수 있게 했다.
## 2026-09-13 — Molecule · Component baseline expansion (`dev/molecule-components`)

- 변경 파일: `workspace/packages/paper-ui/src/{molecules,components}` · app demo/playground · component docs
- 요약: FormField·SearchField와 PageHeader·EmptyState·Pagination을 추가해 27개 기준선을 32개로 확장했다.

새 컴포넌트는 card·색면·shadow를 새로 만들지 않고 기존 paper/ink 축 안에서 반복 조립과 접근성 연결을 맡는다. FormField는 Select·Textarea까지 label/note 관계를 연결하지만 visual status를 빼앗지 않아 Atom의 status 계약을 보존했다. Pagination은 데모에서도 실제 행을 slice하고 필터 변경 시 첫 페이지로 돌아가며, EmptyState는 결과가 없을 때에만 다음 행동을 제시한다. 따라서 "컴포넌트가 많아 보이는" 방향이 아니라 데이터 화면의 시작·빈 상태·이동이라는 빠져 있던 문장을 닫는다.
## 2026-09-14 — Define structural axes for Molecules and Components

- 변경 파일: Card·Tabs·RadioGroup·Table·Modal, component architecture 문서, Playground·Demo·E2E
- 요약: 상위 레이어를 개수로만 채우지 않고 variant·density·size·orientation의 소유권을 정한 뒤 실제 컴포넌트와 비교 표본에 반영했습니다.

Atom의 `color × variant`는 의미색과 시각 무게지만, Card·Table·Tabs의 `variant`는 구조를 고릅니다. Card는 `outlined·filled·plain`, Table은 `plain·ruled·striped`, Tabs는 `segmented·underline`으로 닫았습니다. Table의 `density`는 14px 글자를 그대로 둔 행 높이 36·44·52이고, Modal의 `size`는 담는 일의 폭 360·432·640입니다. RadioGroup에는 짧고 대등한 선택지를 위한 horizontal 배치를 열었습니다.

⚠ shadow를 Card variant로 열지 않았고 ruled와 striped를 겹치는 조합도 만들지 않았습니다. 둘은 각각 붙어 있는 면의 경계와 행 구분을 한 번만 말해야 하기 때문입니다. underline Tabs에서는 닫힌 실루엣이 없으므로 `shape`를 무시합니다. 이런 금지 조합까지 `docs/foundations/component-architecture.md`에 정본으로 남겼습니다.

Playground 시각 검토에서 Table 세 variant와 세 density가 한 줄에서 바로 비교되도록 표본 폭을 15rem으로 맞췄습니다. Card의 세 경계, underline의 선형 구조, Table의 구분법·행 높이, Modal 폭을 computed style로 고정했으며 전체 52개 E2E가 통과합니다.
## 2026-09-15 — Rename shape default to rounded

- 변경 파일: Button·Badge·Field·Select·SegmentedControl API, Playground registry, architecture docs
- 요약: shape 축의 모호한 `default` 이름을 `rounded`로 바꾸고, 컴포넌트별 기본 shape를 분리했습니다.

`default`는 상태 기본값처럼 읽혀 실제 모양을 설명하지 못했습니다. 기존 곡선은 `rounded`, 알약형은 `pill`로 명명하고, SegmentedControl만 생략 시 `pill`을 기본으로 두었습니다. 나머지 한 줄 컨트롤은 기존 곡선을 유지하며 명시적인 override는 `shape="rounded"`로 표현합니다.
## 2026-09-15 — Clarify Select defaults in Playground

- 변경 파일: Playground registry·detail control
- 요약: Select의 실제 기본값(`md · rounded`)을 `default(md)`, `default(rounded)`로 표시하고 명시값과 구분했습니다.

기본 선택지는 별도 sentinel로 유지해 미지정 prop을 preview와 생성 코드에서 재현합니다. Select 컴포넌트 자체의 기본 계약은 변경하지 않았습니다.
## 2026-09-15 — Expose defaults in every Playground prop select

- 변경 파일: Playground Detail control
- 요약: 모든 enum prop select에 `default (실제값)` 옵션을 공통으로 노출했습니다.

기본값을 선택하면 실제 상태는 기존 `def`를 유지해 preview와 생성 코드가 prop 생략 상태를 재현합니다. 명시값과 기본값을 같은 값으로 중복 저장하지 않고 select 표시만 sentinel로 분리했습니다.
## 2026-09-15 — Omit default props in Playground code output

- 변경 파일: Playground Detail control·registry
- 요약: 모든 enum control에 `default (값)`을 노출하고, 기본 선택 시 생성 코드에서 prop을 생략하도록 정리했습니다. Box generator의 잘못된 기본 비교와 존재하지 않는 padding 출력도 수정했습니다.

표시용 sentinel은 내부 상태를 바꾸지 않고 실제 `def` 값으로 환원됩니다. 따라서 preview와 code가 동일한 기본 계약을 유지하며, Box는 `raised · md · md` 기본값을 코드에 중복 출력하지 않습니다.
## 2026-09-15 — Make Playground code editable

- 변경 파일: Playground Detail editor·styles
- 요약: 코드 박스를 editable textarea로 바꾸고, 생성된 Paper UI JSX의 props·단순 text children을 다시 읽어 preview를 갱신하도록 연결했습니다.

임의 JavaScript를 실행하지 않고 각 component spec의 선언된 prop만 opening tag에서 읽습니다. 따라서 문법이 깨진 편집 중에도 앱은 안전하게 유지되고, preview는 마지막 유효 상태를 보여주며 오류 문구를 편집 영역에 남깁니다. Props 패널을 조작하면 편집 초안을 버리고 canonical code를 재생성합니다.
## 2026-09-15 — Read stateful Playground snippets

- 변경 파일: Playground Detail parser
- 요약: `value={value}` 형태를 쓰는 Menu·Tabs·SegmentedControl도 코드 안의 `useState("...")` 초기값을 읽어 preview와 연결했습니다.

기존 code generator가 동작 예제를 보여주기 위해 hook 표현식을 포함하고 있어 literal attribute만 읽으면 선택값이 기본값으로 되돌아갔습니다. hook의 단순 문자열 초기값만 해석하고, 임의 JavaScript 실행은 여전히 하지 않습니다.
## 2026-09-15 — Remove visible code placeholders

- 변경 파일: Playground Detail code expansion·registry
- 요약: 코드 편집 영역에 보이던 `<Box>…</Box>` 같은 placeholder를 실제 Text·Icon·Breadcrumb JSX로 확장했습니다.

코드박스가 이제 복사·수정 가능한 source surface인 만큼 생략 기호를 남기지 않도록 했습니다. Box 기본 예제는 preview와 같은 `surface=raised` 내용을 출력하고, 단순한 반복 예제와 아이콘·breadcrumb도 실제로 읽을 수 있는 JSX 조각을 보여줍니다.
## 2026-09-16 — Keep Playground code read-only until edit mode

- 변경 파일: Playground Detail code surface·styles
- 요약: 코드 박스를 기본 read-only pre로 바꾸고 우측 상단 연필 icon button으로만 편집 모드에 진입하게 했습니다.

코드는 평소 preview를 설명하는 조용한 reference로 두고, 사용자가 의도적으로 연필을 누른 경우에만 textarea가 열립니다. 복사와 편집 액션을 같은 우측 상단 action cluster에 배치해 코드 영역의 시각적 위계를 유지했습니다.
## 2026-09-16 — Use hairline edit toggle state

- 변경 파일: Playground Detail code action
- 요약: 코드 편집 버튼을 `hairline` variant로 통일하고, 편집 중에는 pencil 대신 X 아이콘을 표시합니다.

아이콘만 바꾸는 대신 현재 동작 상태를 닫기 affordance로 직접 표현해 편집 모드 진입·종료를 한 자리에서 이해할 수 있게 했습니다.
## 2026-09-16 — Align read-only and edit code typography

- 변경 파일: Playground detail styles
- 요약: read-only `pre`와 edit `textarea`에 동일한 mono font, weight, style, caption tracking을 명시했습니다.

폼 컨트롤의 브라우저 기본 타이포그래피가 편집 상태에서만 남아 자간이 달라 보일 수 있었습니다. 두 상태가 같은 텍스트 surface처럼 보이도록 typography 축을 직접 공유하게 했습니다.
## 2026-09-16 — Contrast code surface by edit state

- 변경 파일: Playground code block state styles
- 요약: read-only 코드는 `sunken`, 편집 중 코드는 `raised` surface를 사용하도록 전환했습니다.

브라우저에서 Box Playground를 확인한 결과 평소에는 코드가 한 단계 물러나고, 편집 모드에서는 textarea가 흰 면으로 올라와 입력 대상이 분명해졌습니다. 편집 버튼을 누를 때만 class가 바뀌므로 preview나 Props surface에는 영향이 없습니다.
## 2026-09-16 — Remove copy button fill

- 변경 파일: Playground code action styles
- 요약: 복사 버튼의 raised 배경과 border를 제거해 quiet 텍스트 액션으로 정리했습니다.

편집 toggle만 hairline shape를 유지하고, 복사는 코드 surface 위에 조용히 놓이는 보조 액션으로 분리했습니다.
## 2026-09-16 — Use system Button for code copy

- 변경 파일: Playground Detail code action·styles
- 요약: raw `<button>` 복사 액션을 Paper UI `Button`의 `hairline` variant로 교체하고 전용 raw button CSS를 제거했습니다.

편집 toggle과 복사 액션 모두 공개 디자인 시스템 Button을 사용해 높이·focus·hover·radius 계약을 공유합니다.
## 2026-09-16 — Add compact xs control size

- 변경 파일: `workspace/packages/paper-ui/src/tokens/shape.ts`, `workspace/packages/paper-ui/src/atoms/Button.css.ts`, `workspace/app/src/playground/Detail.tsx`
- 요약: Playground 코드 액션을 `Button size="xs"`로 전환하고, 컨트롤 사다리에 xs 높이·패딩·폰트·아이콘·폼·배지 값을 추가했습니다.

복사 액션만 `sm`의 34px 실루엣을 유지한 채 폰트만 줄이면 같은 size 계약이 컴포넌트별로 갈라집니다. xs를 독립 단계로 두어 마이크로 액션의 높이와 글자 크기를 함께 줄이고, 기존 sm의 14px 가독성 계약은 보존했습니다. Variant 확장은 현재 매핑을 정리한 뒤 별도 작업으로 진행합니다.
## 2026-09-16 — Separate button typography from control size and expand variants

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Button.tsx`, `workspace/packages/paper-ui/src/atoms/Button.css.ts`, `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/packages/paper-ui/src/styles/color.css.ts`
- 요약: 컨트롤 size는 기존 `sm/md/lg`로 유지하고 Button에 `fontSize` override를 추가했습니다. 복사 액션은 `sm + label` 조합을 사용합니다. `hairlineMuted`, `muted`, `ghost`, `ghostMuted`, `tonal`, `tonalMuted`를 4축 color profile로 확장했습니다.

xs를 전체 컨트롤 사다리에 넣어 보니 복사 버튼 하나를 줄이기 위해 높이·아이콘·폼 밀도까지 함께 내려가는 부작용이 생겼습니다. 따라서 size는 geometry 축으로 고정하고, 작은 보조 라벨만 typography 축에서 조절하도록 분리했습니다. Variant는 기존 `quiet` 호환성을 남긴 채 각 profile이 foreground·background·border·interaction을 독립적으로 정의하며, muted 계열만 hover 시 잉크와 선을 함께 강화합니다.
## 2026-09-16 — Expose typography overrides in Playground controls

- 변경 파일: `workspace/app/src/playground/registry.tsx`, `workspace/packages/paper-ui/src/atoms/Badge.tsx`, `workspace/packages/paper-ui/src/atoms/Field.tsx`, `workspace/packages/paper-ui/src/atoms/Select.tsx`, `workspace/packages/paper-ui/src/atoms/Textarea.tsx`
- 요약: Button·Badge·Field·Select·Textarea의 Props table에 `fontSize`를 노출하고, 기본값은 코드에서 생략되도록 했습니다. 각 컴포넌트의 `size` geometry는 유지한 채 typography만 조정합니다.

`size`와 `fontSize`를 같은 축으로 묶으면 작은 라벨 하나 때문에 컨트롤 높이와 아이콘까지 축소됩니다. Playground에서는 `default / label / caption / body`만 노출해 의도적인 typography override만 허용하고, 기본값은 기존 컴포넌트의 size 사다리를 따르게 두었습니다.
## 2026-09-16 — Rename muted variant to softMuted

- 변경 파일: `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/app/src/playground/registry.tsx`
- 요약: `muted` variant를 `softMuted`로 이름을 명확히 바꿨습니다.

이 variant는 일반적인 약화 상태가 아니라 soft 배경·soft border·softInk를 한 묶음으로 쓰는 조합이므로, 이름에 기반면을 드러내는 편이 shared variant 사다리를 읽기 쉽습니다. 시각값과 hover 동작은 바꾸지 않았습니다.
## 2026-09-16 — Remove unused tonal variants

- 변경 파일: `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/app/src/playground/registry.tsx`
- 요약: `tonal`과 `tonalMuted`를 shared variant 사다리에서 제거했습니다.

현재는 solid·soft와 역할이 겹치고, 별도의 tonal surface를 요구하는 실제 사용처가 없습니다. 필요할 때 다시 추가할 수 있도록 색 profile 축을 유지하되 공개 variant로는 노출하지 않았습니다.
## 2026-09-16 — Rebalance muted variants and remove quiet

- 변경 파일: `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/packages/paper-ui/src/components/Modal.tsx`, `workspace/packages/paper-ui/src/components/Pagination.tsx`, `workspace/app/src/playground/registry.tsx`
- 요약: `quiet`을 제거하고 `plainMuted`, `outlineMuted`를 추가했습니다. `softMuted`는 무테 soft variant로 분리했으며, 기존 quiet 사용처는 `ghostMuted`로 치환했습니다. Playground variant 순서도 기본 variant 뒤 muted 대응 variant가 오도록 재정렬했습니다.

이제 면과 선의 조합이 겹치지 않습니다. `softMuted`는 soft 면만, `plainMuted`는 soft 면과 hairline 선, `outlineMuted`는 투명 면과 강한 선, `hairlineMuted`는 투명 면과 page hairline을 담당합니다.
## 2026-09-16 — Preserve strong borders in muted variants

- 변경 파일: `workspace/packages/paper-ui/src/styles/color-profile.ts`
- 요약: `plainMuted`의 border를 `plain`과 같은 강한 `edgeStrong`으로 복원했습니다. `outlineMuted`도 `outline`과 동일하게 이미 강한 border를 사용하고 있음을 확인했습니다.

Muted는 foreground만 낮추고 원본 variant의 구조적 border 강도는 보존해야 합니다. 따라서 plain·outline의 muted 버전은 각각 원본과 같은 강한 선을 유지하고, soft·hairline 계열만 해당 계층의 약한 선을 사용합니다.
## 2026-09-16 — Tune Playground code viewer surfaces

- 변경 파일: `workspace/app/src/playground/Detail.tsx`, `workspace/app/src/playground/detail.css.ts`
- 요약: 코드뷰어의 복사·편집 버튼을 `hairlineMuted`로 통일하고, 읽기 상태는 `raised`, 편집 상태는 `sunken`으로 조정했습니다.

코드는 평소에는 떠 있는 reference surface로 읽히고, 편집 중에는 입력 surface로 가라앉아야 한다는 상태 대비를 적용했습니다. 버튼은 약한 잉크와 hairline을 함께 사용해 코드 영역 위에서 과하게 튀지 않게 했습니다.
## 2026-09-16 — Add Button icon size axis

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Button.tsx`, `workspace/app/src/playground/registry.tsx`
- 요약: Button에 `iconSize` prop을 추가해 외곽 `size`, 텍스트 `fontSize`, 아이콘 아트보드 크기를 독립적으로 조절하도록 했습니다. `iconOnly`와 아이콘+라벨 조합 모두 지원합니다.

Button은 기존처럼 children으로 `<Icon>`을 받되, `iconSize`가 지정되면 직접 자식 Icon의 size를 덮어씁니다. 아이콘이 아닌 children은 건드리지 않으므로 라벨·복합 콘텐츠 API와 충돌하지 않습니다. Playground Props table에도 `iconSize`를 노출했습니다.
## 2026-09-16 — Use Button iconSize for code editor toggle

- 변경 파일: `workspace/app/src/playground/Detail.tsx`
- 요약: 코드뷰어 연필·닫기 버튼이 `Button iconSize="sm"`을 사용하도록 정리하고, Icon의 직접적인 size 우회를 제거했습니다.

아이콘 크기 축을 추가한 뒤 실제 소비처도 새 API를 사용하게 맞췄습니다. 화면 크기는 기존과 동일하지만, 버튼 외곽·아이콘 아트보드의 책임이 코드에 명확히 드러납니다.
## 2026-09-16 — Add icon plus label state to Button Playground

- 변경 파일: `workspace/app/src/playground/registry.tsx`
- 요약: Button Props table에 `leadingIcon` 토글을 추가해 일반 라벨 버튼에서도 아이콘+라벨 조합을 preview와 코드에 함께 노출합니다.

`iconOnly`는 접근성 이름이 필요한 별도 상태로 유지하고, `leadingIcon`은 기존 compound children API(`<Icon />라벨`)를 보여주는 Playground 전용 조합 토글로 분리했습니다.
## 2026-09-16 — Split IconButton from Button

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Button.tsx`, `workspace/packages/paper-ui/src/atoms/IconButton.tsx`, `workspace/app/src/playground/registry.tsx`, `workspace/app/src/playground/Detail.tsx`
- 요약: Button의 `iconOnly`, `iconSize`, leading icon 해석을 제거하고 `IconButton`을 별도 atom으로 추가했습니다. Modal·코드뷰어·전수 Playground 사용처를 새 API로 전환했습니다.

텍스트 버튼이 children 내부의 아이콘을 해석하면 Button API가 compound layout까지 책임지게 됩니다. 이제 IconButton만 정사각 geometry와 `iconSize`를 소유하며, Button은 텍스트 액션에 집중합니다. Playground에도 IconButton 전용 Props table을 추가했습니다.
## 2026-09-16 — Require Playground parity for system changes

- 변경 파일: `CLAUDE.md`
- 요약: 컴포넌트·prop·variant·token 변경 시 app Playground의 preview·Props table·생성 코드까지 반드시 반영하고 실제 동작을 확인하도록 작업 완료 체크리스트에 추가했습니다.

Playground가 이 레포의 유일한 시각 검증 surface이므로, 패키지 코드만 바뀐 상태를 완료로 보지 않도록 규칙을 명문화했습니다.
## 2026-09-16 — Move Icon to primitives and align its size vocabulary

- 변경 파일: Icon primitive·tokens, public exports, IconButton·form consumers, Playground registry
- 요약: Icon을 Atom에서 Primitive로 이동하고 `sm/md/lg` 대신 typography ladder의 `label/caption/body/subheading`을 사용하도록 정리했습니다.

아이콘은 텍스트처럼 조합되는 가장 낮은 수준의 표시 primitive라 Button·Field 같은 Atom과 같은 서랍에 둘 이유가 없었습니다. 공개 크기 이름은 typography ladder와 공유하되, 24 viewBox path의 내부 여백 때문에 실제 아트보드는 14·16·18·20px로 광학 보정했습니다. IconButton의 기본은 기존 `md`와 같은 18px인 `body`로 유지해 화면 크기를 보존했습니다. Playground에서도 Icon을 Primitives 그룹으로 옮기고 size·iconSize 선택지를 새 어휘로 갱신했습니다.
## 2026-09-16 — Keep Sidebar state overlay above badges

- 변경 파일: Sidebar layer CSS·compound badge test
- 요약: Sidebar hover/selected overlay를 행 pseudo-element로 올려 Badge까지 같은 상태 틴트 아래에 두었습니다.

기존에는 selected soft Badge 자체에 별도 gradient를 붙여 배지가 행의 overlay 위로 튀어나온 것처럼 보였습니다. 이제 행이 stacking context를 소유하고 텍스트와 Badge는 overlay보다 아래에 놓입니다. selected는 클릭 즉시, hover는 포인터 진입 즉시 같은 레이어에서 합성되며 Badge의 의미 색은 유지하면서 별도 칩처럼 떠 보이지 않습니다.
## 2026-09-16 — Lift neutral Field hover border to primary hover

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Field.css.ts`
- 요약: 일반 Field의 hover 테두리를 `primary.base`에서 한 단계 밝은 `primary.hover`로 조정했습니다.

일반 Field는 배경을 바꾸지 않고 선으로만 hover를 알리므로, resting border와의 차이는 유지하면서 primary solid보다 덜 무거운 `#3f3f46`을 사용하도록 했습니다. Select·Textarea는 이번 비교 범위에서 기존 동작을 유지합니다.
## 2026-09-16 — Use soft ink for neutral form hover edges

- 변경 파일: Field·Select·Textarea hover styles
- 요약: 일반 input류의 hover 테두리를 primary 계열이 아닌 `ink.soft`로 통일했습니다.

일반 Form의 resting edge는 구조선이고 hover는 그 선을 읽기용 잉크 농도까지 한 단계 올리는 피드백으로 정리했습니다. `primary`는 주요 행동 surface에만 남기며, semantic Form은 기존처럼 처음부터 status solid edge와 pigment halo를 사용합니다.
## 2026-09-16 — Lighten neutral form hover edges

- 변경 파일: Field·Select·Textarea hover styles
- 요약: 일반 input류 hover edge를 `ink.soft`에서 `ink.faint`로 낮췄습니다.

기본 edge보다 한 단계만 또렷해지는 가벼운 hover를 목표로 조정했습니다. 이 상태도 semantic Form의 명시적인 status edge와는 충분히 구분됩니다.
