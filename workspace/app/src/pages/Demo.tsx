// 데모 — 복잡한 웹앱 화면 하나(이슈 트래커)를 paper-ui 컴포넌트로 짓는다.
//
// 컴포넌트 갤러리가 아니라 *실제 화면* 이다. Atlassian/Linear 감각의 이슈 목록:
// 상단 nav · 세그먼트 탭 · 필터 · 데이터 표 · status 배지 · 생성 모달.
// 이걸로 화면이 서면 시스템이 충분한 것이고, 안 서면 뭐가 빠졌는지 여기서 드러난다.

import { useEffect, useMemo, useState } from "react";

import {
  Badge,
  Box,
  Breadcrumb,
  Button,
  Checkbox,
  EmptyState,
  FormField,
  Icon,
  Inline,
  Link,
  Modal,
  Navbar,
  PageHeader,
  Pagination,
  SearchField,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextField,
  Tooltip,
  tokens,
  type Column,
  type StatusName,
} from "@studio-baeks/paper-ui";

import { DemoBar } from "../site/chrome";

type State = "todo" | "progress" | "done" | "blocked";

type Issue = {
  id: string;
  key: string;
  title: string;
  state: State;
  priority: "높음" | "보통" | "낮음";
  assignee: string;
  updated: string;
};

const ISSUES: Issue[] = [
  { id: "1", key: "STU-142", title: "토큰 트리를 두 번 걷는 emit 파이프라인", state: "progress", priority: "높음", assignee: "재원", updated: "10분 전" },
  { id: "2", key: "STU-139", title: "Select 포커스 링이 사파리에서 잘림", state: "blocked", priority: "높음", assignee: "민주", updated: "1시간 전" },
  { id: "3", key: "STU-137", title: "Table hover 배경을 subtle 로 통일", state: "done", priority: "보통", assignee: "재원", updated: "3시간 전" },
  { id: "4", key: "STU-135", title: "Badge wash 대비 AA 검증", state: "todo", priority: "보통", assignee: "지현", updated: "어제" },
  { id: "5", key: "STU-131", title: "Modal 진입 애니메이션 곡선 조정", state: "done", priority: "낮음", assignee: "민주", updated: "어제" },
  { id: "6", key: "STU-128", title: "eslint 규칙 4 — Box as 예외 문서화", state: "todo", priority: "낮음", assignee: "지현", updated: "2일 전" },
];

const STATE_LABEL: Record<State, string> = { todo: "할 일", progress: "진행", done: "완료", blocked: "막힘" };
const STATE_STATUS: Record<State, StatusName | undefined> = {
  todo: undefined,
  progress: "info",
  done: "success",
  blocked: "error",
};

// avatar — 전용 컴포넌트 없이 Box 조합으로. 알약(radius=full) + well 면 + 이니셜.
const Avatar = ({ name }: { name: string }) => (
  <Box
    surface="well"
    radius="full"
    className="avatar"
    aria-hidden
    style={{
      width: "1.5rem",
      height: "1.5rem",
      display: "inline-grid",
      placeItems: "center",
      fontSize: "var(--pui-text-size-label)",
      fontWeight: "var(--pui-text-weight-semibold)",
    }}
  >
    {name.slice(0, 1)}
  </Box>
);

export const Demo = () => {
  const [tab, setTab] = useState("all");
  const [priority, setPriority] = useState("all");
  const [mineOnly, setMineOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () =>
      ISSUES.filter((i) => (tab === "all" ? true : tab === "open" ? i.state !== "done" : i.state === "done"))
        .filter((i) => (priority === "all" ? true : i.priority === priority))
        .filter((i) => (mineOnly ? i.assignee === "재원" : true)),
    [tab, priority, mineOnly],
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / 3));
  const visibleRows = rows.slice((page - 1) * 3, page * 3);

  // 필터가 바뀌면 이전 목록의 페이지는 더 이상 의미가 없다. 첫 페이지로 돌아가야 빈 표가
  // "결과 없음"처럼 보이는 오해를 막는다.
  useEffect(() => setPage(1), [tab, priority, mineOnly]);

  const columns: Column<Issue>[] = [
    {
      key: "key",
      header: "키",
      render: (r) => (
        <Link href="#" onClick={(e) => e.preventDefault()}>
          <Text variant="body" as="span">
            {r.key}
          </Text>
        </Link>
      ),
    },
    { key: "title", header: "제목", render: (r) => r.title },
    {
      key: "state",
      header: "상태",
      render: (r) => <Badge color={STATE_STATUS[r.state]}>{STATE_LABEL[r.state]}</Badge>,
    },
    { key: "priority", header: "우선순위", render: (r) => <Text variant="caption" as="span">{r.priority}</Text> },
    {
      key: "assignee",
      header: "담당",
      render: (r) => (
        <Inline gap="sm">
          <Avatar name={r.assignee} />
          <Text variant="body" as="span">{r.assignee}</Text>
        </Inline>
      ),
    },
    {
      key: "updated",
      header: "수정",
      numeric: true,
      render: (r) => <Text variant="caption" as="span">{r.updated}</Text>,
    },
  ];

  return (
    <Stack>
      {/* 데모는 실제 제품처럼 자체 Navbar 를 갖고, 통합 DemoBar 로 사이트에 이어진다 */}
      <DemoBar />
      <Navbar
        brand={
          <Inline gap="sm">
            <Box
              radius="sm"
              aria-hidden
              style={{
                width: "1.5rem",
                height: "1.5rem",
                background: tokens.color.primary.base,
                color: tokens.color.primary.fg,
                display: "grid",
                placeItems: "center",
                fontSize: "var(--pui-text-size-caption)",
                fontWeight: "var(--pui-text-weight-bold)",
              }}
            >
              S
            </Box>
            <Text variant="subheading">Studio</Text>
          </Inline>
        }
        items={[
          { value: "issues", label: "이슈" },
          { value: "boards", label: "보드" },
          { value: "reports", label: "리포트" },
        ]}
        active="issues"
        trailing={
          <Inline gap="sm">
            <Box style={{ width: "16rem" }}>
              <SearchField placeholder="검색…" />
            </Box>
            <Tooltip content={<Stack gap="xs"><Text variant="label">새 이슈</Text><Text variant="caption" ink="soft">단축키 C</Text></Stack>}>
              <Button onClick={() => setOpen(true)}>
                새 이슈
              </Button>
            </Tooltip>
          </Inline>
        }
      />

      <Box paddingX="xl" paddingY="xl">
        <Stack gap="xl" style={{ maxWidth: tokens.layout.container.content, marginInline: "auto" }}>
          <PageHeader
            location={<Breadcrumb items={[{ value: "projects", label: "Projects" }, { value: "studio", label: "Studio UI" }, { value: "issues", label: "Issues" }]} />}
            title="이슈"
            description={`${rows.length}건 표시 중 · 전체 ${ISSUES.length}건`}
          />

          <Inline gap="md" justify="between" wrap>
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "all", label: "전체" },
                { value: "open", label: "열림" },
                { value: "done", label: "완료" },
              ]}
            />
            <Inline gap="md">
              <Inline as="label" gap="sm">
                <Checkbox checked={mineOnly} onChange={(e) => setMineOnly(e.currentTarget.checked)} />
                <Text variant="caption" as="span">내 담당만</Text>
              </Inline>
              <Box style={{ width: "9rem" }}>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.currentTarget.value)}
                  options={[
                    { value: "all", label: "우선순위 전체" },
                    { value: "높음", label: "높음" },
                    { value: "보통", label: "보통" },
                    { value: "낮음", label: "낮음" },
                  ]}
                />
              </Box>
            </Inline>
          </Inline>

          <Table
            variant="plain"
            density="comfortable"
            columns={columns}
            rows={visibleRows}
            rowKey={(r) => r.id}
            empty={
              <EmptyState
                title="일치하는 이슈가 없습니다"
                description="필터를 바꾸거나 새 이슈를 만들어 시작하세요."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setTab("all");
                      setPriority("all");
                      setMineOnly(false);
                    }}
                  >
                    필터 초기화
                  </Button>
                }
              />
            }
          />

          {rows.length ? <Pagination page={page} totalPages={totalPages} onChange={setPage} /> : null}

          <Inline gap="sm">
            <Icon aria-label="정보">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </Icon>
            <Text variant="caption">막힌 이슈는 담당자에게 자동으로 알림이 갑니다.</Text>
          </Inline>
        </Stack>
      </Box>

      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Title>새 이슈</Modal.Title>
          <Modal.Description>새 작업의 제목과 분류를 정합니다.</Modal.Description>
        </Modal.Header>
        <Modal.Body><Stack gap="lg">
          <TextField label="제목" placeholder="무엇을 해야 하나요" />
          <Inline gap="md" align="start">
            <Box style={{ flex: 1 }}>
              <FormField label="상태">
                <Select
                  options={[
                    { value: "todo", label: "할 일" },
                    { value: "progress", label: "진행" },
                    { value: "done", label: "완료" },
                  ]}
                />
              </FormField>
            </Box>
            <Box style={{ flex: 1 }}>
              <FormField label="우선순위">
                <Select
                  options={[
                    { value: "보통", label: "보통" },
                    { value: "높음", label: "높음" },
                    { value: "낮음", label: "낮음" },
                  ]}
                />
              </FormField>
            </Box>
          </Inline>
        </Stack></Modal.Body>
        <Modal.Footer>
          <Modal.Close variant="quiet">취소</Modal.Close>
          <Modal.Close>만들기</Modal.Close>
        </Modal.Footer>
      </Modal>
    </Stack>
  );
};
