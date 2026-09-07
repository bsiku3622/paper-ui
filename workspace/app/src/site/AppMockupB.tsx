// 두 번째 앱 목업 — 사이드바를 다시 설계한 안. 첫 목업은 그대로 두고 나란히 비교한다.
//
// 첫 안의 사이드바는 항목을 나열하고 활성만 칠하는 구조라, 넓혀도 여유가 아니라 허전함이
// 됐다. 폭이 문제가 아니라 **사이드바가 하는 일이 하나뿐인 것** 이 문제였다.
//
// 그래서 이쪽은 세 가지를 더 시킨다. ① 활성 표시를 항목마다 칠하는 대신 판 하나가
// 미끄러지게 해서 **어디에서 어디로 옮겨 갔는지** 를 보여 주고, ② 필터를 접을 수 있는
// 무리로 묶어 목록이 길어져도 한눈에 들어오게 하며, ③ 접으면 글리프만 남는 레일이 되어
// 본문이 넓어진다. 인터랙션이 장식이 아니라 사이드바가 더 많은 일을 하게 만드는 수단이다.

import { useState } from "react";

import {
  Badge, Box, Button, Field, Inline, Table, Tabs, Text, tokens,
  type Column,
} from "@studio-baeks/paper-ui";

import "./mockupB.css";

type Row = { id: string; key: string; title: string; who: string; state: "진행" | "막힘" | "완료" | "할 일" };

const ROWS: Row[] = [
  { id: "1", key: "STU-142", title: "토큰 트리를 두 번 걷는 emit 파이프라인", who: "재원", state: "진행" },
  { id: "2", key: "STU-139", title: "Select 포커스 링이 사파리에서 잘림", who: "민주", state: "막힘" },
  { id: "3", key: "STU-137", title: "Table hover 배경을 subtle 로 통일", who: "재원", state: "완료" },
  { id: "4", key: "STU-135", title: "Badge wash 대비 AA 재검증", who: "지현", state: "할 일" },
  { id: "5", key: "STU-131", title: "Modal 진입 애니메이션 곡선 조정", who: "민주", state: "완료" },
  { id: "6", key: "STU-128", title: "eslint 규칙 4 — Box as 예외 문서화", who: "지현", state: "진행" },
];

const NAV = [
  { key: "issues", glyph: "◆", label: "이슈", count: 6 },
  { key: "board", glyph: "▤", label: "보드", count: 3 },
  { key: "report", glyph: "◑", label: "리포트", count: 0 },
  { key: "member", glyph: "◎", label: "멤버", count: 4 },
];

const FILTERS = [
  { key: "progress", label: "진행 중", accent: "info", count: 2 },
  { key: "blocked", label: "막힘", accent: "error", count: 1 },
  { key: "review", label: "검토", accent: "warning", count: 1 },
  { key: "done", label: "완료", accent: "success", count: 2 },
] as const;

const STATE_TONE: Record<Row["state"], "info" | "error" | "success" | undefined> = {
  진행: "info", 막힘: "error", 완료: "success", "할 일": undefined,
};

const COLUMNS: Column<Row>[] = [
  { key: "key", header: "키", render: (r) => <Text variant="caption" as="span" ink="soft">{r.key}</Text> },
  { key: "title", header: "이슈", render: (r) => <Text variant="body" as="span">{r.title}</Text> },
  { key: "who", header: "담당", render: (r) => <Text variant="caption" as="span">{r.who}</Text> },
  { key: "state", header: "상태", render: (r) => <Badge color={STATE_TONE[r.state]}>{r.state}</Badge> },
];

export const AppMockupB = () => {
  const [nav, setNav] = useState("issues");
  const [openFilters, setOpenFilters] = useState(true);
  const [fold, setFold] = useState(false);
  const [tab, setTab] = useState("all");
  const [filter, setFilter] = useState<string | null>(null);

  const active = NAV.findIndex((n) => n.key === nav);
  const rows = filter
    ? ROWS.filter((r) => (filter === "progress" ? r.state === "진행"
      : filter === "blocked" ? r.state === "막힘"
      : filter === "review" ? r.state === "할 일" : r.state === "완료"))
    : ROWS;

  return (
    <div className="mb" data-fold={fold} style={{ ["--mb-side" as string]: fold ? "3.5rem" : "14.5rem" }}>
      <div className="mb-body">
        <aside className="mb-side">
          <div className="mb-head">
            <Box surface="raised" radius="pill" className="mb-brand" style={{ width: "1.5rem", height: "1.5rem", display: "grid", placeItems: "center", flex: "none" }}>
              <Text variant="label" as="span" style={{ fontWeight: tokens.text.weight.bold }}>S</Text>
            </Box>
            <Text variant="caption" as="span" className="mb-label" style={{ fontWeight: tokens.text.weight.semibold }}>Studio</Text>
            <button type="button" className="mb-fold" onClick={() => setFold((v) => !v)} aria-label={fold ? "사이드바 펼치기" : "사이드바 접기"} aria-expanded={!fold}>
              <span aria-hidden>‹</span>
            </button>
          </div>

          <div className="mb-list" style={{ ["--mb-i" as string]: String(active) }}>
            <div className="mb-mark" aria-hidden />
            {NAV.map((n) => (
              <button key={n.key} type="button" className="mb-item" data-on={n.key === nav} onClick={() => setNav(n.key)}>
                <span className="mb-glyph" aria-hidden>{n.glyph}</span>
                <span className="mb-label">{n.label}</span>
                {n.count ? <span className="mb-count">{n.count}</span> : null}
              </button>
            ))}
          </div>

          <div>
            <button type="button" className="mb-sec" data-open={openFilters} onClick={() => setOpenFilters((v) => !v)} aria-expanded={openFilters}>
              <span aria-hidden>⌄</span>
              <span className="mb-label">필터</span>
            </button>
            <div className="mb-group" data-open={openFilters}>
              <div>
                {FILTERS.map((f) => (
                  <button key={f.key} type="button" className="mb-item" data-on={filter === f.key}
                    onClick={() => setFilter((v) => (v === f.key ? null : f.key))}>
                    <span className="mb-glyph" aria-hidden>
                      <Box className={`pui-${f.accent}-dot mb-dot`} radius="pill" />
                    </span>
                    <span className="mb-label">{f.label}</span>
                    <span className="mb-count">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-foot">
            <Box surface="well" radius="pill" style={{ width: "1.5rem", height: "1.5rem", display: "grid", placeItems: "center", flex: "none" }}>
              <Text variant="label" as="span">재</Text>
            </Box>
            <Text variant="caption" as="span" className="mb-label" ink="soft">재원</Text>
          </div>
        </aside>

        <main className="mb-main">
          <Inline align="center" justify="between" gap="sm" paddingX="lg" paddingY="md"
            style={{ borderBottom: `1px solid ${tokens.color.border.base}` }}>
            <Text variant="heading" as="h3">이슈</Text>
            <Inline gap="sm" align="center">
              <Box style={{ width: "12rem" }}>
                <Field placeholder="검색…" aria-label="검색" />
              </Box>
              <Button>새 이슈</Button>
            </Inline>
          </Inline>

          <Inline align="center" justify="between" gap="sm" paddingX="lg" paddingY="sm"
            style={{ borderBottom: `1px solid ${tokens.color.border.base}` }}>
            <Tabs value={tab} onChange={setTab} items={[
              { value: "all", label: "전체" }, { value: "open", label: "열림" }, { value: "done", label: "완료" },
            ]} />
            <Inline gap="xs" align="center">
              {filter ? (
                <Button size="sm" variant="quiet" onClick={() => setFilter(null)}>필터 해제</Button>
              ) : null}
              <Text variant="caption" ink="faint" as="span">{rows.length}건</Text>
            </Inline>
          </Inline>

          <Table columns={COLUMNS} rows={rows} rowKey={(r) => r.id} />
        </main>
      </div>
    </div>
  );
};
