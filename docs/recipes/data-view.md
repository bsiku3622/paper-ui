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

`Table`은 `columns`를 data로 받습니다. 각 열의 `render`가 그 칸에 무엇을 그릴지 정하고, 상태 칸은 `Badge`에 `status`를 넘겨 옅은 색 면으로 냅니다. 숫자 열은 `numeric: true`만 주면 tabular-nums·우측정렬이 자동입니다(등폭 아님 — 표가 시끄러워지지 않게).

```tsx
type Issue = { id: string; key: string; title: string; state: StatusName; count: number };

const columns: Column<Issue>[] = [
  { key: "key", header: "키", render: (r) => <Text variant="body" as="span">{r.key}</Text> },
  { key: "title", header: "제목", render: (r) => r.title },
  { key: "state", header: "상태", render: (r) => <Badge status={r.state}>{label(r.state)}</Badge> },
  { key: "count", header: "건수", numeric: true, render: (r) => r.count.toLocaleString() },
];

<Box paper="subtle" radius="md" style={{ overflow: "hidden" }}>
  <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
</Box>
```

표는 옅은 면(`paper="subtle"`) 카드 안에 넣어 테두리 없이 감쌉니다 — 테두리 대신 면으로 구획하는 결입니다. 행 hover는 `Table`이 알아서 한 단 어두워집니다.

## 왜 이렇게

`Badge`의 color와 필터의 컨트롤은 전부 시스템이 정합니다 — `info`·`success`·`warning`·`error`가 어느 화면에서든 같은 파랑·초록·amber·빨강입니다. 그래서 이슈 트래커의 "막힘"이 빨갛고 대시보드의 "실패"가 빨갛다면, 둘은 저절로 같은 빨강입니다. 여러분이 정하는 것은 *어떤 데이터를, 어떤 열로, 어떻게 거를지*뿐입니다. 살아 있는 전체 화면은 [데모](/demo)에서 봅니다.
