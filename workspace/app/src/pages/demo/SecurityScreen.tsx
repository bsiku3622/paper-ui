// Security and access: the findings a scan turned up (each with a status and someone to fix it), the people and keys that can get in,
// and the audit log of what they did. A row's title is strong and every other word in the table is the body's own, so a row reads
// from one place. Changes made here are written to the audit log, and the log is the third tab.

import { useState } from "react";

import { Badge, Box, Button, Floating, Inline, Select, Stack, Surface, Text, useFloatingContext } from "@studio-baeks/paper-ui";

import { ClockIcon } from "../../compositions/icons";
import {
  DAY, DataTable, Dialog, DialogFooter, EmptyState, ENVS, Facts, FilterChip, FINDING_STATES, HOUR, KeyManager, MemberManager, PageTitle, Pager, Panel, PersonCell, SearchField, Segmented, SeverityBadge, SEVERITIES, StatStrip, TabCount, TableBar, Tabs, Two,
  clock, formatDate, formatStamp, formatTime, relative, summarize, until, useParam, useProjectName, useStore, useTable, wait,
  type AuditEvent, type Column, type Finding, type FindingState,
} from "./parts";

// ─── Findings ────────────────────────────────────────────────────────────────────────────────────────────────────────

const StateTag = ({ state }: { state: FindingState }) =>
  state === "진행 중" ? <Badge accent="info" variant="soft" dot>{state}</Badge> : state === "해결" ? <Badge accent="success" variant="ghost" dot>해결됨</Badge> : <Badge accent="primary" variant="hairline" dot>{state}</Badge>;

const FindingBody = ({ id }: { id: string }) => {
  const { findings, setFindings, members, notify, record, me } = useStore();
  const nameOf = useProjectName();
  const { close } = useFloatingContext();
  const finding = findings.find((entry) => entry.id === id);
  const [state, setState] = useState<FindingState>(finding?.state ?? "열림");
  const [owner, setOwner] = useState(finding?.owner ?? "");
  const [busy, setBusy] = useState(false);
  if (!finding) return null;
  const at = clock();
  const dirty = state !== finding.state || (owner || null) !== finding.owner;
  const save = async () => {
    setBusy(true);
    await wait(500);
    setFindings((list) => list.map((entry) => (entry.id === id ? { ...entry, state, owner: owner || null, resolved: state === "해결" ? at : undefined } : entry)));
    record({ code: "finding.assign", action: state === "해결" ? "점검 항목을 해결로 처리했습니다" : "점검 항목을 고쳤습니다", target: id });
    notify("success", `${id}을(를) 저장했습니다`, `${state}${owner ? ` · 담당 ${owner}` : " · 담당자 없음"}`);
    setBusy(false);
    close();
  };
  return (
    <Stack gap="lg">
      <Facts items={[
        ["심각도", <SeverityBadge key="severity" level={finding.severity} />],
        ["영향받는 자원", `${finding.resource} (${finding.kind})`],
        ["프로젝트", `${nameOf(finding.projectId)} · ${finding.env}`],
        ["기한", finding.state === "해결" && finding.resolved ? `${formatStamp(finding.resolved)}에 해결` : `${formatDate(finding.due)} (${until(finding.due, at)})`],
      ]} />
      <Stack gap="md">
        <Box width="full">
          <Stack gap="xs">
            <Text as="label" variant="label" htmlFor="finding-state">상태</Text>
            <Select id="finding-state" value={state} onChange={(event) => setState(event.target.value as FindingState)}>
              {FINDING_STATES.map((entry) => <Select.Option key={entry} value={entry}>{entry}</Select.Option>)}
            </Select>
          </Stack>
        </Box>
        <Box width="full">
          <Stack gap="xs">
            <Text as="label" variant="label" htmlFor="finding-owner">담당자</Text>
            <Select id="finding-owner" value={owner} onChange={(event) => setOwner(event.target.value)}>
              <Select.Option value="">담당자 없음</Select.Option>
              {members.filter((person) => !person.pending).map((person) => <Select.Option key={person.name} value={person.name}>{person.name === me.name ? `${person.name} (나)` : person.name}</Select.Option>)}
            </Select>
          </Stack>
        </Box>
      </Stack>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">닫기</Button>
        <Button disabled={!dirty} loading={busy} loadingLabel="저장하는 중" onClick={save}>저장</Button>
      </DialogFooter>
    </Stack>
  );
};

const RANK = Object.fromEntries(SEVERITIES.map((level, index) => [level, index]));

// ─── Audit ───────────────────────────────────────────────────────────────────────────────────────────────────────────

const ResultTag = ({ result }: { result: AuditEvent["result"] }) =>
  result === "성공" ? <Badge accent="success" variant="ghost" dot>{result}</Badge> : result === "실패" ? <Badge accent="warning" variant="soft" dot>{result}</Badge> : <Badge accent="error" variant="soft" dot>{result}</Badge>;

const AuditBody = ({ event }: { event: AuditEvent }) => (
  <Stack gap="lg">
    <Facts items={[
      ["시각", `${formatStamp(event.at)} (${relative(event.at)})`],
      ["행위자", <PersonCell key="actor" name={event.actor === "알 수 없음" ? null : event.actor} />],
      ["동작", event.action],
      ["대상", event.target],
      ["접속 위치", `${event.ip} · ${event.place}`],
      ["결과", <ResultTag key="result" result={event.result} />],
    ]} />
    <Stack gap="xs">
      <Text as="span" variant="label" strong={false} ink="tertiary">원본 기록</Text>
      <Surface fill="sunken" radius="md" padding="md" overflowX="auto">
        <Stack>
          {[["id", event.id], ["time", new Date(event.at).toISOString()], ["actor", event.actor], ["event", event.code], ["target", event.target], ["source_ip", event.ip], ["result", event.result]].map(([key, value]) => (
            <Text key={key} as="span" family="mono" variant="caption" ink="secondary">{`${key}: ${value}`}</Text>
          ))}
        </Stack>
      </Surface>
    </Stack>
    <DialogFooter><Button as={Floating.Close}>닫기</Button></DialogFooter>
  </Stack>
);

const PERIODS = [{ id: "day", label: "24시간" }, { id: "week", label: "7일" }, { id: "all", label: "전체" }] as const;

const ROLE_NOTES: readonly (readonly [string, string])[] = [
  ["소유자", "모든 설정과 결제, 작업 공간 삭제. 작업 공간에 한 명입니다."],
  ["관리자", "멤버와 키, 프로젝트를 관리합니다. 결제 정보는 읽기만 합니다."],
  ["개발자", "맡은 프로젝트의 자원과 배포를 다룹니다. 멤버와 결제는 볼 수 없습니다."],
  ["결제 담당", "비용과 청구서, 결제 수단을 다룹니다. 자원은 읽기만 합니다."],
  ["읽기 전용", "모든 화면을 볼 수 있지만 아무것도 바꿀 수 없습니다."],
];

// ─── The page ────────────────────────────────────────────────────────────────────────────────────────────────────────

export const SecurityScreen = () => {
  const { findings, members, keys, audit, resources, inScope, notify, record } = useStore();
  const nameOf = useProjectName();
  const [tab, setTab] = useParam("tab", "findings", ["findings", "access", "audit"]);
  const [looking, setLooking] = useParam("finding", "");
  const [event, setEvent] = useState<AuditEvent | null>(null);
  const [period, setPeriod] = useParam("period", "all", PERIODS.map((entry) => entry.id));
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(() => clock() - 5 * HOUR);
  const at = clock();

  const mine = findings.filter(inScope);
  const open = mine.filter((finding) => finding.state !== "해결");
  const overdue = open.filter((finding) => finding.due < at);
  const lately = mine.filter((finding) => finding.state === "해결" && finding.resolved !== undefined && finding.resolved > at - 30 * DAY);
  const admins = members.filter((person) => (person.role === "소유자" || person.role === "관리자") && !person.pending);
  const noMfa = members.filter((person) => !person.mfa && !person.pending);
  const idle = keys.filter((key) => !key.revoked && key.used !== null && at - key.used > 90 * DAY);
  const rows = overdueOnly ? mine.filter((finding) => finding.state !== "해결" && finding.due < at) : mine;

  const columns: readonly Column<Finding>[] = [
    { id: "severity", header: "심각도", track: "5.5rem", compare: (a, b) => Number(a.state === "해결") - Number(b.state === "해결") || RANK[a.severity]! - RANK[b.severity]! || a.due - b.due, render: (row) => <SeverityBadge level={row.severity} /> },
    { id: "title", header: "항목", track: "minmax(16rem, 2.4fr)", opens: true, compare: (a, b) => a.title.localeCompare(b.title, "ko"), render: (row) => <Two title top={row.title} sub={row.id} mono /> },
    { id: "resource", header: "영향받는 자원", track: "minmax(11rem, 1.5fr)", compare: (a, b) => a.resource.localeCompare(b.resource), render: (row) => <Two top={row.resource} sub={row.kind} /> },
    { id: "project", header: "프로젝트 · 환경", track: "minmax(8rem, 1.1fr)", compare: (a, b) => nameOf(a.projectId).localeCompare(nameOf(b.projectId), "ko"), render: (row) => <Two top={nameOf(row.projectId)} sub={row.env} /> },
    { id: "state", header: "상태", track: "5.5rem", compare: (a, b) => FINDING_STATES.indexOf(a.state) - FINDING_STATES.indexOf(b.state), render: (row) => <StateTag state={row.state} /> },
    { id: "owner", header: "담당자", track: "6.5rem", compare: (a, b) => (a.owner ?? "힣").localeCompare(b.owner ?? "힣", "ko"), render: (row) => <PersonCell name={row.owner} /> },
    { id: "due", header: "기한", track: "6.5rem", compare: (a, b) => a.due - b.due, render: (row) => (
      row.state === "해결" && row.resolved ? <Two top={formatDate(row.resolved)} sub="해결됨" /> : <Two top={formatDate(row.due)} sub={until(row.due, at)} ink={row.due < at ? "error" : row.due - at < 4 * DAY ? "warning" : "tertiary"} />
    ) },
  ];
  const table = useTable(rows, {
    columns, sort: { id: "severity", dir: "asc" }, size: 10,
    match: (row, words) => `${row.id} ${row.title} ${row.resource} ${row.owner ?? ""}`.toLowerCase().includes(words),
    filters: { severity: (row) => row.severity, state: (row) => row.state, project: (row) => row.projectId, env: (row) => row.env, owner: (row) => row.owner ?? "미지정" },
  });
  const count = (pick: (finding: Finding) => string, value: string) => mine.filter((finding) => pick(finding) === value).length;
  const owners = [...new Set(mine.map((finding) => finding.owner ?? "미지정"))].sort((a, b) => a.localeCompare(b, "ko"));
  const projects = [...new Set(mine.map((finding) => finding.projectId))];
  const looked = findings.find((finding) => finding.id === looking);

  const cutoff = period === "day" ? at - DAY : period === "week" ? at - 7 * DAY : 0;
  const trail = audit.filter((entry) => entry.at >= cutoff);
  const auditColumns: readonly Column<AuditEvent>[] = [
    { id: "at", header: "시각", track: "7rem", largestFirst: true, compare: (a, b) => a.at - b.at, render: (row) => <Two top={relative(row.at, at)} sub={formatStamp(row.at)} /> },
    { id: "actor", header: "행위자", track: "minmax(7rem, 1fr)", compare: (a, b) => a.actor.localeCompare(b.actor, "ko"), render: (row) => <PersonCell name={row.actor === "알 수 없음" ? null : row.actor} /> },
    { id: "action", header: "동작", track: "minmax(14rem, 2fr)", opens: true, compare: (a, b) => a.action.localeCompare(b.action, "ko"), render: (row) => <Two title top={row.action} sub={row.code} mono /> },
    { id: "target", header: "대상", track: "minmax(11rem, 1.6fr)", render: (row) => <Text as="span" ink="secondary" truncate>{row.target}</Text> },
    { id: "ip", header: "접속 위치", track: "minmax(8rem, 1fr)", render: (row) => <Two top={row.ip} sub={row.place} /> },
    { id: "result", header: "결과", track: "5.5rem", compare: (a, b) => a.result.localeCompare(b.result, "ko"), render: (row) => <ResultTag result={row.result} /> },
  ];
  const auditTable = useTable(trail, {
    columns: auditColumns, sort: { id: "at", dir: "desc" }, size: 12,
    match: (row, words) => `${row.actor} ${row.action} ${row.code} ${row.target} ${row.ip}`.toLowerCase().includes(words),
    filters: { actor: (row) => row.actor, action: (row) => row.action, result: (row) => row.result },
  });
  const auditCount = (pick: (entry: AuditEvent) => string, value: string) => trail.filter((entry) => pick(entry) === value).length;
  const actors = [...new Set(audit.map((entry) => entry.actor))].sort((a, b) => a.localeCompare(b, "ko"));
  const actions = [...new Set(audit.map((entry) => entry.action))].sort((a, b) => a.localeCompare(b, "ko"));

  const scan = async () => {
    setScanning(true);
    await wait(2200);
    const stamp = clock();
    setScanned(stamp);
    setScanning(false);
    record({ code: "scan.run", action: "보안 점검을 실행했습니다", target: "작업 공간 전체" });
    notify("success", "점검을 마쳤습니다", `자원 ${resources.length}개를 검사했고 새로 발견한 항목은 없습니다.`);
  };

  return (
    <Stack gap="xl">
      <PageTitle
        title="보안과 접근"
        description="보안 점검 결과, 접근 권한, 감사 기록."
        aside={
          <Inline gap="sm" wrap>
            <Inline gap="xs"><ClockIcon size="label" ink="tertiary" /><Text as="span" variant="label" strong={false} ink="tertiary" numeric>마지막 점검 {formatTime(scanned)}</Text></Inline>
            <Button size="sm" variant="hairline" loading={scanning} loadingLabel="점검하는 중" onClick={scan}>지금 점검</Button>
          </Inline>
        }
      />
      <Tabs
        label="보안과 접근"
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            id: "findings", label: <TabCount label="점검 결과" count={open.length} />, panel: (
              <Stack gap="xl">
                <StatStrip stats={[
                  { label: "열린 항목", value: String(open.length), note: `심각 ${open.filter((finding) => finding.severity === "심각").length} · 높음 ${open.filter((finding) => finding.severity === "높음").length} · 그 외 ${open.filter((finding) => finding.severity === "보통" || finding.severity === "낮음").length}` },
                  { label: "기한 넘김", value: String(overdue.length), note: overdue.length ? overdue.map((finding) => finding.id).join(" · ") : "없음", tone: overdue.length ? "error" : undefined },
                  { label: "30일 안에 해결", value: String(lately.length), note: "재검사로 확인" },
                  { label: "관리자와 소유자", value: String(admins.length), note: admins.map((person) => person.name).join(" · ") },
                  { label: "MFA 없는 멤버", value: String(noMfa.length), note: noMfa.map((person) => person.name).join(" · ") || "없음", tone: noMfa.length ? "warning" : undefined },
                  { label: "90일 미사용 키", value: String(idle.length), note: idle.map((key) => key.name).join(" · ") || "없음", tone: idle.length ? "warning" : undefined },
                ]} />
                <Panel>
                  <TableBar summary={table.sort.id === "severity" && table.sort.dir === "asc" ? `${table.total === table.all ? `${table.total}개` : `${table.all}개 중 ${table.total}개`} · 심각도, 그다음 기한 순` : summarize(table, columns)} onReset={table.active || overdueOnly ? () => { table.reset(); setOverdueOnly(false); } : undefined}>
                    <SearchField label="ID나 제목으로 찾기" value={table.query} onChange={table.setQuery} />
                    <FilterChip label="심각도" selected={table.picked.severity ?? []} onChange={(next) => table.pick("severity", next)} options={SEVERITIES.map((level) => ({ value: level, label: level, count: count((finding) => finding.severity, level) }))} />
                    <FilterChip label="상태" selected={table.picked.state ?? []} onChange={(next) => table.pick("state", next)} options={FINDING_STATES.map((state) => ({ value: state, label: state === "해결" ? "해결됨" : state, count: count((finding) => finding.state, state) }))} />
                    <FilterChip label="프로젝트" selected={table.picked.project ?? []} onChange={(next) => table.pick("project", next)} options={projects.map((id) => ({ value: id, label: nameOf(id), count: count((finding) => finding.projectId, id) }))} />
                    <FilterChip label="환경" selected={table.picked.env ?? []} onChange={(next) => table.pick("env", next)} options={[...ENVS, "—"].map((env) => ({ value: env, label: env === "—" ? "환경 없음" : env, count: count((finding) => finding.env, env) }))} />
                    <FilterChip label="담당자" selected={table.picked.owner ?? []} onChange={(next) => table.pick("owner", next)} options={owners.map((name) => ({ value: name, label: name, count: count((finding) => finding.owner ?? "미지정", name) }))} />
                    <Button size="sm" shape="pill" variant={overdueOnly ? "soft" : "dashed"} fontSize="label" aria-pressed={overdueOnly} onClick={() => setOverdueOnly(!overdueOnly)}>기한 넘김만</Button>
                  </TableBar>
                  <DataTable label="점검 결과" columns={columns} rows={table.slice} rowKey={(row) => row.id} sort={table.sort} onSort={table.toggleSort} onOpen={(row) => setLooking(row.id)}
                    empty={<EmptyState title="조건에 맞는 항목이 없습니다" action={<Button size="sm" variant="hairline" onClick={() => { table.reset(); setOverdueOnly(false); }}>필터 초기화</Button>}>검색어나 필터를 바꿔보세요.</EmptyState>} />
                  <Pager table={table} />
                </Panel>
              </Stack>
            ),
          },
          {
            id: "access", label: "접근", panel: (
              <Stack gap="xl">
                <MemberManager />
                <KeyManager />
                <Panel title="역할이 할 수 있는 일" description="멤버의 역할을 바꾸기 전에 확인하세요.">
                  <Box padding="xl"><Facts items={ROLE_NOTES} /></Box>
                </Panel>
              </Stack>
            ),
          },
          {
            id: "audit", label: <TabCount label="감사 기록" count={audit.length} />, panel: (
              <Panel
                title="감사 기록" description="이 작업 공간에서 일어난 일을 시간순으로 남깁니다. 방금 한 일도 여기에 쌓입니다."
                actions={
                  <Inline gap="sm" wrap>
                    <Segmented label="기간" value={period} onChange={setPeriod} options={PERIODS} />
                    <Button size="sm" variant="hairline" onClick={() => notify("info", "감사 기록 CSV를 준비했습니다", `${auditTable.total}건입니다. 데모에서는 파일을 만들지 않습니다.`)}>내보내기</Button>
                  </Inline>
                }>
                <TableBar summary={summarize(auditTable, auditColumns)} onReset={auditTable.active ? auditTable.reset : undefined}>
                  <SearchField label="행위자, 동작, 대상, IP로 찾기" value={auditTable.query} onChange={auditTable.setQuery} />
                  <FilterChip label="행위자" selected={auditTable.picked.actor ?? []} onChange={(next) => auditTable.pick("actor", next)} options={actors.map((name) => ({ value: name, label: name, count: auditCount((entry) => entry.actor, name) }))} />
                  <FilterChip label="동작" selected={auditTable.picked.action ?? []} onChange={(next) => auditTable.pick("action", next)} options={actions.map((name) => ({ value: name, label: name, count: auditCount((entry) => entry.action, name) }))} />
                  <FilterChip label="결과" selected={auditTable.picked.result ?? []} onChange={(next) => auditTable.pick("result", next)} options={(["성공", "실패", "거부됨"] as const).map((result) => ({ value: result, label: result, count: auditCount((entry) => entry.result, result) }))} />
                </TableBar>
                <DataTable label="감사 기록" columns={auditColumns} rows={auditTable.slice} rowKey={(row) => row.id} sort={auditTable.sort} onSort={auditTable.toggleSort} onOpen={setEvent}
                  empty={<EmptyState title="조건에 맞는 기록이 없습니다" action={<Button size="sm" variant="hairline" onClick={auditTable.reset}>필터 초기화</Button>}>기간이나 필터를 바꿔보세요.</EmptyState>} />
                <Pager table={auditTable} />
              </Panel>
            ),
          },
        ]}
      />
      <Dialog open={looked !== undefined} onOpenChange={(open) => { if (!open) setLooking(""); }} title={looked?.title ?? "점검 항목"} description={looked?.id} size="md">
        {looked ? <FindingBody id={looked.id} /> : null}
      </Dialog>
      <Dialog open={event !== null} onOpenChange={(open) => { if (!open) setEvent(null); }} title={event?.action ?? "기록"} description={event?.id} size="md">
        {event ? <AuditBody event={event} /> : null}
      </Dialog>
    </Stack>
  );
};
