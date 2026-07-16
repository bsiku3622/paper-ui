// 데모 — ledger 의 한 화면을 paper-ui 20 개로 다시 만든다.
//
// 이게 이 데모의 전부다. 컴포넌트 갤러리가 아니라 *실제 화면 하나* 를 짓는다.
// 20 개로 장부 화면이 서면 20 개면 충분한 것이고, 안 서면 뭐가 빠졌는지 여기서
// 드러난다. 그게 "실사용 검증" 이다.

import { useMemo, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Inline,
  Label,
  Modal,
  Navbar,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextField,
  Tooltip,
  type Column,
} from "@studio-baeks/paper-ui";

type Entry = {
  id: string;
  date: string;
  memo: string;
  tag: string;
  amount: number; // 음수 = 지출
};

const ENTRIES: Entry[] = [
  { id: "1", date: "07-16", memo: "급여", tag: "수입", amount: 3_240_000 },
  { id: "2", date: "07-15", memo: "전세 대출 이자", tag: "고정", amount: -412_000 },
  { id: "3", date: "07-14", memo: "장보기 — 이마트", tag: "식비", amount: -86_400 },
  { id: "4", date: "07-14", memo: "커피", tag: "식비", amount: -4_800 },
  { id: "5", date: "07-12", memo: "책 — 알라딘", tag: "문화", amount: -32_000 },
  { id: "6", date: "07-11", memo: "외주 정산", tag: "수입", amount: 900_000 },
  { id: "7", date: "07-09", memo: "통신비", tag: "고정", amount: -55_000 },
];

const won = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ko-KR")}`;

export const App = () => {
  const [tab, setTab] = useState("all");
  const [tag, setTag] = useState("all");
  const [hideSmall, setHideSmall] = useState(false);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      ENTRIES.filter((e) => (tab === "all" ? true : tab === "in" ? e.amount > 0 : e.amount < 0))
        .filter((e) => (tag === "all" ? true : e.tag === tag))
        .filter((e) => (hideSmall ? Math.abs(e.amount) >= 10_000 : true)),
    [tab, tag, hideSmall],
  );

  const total = rows.reduce((s, e) => s + e.amount, 0);

  const columns: Column<Entry>[] = [
    { key: "date", header: "날짜", render: (r) => <Text variant="numeric">{r.date}</Text> },
    { key: "memo", header: "적요", render: (r) => r.memo },
    {
      key: "tag",
      header: "분류",
      render: (r) => <Badge status={r.amount > 0 ? "success" : "info"}>{r.tag}</Badge>,
    },
    {
      key: "amount",
      header: "금액",
      numeric: true,
      // 번 돈은 검정, 쓴 돈은 붉은 잉크 — 이 시스템에서 색이 등장하는 자리.
      render: (r) => (
        <Text variant="numeric" className={r.amount < 0 ? "paper-red-ink" : undefined}>
          {won(r.amount)}
        </Text>
      ),
    },
  ];

  return (
    <Stack>
      <Navbar
        brand={<Text variant="heading">장부</Text>}
        items={[
          { value: "book", label: "기입" },
          { value: "budget", label: "예산" },
          { value: "report", label: "결산" },
        ]}
        active="book"
        trailing={
          <Inline gap="sm">
            <Tooltip label="새 항목 추가 (N)">
              <Button kind="solid" onClick={() => setOpen(true)}>
                기입
              </Button>
            </Tooltip>
          </Inline>
        }
      />

      <Box paddingX="xl" paddingY="xl">
        <Stack gap="xl" className="page">
          <Stack gap="xs">
            <Text variant="label">2026년 7월</Text>
            <Inline justify="between" align="baseline">
              <Text variant="title">이번 달 장부</Text>
              <Text variant="numeric" className={total < 0 ? "paper-red-ink" : undefined}>
                {won(total)}
              </Text>
            </Inline>
          </Stack>

          <Inline gap="md" justify="between" wrap>
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "all", label: "전체" },
                { value: "in", label: "수입" },
                { value: "out", label: "지출" },
              ]}
            />
            <Inline gap="md">
              <Box>
                <Select
                  value={tag}
                  onChange={(e) => setTag(e.currentTarget.value)}
                  options={[
                    { value: "all", label: "분류 전체" },
                    { value: "수입", label: "수입" },
                    { value: "고정", label: "고정" },
                    { value: "식비", label: "식비" },
                    { value: "문화", label: "문화" },
                  ]}
                />
              </Box>
              <Inline as="label" gap="sm">
                <Checkbox
                  checked={hideSmall}
                  onChange={(e) => setHideSmall(e.currentTarget.checked)}
                />
                <Text variant="caption" as="span">
                  1만원 미만 숨기기
                </Text>
              </Inline>
            </Inline>
          </Inline>

          {/* 괘선지 위에 행이 앉는다 — Table 의 행 높이 = line = 괘선 간격 */}
          <Card padding="none" radius="base">
            <Box ruled>
              <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
            </Box>
          </Card>

          <Inline gap="lg">
            <Text variant="caption">{rows.length}건</Text>
            <Divider axis="vertical" />
            <Text variant="caption">잔액은 기입 즉시 반영됩니다.</Text>
          </Inline>
        </Stack>
      </Box>

      <Modal
        open={open}
        title="새 항목 기입"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button kind="quiet" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button kind="solid" onClick={() => setOpen(false)}>
              기입
            </Button>
          </>
        }
      >
        <Stack gap="lg">
          <TextField label="적요" placeholder="무엇에 썼나요" />
          <TextField label="금액" numeric placeholder="0" hint="지출은 음수로 적습니다." />
          <Stack gap="xs">
            <Label>분류</Label>
            <Select
              options={[
                { value: "식비", label: "식비" },
                { value: "고정", label: "고정" },
                { value: "문화", label: "문화" },
              ]}
            />
          </Stack>
        </Stack>
      </Modal>
    </Stack>
  );
};
