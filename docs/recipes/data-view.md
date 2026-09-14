# Data Table

표 위에 필터 바를 얹어 데이터 화면을 짓습니다. 데모(이슈 트래커)의 뼈대가 이것입니다 — `Tabs`·`Select`·`Checkbox`로 짠 필터 한 줄 아래, `Table`과 status `Badge`.

## 필터 바

세그먼트로 나뉘는 큰 분류는 `Tabs`, 값을 좁히는 필터는 `Select`, 참/거짓 토글은 `Checkbox`로 냅니다. 한 줄에 두되 왼쪽(분류)과 오른쪽(필터)을 `Inline justify="between"`으로 갈라 놓습니다.

```tsx
<Inline justify="between" wrap gap="md">
  <Tabs value={tab} onChange={setTab} items={[
    { value: "all", label: "전체" },
    { value: "open", label: "열림" },
    { value: "done", label: "완료" },
  ]} />

  <Inline gap="md">
    <Inline as="label" gap="sm" align="center">
      <Checkbox checked={mineOnly} onChange={(e) => setMineOnly(e.currentTarget.checked)} />
      <Text variant="caption" as="span">내 담당만</Text>
    </Inline>
    <Box style={{ width: "9rem" }}>
      <Select value={priority} onChange={(e) => setPriority(e.currentTarget.value)} options={[
        { value: "all", label: "우선순위 전체" },
        { value: "high", label: "높음" },
        { value: "low", label: "낮음" },
      ]} />
    </Box>
  </Inline>
</Inline>
```

필터 상태는 컴포넌트가 들지 않습니다 — `useState`로 여러분이 들고, 걸러진 행을 `Table`에 넘깁니다. 시스템은 컨트롤의 *모양*만 정하고, *무엇을 거를지*는 화면의 몫입니다.

## 표와 status 배지

반복되는 행은 `Table`의 data API가 가장 짧습니다. `columns`의 각 `render`가 칸의 내용을 정하고, 상태 칸은 `Badge`에 `color`를 넘겨 옅은 색 면으로 냅니다(`status`는 Field 계열의 validation 축이라 여기서는 쓰지 않습니다). 숫자 열은 `numeric: true`만 주면 tabular-nums·우측정렬이 자동입니다(등폭 아님 — 표가 시끄러워지지 않게). `align="start · center · end"`로 열마다 정렬을 직접 정할 수도 있습니다.

표의 축은 둘입니다. `variant="plain · ruled · striped"`는 행을 **어떻게 구분할지**, `density="compact · default · comfortable"`는 같은 14px 정보를 **얼마나 촘촘히 담을지** 정합니다. 선과 줄무늬를 동시에 넣는 prop 조합은 없습니다. 둘이 같은 정보를 두 번 말하지 않게 막은 것입니다. 운영 도구처럼 반복 정보가 많은 화면은 `ruled + compact`, 읽기 중심 목록은 `plain + default`가 안정적인 시작점입니다.

```tsx
type Issue = { id: string; key: string; title: string; state: StatusName; count: number };

const columns: Column<Issue>[] = [
  { key: "key", header: "키", render: (r) => <Text variant="body" as="span">{r.key}</Text> },
  { key: "title", header: "제목", render: (r) => r.title },
  { key: "state", header: "상태", render: (r) => <Badge color={r.state}>{label(r.state)}</Badge> },
  { key: "count", header: "건수", numeric: true, render: (r) => r.count.toLocaleString() },
];

<Table variant="plain" density="default"
  columns={columns} rows={rows} rowKey={(r) => r.id} />
```

기본 표는 별도 Card나 외곽선 없이 페이지에 바로 놓습니다. 회색은 header 면에만 쓰고, body의 행 간격과 hover가 구분을 맡습니다. 사용자가 보낸 홈 예제처럼 가장 조용하고 읽기 쉬운 시작점입니다. 실제 패널 경계가 필요한 화면에서만 바깥 Card를 더합니다.

열 구조가 동적이거나 `colSpan`, 복합 header처럼 data 배열로 표현하기 어려우면 같은 스타일 계약의 compound API를 씁니다. `Table.Column`과 `Table.Cell`이 각각 정렬을 소유하므로 header와 body가 우연히 어긋나지 않습니다.

```tsx
<Table.Root variant="plain" density="default">
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
</Table.Root>
```

## 왜 이렇게

`Badge`의 color와 필터의 컨트롤은 전부 시스템이 정합니다 — `info`·`success`·`warning`·`error`가 어느 화면에서든 같은 파랑·초록·amber·빨강입니다. 그래서 이슈 트래커의 "막힘"이 빨갛고 대시보드의 "실패"가 빨갛다면, 둘은 저절로 같은 빨강입니다. 여러분이 정하는 것은 *어떤 데이터를, 어떤 열로, 어떻게 거를지*뿐입니다. 살아 있는 전체 화면은 [데모](/demo)에서 봅니다.
