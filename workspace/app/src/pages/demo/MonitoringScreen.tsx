// Monitoring: how the services are doing now, the alerts that say when they are not, and the incidents that came of them. An alert
// can be taken, resolved or handed to someone, and the counts in the sidebar and the overview follow.

import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Box, Button, Floating, Grid, Inline, Select, Stack, Text, useFloatingContext } from "@studio-baeks/paper-ui";

import { ClockIcon } from "../../compositions/icons";
import {
  Bars, DataTable, Dialog, DialogFooter, EmptyState, Facts, FilterChip, HealthBadge, Meter, METRICS, MINUTE, Notice, PageTitle, Pager, Panel, PersonCell, SearchField, Segmented, StatStrip, TabCount, TableBar, Tabs, Two,
  HOUR, clock, formatCount, formatMinutes, formatPercent, formatStamp, formatTime, loadAccent, relative, resourceOf, seriesOf, summarize, useParam, useProjectName, useStore, useTable, wait,
  type Alert, type AlertSeverity, type AlertState, type Column, type Metrics,
} from "./parts";

const RANGES = [
  { id: "1h", label: "1시간", points: 12, from: "1시간 전" },
  { id: "24h", label: "24시간", points: 24, from: "24시간 전" },
  { id: "7d", label: "7일", points: 28, from: "7일 전" },
  { id: "30d", label: "30일", points: 30, from: "30일 전" },
] as const;

// ─── Incidents ───────────────────────────────────────────────────────────────────────────────────────────────────────

type IncidentStatus = "조사 중" | "완화됨" | "종료";
type Incident = { id: string; title: string; status: IncidentStatus; impact: string; service: string; started: number; minutes: number | null; lead: string; summary: string; cause: string };

type IncidentRow = readonly [id: string, title: string, status: IncidentStatus, impact: string, service: string, hoursAgo: number, minutes: number | null, lead: string, summary: string, cause: string];

const INCIDENT_ROWS: readonly IncidentRow[] = [
  ["INC-221", "경로 최적화 응답 지연", "조사 중", "기사 앱의 경로 갱신이 느려졌습니다", "route-optimizer", 0.8, null, "박지호", "외부 지도 API의 응답 지연과 인스턴스 CPU 포화를 함께 확인하고 있습니다.", "외부 지도 API 지연"],
  ["INC-220", "스캐너 게이트웨이 재시작 반복", "완화됨", "창고 입고 스캔이 간헐적으로 끊겼습니다", "warehouse-scanner-gw", 9, 95, "윤태오", "메모리 누수로 5분마다 재시작되었습니다. 재시작 주기를 늘려 완화했고 수정 배포를 준비합니다.", "메모리 누수"],
  ["INC-219", "배송 조회 API 오류율 상승", "종료", "고객 조회의 4%가 7분 동안 실패했습니다", "tracking-api", 72, 7, "이도윤", "데이터베이스 연결 풀이 가득 차 새 요청이 기다리다 실패했습니다. 풀 크기를 늘리고 연결 누수를 고쳤습니다.", "연결 풀 고갈"],
  ["INC-218", "정산 배치 지연", "종료", "일 정산이 2시간 늦게 끝났습니다", "settlement-batch", 130, 118, "오세린", "전날 늘어난 거래량으로 한 건씩 처리하던 구간이 길어졌습니다. 묶음 처리로 바꿨습니다.", "단건 처리 구간 병목"],
  ["INC-217", "기사 푸시 알림 지연", "종료", "새 배차 알림이 평균 40초 늦게 도착했습니다", "driver-push-gateway", 190, 52, "황예린", "푸시 공급자의 제한에 걸려 재시도 대기열이 쌓였습니다. 전송 속도를 낮추고 대기열을 비웠습니다.", "푸시 공급자 속도 제한"],
  ["INC-216", "수집 대기열 적체", "종료", "분석 대시보드의 데이터가 1시간 늦게 갱신되었습니다", "dp-ingest-worker", 260, 64, "한지우", "스키마가 바뀐 이벤트가 들어와 소비자가 같은 메시지를 계속 재시도했습니다. 메시지를 격리하고 소비자를 고쳤습니다.", "스키마 변경 이벤트"],
  ["INC-215", "운영 콘솔 로그인 실패", "종료", "운영팀 일부가 15분 동안 로그인하지 못했습니다", "ops-console-app", 330, 15, "최하린", "세션 저장소의 만료 설정이 잘못 배포되었습니다. 설정을 되돌렸습니다.", "세션 설정 오류"],
  ["INC-214", "서울 리전 네트워크 지연", "종료", "모든 서비스의 응답이 20분 동안 느려졌습니다", "driver-api", 410, 21, "정민준", "리전 내부 네트워크의 장애였고 공급자가 복구했습니다. 우리 쪽 조치는 없었습니다.", "공급자 네트워크 장애"],
  ["INC-213", "데이터베이스 연결 한도 초과", "종료", "배송 추적 쓰기가 3분 동안 실패했습니다", "tracking-worker", 500, 3, "이도윤", "작업자 수가 늘며 연결이 한도를 넘었습니다. 연결 풀을 분리했습니다.", "연결 한도 초과"],
  ["INC-212", "인증서 만료로 API 오류", "종료", "외부 파트너 호출이 38분 동안 거절되었습니다", "tracking-api", 590, 38, "김서연", "자동 갱신이 실패한 것을 알림으로 받지 못했습니다. 만료 14일 전 경보를 추가했습니다.", "인증서 갱신 실패"],
  ["INC-211", "롤백 중 서비스 중단", "종료", "정산 API가 5분 동안 응답하지 않았습니다", "settlement-api", 700, 5, "오세린", "롤백 때 이전 버전이 새 스키마와 맞지 않아 시작하지 못했습니다. 스키마를 되돌린 뒤 복구했습니다.", "스키마와 버전 불일치"],
  ["INC-210", "웨어하우스 쿼리 시간 초과", "종료", "일일 보고서가 실패했습니다", "warehouse-api", 840, 45, "윤태오", "느린 쿼리 하나가 테이블을 오래 잠갔습니다. 인덱스를 추가했습니다.", "느린 쿼리"],
];

const INCIDENTS: readonly Incident[] = INCIDENT_ROWS.map(([id, title, status, impact, service, hoursAgo, minutes, lead, summary, cause]) => ({
  id, title, status, impact, service, started: clock() - Math.round(hoursAgo * HOUR), minutes, lead, summary, cause,
}));

const IncidentBody = ({ incident }: { incident: Incident }) => {
  const total = incident.minutes ?? Math.round((clock() - incident.started) / MINUTE);
  const steps: [number, string][] = [
    [0, `${incident.service}에서 알림이 발생했습니다.`],
    [Math.min(3, total), `${incident.lead}님이 알림을 확인하고 사건을 열었습니다.`],
    [Math.round(total * 0.25), `원인 후보를 좁혔습니다: ${incident.cause}.`],
    [Math.round(total * 0.6), incident.status === "조사 중" ? "원인 검증 중입니다. 임시 완화 방안을 준비합니다." : "조치를 적용했고 지표가 돌아오는지 지켜봤습니다."],
    ...(incident.status === "조사 중" ? [] : [[total, incident.status === "종료" ? "지표가 정상으로 돌아와 사건을 종료했습니다." : "증상은 완화되었고, 근본 수정이 남았습니다."] as [number, string]]),
  ];
  return (
    <Stack gap="lg">
      <Text as="p" ink="secondary">{incident.summary}</Text>
      <Facts items={[
        ["영향", incident.impact],
        ["서비스", incident.service],
        ["시작", `${formatStamp(incident.started)} (${relative(incident.started)})`],
        ["지속", incident.minutes === null ? "진행 중" : formatMinutes(incident.minutes)],
        ["담당", <PersonCell key="lead" name={incident.lead} />],
      ]} />
      <Stack gap="sm">
        <Text as="h3" variant="subheading">타임라인</Text>
        <Stack as="ol" gap="sm">
          {steps.map(([minute, text]) => (
            <Inline as="li" key={`${minute}-${text}`} gap="md" align="baseline">
              <Text as="span" variant="caption" family="mono" ink="tertiary" numeric>{formatTime(incident.started + minute * MINUTE)}</Text>
              <Text as="span" ink="secondary">{text}</Text>
            </Inline>
          ))}
        </Stack>
      </Stack>
      <DialogFooter>
        <Button as={RouterLink} to="/demo/arcfield/docs/postmortem" variant="hairline">사후 분석 쓰는 법</Button>
        <Button as={Floating.Close}>닫기</Button>
      </DialogFooter>
    </Stack>
  );
};

// ─── Alerts ──────────────────────────────────────────────────────────────────────────────────────────────────────────

const RANK: Record<AlertSeverity, number> = { 긴급: 0, 경고: 1, 정보: 2 };
const STATE_RANK: Record<AlertState, number> = { "발생 중": 0, 확인함: 1, 해결됨: 2 };

const SeverityTag = ({ level }: { level: AlertSeverity }) =>
  level === "긴급" ? <Badge accent="error" variant="soft" dot>{level}</Badge> : level === "경고" ? <Badge accent="warning" variant="soft" dot>{level}</Badge> : <Badge accent="primary" variant="ghost" dot>{level}</Badge>;

const StateTag = ({ state }: { state: AlertState }) =>
  state === "발생 중" ? <Badge accent="error" variant="soft" dot>{state}</Badge> : state === "확인함" ? <Badge accent="warning" variant="soft" dot>{state}</Badge> : <Badge accent="primary" variant="hairline" dot>{state}</Badge>;

const useAlertActions = () => {
  const { setAlerts, notify, record, me } = useStore();
  return {
    take: (alert: Alert) => {
      setAlerts((list) => list.map((entry) => (entry.id === alert.id ? { ...entry, state: "확인함", assignee: entry.assignee ?? me.name } : entry)));
      record({ code: "alert.ack", action: "알림을 확인했습니다", target: alert.id });
      notify("success", `${alert.id}을(를) 확인했습니다`, `${alert.assignee ?? me.name}님이 맡습니다.`);
    },
    resolve: (alert: Alert) => {
      setAlerts((list) => list.map((entry) => (entry.id === alert.id ? { ...entry, state: "해결됨", until: clock(), assignee: entry.assignee ?? me.name } : entry)));
      record({ code: "alert.resolve", action: "알림을 해결로 처리했습니다", target: alert.id });
      notify("success", `${alert.id}을(를) 해결로 처리했습니다`, "같은 조건이 다시 생기면 새 알림이 만들어집니다.");
    },
    assign: (alert: Alert, name: string | null) => {
      setAlerts((list) => list.map((entry) => (entry.id === alert.id ? { ...entry, assignee: name } : entry)));
      record({ code: "alert.assign", action: "알림의 담당자를 정했습니다", target: `${alert.id}: ${name ?? "미지정"}` });
    },
  };
};

const AlertBody = ({ id }: { id: string }) => {
  const { alerts, members } = useStore();
  const nameOf = useProjectName();
  const actions = useAlertActions();
  const { close } = useFloatingContext();
  const alert = alerts.find((entry) => entry.id === id);
  if (!alert) return null;
  const resource = resourceOf(alert.service);
  const length = Math.round(((alert.until ?? clock()) - alert.since) / MINUTE);
  return (
    <Stack gap="lg">
      <Facts items={[
        ["상태", <StateTag key="state" state={alert.state} />],
        ["심각도", <SeverityTag key="severity" level={alert.severity} />],
        ["서비스", `${alert.service} (${resource ? `${nameOf(resource.projectId)} · ${resource.env}` : "알 수 없음"})`],
        ["규칙", <Text key="rule" as="span" family="mono" variant="caption">{alert.rule}</Text>],
        ["시작", `${formatStamp(alert.since)} (${relative(alert.since)})`],
        ["끝", alert.until ? formatStamp(alert.until) : "아직 이어지는 중"],
        ["지속", formatMinutes(length)],
      ]} />
      <Box width="full">
        <Select aria-label="담당자" value={alert.assignee ?? ""} onChange={(event) => actions.assign(alert, event.target.value || null)}>
          <Select.Option value="">담당자 없음</Select.Option>
          {members.filter((person) => !person.pending).map((person) => <Select.Option key={person.name} value={person.name}>{person.name}</Select.Option>)}
        </Select>
      </Box>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">닫기</Button>
        {alert.state === "발생 중" ? <Button variant="hairline" onClick={() => { actions.take(alert); close(); }}>확인 처리</Button> : null}
        {alert.state !== "해결됨" ? <Button onClick={() => { actions.resolve(alert); close(); }}>해결로 처리</Button> : null}
      </DialogFooter>
    </Stack>
  );
};

// ─── Charts ──────────────────────────────────────────────────────────────────────────────────────────────────────────

const Chart = ({ title, value, note, values, range, accent, mark }: { title: string; value: string; note: string; values: number[]; range: (typeof RANGES)[number]; accent?: "primary" | "info"; mark?: (value: number) => boolean }) => (
  <Stack gap="md">
    <Stack gap="xs">
      <Text as="h3" variant="label" strong={false} ink="tertiary">{title}</Text>
      <Text as="span" variant="title" numeric>{value}</Text>
      <Text as="span" variant="label" strong={false} ink="tertiary">{note}</Text>
    </Stack>
    <Bars label={`${title}, 최근 ${range.label}`} values={values} ends={[range.from, "지금"]} accent={accent} marks={mark ? values.map(mark) : undefined} />
  </Stack>
);

const Charts = ({ service, range }: { service: string; range: (typeof RANGES)[number] }) => {
  const [tries, setTries] = useState(1);
  const [busy, setBusy] = useState(false);
  const metrics = METRICS.find((entry) => entry.id === service);
  if (!metrics) return null;
  if (metrics.health === "장애") {
    return (
      <Stack gap="lg" padding="xl" align="start">
        <Notice accent="error" title="지표를 불러오지 못했습니다">
          {service}의 수집기가 {tries}번 시도해도 연결되지 않았습니다. 인스턴스가 다시 시작을 반복하고 있어 지표를 보내지 못하는 중일 수 있습니다.
        </Notice>
        <Button variant="hairline" loading={busy} loadingLabel="다시 불러오는 중" onClick={async () => { setBusy(true); await wait(1200); setTries(tries + 1); setBusy(false); }}>다시 불러오기</Button>
      </Stack>
    );
  }
  const rps = seriesOf(service, "rps", range.points);
  const p95 = seriesOf(service, "p95", range.points);
  const errors = seriesOf(service, "errors", range.points);
  const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const last = <T,>(values: T[]) => values[values.length - 1]!;
  return (
    <Grid columns={{ base: "minmax(0, 1fr)", lg: "repeat(3, minmax(0, 1fr))" }} gap="xl" padding="xl">
      <Chart title="초당 요청 수" value={`${formatCount(last(rps))} req/s`} note={`평균 ${formatCount(average(rps))}`} values={rps} range={range} />
      <Chart title="응답 시간 p95" value={`${formatCount(last(p95))} ms`} note={`평균 ${formatCount(average(p95))} · 기준 2,000`} values={p95} range={range} mark={(value) => value > 2000} />
      <Chart title="오류율" value={formatPercent(last(errors), 2)} note={`평균 ${formatPercent(average(errors), 2)} · 기준 1%`} values={errors} range={range} mark={(value) => value > 1} />
    </Grid>
  );
};

// ─── The page ────────────────────────────────────────────────────────────────────────────────────────────────────────

const OPEN: readonly AlertState[] = ["발생 중", "확인함"];

export const MonitoringScreen = () => {
  const { alerts, inScope } = useStore();
  const nameOf = useProjectName();
  const actions = useAlertActions();
  const [tab, setTab] = useParam("tab", "services", ["services", "alerts", "incidents"]);
  const [service, setService] = useParam("service", "route-optimizer", METRICS.map((entry) => entry.id));
  const [range, setRange] = useParam("range", "24h", RANGES.map((entry) => entry.id));
  const [looking, setLooking] = useParam("alert", "");
  const [incident, setIncident] = useState<Incident | null>(null);
  const at = clock();

  const services = METRICS.filter((entry) => {
    const resource = resourceOf(entry.id);
    return resource ? inScope(resource) : false;
  });
  const mine = alerts.filter((alert) => {
    const resource = resourceOf(alert.service);
    return resource ? inScope(resource) : false;
  });
  const active = mine.filter((alert) => OPEN.includes(alert.state));
  const firing = mine.filter((alert) => alert.state === "발생 중");
  const running = services.filter((entry) => entry.p95 > 0);
  const healthy = services.filter((entry) => entry.health === "정상").length;
  const chosen = RANGES.find((entry) => entry.id === range) ?? RANGES[1];
  const looked = alerts.find((alert) => alert.id === looking);

  const serviceColumns: readonly Column<Metrics>[] = [
    { id: "name", header: "서비스", track: "minmax(11rem, 1.8fr)", opens: true, compare: (a, b) => a.id.localeCompare(b.id), render: (row) => <Two title top={row.id} sub={`${nameOf(resourceOf(row.id)?.projectId ?? "")} · ${resourceOf(row.id)?.env ?? ""}`} /> },
    { id: "health", header: "상태", track: "6.5rem", compare: (a, b) => ["정상", "성능 저하", "장애"].indexOf(a.health) - ["정상", "성능 저하", "장애"].indexOf(b.health), largestFirst: true, render: (row) => <HealthBadge health={row.health} /> },
    { id: "p95", header: "p95", track: "5.5rem", end: true, largestFirst: true, compare: (a, b) => a.p95 - b.p95, render: (row) => <Text as="span" numeric ink={row.p95 > 2000 ? "error" : "primary"}>{row.p95 ? `${formatCount(row.p95)}ms` : "—"}</Text> },
    { id: "errors", header: "오류율", track: "5rem", end: true, largestFirst: true, compare: (a, b) => a.errors - b.errors, render: (row) => <Text as="span" numeric ink={row.errors > 1 ? "error" : "primary"}>{formatPercent(row.errors, 2)}</Text> },
    { id: "rps", header: "요청/초", track: "5.5rem", end: true, largestFirst: true, compare: (a, b) => a.rps - b.rps, render: (row) => <Text as="span" numeric>{formatCount(row.rps)}</Text> },
    { id: "cpu", header: "CPU", track: "minmax(6rem, 1fr)", compare: (a, b) => a.cpu - b.cpu, largestFirst: true, render: (row) => <Meter value={row.cpu} label={`${row.id} CPU ${row.cpu}%`} accent={loadAccent(row.cpu)} /> },
    { id: "memory", header: "메모리", track: "minmax(6rem, 1fr)", compare: (a, b) => a.memory - b.memory, largestFirst: true, render: (row) => <Meter value={row.memory} label={`${row.id} 메모리 ${row.memory}%`} accent={loadAccent(row.memory)} /> },
    { id: "uptime", header: "가동률 30일", track: "6.5rem", end: true, compare: (a, b) => a.uptime - b.uptime, render: (row) => <Text as="span" numeric ink="secondary">{formatPercent(row.uptime, 2)}</Text> },
  ];
  const serviceTable = useTable(services, { columns: serviceColumns, sort: { id: "health", dir: "desc" }, size: 10, match: (row, words) => row.id.includes(words) });

  const alertColumns: readonly Column<Alert>[] = [
    { id: "severity", header: "심각도", track: "5.5rem", compare: (a, b) => RANK[a.severity] - RANK[b.severity], render: (row) => <SeverityTag level={row.severity} /> },
    { id: "title", header: "알림", track: "minmax(16rem, 2.6fr)", opens: true, render: (row) => <Two title top={row.title} sub={`${row.id} · ${row.rule}`} mono /> },
    { id: "service", header: "서비스", track: "minmax(9rem, 1.3fr)", compare: (a, b) => a.service.localeCompare(b.service), render: (row) => <Two top={row.service} sub={nameOf(resourceOf(row.service)?.projectId ?? "")} /> },
    { id: "state", header: "상태", track: "6.5rem", compare: (a, b) => STATE_RANK[a.state] - STATE_RANK[b.state], render: (row) => <StateTag state={row.state} /> },
    { id: "since", header: "시작", track: "6.5rem", largestFirst: true, compare: (a, b) => a.since - b.since, render: (row) => <Two top={relative(row.since, at)} sub={formatStamp(row.since)} /> },
    { id: "assignee", header: "담당자", track: "7rem", compare: (a, b) => (a.assignee ?? "힣").localeCompare(b.assignee ?? "힣", "ko"), render: (row) => <PersonCell name={row.assignee} /> },
    { id: "action", header: "조치", track: "5rem", end: true, render: (row) => (
      <Box onClick={(event) => event.stopPropagation()}>
        {row.state === "발생 중" ? <Button size="xs" variant="hairline" onClick={() => actions.take(row)}>확인</Button>
          : row.state === "확인함" ? <Button size="xs" variant="hairline" onClick={() => actions.resolve(row)}>해결</Button>
          : <Text as="span" variant="label" strong={false} ink="tertiary">{formatMinutes(Math.round(((row.until ?? at) - row.since) / MINUTE))}</Text>}
      </Box>
    ) },
  ];
  const alertTable = useTable(mine, {
    columns: alertColumns, sort: { id: "since", dir: "desc" }, size: 10,
    match: (row, words) => `${row.id} ${row.title} ${row.service} ${row.rule}`.toLowerCase().includes(words),
    filters: { state: (row) => row.state, severity: (row) => row.severity, service: (row) => row.service },
  });
  const count = (pick: (alert: Alert) => string, value: string) => mine.filter((alert) => pick(alert) === value).length;

  const incidentColumns: readonly Column<Incident>[] = [
    { id: "title", header: "사건", track: "minmax(14rem, 2.2fr)", opens: true, render: (row) => <Two title top={row.title} sub={`${row.id} · ${row.service}`} mono /> },
    { id: "impact", header: "영향", track: "minmax(14rem, 2.4fr)", render: (row) => <Text as="span" ink="secondary" truncate>{row.impact}</Text> },
    { id: "status", header: "상태", track: "6rem", render: (row) => row.status === "조사 중" ? <Badge accent="error" variant="soft" dot>{row.status}</Badge> : row.status === "완화됨" ? <Badge accent="warning" variant="soft" dot>{row.status}</Badge> : <Badge accent="primary" variant="hairline" dot>{row.status}</Badge> },
    { id: "started", header: "시작", track: "6.5rem", largestFirst: true, compare: (a, b) => a.started - b.started, render: (row) => <Two top={relative(row.started, at)} sub={formatStamp(row.started)} /> },
    { id: "length", header: "지속", track: "6rem", end: true, render: (row) => <Text as="span" numeric ink="secondary">{row.minutes === null ? "진행 중" : formatMinutes(row.minutes)}</Text> },
    { id: "lead", header: "담당", track: "7rem", render: (row) => <PersonCell name={row.lead} /> },
  ];
  const incidentTable = useTable(INCIDENTS.filter((entry) => { const resource = resourceOf(entry.service); return resource ? inScope(resource) : true; }), {
    columns: incidentColumns, sort: { id: "started", dir: "desc" }, size: 10,
    match: (row, words) => `${row.id} ${row.title} ${row.service} ${row.impact}`.toLowerCase().includes(words),
  });

  return (
    <Stack gap="xl">
      <PageTitle
        title="모니터링"
        description="서비스의 지금 지표, 알림, 지난 사건입니다."
        aside={<Inline gap="xs"><ClockIcon size="label" ink="tertiary" /><Text as="span" variant="label" strong={false} ink="tertiary" numeric>{formatTime(at)} 기준</Text></Inline>}
      />
      <StatStrip stats={[
        { label: "정상 서비스", value: `${healthy}/${services.length}`, note: services.length - healthy ? `성능 저하·장애 ${services.length - healthy}` : "모두 정상", tone: services.length - healthy ? "warning" : undefined },
        { label: "발생 중 알림", value: String(firing.length), note: `확인함 ${active.length - firing.length}`, tone: firing.length ? "error" : undefined },
        { label: "평균 p95", value: running.length ? `${formatCount(running.reduce((sum, entry) => sum + entry.p95, 0) / running.length)}ms` : "—", note: "응답하는 서비스 기준" },
        { label: "처리량", value: formatCount(services.reduce((sum, entry) => sum + entry.rps, 0)), note: "요청/초 합계" },
        { label: "30일 가동률", value: services.length ? formatPercent(services.reduce((sum, entry) => sum + entry.uptime, 0) / services.length, 2) : "—", note: "서비스 평균" },
      ]} />
      <Tabs
        label="모니터링"
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            id: "services", label: <TabCount label="서비스" count={services.length} />, panel: (
              <Stack gap="xl">
                <Panel title="지표" description="서비스 하나와 기간을 골라 그래프를 봅니다. 가장 오른쪽 막대가 지금입니다."
                  actions={
                    <Inline gap="sm" wrap>
                      <Box width="lg" maxWidth="full">
                        <Select size="sm" aria-label="서비스" value={service} onChange={(event) => setService(event.target.value)}>
                          {METRICS.map((entry) => <Select.Option key={entry.id} value={entry.id}>{entry.id}</Select.Option>)}
                        </Select>
                      </Box>
                      <Segmented label="기간" value={chosen.id} onChange={setRange} options={RANGES.map((entry) => ({ id: entry.id, label: entry.label }))} />
                    </Inline>
                  }>
                  <Charts key={service} service={service} range={chosen} />
                </Panel>
                <Panel>
                  <TableBar summary={summarize(serviceTable, serviceColumns)} onReset={serviceTable.active ? serviceTable.reset : undefined}>
                    <SearchField label="서비스 이름으로 찾기" value={serviceTable.query} onChange={serviceTable.setQuery} />
                  </TableBar>
                  <DataTable label="서비스 상태" columns={serviceColumns} rows={serviceTable.slice} rowKey={(row) => row.id} sort={serviceTable.sort} onSort={serviceTable.toggleSort} onOpen={(row) => setService(row.id)}
                    empty={<EmptyState title="이 범위에는 서비스가 없습니다">위쪽의 프로젝트나 환경을 바꿔보세요.</EmptyState>} />
                  <Pager table={serviceTable} />
                </Panel>
              </Stack>
            ),
          },
          {
            id: "alerts", label: <TabCount label="알림" count={active.length} />, panel: (
              <Panel>
                <TableBar summary={summarize(alertTable, alertColumns)} onReset={alertTable.active ? alertTable.reset : undefined}>
                  <SearchField label="알림, 서비스, 규칙으로 찾기" value={alertTable.query} onChange={alertTable.setQuery} />
                  <FilterChip label="상태" selected={alertTable.picked.state ?? []} onChange={(next) => alertTable.pick("state", next)} options={(["발생 중", "확인함", "해결됨"] as const).map((state) => ({ value: state, label: state, count: count((alert) => alert.state, state) }))} />
                  <FilterChip label="심각도" selected={alertTable.picked.severity ?? []} onChange={(next) => alertTable.pick("severity", next)} options={(["긴급", "경고", "정보"] as const).map((level) => ({ value: level, label: level, count: count((alert) => alert.severity, level) }))} />
                  <FilterChip label="서비스" selected={alertTable.picked.service ?? []} onChange={(next) => alertTable.pick("service", next)} options={[...new Set(mine.map((alert) => alert.service))].sort().map((name) => ({ value: name, label: name, count: count((alert) => alert.service, name) }))} />
                </TableBar>
                <DataTable label="알림" columns={alertColumns} rows={alertTable.slice} rowKey={(row) => row.id} sort={alertTable.sort} onSort={alertTable.toggleSort} onOpen={(row) => setLooking(row.id)}
                  empty={<EmptyState title="조건에 맞는 알림이 없습니다" action={<Button size="sm" variant="hairline" onClick={alertTable.reset}>필터 초기화</Button>}>검색어나 필터를 바꿔보세요.</EmptyState>} />
                <Pager table={alertTable} />
              </Panel>
            ),
          },
          {
            id: "incidents", label: <TabCount label="사건 기록" count={incidentTable.all} />, panel: (
              <Panel>
                <TableBar summary={summarize(incidentTable, incidentColumns)} onReset={incidentTable.active ? incidentTable.reset : undefined}>
                  <SearchField label="사건이나 서비스로 찾기" value={incidentTable.query} onChange={incidentTable.setQuery} />
                </TableBar>
                <DataTable label="사건 기록" columns={incidentColumns} rows={incidentTable.slice} rowKey={(row) => row.id} sort={incidentTable.sort} onSort={incidentTable.toggleSort} onOpen={setIncident}
                  empty={<EmptyState title="사건이 없습니다">조건을 바꾸면 지난 사건이 보입니다.</EmptyState>} />
                <Pager table={incidentTable} />
              </Panel>
            ),
          },
        ]}
      />
      <Dialog open={looked !== undefined} onOpenChange={(open) => { if (!open) setLooking(""); }} title={looked?.title ?? "알림"} description={looked?.id} size="md">
        {looked ? <AlertBody id={looked.id} /> : null}
      </Dialog>
      <Dialog open={incident !== null} onOpenChange={(open) => { if (!open) setIncident(null); }} title={incident?.title ?? "사건"} description={incident?.id} size="md">
        {incident ? <IncidentBody incident={incident} /> : null}
      </Dialog>
    </Stack>
  );
};
