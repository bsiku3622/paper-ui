# Data Table

표 위에 필터 바를 얹어 데이터 화면을 짓습니다. 데모(이슈 트래커)의 뼈대가 이것입니다 — `SegmentedControl`·`Select`·`Checkbox`로 짠 필터 한 줄 아래, `Table`과 status `Badge`.

## 필터 바

세그먼트로 나뉘는 큰 분류는 `SegmentedControl`, 값을 좁히는 필터는 `Select`, 참/거짓 토글은 `Checkbox`로 냅니다. 한 줄에 두되 왼쪽(분류)과 오른쪽(필터)을 `Inline justify="between"`으로 갈라 놓습니다.

```tsx
<Inline justify="between" wrap gap="md">
  <SegmentedControl value={filter} onValueChange={setFilter}>
    <SegmentedControl.Item value="all">전체</SegmentedControl.Item>
    <SegmentedControl.Item value="open">열림</SegmentedControl.Item>
    <SegmentedControl.Item value="done">완료</SegmentedControl.Item>
  </SegmentedControl>

  <Inline gap="md">
    <Inline as="label" gap="sm" align="center">
      <Checkbox checked={mineOnly} onChange={(e) => setMineOnly(e.currentTarget.checked)} />
      <Text variant="caption" as="span">내 담당만</Text>
    </Inline>
    <Box style={{ width: "9rem" }}>
      <Select value={priority} onChange={(e) => setPriority(e.currentTarget.value)}>
        <Select.Option value="all">우선순위 전체</Select.Option>
        <Select.Option value="high">높음</Select.Option>
        <Select.Option value="low">낮음</Select.Option>
      </Select>
    </Box>
  </Inline>
</Inline>
```

필터 상태는 컴포넌트가 들지 않습니다 — `useState`로 여러분이 들고, 걸러진 행을 `Table.Row`로 조합합니다. 시스템은 컨트롤의 *모양*만 정하고, *무엇을 거를지*는 화면의 몫입니다.

## 표와 status 배지

Table은 화면에 보이는 열과 셀을 그대로 JSX에 적습니다. 상태 칸은 `Badge`에 `color`를 넘겨 옅은 색 면으로 내고, `Table.Column`과 `Table.Cell`이 각자의 `align`·`numeric`을 소유합니다. 객체 안의 render 함수보다 실제 semantic table 구조가 코드에서 바로 읽히는 것이 우선입니다.

표의 축은 둘입니다. `variant="plain · ruled · striped"`는 행을 **어떻게 구분할지**, `density="compact · default · comfortable"`는 같은 14px 정보를 **얼마나 촘촘히 담을지** 정합니다. 선과 줄무늬를 동시에 넣는 prop 조합은 없습니다. 둘이 같은 정보를 두 번 말하지 않게 막은 것입니다. 운영 도구처럼 반복 정보가 많은 화면은 `ruled + compact`, 읽기 중심 목록은 `plain + default`가 안정적인 시작점입니다.

```tsx
<Table variant="plain" density="default">
  <Table.Header>
    <Table.Column>키</Table.Column>
    <Table.Column>이슈</Table.Column>
    <Table.Column align="center">담당</Table.Column>
    <Table.Column align="end">건수</Table.Column>
  </Table.Header>
  <Table.Body>
    {rows.map((row) => (
      <Table.Row key={row.id}>
        <Table.Cell>{row.key}</Table.Cell>
        <Table.Cell>{row.title}</Table.Cell>
        <Table.Cell align="center">{row.owner}</Table.Cell>
        <Table.Cell numeric>{row.count}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

기본 표는 별도 container나 외곽선 없이 페이지에 바로 놓습니다. 회색은 직각 header 면에만 쓰고, body의 행 간격과 hover가 구분을 맡습니다. 실제 패널 경계가 필요한 화면에서만 바깥에 Box의 surface·border를 조합합니다. 서버 스키마에서 곧바로 표를 만드는 제한적인 경우에는 별도 `DataTable` adapter를 쓸 수 있지만, 제품 화면의 기본 API는 위 compound anatomy입니다.

## 왜 이렇게

`Badge`의 color와 필터의 컨트롤은 전부 시스템이 정합니다 — `info`·`success`·`warning`·`error`가 어느 화면에서든 같은 파랑·초록·amber·빨강입니다. 그래서 이슈 트래커의 "막힘"이 빨갛고 대시보드의 "실패"가 빨갛다면, 둘은 저절로 같은 빨강입니다. 여러분이 정하는 것은 *어떤 데이터를, 어떤 열로, 어떻게 거를지*뿐입니다. 살아 있는 전체 화면은 [데모](/demo)에서 봅니다.
